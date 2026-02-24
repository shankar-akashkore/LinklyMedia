package routes

import (
	"LinklyMedia/controllers"
	"LinklyMedia/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupProtectedRoutes(router *gin.Engine, client *mongo.Client) {

	// Base group for authenticated routes
	protected := router.Group("/api")
	protected.Use(middleware.AuthMiddleware())

	// ---------------------- USER ROUTES ----------------------
	user := protected.Group("/user")
	{
		user.GET("/profile", controllers.GetUserProfile(client))
		user.PUT("/profile", controllers.UpdateUserProfile(client))
		user.POST("/logout", controllers.LogoutHandler(client))
		//user.GET("/name", utils.GetUserFirstname(client))

		// Cart
		user.POST(
			"/cart/add",
			middleware.BillboardActiveMiddleware(client),
			controllers.AddToCart(client),
		)

		user.DELETE("/cart/remove/:cartItemId", controllers.RemoveFromCart(client))
		user.GET("/cart", controllers.GetCartItems(client))

		// Booking
		//user.POST("/booking/calculate", controllers.CalculateOrderPrice())

		// Payments
		user.POST("/checkout/preview", controllers.PreviewCheckout(client))
		user.POST("/checkout/pay", controllers.Checkout(client))
		user.POST("/checkout/verify-payment", controllers.VerifyPayment(client))

		// Orders
		user.GET("/orders", controllers.GetUserBookings(client))
		user.GET("/orders/:orderId", controllers.GetOrderByID(client))
	}

	// ---------------------- BILLBOARD INTERACTIONS ----------------------
	billboard := protected.Group("/billboard")
	{
		billboard.POST("/:id/like", controllers.LikeBillboard(client))
		billboard.DELETE("/:id/like", controllers.UnlikeBillboard(client))
	}

	// ---------------------- REVIEWS ----------------------
	review := protected.Group("/review")
	{
		review.POST("/:billboardId", controllers.AddOrUpdateReview(client))
		review.DELETE("/:billboardId", controllers.DeleteReview(client))
	}

	// ---------------------- PARTNER ROUTES ----------------------
	// ---------------------- PARTNER ROUTES ----------------------
	partner := protected.Group("/partner")
	partner.Use(middleware.RequireVerifiedPartner(client))
	{
		// Billboard management
		partner.POST("/billboard", controllers.AddBillboard(client))
		partner.PUT("/billboard/:id", controllers.UpdateBillboard(client))
		partner.DELETE("/billboard/:id", controllers.DeleteBillboard(client))
		partner.GET("/billboard/:id", controllers.GetPartnerBillboardByID(client))
		partner.PATCH("/billboard/:billboardId/toggle", controllers.ToggleBillboardStatus(client))

		// Listings
		partner.GET("/listings", controllers.GetPartnerListings(client))

		// Profile
		partner.GET("/profile", controllers.GetUserProfile(client))
		partner.PUT("/profile", controllers.UpdateUserProfile(client))

		// Bookings
		partner.GET("/bookings", controllers.GetPartnerBookings(client))
		partner.PATCH("/booking/:orderId/:cartItemId/status", controllers.UpdateBillboardLifecycle(client))

		// Dashboard
		partner.GET("/dashboard", controllers.GetBasicPartnerDashboard(client))
		partner.GET("/history", controllers.GetPartnerOrderHistory(client))

		// partner.GET("/dashboard/revenue", controllers.GetRevenueByRange(client))
	}

}
