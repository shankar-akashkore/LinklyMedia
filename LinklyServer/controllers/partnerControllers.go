package controllers

import (
	"LinklyMedia/database"
	"LinklyMedia/middleware"
	"LinklyMedia/models"
	"LinklyMedia/services"
	"LinklyMedia/utils"
	"context"
	"encoding/json"
	"errors"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func AddBillboard(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		// ================= ROLE VALIDATION =================
		role, err := middleware.GetRoleMiddleware(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get role"})
			return
		}
		if role != "PARTNER" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Only PARTNER can add billboard"})
			return
		}

		userIdValue, exists := c.Get("userid")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User ID missing in context"})
			return
		}

		userId, ok := userIdValue.(string)
		if !ok || strings.TrimSpace(userId) == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		userCollection := database.OpenCollection("users", client)

		var foundUser models.User
		err = userCollection.FindOne(ctx, bson.M{"userid": userId}).Decode(&foundUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
			return
		}

		if foundUser.Role != "PARTNER" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Only partner can add billboard"})
			return
		}

		// ================= BASIC FIELD VALIDATION =================
		title := strings.TrimSpace(c.PostForm("billboardtitle"))
		description := strings.TrimSpace(c.PostForm("description"))
		landmark := strings.TrimSpace(c.PostForm("landmark"))
		locality := strings.TrimSpace(c.PostForm("locality"))
		if description == "" || landmark == "" || locality == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Description, landmark and locality are required"})
			return
		}

		location := strings.TrimSpace(c.PostForm("location"))
		city := strings.TrimSpace(c.PostForm("city"))

		if title == "" || location == "" || city == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Title, location and city are required"})
			return
		}

		priceStr := c.PostForm("price")
		price, err := strconv.Atoi(priceStr)
		if err != nil || price <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid price"})
			return
		}

		widthStr := c.PostForm("widthinft")
		heightStr := c.PostForm("heightinft")

		width, err := strconv.Atoi(widthStr)
		if err != nil || width <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid width"})
			return
		}

		height, err := strconv.Atoi(heightStr)
		if err != nil || height <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid height"})
			return
		}

		impressionsStr := c.PostForm("impressions")
		impressions, err := strconv.Atoi(impressionsStr)
		if err != nil || impressions < 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid impressions"})
			return
		}
		minspanStr := c.PostForm("minspan")
		minspan, err := strconv.Atoi(minspanStr)
		if err != nil || minspan <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid minspan"})
			return
		}

		// ================= MATERIALS & MOUNTINGS =================
		materialsJSON := strings.TrimSpace(c.PostForm("materials"))
		mountingsJSON := strings.TrimSpace(c.PostForm("mountings"))

		if materialsJSON == "" || mountingsJSON == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Materials and mountings are required"})
			return
		}

		var materials []models.MaterialPricing
		var mountings []models.MountingPricing

		if err := json.Unmarshal([]byte(materialsJSON), &materials); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid materials format"})
			return
		}

		if err := json.Unmarshal([]byte(mountingsJSON), &mountings); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mountings format"})
			return
		}

		if len(materials) == 0 || len(mountings) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "At least one material and mounting required"})
			return
		}

		materialSet := make(map[string]bool)
		for _, m := range materials {
			if strings.TrimSpace(m.MaterialType) == "" || m.PricePerSqFt <= 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid material pricing"})
				return
			}
			if materialSet[m.MaterialType] {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Duplicate material types not allowed"})
				return
			}
			materialSet[m.MaterialType] = true
		}

		mountingSet := make(map[string]bool)
		for _, m := range mountings {
			if strings.TrimSpace(m.MountingType) == "" || m.FlatCharge < 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mounting pricing"})
				return
			}
			if mountingSet[m.MountingType] {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Duplicate mounting types not allowed"})
				return
			}
			mountingSet[m.MountingType] = true
		}

		// ================= IMAGE VALIDATION =================
		form, err := c.MultipartForm()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid multipart form"})
			return
		}

		files := form.File["images"]
		if len(files) == 0 || len(files) > 5 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "1 to 5 images required"})
			return
		}

		allowedTypes := map[string]bool{
			"image/jpeg": true,
			"image/jpg":  true,
			"image/png":  true,
			"image/webp": true,
		}

		maxSize := int64(5 << 20)

		for _, file := range files {
			if file.Size > maxSize {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Each image must be less than 5MB"})
				return
			}

			openedFile, err := file.Open()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read image"})
				return
			}

			buffer := make([]byte, 512)
			_, err = openedFile.Read(buffer)
			openedFile.Close()

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to inspect image"})
				return
			}

			fileType := http.DetectContentType(buffer)
			if !allowedTypes[fileType] {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Only JPG, PNG, WEBP allowed"})
				return
			}
		}
		typeStr := strings.TrimSpace(c.PostForm("types"))
		if typeStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "At least one type required"})
			return
		}

		typeNames := strings.Split(typeStr, ",")

		var types []models.Type
		for i, t := range typeNames {
			clean := strings.TrimSpace(t)
			if clean == "" {
				continue
			}
			types = append(types, models.Type{
				TypeID:   i + 1,
				TypeName: clean,
			})
		}

		if len(types) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid types"})
			return
		}

		// ================= UPLOAD IMAGES =================
		// ================= CREATE BILLBOARD (WITHOUT IMAGES FIRST) =================
		billboard := models.Billboard{
			ID:             primitive.NewObjectID(),
			BillboardID:    primitive.NewObjectID().Hex(),
			BillboardTitle: title,
			Description:    description,
			Landmark:       landmark,
			Locality:       locality,
			Location:       location,
			City:           city,
			Impressions:    impressions,
			MinSpan:        minspan,
			Price:          price,
			Type:           types,
			PartnerID:      userId,
			Images:         []models.BillboardImage{}, // empty initially
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
			Size: models.Size{
				Width:  width,
				Height: height,
			},
			Materials:     materials,
			Mountings:     mountings,
			AverageRating: 0,
			TotalLikes:    0,
			Reviews:       []models.CustomerReview{},
			IsActive:      true,
		}

		validate := validator.New()
		if err := validate.StructExcept(billboard, "Images"); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Validation failed",
				"details": err.Error(),
			})
			return
		}

		billboardCollection := database.OpenCollection("billboards", client)

		// ---------- STEP 1: Insert billboard WITHOUT images ----------
		_, err = billboardCollection.InsertOne(ctx, billboard)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert billboard"})
			return
		}

		// ================= UPLOAD IMAGES =================
		var uploadedImages []models.BillboardImage
		var uploadedPublicIDs []string

		for i, file := range files {

			uploadedImg, err := services.UploadToCloudinary(file)
			if err != nil {

				// Rollback DB record
				_, _ = billboardCollection.DeleteOne(ctx, bson.M{"billboardid": billboard.BillboardID})

				// Rollback already uploaded images
				for _, pid := range uploadedPublicIDs {
					_ = services.DeleteFromCloudinary(pid)
				}

				c.JSON(http.StatusInternalServerError, gin.H{"error": "Image upload failed"})
				return
			}

			uploadedImg.IsPrimary = (i == 0)

			uploadedImages = append(uploadedImages, uploadedImg)
			uploadedPublicIDs = append(uploadedPublicIDs, uploadedImg.PublicID)
		}

		// ---------- STEP 2: Update billboard with images ----------
		_, err = billboardCollection.UpdateOne(
			ctx,
			bson.M{"billboardid": billboard.BillboardID},
			bson.M{
				"$set": bson.M{
					"images":    uploadedImages,
					"updatedat": time.Now(),
				},
			},
		)

		if err != nil {

			// Rollback DB
			_, _ = billboardCollection.DeleteOne(ctx, bson.M{"billboardid": billboard.BillboardID})

			// Rollback images
			for _, pid := range uploadedPublicIDs {
				_ = services.DeleteFromCloudinary(pid)
			}

			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save images"})
			return
		}

		// ---------- STEP 3: Update partner listings ----------
		update := bson.M{
			"$addToSet": bson.M{
				"partner.listings.billboardids": billboard.BillboardID,
			},
		}

		_, err = userCollection.UpdateOne(ctx, bson.M{"userid": userId}, update)
		if err != nil {

			// Full rollback
			_, _ = billboardCollection.DeleteOne(ctx, bson.M{"billboardid": billboard.BillboardID})

			for _, pid := range uploadedPublicIDs {
				_ = services.DeleteFromCloudinary(pid)
			}

			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update partner listings"})
			return
		}

		// ---------- SUCCESS ----------
		c.JSON(http.StatusOK, gin.H{
			"message": "Billboard added successfully",
			"id":      billboard.BillboardID,
		})

	}
}

