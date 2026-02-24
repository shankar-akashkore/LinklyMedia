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
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func ResendUserOTP(client *mongo.Client, user models.User) error {

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	otpCollection := database.OpenCollection("otpVerifications", client)

	// Cooldown check (30 seconds)
	var lastOTP models.OTPVerification
	err := otpCollection.FindOne(ctx, bson.M{
		"userid": user.UserID,
		"type":   "EMAIL",
	}).Decode(&lastOTP)

	if err == nil {
		if time.Since(lastOTP.CreatedAt) < 30*time.Second {
			return fmt.Errorf("please wait before requesting OTP again")
		}
	}

	emailOTP := utils.GenerateOTP()
	mobileOTP := utils.GenerateOTP()

	if err := CreateOTPRecord(client, user.UserID, "EMAIL", emailOTP); err != nil {
		return fmt.Errorf("failed to store email otp: %w", err)
	}

	if err := CreateOTPRecord(client, user.UserID, "MOBILE", mobileOTP); err != nil {
		return fmt.Errorf("failed to store mobile otp: %w", err)
	}

	// Send Email OTP
	if err := services.SendEmailOTP(user.Email, emailOTP); err != nil {
		log.Printf("Email send failed for user %s: %v", user.UserID, err)
		return fmt.Errorf("failed to send email otp")
	}

	log.Printf("OTP resent for user %s", user.UserID)

	// Temporary mobile OTP log
	log.Printf("Mobile OTP (dev only) for %s: %s", user.Mobile, mobileOTP)

	return nil
}
func ResendOTPHandler(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		var body struct {
			UserID string `json:"userid" binding:"required"`
		}

		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "userid required"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userCollection := database.OpenCollection("users", client)

		var user models.User
		err := userCollection.FindOne(ctx, bson.M{"userid": body.UserID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		err = ResendUserOTP(client, user)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "OTP resent successfully",
		})
	}
}
func CreateOTPRecord(client *mongo.Client, userID, otpType, otp string) error {

	if len(otp) != 6 {
		return fmt.Errorf("invalid otp format")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	otpCollection := database.OpenCollection("otpVerifications", client)

	// Remove previous OTP of same type
	_, err := otpCollection.DeleteMany(ctx, bson.M{
		"userid": userID,
		"type":   otpType,
	})
	if err != nil {
		return fmt.Errorf("failed to delete old otp: %w", err)
	}

	hashedOTP, err := bcrypt.GenerateFromPassword([]byte(otp), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash otp: %w", err)
	}

	record := models.OTPVerification{
		ID:        primitive.NewObjectID(),
		UserID:    userID,
		Type:      otpType,
		OTPHash:   string(hashedOTP),
		ExpiresAt: time.Now().Add(5 * time.Minute),
		Attempts:  0,
		CreatedAt: time.Now(),
	}

	_, err = otpCollection.InsertOne(ctx, record)
	if err != nil {
		return fmt.Errorf("failed to insert otp record: %w", err)
	}

	return nil
}
func VerifyOTP(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		var body struct {
			UserID string `json:"userid" binding:"required"`
			OTP    string `json:"otp" binding:"required"`
			Type   string `json:"type" binding:"required"`
		}

		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		otpCollection := database.OpenCollection("otpVerifications", client)
		userCollection := database.OpenCollection("users", client)

		var otpRecord models.OTPVerification
		err := otpCollection.FindOne(ctx, bson.M{
			"userid": body.UserID,
			"type":   body.Type,
		}).Decode(&otpRecord)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid OTP"})
			return
		}

		// Attempt limit
		if otpRecord.Attempts >= 5 {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many attempts. Request new OTP",
			})
			return
		}

		// Expiry check
		if time.Now().After(otpRecord.ExpiresAt) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "OTP expired"})
			return
		}

		// Compare OTP
		err = bcrypt.CompareHashAndPassword(
			[]byte(otpRecord.OTPHash),
			[]byte(body.OTP),
		)

		if err != nil {
			otpCollection.UpdateOne(ctx,
				bson.M{"_id": otpRecord.ID},
				bson.M{"$inc": bson.M{"attempts": 1}},
			)

			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid OTP"})
			return
		}

		updateField := bson.M{}
		if body.Type == "EMAIL" {
			updateField["emailverified"] = true
		}

		_, err = userCollection.UpdateOne(
			ctx,
			bson.M{"userid": body.UserID},
			bson.M{"$set": updateField},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Verification failed"})
			return
		}

		var user models.User
		userCollection.FindOne(ctx, bson.M{"userid": body.UserID}).Decode(&user)

		if user.EmailVerified {
			userCollection.UpdateOne(ctx,
				bson.M{"userid": body.UserID},
				bson.M{"$set": bson.M{"isactive": true}},
			)
		}

		otpCollection.DeleteMany(ctx, bson.M{
			"userid": body.UserID,
			"type":   body.Type,
		})

		c.JSON(http.StatusOK, gin.H{
			"message": "Verification successful",
		})
	}
}
func RequestPasswordReset(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		var body struct {
			Email string `json:"email" binding:"required,email"`
		}

		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Valid email required"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userCollection := database.OpenCollection("users", client)

		var user models.User
		err := userCollection.FindOne(ctx, bson.M{"email": body.Email}).Decode(&user)
		if err != nil {
			// Do not reveal whether email exists (security best practice)
			c.JSON(http.StatusOK, gin.H{
				"message": "If the email exists, OTP has been sent",
			})
			return
		}

		// Send OTP using existing logic
		err = ResendUserOTP(client, user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send OTP"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "OTP sent to registered email",
		})
	}
}
func ResetPassword(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		var body struct {
			Email       string `json:"email" binding:"required,email"`
			OTP         string `json:"otp" binding:"required"`
			NewPassword string `json:"newpassword" binding:"required,min=6"`
		}

		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userCollection := database.OpenCollection("users", client)
		otpCollection := database.OpenCollection("otpVerifications", client)

		// Find user
		var user models.User
		err := userCollection.FindOne(ctx, bson.M{"email": body.Email}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid request"})
			return
		}

		// Find OTP record (EMAIL type)
		var otpRecord models.OTPVerification
		err = otpCollection.FindOne(ctx, bson.M{
			"userid": user.UserID,
			"type":   "EMAIL",
		}).Decode(&otpRecord)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired OTP"})
			return
		}

		// Expiry check
		if time.Now().After(otpRecord.ExpiresAt) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "OTP expired"})
			return
		}

		// Compare OTP
		err = bcrypt.CompareHashAndPassword(
			[]byte(otpRecord.OTPHash),
			[]byte(body.OTP),
		)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid OTP"})
			return
		}

		// Hash new password
		hashedPassword, err := bcrypt.GenerateFromPassword(
			[]byte(body.NewPassword),
			bcrypt.DefaultCost,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Password update failed"})
			return
		}

		// Update password
		_, err = userCollection.UpdateOne(
			ctx,
			bson.M{"userid": user.UserID},
			bson.M{"$set": bson.M{
				"password":  string(hashedPassword),
				"updatedat": time.Now(),
			}},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Password update failed"})
			return
		}

		// Delete OTP after use
		otpCollection.DeleteMany(ctx, bson.M{
			"userid": user.UserID,
			"type":   "EMAIL",
		})
		utils.UpdateAllTokens(user.UserID, "", "", client)

		c.JSON(http.StatusOK, gin.H{
			"message": "Password reset successful",
		})
	}
}
