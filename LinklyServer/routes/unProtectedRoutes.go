package routes

import (
	"LinklyMedia/controllers"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// func SetupProtectedRoutes(router *gin.Engine, client *mongo.Client) {
// 	router.Use(middleware.AuthMiddleware())

func SetupUnProtectedRoutes(router *gin.Engine, client *mongo.Client) {
	public := router.Group("/api")
	{
		// Auth routes
		public.POST("/register", controllers.Register(client))
		public.POST("/login", controllers.LoginUser(client))
		//public.POST("/refresh", controllers.RefreshTokenHandler(client))
		public.POST("/verify-otp", controllers.VerifyOTP(client))
		public.POST("/resend-otp", controllers.ResendOTPHandler(client))
		public.POST("/user/favcities", controllers.UpdateFavCities(client))
		public.POST("/forgot-password", controllers.RequestPasswordReset(client))
		public.POST("/reset-password", controllers.ResetPassword(client))
		public.GET("/campaign/proof/:token", controllers.GetCampaignProofByToken(client))
		// Token refresh
		public.POST("/refresh", controllers.RefreshTokenHandler(client))

		// Billboard routes
		public.GET("/billboards", controllers.GetBillboards(client))
		public.GET("/billboard/:billboardId", controllers.GetBillboardByID(client))
		public.GET("/topBillboards", controllers.GetTopBillboards(client))
		public.GET("/review/:billboardId", controllers.GetReviews(client))
		public.GET("/billboards/filter", controllers.GetBillboardsWithFilters(client))
		public.GET("/search", controllers.SearchBillboards(client))
	}
}