func DeleteBillboard(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(c.Request.Context(), 20*time.Second)
		defer cancel()

		billboardID := strings.TrimSpace(c.Param("billboardid"))
		if billboardID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid billboard ID"})
			return
		}

		userID, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		billboardCollection := database.OpenCollection("billboards", client)
		userCollection := database.OpenCollection("users", client)
		orderCollection := database.OpenCollection("orders", client)

		// 🔹 Step 1: Fetch billboard
		var billboard models.Billboard
		err = billboardCollection.FindOne(ctx, bson.M{
			"billboardid": billboardID,
		}).Decode(&billboard)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Billboard not found"})
			return
		}

		// 🔒 Ownership check
		if billboard.PartnerID != userID {
			c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to delete this billboard"})
			return
		}

		// 🔒 Step 2: Check active orders
		activeFilter := bson.M{
			"ordercart.billboardid": billboardID,
			"$or": []bson.M{
				{"orderstatus": "CONFIRMED"},
				{
					"orderstatus": "PENDING",
					"expiresat":   bson.M{"$gt": time.Now().UTC()},
				},
			},
		}

		activeCount, err := orderCollection.CountDocuments(ctx, activeFilter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify active orders"})
			return
		}

		if activeCount > 0 {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Cannot delete billboard while active bookings exist",
			})
			return
		}

		// 🔹 Step 3: Delete Cloudinary images
		for _, img := range billboard.Images {
			if img.PublicID != "" {
				_ = services.DeleteFromCloudinary(img.PublicID)
			}
		}

		// 🔹 Step 4: Delete billboard from DB
		_, err = billboardCollection.DeleteOne(ctx, bson.M{
			"billboardid": billboardID,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete billboard"})
			return
		}

		// 🔹 Step 5: Remove from partner listings
		_, err = userCollection.UpdateOne(
			ctx,
			bson.M{"userid": userID},
			bson.M{
				"$pull": bson.M{
					"partner.listings.billboardids": billboardID,
				},
			},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update partner listings"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":     "Billboard deleted successfully",
			"billboardid": billboardID,
		})
	}
}
func GetPartnerListings(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		// ================= AUTH VALIDATION =================
		role, err := middleware.GetRoleMiddleware(c)
		if err != nil || role != "PARTNER" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Unauthorized access",
			})
			return
		}

		partnerID, err := utils.GetUserIdFromContext(c)
		if err != nil || partnerID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Invalid partner identity",
			})
			return
		}

		// ================= PAGINATION =================
		page := 1
		limit := 10

		if p := c.Query("page"); p != "" {
			if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 && parsed <= 10000 {
				page = parsed
			}
		}

		if l := c.Query("limit"); l != "" {
			if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 50 {
				limit = parsed
			}
		}

		skip := (page - 1) * limit

		// ================= CONTEXT =================
		ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
		defer cancel()

		collection := database.OpenCollection("billboards", client)

		filter := bson.M{
			"partnerid": partnerID,
		}

		findOptions := options.Find().
			SetSort(bson.D{{Key: "createdat", Value: -1}}).
			SetSkip(int64(skip)).
			SetLimit(int64(limit))

		cursor, err := collection.Find(ctx, filter, findOptions)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to fetch listings",
			})
			return
		}
		defer cursor.Close(ctx)

		var listings []models.Billboard // ✅ Strongly typed

		for cursor.Next(ctx) {
			var billboard models.Billboard

			if err := cursor.Decode(&billboard); err != nil {
				continue // skip corrupted doc
			}

			// Optional: Auto set thumbnail if frontend needs it
			// for _, img := range billboard.Images {
			// 	if img.IsPrimary {
			// 		billboard.Thumbnail = img.URL
			// 		break
			// 	}
			// }

			listings = append(listings, billboard)
		}

		if err := cursor.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Cursor processing failed",
			})
			return
		}

		total, err := collection.CountDocuments(ctx, filter)
		if err != nil {
			total = 0
		}

		totalPages := int(math.Ceil(float64(total) / float64(limit)))

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    listings,
			"pagination": gin.H{
				"page":       page,
				"limit":      limit,
				"total":      total,
				"totalPages": totalPages,
			},
		})
	}
}

