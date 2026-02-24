package controllers

import (
	"LinklyMedia/database"
	"LinklyMedia/models"
	"LinklyMedia/services"
	"LinklyMedia/utils"
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	HashPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(HashPassword), nil
}

func Register(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var user models.User

		// Bind JSON
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid request body",
				"details": err.Error(),
			})
			return
		}

		// Assign system fields BEFORE validation
		user.ID = primitive.NewObjectID()
		user.UserID = user.ID.Hex()
		user.CreatedAt = time.Now()
		user.UpdatedAt = time.Now()
		user.EmailVerified = false
		user.IsActive = false
		user.UserCart = []models.BillboardCart{}

		// Role-based setup BEFORE validation
		switch user.Role {

		case "PARTNER":

			if user.Partner == nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Partner details required for PARTNER role",
				})
				return
			}

			user.Partner.PartnerID = user.UserID
			user.Partner.Listings = models.Listings{BillboardIDs: []string{}}
			user.Partner.OrderIDs = []primitive.ObjectID{}
			user.Partner.JoinedAt = time.Now()
			user.Partner.Status = "PENDING"
			user.Partner.IsVerified = false

		case "USER", "ADMIN":
			user.Partner = nil
		}

		// Validate struct AFTER setting defaults
		validate := validator.New()
		if err := validate.Struct(user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Validation failed",
				"details": err.Error(),
			})
			return
		}

		// Hash password
		hashPassword, err := HashPassword(user.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Unable to hash password",
			})
			return
		}
		user.Password = hashPassword

		userCollection := database.OpenCollection("users", client)

		// Check duplicate email
		count, err := userCollection.CountDocuments(ctx, bson.M{"email": user.Email})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to count documents",
			})
			return
		}

		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "User already exists, please login",
			})
			return
		}

		// Save user
		result, err := userCollection.InsertOne(ctx, user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to register user",
			})
			return
		}

		// Generate OTP
		emailOTP := utils.GenerateOTP()

		CreateOTPRecord(client, user.UserID, "EMAIL", emailOTP)

		err = services.SendEmailOTP(user.Email, emailOTP)
		if err != nil {
			log.Println("Email send failed:", err)
		}

		fmt.Println("Email OTP:", emailOTP)

		c.JSON(http.StatusCreated, gin.H{
			"message":     "User registered successfully. Please verify OTP.",
			"user_id":     user.UserID,
			"role":        user.Role,
			"inserted_id": result.InsertedID,
		})
	}
}

func LoginUser(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var userLogin models.UserLogin
		if err := c.ShouldBindJSON(&userLogin); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid credentials"})
			return
		}

		userCollection := database.OpenCollection("users", client)

		var foundUser models.User
		err := userCollection.FindOne(ctx, bson.M{"email": userLogin.Email}).Decode(&foundUser)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}

		// Check verification status
		if !foundUser.IsActive {

			// Resend OTP automatically
			err := ResendUserOTP(client, foundUser)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Account not verified and failed to resend OTP",
				})
				return
			}

			c.JSON(http.StatusUnauthorized, gin.H{
				"error":  "Account not verified. OTP sent again.",
				"userid": foundUser.UserID,
				"role":   foundUser.Role,
			})
			return
		}

		// Password check
		err = bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(userLogin.Password))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}

		// Generate tokens
		token, refreshtoken, _, err := utils.GenerateAllToken(
			foundUser.Email,
			foundUser.FirstName,
			foundUser.LastName,
			foundUser.Role,
			foundUser.UserID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate tokens"})
			return
		}

		// Update tokens in DB
		err = utils.UpdateAllTokens(foundUser.UserID, token, refreshtoken, client)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tokens"})
			return
		}
		// ===== SET COOKIES (PRODUCTION STYLE) =====

		// Access Token - 1 day
		c.SetCookie(
			"accessToken",
			token,
			86400, // 1 day
			"/",
			"",    // domain (empty for localhost)
			false, // secure (true in production HTTPS)
			true,  // HttpOnly
		)

		// Refresh Token - 7 days
		c.SetCookie(
			"refreshToken",
			refreshtoken,
			604800, // 7 days
			"/",
			"",
			false,
			true,
		)

		// Success response
		c.JSON(http.StatusAccepted, models.UserResponse{
			UserID:       foundUser.UserID,
			FirstName:    foundUser.FirstName,
			LastName:     foundUser.LastName,
			Email:        foundUser.Email,
			Role:         foundUser.Role,
			Token:        token,
			RefreshToken: refreshtoken,
		})
	}
}

