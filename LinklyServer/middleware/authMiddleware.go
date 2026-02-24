package middleware

import (
	"LinklyMedia/database"
	"LinklyMedia/models"
	"LinklyMedia/utils"
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			c.Abort()
			return
		}

		const bearerPrefix = "Bearer "
		if !strings.HasPrefix(authHeader, bearerPrefix) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, bearerPrefix)

		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		c.Set("userid", claims.UserID)
		c.Set("role", claims.Role)

		c.Next()
	}
}

//	func GetRoleMiddleware(c *gin.Context) (string, error) {
//		userrole, exists := c.Get("role")
//		if !exists {
//			return "", errors.New("Role does not exist in context")
//		}
//		if userrole.(string) == "" {
//			return "", errors.New("Role is empty")
//		}
//		role, ok := userrole.(string)
//		if !ok {
//			return "", errors.New("unable to retrive role")
//		}
//		return role, nil
//	}
func GetRoleMiddleware(c *gin.Context) (string, error) {
	userrole, exists := c.Get("role")
	if !exists {
		return "", errors.New("role does not exist in context")
	}

	role, ok := userrole.(string)
	if !ok {
		return "", errors.New("unable to retrieve role")
	}

	if strings.TrimSpace(role) == "" {
		return "", errors.New("role is empty")
	}

	return role, nil
}

func RequireVerifiedPartner(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get role from JWT context
		role, err := GetRoleMiddleware(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: " + err.Error()})
			c.Abort()
			return
		}
		// Only PARTNER role allowed
		if role != "PARTNER" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: only PARTNERs can perform this action"})
			c.Abort()
			return
		}
		// Get userId from context
		userIdValue, exists := c.Get("userid")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get user ID from context"})
			c.Abort()
			return
		}
		userId, ok := userIdValue.(string)
		if !ok || strings.TrimSpace(userId) == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or empty user ID"})
			c.Abort()
			return
		}
		// Fetch user from DB
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		var foundUser models.User
		userCollection := database.OpenCollection("users", client)
		if err := userCollection.FindOne(ctx, bson.M{"userid": userId}).Decode(&foundUser); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user from database"})
			c.Abort()
			return
		}
		// Ensure DB role is also PARTNER
		if foundUser.Role != "PARTNER" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Database role mismatch: only PARTNERs allowed"})
			c.Abort()
			return
		}
		// Ensure partner info exists
		if foundUser.Partner == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "No partner profile found for this user"})
			c.Abort()
			return
		}

		// Ensure partner is verified and approved
		if !foundUser.Partner.IsVerified || foundUser.Partner.Status != "APPROVED" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Your partner account is not verified or not approved yet. Please wait for admin approval.",
			})
			c.Abort()
			return
		}
		// Everything passed — continue
		c.Next()
	}
}