func UpdateBillboard(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(c.Request.Context(), 20*time.Second)
		defer cancel()

		billboardID := strings.TrimSpace(c.Param("billboardid"))
		if billboardID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid billboard ID"})
			return
		}

		partnerID, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		billboardCollection := database.OpenCollection("billboards", client)

		// 🔹 Fetch billboard
		var existing models.Billboard
		err = billboardCollection.FindOne(ctx, bson.M{
			"billboardid": billboardID,
		}).Decode(&existing)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Billboard not found"})
			return
		}

		// 🔒 Ownership enforcement
		if existing.PartnerID != partnerID {
			c.JSON(http.StatusForbidden, gin.H{"error": "You do not own this billboard"})
			return
		}

		updateFields := bson.M{}

		// ================= BASIC FIELDS =================

		if v := strings.TrimSpace(c.PostForm("billboardtitle")); v != "" {
			updateFields["billboardtitle"] = v
		}

		if v := strings.TrimSpace(c.PostForm("description")); v != "" {
			updateFields["description"] = v
		}

		if v := strings.TrimSpace(c.PostForm("landmark")); v != "" {
			updateFields["landmark"] = v
		}

		if v := strings.TrimSpace(c.PostForm("locality")); v != "" {
			updateFields["locality"] = v
		}

		if v := strings.TrimSpace(c.PostForm("location")); v != "" {
			updateFields["location"] = v
		}

		if v := strings.TrimSpace(c.PostForm("city")); v != "" {
			updateFields["city"] = v
		}

		// ================= NUMERIC FIELDS =================

		if v := strings.TrimSpace(c.PostForm("price")); v != "" {
			price, err := strconv.Atoi(v)
			if err != nil || price <= 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid price"})
				return
			}
			updateFields["price"] = price
		}

		if v := strings.TrimSpace(c.PostForm("impressions")); v != "" {
			impressions, err := strconv.Atoi(v)
			if err != nil || impressions < 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid impressions"})
				return
			}
			updateFields["impressions"] = impressions
		}

		if v := strings.TrimSpace(c.PostForm("minspan")); v != "" {
			minSpan, err := strconv.Atoi(v)
			if err != nil || minSpan <= 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid minspan"})
				return
			}
			updateFields["minspan"] = minSpan
		}

		// ================= SIZE (Nested Update) =================

		if v := strings.TrimSpace(c.PostForm("widthinft")); v != "" {
			width, err := strconv.Atoi(v)
			if err != nil || width <= 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid width"})
				return
			}
			updateFields["size.widthinft"] = width
		}

		if v := strings.TrimSpace(c.PostForm("heightinft")); v != "" {
			height, err := strconv.Atoi(v)
			if err != nil || height <= 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid height"})
				return
			}
			updateFields["size.heightinft"] = height
		}

		// ================= MATERIALS =================

		if materialsJSON := strings.TrimSpace(c.PostForm("materials")); materialsJSON != "" {

			var materials []models.MaterialPricing
			if err := json.Unmarshal([]byte(materialsJSON), &materials); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid materials format"})
				return
			}

			if len(materials) == 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "At least one material required"})
				return
			}

			updateFields["materials"] = materials
		}

		// ================= MOUNTINGS =================

		if mountingsJSON := strings.TrimSpace(c.PostForm("mountings")); mountingsJSON != "" {

			var mountings []models.MountingPricing
			if err := json.Unmarshal([]byte(mountingsJSON), &mountings); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mountings format"})
				return
			}

			if len(mountings) == 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "At least one mounting required"})
				return
			}

			updateFields["mountings"] = mountings
		}

		// ================= TYPE =================

		if typeStr := strings.TrimSpace(c.PostForm("types")); typeStr != "" {
			typeNames := strings.Split(typeStr, ",")

			var types []models.Type
			for i, t := range typeNames {
				clean := strings.TrimSpace(t)
				if clean == "" {
					continue
				}
				types = append(types, models.Type{
					TypeID:   i + 1,
					TypeName: clean,
				})
			}

			if len(types) == 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid types"})
				return
			}

			updateFields["type"] = types
		}

		// ================= ACTIVE ORDER CHECK =================

		orderCollection := database.OpenCollection("orders", client)

		activeFilter := bson.M{
			"ordercart.billboardid": billboardID,
			"$or": []bson.M{
				{"orderstatus": "CONFIRMED"},
				{
					"orderstatus": "PENDING",
					"expiresat":   bson.M{"$gt": time.Now().UTC()},
				},
			},
		}

		activeCount, err := orderCollection.CountDocuments(ctx, activeFilter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify active orders"})
			return
		}

		// 🔒 Restrict structural updates if active orders exist
		if activeCount > 0 {

			restricted := []string{
				"price",
				"minspan",
				"size.widthinft",
				"size.heightinft",
				"materials",
				"mountings",
			}

			for _, field := range restricted {
				if _, exists := updateFields[field]; exists {
					c.JSON(http.StatusForbidden, gin.H{
						"error": "Cannot modify pricing or structural fields while active orders exist",
					})
					return
				}
			}
		}

		if len(updateFields) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No valid fields provided"})
			return
		}

		updateFields["updatedat"] = time.Now().UTC()

		_, err = billboardCollection.UpdateOne(
			ctx,
			bson.M{"billboardid": billboardID},
			bson.M{"$set": updateFields},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update billboard"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Billboard updated successfully",
		})
	}
}