func LogoutHandler(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		// Get userId from middleware (JWT claims)
		userIdValue, exists := c.Get("userid")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		userId, ok := userIdValue.(string)
		if !ok || userId == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user"})
			return
		}

		// Clear tokens in DB
		err := utils.UpdateAllTokens(userId, "", "", client)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong while updating tokens"})
			return
		}

		// Clear cookies (LOCALHOST SAFE)
		c.SetCookie("accessToken", "", -1, "/", "", false, true)
		c.SetCookie("refreshToken", "", -1, "/", "", false, true)

		c.JSON(http.StatusOK, gin.H{"msg": "User Logged out Successfully"})
	}
}

func RefreshTokenHandler(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		refreshToken, err := c.Cookie("refreshToken")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unable to retrieve refreshToken"})
			return
		}
		if refreshToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Empty refreshToken"})
			return
		}
		claims, err := utils.ValidateRefreshToken(refreshToken)
		if err != nil || claims == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired tokens"})
			return
		}
		var userCollection *mongo.Collection = database.OpenCollection("users", client)
		var user models.User
		err = userCollection.FindOne(ctx, bson.M{"userid": claims.UserID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found for refresh token"})
			return
		}

		newToken, newRefreshToken, _, err := utils.GenerateAllToken(user.Email, user.FirstName, user.LastName, user.Role, user.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate new Tokens"})
			return
		}
		err = utils.UpdateAllTokens(user.UserID, newToken, newRefreshToken, client)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falied to Update tokens"})
			return
		}
		c.SetCookie("accessToken", newToken, 86400, "/", "localhost", false, true)
		c.SetCookie("refreshToken", newRefreshToken, 604800, "/", "localhost", false, true)
		c.JSON(http.StatusOK, gin.H{
			"accessToken": newToken,
		})

	}
}
func GetUserProfile(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		Userid, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get Userid"})
			return
		}
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		var foundUser models.User
		var userCollection *mongo.Collection = database.OpenCollection("users", client)
		if err = userCollection.FindOne(ctx, bson.M{"userid": Userid}).Decode(&foundUser); err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user profile"})
			}
			return
		}
		userData := gin.H{
			"userid":          foundUser.UserID,
			"firstname":       foundUser.FirstName,
			"lastname":        foundUser.LastName,
			"email":           foundUser.Email,
			"mobile":          foundUser.Mobile,
			"dob":             foundUser.DOB,
			"role":            foundUser.Role,
			"usercart":        foundUser.UserCart,
			"orderids":        foundUser.OrderIDs,
			"favouritecities": foundUser.FavouriteCities,
			"createdat":       foundUser.CreatedAt,
			"updatedat":       foundUser.UpdatedAt,
		}
		if foundUser.Role == "PARTNER" && foundUser.Partner != nil {
			partner := foundUser.Partner
			address := gin.H{
				"street":  partner.Address.Street,
				"city":    partner.Address.City,
				"state":   partner.Address.State,
				"pincode": partner.Address.Pincode,
				"country": partner.Address.Country,
			}
			listings := gin.H{
				"billboardids": partner.Listings.BillboardIDs,
			}
			partnerData := gin.H{
				"partnerid":     partner.PartnerID,
				"businessname":  partner.BusinessName,
				"gstnumber":     partner.GSTNumber,
				"pannumber":     partner.PANNumber,
				"contactemail":  partner.ContactEmail,
				"contactphone":  partner.ContactPhone,
				"address":       address,
				"isverified":    partner.IsVerified,
				"status":        partner.Status,
				"joinedat":      partner.JoinedAt,
				"approvedat":    partner.ApprovedAt,
				"listings":      listings,
				"orderids":      partner.OrderIDs,
				"totallistings": partner.TotalListings,
				"totalearnings": partner.TotalEarnings,
				"rating":        partner.Rating,
				"businesstype":  partner.BusinessType,
			}
			userData["partner"] = partnerData
		}
		c.JSON(http.StatusOK, gin.H{"user": userData})
	}
}
func UpdateUserProfile(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// ================= AUTH =================
		userId, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// ================= REQUEST DTO =================
		type AddressUpdate struct {
			Street  *string `json:"street,omitempty"`
			City    *string `json:"city,omitempty"`
			State   *string `json:"state,omitempty"`
			Pincode *string `json:"pincode,omitempty"`
		}

		type PartnerUpdate struct {
			BusinessName *string        `json:"businessname,omitempty"`
			ContactEmail *string        `json:"contactemail,omitempty"`
			ContactPhone *string        `json:"contactphone,omitempty"`
			BusinessType *string        `json:"businesstype,omitempty"`
			Address      *AddressUpdate `json:"address,omitempty"`
		}

		type UpdateRequest struct {
			FirstName       *string        `json:"firstname,omitempty"`
			LastName        *string        `json:"lastname,omitempty"`
			Email           *string        `json:"email,omitempty"`
			Mobile          *string        `json:"mobile,omitempty"`
			DOB             *time.Time     `json:"dob,omitempty"`
			FavouriteCities *[]string      `json:"favouritecities,omitempty"`
			Partner         *PartnerUpdate `json:"partner,omitempty"`
		}

		var req UpdateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		userCollection := database.OpenCollection("users", client)

		// ================= FETCH USER =================
		var existingUser models.User
		err = userCollection.FindOne(ctx, bson.M{"userid": userId}).Decode(&existingUser)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		updateFields := bson.M{}

		// ================= BASIC FIELDS =================
		if req.FirstName != nil {
			updateFields["firstname"] = strings.TrimSpace(*req.FirstName)
		}

		if req.LastName != nil {
			updateFields["lastname"] = strings.TrimSpace(*req.LastName)
		}

		if req.Mobile != nil {
			mobile := strings.TrimSpace(*req.Mobile)

			// Check duplicate mobile
			count, _ := userCollection.CountDocuments(ctx, bson.M{
				"mobile": mobile,
				"userid": bson.M{"$ne": userId},
			})
			if count > 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Mobile already in use"})
				return
			}

			updateFields["mobile"] = mobile
		}

		if req.Email != nil {
			email := strings.ToLower(strings.TrimSpace(*req.Email))

			// Prevent updating to same email
			if email != existingUser.Email {
				count, _ := userCollection.CountDocuments(ctx, bson.M{
					"email":  email,
					"userid": bson.M{"$ne": userId},
				})
				if count > 0 {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Email already in use"})
					return
				}

				// Require re-verification
				updateFields["email"] = email
				updateFields["emailverified"] = false
			}
		}

		if req.DOB != nil {
			updateFields["dob"] = *req.DOB
		}

		if req.FavouriteCities != nil {
			updateFields["favouritecities"] = req.FavouriteCities
		}

		// ================= PARTNER UPDATE =================
		if req.Partner != nil {

			// Ensure user is partner
			if existingUser.Role != "PARTNER" {
				c.JSON(http.StatusForbidden, gin.H{"error": "Only partners can update partner details"})
				return
			}

			if req.Partner.BusinessName != nil {
				updateFields["partner.businessname"] =
					strings.TrimSpace(*req.Partner.BusinessName)
			}

			if req.Partner.ContactEmail != nil {
				updateFields["partner.contactemail"] =
					strings.ToLower(strings.TrimSpace(*req.Partner.ContactEmail))
			}

			if req.Partner.ContactPhone != nil {
				updateFields["partner.contactphone"] =
					strings.TrimSpace(*req.Partner.ContactPhone)
			}

			if req.Partner.BusinessType != nil {
				updateFields["partner.businesstype"] =
					strings.TrimSpace(*req.Partner.BusinessType)
			}

			if req.Partner.Address != nil {
				addr := req.Partner.Address

				if addr.Street != nil {
					updateFields["partner.address.street"] =
						strings.TrimSpace(*addr.Street)
				}
				if addr.City != nil {
					updateFields["partner.address.city"] =
						strings.TrimSpace(*addr.City)
				}
				if addr.State != nil {
					updateFields["partner.address.state"] =
						strings.TrimSpace(*addr.State)
				}
				if addr.Pincode != nil {
					updateFields["partner.address.pincode"] =
						strings.TrimSpace(*addr.Pincode)
				}
			}
		}

		// ================= EMPTY CHECK =================
		if len(updateFields) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No valid fields provided"})
			return
		}

		updateFields["updatedat"] = time.Now()

		// ================= UPDATE =================
		_, err = userCollection.UpdateOne(
			ctx,
			bson.M{"userid": userId},
			bson.M{"$set": updateFields},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Profile updated successfully",
		})
	}
}

