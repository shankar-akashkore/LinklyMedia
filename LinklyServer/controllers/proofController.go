package controllers

import (
	"LinklyMedia/database"
	"LinklyMedia/models"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetCampaignProofByToken(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
		defer cancel()

		token := c.Param("token")

		if token == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
			return
		}

		orderCollection := database.OpenCollection("orders", client)

		filter := bson.M{
			"ordercart.mountingproof.token": token,
		}

		var order models.Order

		err := orderCollection.FindOne(ctx, filter).Decode(&order)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Proof not found"})
			return
		}

		for _, item := range order.OrderCart {

			if item.MountingProof.Token == token {

				c.JSON(http.StatusOK, gin.H{
					"photos": item.MountingProof.Photos,
					"video":  item.MountingProof.Video,
					"liveAt": item.LiveAt,
					"title":  item.Title,
				})
				return
			}
		}

		c.JSON(http.StatusNotFound, gin.H{"error": "Proof not found"})
	}
}