func GetPartnerBillboardByID(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		// -----------------------------
		// 1. Validate Billboard ID
		// -----------------------------
		idParam := strings.TrimSpace(c.Param("id"))
		if idParam == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Billboard ID is required",
			})
			return
		}

		// objectID, err := primitive.ObjectIDFromHex(idParam)
		// if err != nil {
		// 	c.JSON(http.StatusBadRequest, gin.H{
		// 		"error": "Invalid billboard ID format",
		// 	})
		// 	return
		// }

		// -----------------------------
		// 2. Get User ID from Context
		// -----------------------------
		userID, err := utils.GetUserIdFromContext(c)
		if err != nil || strings.TrimSpace(userID) == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Unauthorized",
			})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userCollection := database.OpenCollection("users", client)
		billboardCollection := database.OpenCollection("billboards", client)

		// -----------------------------
		// 3. Validate Partner
		// -----------------------------
		var user models.User
		err = userCollection.FindOne(ctx, bson.M{"userid": userID}).Decode(&user)

		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": "User not found",
				})
				return
			}

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch user",
			})
			return
		}

		// Role check
		if user.Role != "PARTNER" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Only partners can access this resource",
			})
			return
		}

		// Partner checks
		if user.Partner == nil {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Partner profile missing",
			})
			return
		}

		if !user.IsActive {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Account inactive",
			})
			return
		}

		if !user.Partner.IsVerified || user.Partner.Status != "APPROVED" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Partner not verified or approved",
			})
			return
		}

		// -----------------------------
		// 4. Fetch Billboard (ownership enforced)
		// -----------------------------
		filter := bson.M{
			//"_id":       objectID,
			"partnerid": userID,
		}

		// Projection: include only required fields
		// projection := bson.M{
		// 	"_id":             1,
		// 	"billboardid":     1,
		// 	"billboardtitle":  1,
		// 	"description":     1,
		// 	"location":        1,
		// 	"city":            1,
		// 	"landmark":        1,
		// 	"price":           1,
		// 	"impressions":     1,
		// 	"type":            1,
		// 	"images":          1,
		// 	"size":            1,
		// 	"executioncharge": 1,
		// 	"averagerating":   1,
		// 	"totallikes":      1,
		// 	"createdat":       1,
		// 	"updatedat":       1,
		// }

		var billboard models.Billboard

		err = billboardCollection.FindOne(
			ctx,
			filter,
			// options.FindOne().SetProjection(projection),
		).Decode(&billboard)

		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "Billboard not found or access denied",
				})
				return
			}

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Database error",
			})
			return
		}

		// -----------------------------
		// 5. Defensive fixes (frontend safety)
		// -----------------------------
		if billboard.Images == nil {
			billboard.Images = []models.BillboardImage{}
		}
		if billboard.Type == nil {
			billboard.Type = []models.Type{}
		}

		// -----------------------------
		// 6. Response
		// -----------------------------
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    billboard,
		})
	}
}

// func UpdateBookingStatus(client *mongo.Client) gin.HandlerFunc {
// 	return func(c *gin.Context) {

// 		//---------------------------------------
// 		// 1. Validate Order ID
// 		//---------------------------------------
// 		orderIDParam := strings.TrimSpace(c.Param("id"))
// 		if orderIDParam == "" {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "Order ID is required"})
// 			return
// 		}

// 		orderObjectID, err := primitive.ObjectIDFromHex(orderIDParam)
// 		if err != nil {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Order ID"})
// 			return
// 		}

// 		//---------------------------------------
// 		// 2. Get Partner ID from JWT/context
// 		//---------------------------------------
// 		partnerID, err := utils.GetUserIdFromContext(c)
// 		if err != nil || partnerID == "" {
// 			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
// 			return
// 		}

// 		//---------------------------------------
// 		// 3. Parse request body
// 		//---------------------------------------
// 		var req struct {
// 			Status string `json:"status" binding:"required"`
// 		}

// 		if err := c.ShouldBindJSON(&req); err != nil {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
// 			return
// 		}

// 		newStatus := strings.ToUpper(strings.TrimSpace(req.Status))

// 		validStatuses := map[string]bool{
// 			"CONFIRMED": true,
// 			"CANCELLED": true,
// 			"COMPLETED": true,
// 		}

// 		if !validStatuses[newStatus] {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
// 			return
// 		}

// 		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
// 		defer cancel()

// 		userCollection := database.OpenCollection("users", client)
// 		orderCollection := database.OpenCollection("orders", client)

// 		//---------------------------------------
// 		// 4. Verify Partner Account
// 		//---------------------------------------
// 		var user models.User
// 		err = userCollection.FindOne(ctx, bson.M{"userid": partnerID}).Decode(&user)

// 		if err != nil {
// 			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
// 			return
// 		}

// 		if user.Role != "PARTNER" || user.Partner == nil {
// 			c.JSON(http.StatusForbidden, gin.H{"error": "Only partners allowed"})
// 			return
// 		}