// func GetUserBookings(client *mongo.Client) gin.HandlerFunc {
// 	return func(c *gin.Context) {

// 		ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
// 		defer cancel()

// 		userID, err := utils.GetUserIdFromContext(c)
// 		if err != nil {
// 			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
// 			return
// 		}

// 		orderCollection := database.OpenCollection("orders", client)

// 		pipeline := mongo.Pipeline{

// 			// FAST INDEX MATCH FIRST
// 			{{"$match", bson.M{
// 				"customerid":    userID,
// 				"paymentstatus": "PAID",
// 			}}},

// 			// ONLY KEEP NEEDED FIELDS
// 			{{"$project", bson.M{
// 				"orderid":   1,
// 				"createdat": 1,
// 				"ordercart": 1,
// 			}}},

// 			// FLATTEN BOOKINGS
// 			{{"$unwind", "$ordercart"}},

// 			// IGNORE CANCELLED
// 			{{"$match", bson.M{
// 				"ordercart.status": bson.M{
// 					"$ne": "CANCELLED",
// 				},
// 			}}},

// 			// SAFE RESPONSE
// 			{{"$project", bson.M{
// 				"_id": 0,

// 				"orderId":     "$orderid",
// 				"billboardId": "$ordercart.billboardid",

// 				"title":      "$ordercart.title",
// 				"coverImage": "$ordercart.coverimage",

