// FILE: controllers/favcities.go

package controllers

import (
	"LinklyMedia/database"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type FavCitiesRequest struct {
	UserID          string   `json:"userid" binding:"required"`
	FavouriteCities []string `json:"favouritecities" binding:"required"`
}

// UpdateFavCities — PUBLIC route, no token needed
// Called after SignUp register, before OTP verify
func UpdateFavCities(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req FavCitiesRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
			return
		}

		// Convert userid string → MongoDB ObjectID
		objID, err := primitive.ObjectIDFromHex(req.UserID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userid format"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// ✅ Uses database.OpenCollection — reads DATABASE_NAME=LinklyMedia from .env
		userCollection := database.OpenCollection("users", client)

		filter := bson.M{"_id": objID}
		update := bson.M{
			"$set": bson.M{
				"favouritecities": req.FavouriteCities,
				"updatedat":       time.Now(),
			},
		}

		result, err := userCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cities"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":         "Favourite cities updated successfully",
			"favouritecities": req.FavouriteCities,
		})
	}
}