// 		if !user.IsActive || !user.Partner.IsVerified || user.Partner.Status != "APPROVED" {
// 			c.JSON(http.StatusForbidden, gin.H{"error": "Partner not active or verified"})
// 			return
// 		}

// 		//---------------------------------------
// 		// 5. Fetch Order with ownership enforced
// 		//---------------------------------------
// 		var order models.Order

// 		err = orderCollection.FindOne(ctx, bson.M{
// 			"_id":       orderObjectID,
// 			"partnerid": partnerID,
// 		}).Decode(&order)

// 		if err != nil {
// 			if err == mongo.ErrNoDocuments {
// 				c.JSON(http.StatusNotFound, gin.H{
// 					"error": "Order not found or access denied",
// 				})
// 				return
// 			}
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
// 			return
// 		}

// 		//---------------------------------------
// 		// 6. Integrity checks
// 		//---------------------------------------
// 		if len(order.OrderCart) == 0 ||
// 			order.TotalBillboards == 0 ||
// 			order.TotalCheckoutPrice <= 0 {

// 			c.JSON(http.StatusBadRequest, gin.H{
// 				"error": "Invalid or corrupted order",
// 			})
// 			return
// 		}

// 		//---------------------------------------
// 		// 7. Expiry protection
// 		//---------------------------------------
// 		if time.Now().After(order.ExpiresAt) && order.OrderStatus == "PENDING" {
// 			c.JSON(http.StatusBadRequest, gin.H{
// 				"error": "Order expired",
// 			})
// 			return
// 		}

// 		//---------------------------------------
// 		// 8. Payment validation
// 		//---------------------------------------
// 		if newStatus == "CONFIRMED" && order.PaymentStatus != "PAID" {
// 			c.JSON(http.StatusBadRequest, gin.H{
// 				"error": "Payment not completed",
// 			})
// 			return
// 		}

// 		//---------------------------------------
// 		// 9. Status transition rules
// 		//---------------------------------------
// 		validTransitions := map[string][]string{
// 			"PENDING":   {"CONFIRMED", "CANCELLED"},
// 			"CONFIRMED": {"COMPLETED"},
// 		}

// 		currentStatus := order.OrderStatus
// 		nextStates, exists := validTransitions[currentStatus]

// 		if !exists {
// 			c.JSON(http.StatusBadRequest, gin.H{
// 				"error": "Order cannot be modified",
// 			})
// 			return
// 		}

// 		allowed := false
// 		for _, s := range nextStates {
// 			if s == newStatus {
// 				allowed = true
// 				break
// 			}
// 		}

// 		if !allowed {
// 			c.JSON(http.StatusBadRequest, gin.H{
// 				"error": "Invalid status transition",
// 			})
// 			return
// 		}

// 		//---------------------------------------
// 		// 10. Race-condition safe update
// 		//---------------------------------------
// 		update := bson.M{
// 			"$set": bson.M{
// 				"orderstatus": newStatus,
// 				"updatedat":   time.Now(),
// 			},
// 		}

// 		result, err := orderCollection.UpdateOne(
// 			ctx,
// 			bson.M{
// 				"_id":         orderObjectID,
// 				"partnerid":   partnerID,
// 				"orderstatus": currentStatus,
// 			},
// 			update,
// 		)

// 		if err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
// 			return
// 		}

// 		if result.MatchedCount == 0 {
// 			c.JSON(http.StatusConflict, gin.H{
// 				"error": "Order already updated by another request",
// 			})
// 			return
// 		}