// 				"fromDate": "$ordercart.fromdate",
// 				"toDate":   "$ordercart.todate",

// 				"material": "$ordercart.selectedmaterial",
// 				"mounting": "$ordercart.selectedmounting",

// 				"status": "$ordercart.status",

// 				"confirmedAt": "$ordercart.confirmedat",
// 				"liveAt":      "$ordercart.liveat",

// 				// HIDE INTERNAL TOKEN
// 				"mountingProof": bson.M{
// 					"photos": bson.M{"$ifNull": []interface{}{"$ordercart.mountingproof.photos", []string{}}},
// 					"video":  bson.M{"$ifNull": []interface{}{"$ordercart.mountingproof.video", ""}},
// 				},

// 				"createdAt": "$createdat",
// 			}}},

// 			// LATEST FIRST
// 			{{"$sort", bson.M{
// 				"createdAt": -1,
// 			}}},
// 		}

// 		cursor, err := orderCollection.Aggregate(ctx, pipeline)
// 		if err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
// 			return
// 		}
// 		defer cursor.Close(ctx)

// 		var bookings []bson.M
// 		if err := cursor.All(ctx, &bookings); err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Decode failed"})
// 			return
// 		}

//			c.JSON(http.StatusOK, gin.H{
//				"success":  true,
//				"count":    len(bookings),
//				"bookings": bookings,
//			})
//		}
//	}
func GetUserBookings(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
		defer cancel()

		userID, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		orderCollection := database.OpenCollection("orders", client)

		pipeline := mongo.Pipeline{

			// MATCH FIRST (INDEXED)
			{{"$match", bson.M{
				"customerid":    userID,
				"paymentstatus": "PAID",
			}}},

			// KEEP ONLY REQUIRED FIELDS
			{{"$project", bson.M{
				"orderid":              1,
				"createdat":            1,
				"ordercart":            1,
				"paymentcaptured":      1,
				"paymentverifiedat":    1,
				"paymentmethoddetails": 1,
			}}},

			// FLATTEN BOOKINGS
			{{"$unwind", "$ordercart"}},

			// IGNORE CANCELLED
			{{"$match", bson.M{
				"ordercart.status": bson.M{
					"$ne": "CANCELLED",
				},
			}}},

			// SAFE PROJECTION
			{{"$project", bson.M{
				"_id": 0,

				"orderId":     "$orderid",
				"billboardId": "$ordercart.billboardid",

				"title":      "$ordercart.title",
				"coverImage": "$ordercart.coverimage",

				"fromDate": "$ordercart.fromdate",
				"toDate":   "$ordercart.todate",

				"material": "$ordercart.selectedmaterial",
				"mounting": "$ordercart.selectedmounting",

				"status": "$ordercart.status",

				"confirmedAt": "$ordercart.confirmedat",
				"liveAt":      "$ordercart.liveat",

				"mountingProof": bson.M{
					"photos": bson.M{"$ifNull": []interface{}{"$ordercart.mountingproof.photos", []string{}}},
					"video":  bson.M{"$ifNull": []interface{}{"$ordercart.mountingproof.video", ""}},
				},

				// 🔥 PAYMENT META (FOR FUTURE DISPUTE / INVOICE)
				"paymentMethod": bson.M{
					"$ifNull": []interface{}{"$paymentmethoddetails.method", ""},
				},
				"paymentCaptured": bson.M{
					"$ifNull": []interface{}{"$paymentcaptured", false},
				},
				"paymentVerifiedAt": bson.M{
					"$ifNull": []interface{}{"$paymentverifiedat", nil},
				},

				"createdAt": "$createdat",
			}}},

			// LATEST FIRST
			{{"$sort", bson.M{
				"createdAt": -1,
			}}},
		}

		cursor, err := orderCollection.Aggregate(ctx, pipeline)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
			return
		}
		defer cursor.Close(ctx)

		var bookings []bson.M
		if err := cursor.All(ctx, &bookings); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Decode failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success":  true,
			"count":    len(bookings),
			"bookings": bookings,
		})
	}
}
