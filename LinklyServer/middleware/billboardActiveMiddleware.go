package middleware

import (
	"LinklyMedia/database"
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func BillboardActiveMiddleware(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		var billboardID string

		// 1️⃣ URL param
		billboardID = strings.TrimSpace(c.Param("billboardid"))

		// 2️⃣ If empty, try form-data (for multipart)
		if billboardID == "" {
			billboardID = strings.TrimSpace(c.PostForm("billboardId"))
		}

		// 3️⃣ If still empty, try JSON (for raw JSON requests)
		if billboardID == "" && c.Request.Method == http.MethodPost {

			if strings.Contains(c.GetHeader("Content-Type"), "application/json") {

				bodyBytes, err := io.ReadAll(c.Request.Body)
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
					c.Abort()
					return
				}

				// Restore body
				c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

				var temp struct {
					BillboardID string `json:"billboardId"`
				}

				if err := json.Unmarshal(bodyBytes, &temp); err == nil {
					billboardID = strings.TrimSpace(temp.BillboardID)
				}
			}
		}

		if billboardID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Billboard ID required"})
			c.Abort()
			return
		}

		ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
		defer cancel()

		billboardCollection := database.OpenCollection("billboards", client)

		err := billboardCollection.FindOne(
			ctx,
			bson.M{
				"billboardid": billboardID,
				"isactive":    true,
			},
			options.FindOne().SetProjection(bson.M{"_id": 1}),
		).Err()

		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Billboard is inactive or unavailable",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