//			//---------------------------------------
//			// 11. Success
//			//---------------------------------------
//			c.JSON(http.StatusOK, gin.H{
//				"success": true,
//				"message": "Order status updated successfully",
//			})
//		}
//	}
func GetPartnerBookings(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		// =====================================================
		// 1. Secure Partner Identity
		// =====================================================
		partnerIDValue, exists := c.Get("userid")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		partnerID, ok := partnerIDValue.(string)
		partnerID = strings.TrimSpace(partnerID)

		if !ok || partnerID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid partner identity"})
			return
		}

		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		// =====================================================
		// 2. Validate Partner Account
		// =====================================================
		userCollection := database.OpenCollection("users", client)

		var user models.User
		err := userCollection.FindOne(
			ctx,
			bson.M{"userid": partnerID},
			options.FindOne().SetProjection(bson.M{
				"role":               1,
				"isactive":           1,
				"partner.isverified": 1,
				"partner.status":     1,
			}),
		).Decode(&user)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Partner not found"})
			return
		}

		if user.Role != "PARTNER" ||
			user.Partner == nil ||
			!user.IsActive ||
			!user.Partner.IsVerified ||
			user.Partner.Status != "APPROVED" {

			c.JSON(http.StatusForbidden, gin.H{"error": "Access restricted"})
			return
		}

		// =====================================================
		// 3. Pagination
		// =====================================================
		page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil || page < 1 {
			page = 1
		}

		limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
		if err != nil || limit < 1 {
			limit = 10
		}
		if limit > 50 {
			limit = 50
		}

		skip := (page - 1) * limit

		// =====================================================
		// 4. Status Filter
		// =====================================================
		status := strings.ToUpper(strings.TrimSpace(c.Query("status")))

		validStatuses := map[string]bool{
			"PENDING":   true,
			"CONFIRMED": true,
			"CANCELLED": true,
			"COMPLETED": true,
			"EXPIRED":   true,
			"":          true,
		}

		if !validStatuses[status] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status filter"})
			return
		}

		// =====================================================
		// 5. Query Orders (Multi-Vendor Safe)
		// =====================================================
		orderCollection := database.OpenCollection("orders", client)

		filter := bson.M{
			"ordercart": bson.M{
				"$elemMatch": bson.M{
					"partnerid": partnerID,
				},
			},
		}

		if status != "" {
			filter["orderstatus"] = status
		}

		opts := options.Find().
			SetSort(bson.D{{Key: "createdat", Value: -1}}).
			SetSkip(int64(skip)).
			SetLimit(int64(limit))

		cursor, err := orderCollection.Find(ctx, filter, opts)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
			return
		}
		defer cursor.Close(ctx)

		var bookings []PartnerBookingResponse

		// =====================================================
		// 6. Process Each Order
		// =====================================================
		for cursor.Next(ctx) {

			var order models.Order
			if err := cursor.Decode(&order); err != nil {
				continue // skip corrupted record
			}

			// -----------------------------
			// Extract ONLY this partner’s items
			// -----------------------------
			var partnerItems []models.BillboardCart
			for _, item := range order.OrderCart {
				if item.PartnerID == partnerID {
					partnerItems = append(partnerItems, item)
				}
			}

			if len(partnerItems) == 0 {
				continue
			}

			// -----------------------------
			// Read Financial Truth
			// -----------------------------
			var pb *models.PartnerFinancialBreakdown

			for i := range order.PartnerBreakdown {
				if order.PartnerBreakdown[i].PartnerID == partnerID {
					pb = &order.PartnerBreakdown[i]
					break
				}
			}

			if pb == nil {
				continue // safety: skip if breakdown missing
			}
			// -----------------------------
			// Calculate Total Days SAFELY
			// -----------------------------
			totalDays := 0

			for _, item := range partnerItems {

				days, err := utils.CalculateDays(item.FromDate, item.ToDate)
				if err != nil {
					continue
				}

				totalDays += days
			}

			bookings = append(bookings, PartnerBookingResponse{
				OrderID:       order.OrderID,
				CustomerID:    order.CustomerID,
				OrderStatus:   order.OrderStatus,
				PaymentStatus: order.PaymentStatus,
				CreatedAt:     order.CreatedAt,
				PartnerItems:  partnerItems,
				TotalDays:     totalDays,

				BaseRentTotal:       pb.BaseRent,
				PrintingCostTotal:   pb.PrintingCost,
				MountingChargeTotal: pb.MountingCost,
				TaxableAmount:       pb.TaxableAmount,
				GST:                 pb.GST,
				GrossAmount:         pb.GrossAmount,
				Commission:          pb.Commission,
				NetPayout:           pb.NetPayout,

				//OrderTotal: order.TotalCheckoutPrice,
				//Discount:   order.DiscountAmount,
			})
		}

		if err := cursor.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Cursor error"})
			return
		}

		// =====================================================
		// 7. Pagination Metadata
		// =====================================================
		totalRecords, _ := orderCollection.CountDocuments(ctx, filter)
		totalPages := int(math.Ceil(float64(totalRecords) / float64(limit)))

		// =====================================================
		// 8. Final Response
		// =====================================================
		c.JSON(http.StatusOK, gin.H{
			"success":    true,
			"page":       page,
			"limit":      limit,
			"status":     status,
			"total":      totalRecords,
			"totalPages": totalPages,
			"count":      len(bookings),
			"bookings":   bookings,
		})
	}
}
func GetBasicPartnerDashboard(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
		defer cancel()

		partnerID, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		orderCollection := database.OpenCollection("orders", client)
		billboardCollection := database.OpenCollection("billboards", client)

		// ✅ ACTIVE INVENTORY (CLEAN NOW)
		activeListingsCount, err := billboardCollection.CountDocuments(ctx, bson.M{
			"partnerid": partnerID,
			"isactive":  true,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch active listings"})
			return
		}

		now := time.Now().UTC()
		startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)

		pipeline := mongo.Pipeline{

			// match only partner related orders
			{{"$match", bson.M{
				"ordercart.partnerid": partnerID,
			}}},

			// isolate partner cart item
			{{"$addFields", bson.M{
				"partnerItem": bson.M{
					"$first": bson.M{
						"$filter": bson.M{
							"input": "$ordercart",
							"as":    "item",
							"cond": bson.M{
								"$eq": []interface{}{"$$item.partnerid", partnerID},
							},
						},
					},
				},

				// isolate partner payout
				"partnerFinance": bson.M{
					"$first": bson.M{
						"$filter": bson.M{
							"input": "$partnerbreakdown",
							"as":    "pb",
							"cond": bson.M{
								"$eq": []interface{}{"$$pb.partnerid", partnerID},
							},
						},
					},
				},
			}}},

			// ✅ ignore cancelled or missing lifecycle
			{{"$match", bson.M{
				"partnerItem.status": bson.M{
					"$ne": "CANCELLED",
				},
				"partnerFinance.netpayout": bson.M{
					"$exists": true,
				},
			}}},

			// aggregate
			{{"$group", bson.M{

				"_id": nil,

				"totalOrders": bson.M{"$sum": 1},

				"todayOrders": bson.M{
					"$sum": bson.M{
						"$cond": []interface{}{
							bson.M{
								"$gte": []interface{}{
									"$partnerItem.confirmedat",
									startOfDay,
								},
							},
							1, 0,
						},
					},
				},

				"assignedOrders": bson.M{
					"$sum": bson.M{
						"$cond": []interface{}{
							bson.M{
								"$eq": []interface{}{
									"$partnerItem.status",
									"CONFIRMED",
								},
							},
							1, 0,
						},
					},
				},

				"inProductionOrders": bson.M{
					"$sum": bson.M{
						"$cond": []interface{}{
							bson.M{
								"$in": []interface{}{
									"$partnerItem.status",
									[]string{"PRINTING", "MOUNTING"},
								},
							},
							1, 0,
						},
					},
				},

				"liveOrders": bson.M{
					"$sum": bson.M{
						"$cond": []interface{}{
							bson.M{
								"$eq": []interface{}{
									"$partnerItem.status",
									"LIVE",
								},
							},
							1, 0,
						},
					},
				},

				"completedOrders": bson.M{
					"$sum": bson.M{
						"$cond": []interface{}{
							bson.M{
								"$eq": []interface{}{
									"$partnerItem.status",
									"COMPLETED",
								},
							},
							1, 0,
						},
					},
				},

				"totalRevenue": bson.M{
					"$sum": "$partnerFinance.netpayout",
				},

				"todayRevenue": bson.M{
					"$sum": bson.M{
						"$cond": []interface{}{
							bson.M{
								"$gte": []interface{}{
									"$partnerItem.confirmedat",
									startOfDay,
								},
							},
							"$partnerFinance.netpayout",
							0,
						},
					},
				},
			}}},
		}

		cursor, err := orderCollection.Aggregate(ctx, pipeline)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Dashboard aggregation failed"})
			return
		}
		defer cursor.Close(ctx)

		var result []bson.M
		if err = cursor.All(ctx, &result); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Decode failed"})
			return
		}

		if len(result) == 0 {
			c.JSON(http.StatusOK, gin.H{
				"totalOrders":        0,
				"todayOrders":        0,
				"assignedOrders":     0,
				"inProductionOrders": 0,
				"liveOrders":         0,
				"completedOrders":    0,
				"totalRevenue":       0,
				"todayRevenue":       0,
				"activeListings":     activeListingsCount,
			})
			return
		}

		dashboard := result[0]
		dashboard["activeListings"] = activeListingsCount

		c.JSON(http.StatusOK, dashboard)
	}
}

