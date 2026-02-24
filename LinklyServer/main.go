package main

import (
	"LinklyMedia/database"
	"LinklyMedia/routes"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning unable to find .env file")
	}
	client := database.Connect()

	// Create OTP TTL index at startup
	err = database.EnsureOTPIndexes(client)
	if err != nil {
		log.Fatal("Failed to create OTP indexes:", err)
	}

	router := gin.Default()

	// CORS configuration
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			//"https://www.linklymedia.com",
			//"https://linklymedia.com",
			"http://localhost:5173",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	routes.SetupUnProtectedRoutes(router, client)
	routes.SetupProtectedRoutes(router, client)

	router.GET("/", func(c *gin.Context) {
		c.String(200, "Welcome to LinklyMedia")
	})
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