func GetRevenueByRange(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		//----------------------------------------
		// 1. Get Partner ID safely
		//----------------------------------------
		partnerIDValue, exists := c.Get("partnerID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Partner not authorized"})
			return
		}

		partnerID, ok := partnerIDValue.(string)
		if !ok || strings.TrimSpace(partnerID) == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid partner identity"})
			return
		}

		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		userCollection := database.OpenCollection("users", client)
		orderCollection := database.OpenCollection("orders", client)

		//----------------------------------------
		// 2. Validate Partner Account
		//----------------------------------------
		var user models.User
		err := userCollection.FindOne(ctx, bson.M{"userid": partnerID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Partner not found"})
			return
		}

		if user.Role != "PARTNER" || user.Partner == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access restricted to partners"})
			return
		}

		if !user.IsActive || !user.Partner.IsVerified || user.Partner.Status != "APPROVED" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Partner not active or verified"})
			return
		}

		//----------------------------------------
		// 3. Parse Range
		//----------------------------------------
		rangeParam := strings.ToLower(strings.TrimSpace(c.DefaultQuery("range", "last30days")))

		validRanges := map[string]bool{
			"last7days":    true,
			"last30days":   true,
			"last6months":  true,
			"last12months": true,
			"all":          true,
		}

		if !validRanges[rangeParam] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid range"})
			return
		}

		now := time.Now()
		var startDate time.Time
		groupByMonth := false

		switch rangeParam {
		case "last7days":
			startDate = now.AddDate(0, 0, -7)
		case "last30days":
			startDate = now.AddDate(0, 0, -30)
		case "last6months":
			startDate = now.AddDate(0, -6, 0)
			groupByMonth = true
		case "last12months":
			startDate = now.AddDate(0, -12, 0)
			groupByMonth = true
		case "all":
			startDate = time.Time{}
			groupByMonth = true
		}

		//----------------------------------------
		// 4. Build Match Stage
		//----------------------------------------
		matchStage := bson.M{
			"partnerid":   partnerID,
			"orderstatus": "COMPLETED",
		}

		if !startDate.IsZero() {
			matchStage["createdat"] = bson.M{"$gte": startDate}
		}

		//----------------------------------------
		// 5. Group Stage
		//----------------------------------------
		var groupID bson.M

		if groupByMonth {
			groupID = bson.M{
				"year":  bson.M{"$year": "$createdat"},
				"month": bson.M{"$month": "$createdat"},
			}
		} else {
			groupID = bson.M{
				"year":  bson.M{"$year": "$createdat"},
				"month": bson.M{"$month": "$createdat"},
				"day":   bson.M{"$dayOfMonth": "$createdat"},
			}
		}

		pipeline := mongo.Pipeline{
			{{Key: "$match", Value: matchStage}},
			{{Key: "$group", Value: bson.M{
				"_id":     groupID,
				"revenue": bson.M{"$sum": "$totalcheckoutprice"},
			}}},
			{{Key: "$sort", Value: bson.M{
				"_id.year":  1,
				"_id.month": 1,
				"_id.day":   1,
			}}},
		}

		//----------------------------------------
		// 6. Run Aggregation
		//----------------------------------------
		cursor, err := orderCollection.Aggregate(ctx, pipeline)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate revenue"})
			return
		}
		defer cursor.Close(ctx)

		var results []bson.M
		if err := cursor.All(ctx, &results); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse revenue data"})
			return
		}

		//----------------------------------------
		// 7. Format Response
		//----------------------------------------
		var revenueData []gin.H

		for _, r := range results {
			id := r["_id"].(bson.M)

			entry := gin.H{
				"year":    id["year"],
				"month":   id["month"],
				"revenue": r["revenue"],
			}

			if day, exists := id["day"]; exists {
				entry["day"] = day
			}

			revenueData = append(revenueData, entry)
		}

		//----------------------------------------
		// 8. Response
		//----------------------------------------
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"range":   rangeParam,
			"data":    revenueData,
		})
	}
}
func ToggleBillboardStatus(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		// ---------- Context ----------
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		// ---------- Validate Param ----------
		billboardId := strings.TrimSpace(c.Param("billboardId"))
		if billboardId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid billboard id"})
			return
		}

		// ---------- Auth ----------
		userId, err := utils.GetUserIdFromContext(c)
		if err != nil || userId == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		role, err := utils.GetRoleFromContext(c)
		if err != nil || role != "PARTNER" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
			return
		}

		collection := database.OpenCollection("billboards", client)

		// ---------- Ownership Filter ----------
		filter := bson.M{
			"billboardid": billboardId,
			"partnerid":   userId,
		}

		// ---------- Atomic Toggle (Mongo 4.2+) ----------
		update := mongo.Pipeline{
			bson.D{
				{Key: "$set", Value: bson.M{
					"isactive":  bson.M{"$not": "$isactive"},
					"updatedat": time.Now(),
				}},
			},
		}

		opts := options.FindOneAndUpdate().
			SetReturnDocument(options.After).
			SetProjection(bson.M{
				"_id":         0,
				"billboardid": 1,
				"isactive":    1,
			})

		// Minimal response struct (avoid full model decode)
		var result struct {
			BillboardID string `bson:"billboardid" json:"billboardId"`
			IsActive    bool   `bson:"isactive" json:"isActive"`
		}

		err = collection.FindOneAndUpdate(ctx, filter, update, opts).Decode(&result)
		if err != nil {
			if errors.Is(err, mongo.ErrNoDocuments) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Billboard not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Server error"})
			return
		}

		// ---------- Success ----------
		c.JSON(http.StatusOK, result)
	}
}
func UpdateBillboardLifecycle(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		partnerID, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		orderID := strings.TrimSpace(c.Param("orderId"))
		cartItemID := strings.TrimSpace(c.Param("cartItemId"))

		if orderID == "" || cartItemID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid parameters"})
			return
		}

		// -------------------------------
		// Handle JSON or Multipart
		// -------------------------------
		contentType := c.ContentType()
		var newStatus string

		if strings.Contains(contentType, "multipart/form-data") {

			newStatus = strings.ToUpper(strings.TrimSpace(c.PostForm("status")))
			if newStatus == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Status required"})
				return
			}

		} else {

			var body struct {
				Status string `json:"status" binding:"required"`
			}

			if err := c.ShouldBindJSON(&body); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
				return
			}

			newStatus = strings.ToUpper(strings.TrimSpace(body.Status))
		}

		validTransitions := map[string]string{
			"CONFIRMED": "PRINTING",
			"PRINTING":  "MOUNTING",
			"MOUNTING":  "LIVE",
			"LIVE":      "COMPLETED",
		}

		orderCollection := database.OpenCollection("orders", client)

		var order models.Order

		err = orderCollection.FindOne(
			ctx,
			bson.M{
				"orderid": orderID,
				"ordercart": bson.M{
					"$elemMatch": bson.M{
						"cartitemid": cartItemID,
						"partnerid":  partnerID,
					},
				},
			},
		).Decode(&order)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
			return
		}

		var currentStatus string
		var bookingEnd time.Time
		found := false

		for _, item := range order.OrderCart {
			if item.CartItemID == cartItemID {
				currentStatus = item.Status
				bookingEnd = item.ToDate.UTC()
				found = true
				break
			}
		}

		if !found {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
			return
		}

		expectedNext, ok := validTransitions[currentStatus]
		if !ok || expectedNext != newStatus {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status transition"})
			return
		}

		now := time.Now().UTC()

		if currentStatus == "LIVE" && newStatus == "COMPLETED" {
			if now.Before(bookingEnd) {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Cannot complete before booking end date",
				})
				return
			}
		}

		updateFields := bson.M{
			"ordercart.$.status": newStatus,
			"updatedat":          now,
		}

		switch newStatus {

		case "PRINTING":
			updateFields["ordercart.$.printstartedat"] = now

		case "MOUNTING":
			updateFields["ordercart.$.mountstartedat"] = now

		case "LIVE":

			form, err := c.MultipartForm()
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Proof photos required to mark LIVE",
				})
				return
			}

			photos := form.File["photos"]
			if len(photos) == 0 {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "At least one mounting photo is required",
				})
				return
			}

			video, _ := c.FormFile("video")

			var photoURLs []string
			var videoURL string

			for _, p := range photos {
				up, err := services.UploadToCloudinary(p)
				if err != nil {
					c.JSON(500, gin.H{"error": "Photo upload failed"})
					return
				}
				photoURLs = append(photoURLs, up.URL)
			}

			if video != nil {
				up, err := services.UploadToCloudinary(video)
				if err != nil {
					c.JSON(500, gin.H{"error": "Video upload failed"})
					return
				}
				videoURL = up.URL
			}

			token := utils.GenerateProofToken()

			updateFields["ordercart.$.liveat"] = now
			updateFields["ordercart.$.mountingproof.photos"] = photoURLs
			updateFields["ordercart.$.mountingproof.video"] = videoURL
			updateFields["ordercart.$.mountingproof.token"] = token
			updateFields["ordercart.$.mountingproof.uploadedat"] = now

		case "COMPLETED":
			updateFields["ordercart.$.completedat"] = now
		}

		result, err := orderCollection.UpdateOne(
			ctx,
			bson.M{
				"orderid":              orderID,
				"ordercart.cartitemid": cartItemID,
				"ordercart.partnerid":  partnerID,
				"ordercart.status":     currentStatus,
			},
			bson.M{"$set": updateFields},
		)

		if err != nil || result.MatchedCount == 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "Concurrent update detected"})
			return
		}

		if newStatus == "LIVE" {
			proofToken := updateFields["ordercart.$.mountingproof.token"].(string)

			go services.NotifyUserProofAvailable(
				client,
				order.CustomerID,
				cartItemID,
				proofToken,
			)

		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Lifecycle updated successfully",
		})
	}
}
