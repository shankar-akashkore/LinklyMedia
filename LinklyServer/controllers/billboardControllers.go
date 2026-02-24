package controllers

import (
	"LinklyMedia/database"
	"LinklyMedia/models"
	"LinklyMedia/services"
	"LinklyMedia/utils"
	"context"
	"math"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetBillboards(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		collection := database.OpenCollection("billboards", client)

		// default silent pagination (frontend doesn't need to send anything)
		page := int64(1)
		limit := int64(12)

		skip := (page - 1) * limit

		filter := bson.M{
			"isactive": true,
		}

		opts := options.Find().
			SetSkip(skip).
			SetLimit(limit).
			SetSort(bson.D{
				{Key: "averagerating", Value: -1},
				{Key: "createdat", Value: -1},
			}).
			SetProjection(bson.M{
				"reviews": 0,
				"likes":   0,
			})

		cursor, err := collection.Find(ctx, filter, opts)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
			return
		}

		var billboards []models.Billboard
		if err := cursor.All(ctx, &billboards); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Decode error"})
			return
		}

		c.JSON(http.StatusOK, billboards)
	}
}
func GetBillboardsWithFilters(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		collection := database.OpenCollection("billboards", client)

		var query models.BillboardFilterQuery

		if err := c.ShouldBindQuery(&query); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query params"})
			return
		}

		if query.Page <= 0 {
			query.Page = 1
		}
		if query.Limit <= 0 || query.Limit > 50 {
			query.Limit = 10
		}

		skip := (query.Page - 1) * query.Limit

		filter := bson.M{
			"isactive": true,
		}

		// 🔍 LOCATION SEARCH
		if query.Location != "" {
			filter["$or"] = []bson.M{
				{"city": bson.M{"$regex": query.Location, "$options": "i"}},
				{"locality": bson.M{"$regex": query.Location, "$options": "i"}},
				{"landmark": bson.M{"$regex": query.Location, "$options": "i"}},
			}
		}

		// 💰 PRICE
		if query.MinPrice > 0 || query.MaxPrice > 0 {
			priceFilter := bson.M{}
			if query.MinPrice > 0 {
				priceFilter["$gte"] = query.MinPrice
			}
			if query.MaxPrice > 0 {
				priceFilter["$lte"] = query.MaxPrice
			}
			filter["price"] = priceFilter
		}

		// 📈 REACH
		if query.MinReach > 0 || query.MaxReach > 0 {
			reachFilter := bson.M{}
			if query.MinReach > 0 {
				reachFilter["$gte"] = query.MinReach
			}
			if query.MaxReach > 0 {
				reachFilter["$lte"] = query.MaxReach
			}
			filter["impressions"] = reachFilter
		}

		// ⭐ RATING
		if query.MinRating > 0 {
			filter["averagerating"] = bson.M{
				"$gte": query.MinRating,
			}
		}

		// 📦 TYPES
		if len(query.Types) > 0 {
			filter["type.typename"] = bson.M{
				"$in": query.Types,
			}
		}

		// 🔄 SORT WHITELIST
		sortOptions := bson.D{}

		switch query.SortBy {
		case "price_low":
			sortOptions = bson.D{{Key: "price", Value: 1}}
		case "price_high":
			sortOptions = bson.D{{Key: "price", Value: -1}}
		case "reach_high":
			sortOptions = bson.D{{Key: "impressions", Value: -1}}
		case "reach_low":
			sortOptions = bson.D{{Key: "impressions", Value: 1}}
		case "rating_high":
			sortOptions = bson.D{{Key: "averagerating", Value: -1}}
		case "rating_low":
			sortOptions = bson.D{{Key: "averagerating", Value: 1}}
		case "oldest":
			sortOptions = bson.D{{Key: "createdat", Value: 1}}
		default:
			sortOptions = bson.D{{Key: "createdat", Value: -1}}
		}

		findOptions := options.Find().
			SetSkip(skip).
			SetLimit(query.Limit).
			SetSort(sortOptions).
			SetProjection(bson.M{
				"reviews": 0,
				"likes":   0,
			})

		totalCount, err := collection.CountDocuments(ctx, filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Count failed"})
			return
		}

		totalPages := int64(math.Ceil(float64(totalCount) / float64(query.Limit)))
		cursor, err := collection.Find(ctx, filter, findOptions)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB Error"})
			return
		}

		var billboards []models.Billboard
		if err := cursor.All(ctx, &billboards); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Cursor decode error"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data":        billboards,
			"page":        query.Page,
			"limit":       query.Limit,
			"total":       totalCount,
			"totalPages":  totalPages,
			"hasNextPage": query.Page < totalPages,
		})
	}
}
func AddToCart(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		// fmt.Println("billboardId:", c.PostForm("billboardId"))
		// fmt.Println("selectedMaterial:", c.PostForm("selectedMaterial"))
		// fmt.Println("selectedMounting:", c.PostForm("selectedMounting"))
		// fmt.Println("fromDate:", c.PostForm("fromDate"))
		// fmt.Println("toDate:", c.PostForm("toDate"))

		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		userCollection := database.OpenCollection("users", client)
		billboardCollection := database.OpenCollection("billboards", client)

		// ========= Extract Form Fields =========

		billboardID := c.PostForm("billboardId")
		selectedMaterial := c.PostForm("selectedMaterial")
		selectedMounting := c.PostForm("selectedMounting")
		fromDateStr := c.PostForm("fromDate")
		toDateStr := c.PostForm("toDate")

		if billboardID == "" || selectedMaterial == "" || selectedMounting == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing required fields"})
			return
		}

		fromDate, err := time.Parse(time.RFC3339, fromDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid fromDate format"})
			return
		}

		toDate, err := time.Parse(time.RFC3339, toDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid toDate format"})
			return
		}

		if !toDate.After(fromDate) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date range"})
			return
		}

		// ========= Handle Design Upload =========
		var design models.DesignImage

		file, err := c.FormFile("design")
		if err == nil {
			uploaded, err := services.UploadToCloudinary(file)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "design upload failed"})
				return
			}

			design = models.DesignImage{
				URL:      uploaded.URL,
				PublicID: uploaded.PublicID,
				AltText:  file.Filename,
			}
		}

		// ========= Call Util =========
		err = utils.AddBillboardToCart(
			ctx,
			c,
			billboardCollection,
			userCollection,
			billboardID,
			selectedMaterial,
			selectedMounting,
			fromDate,
			toDate,
			design,
		)

		if err != nil {

			// Rollback Cloudinary if DB fails
			if design.PublicID != "" {
				_ = services.DeleteFromCloudinary(design.PublicID)
			}

			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Billboard added to cart successfully",
		})
	}
}

func RemoveFromCart(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		cartItemID := c.Param("cartItemId")

		userID, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userCollection := database.OpenCollection("users", client)

		err = utils.RemoveCartItem(ctx, userCollection, cartItemID, userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Cart item removed successfully",
		})
	}
}

//	func GetCartItems(client *mongo.Client) gin.HandlerFunc {
//		return func(c *gin.Context) {
//			userId, err := utils.GetUserIdFromContext(c)
//			if err != nil {
//				c.JSON(http.StatusInternalServerError, gin.H{"error": "Falied to get user id from context"})
//				return
//			}
//			ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
//			defer cancel()
//			var userCollection *mongo.Collection = database.OpenCollection("users", client)
//			var filledCart models.User
//			err = userCollection.FindOne(ctx, bson.D{primitive.E{Key: "userid", Value: userId}}).Decode(&filledCart)
//			if err != nil {
//				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Filled cart"})
//				return
//			}
//			filter := bson.D{{Key: "$match", Value: bson.D{primitive.E{Key: "userid", Value: userId}}}}
//			unwind := bson.D{{Key: "$unwind", Value: bson.D{primitive.E{Key: "path", Value: "$usercart"}}}}
//			group := bson.D{{Key: "$group", Value: bson.D{primitive.E{Key: "_id", Value: "$_id"}, {Key: "total", Value: bson.D{primitive.E{Key: "$sum", Value: "$usercart.price"}}}}}}
//			cursor, err := userCollection.Aggregate(ctx, mongo.Pipeline{filter, unwind, group})
//			if err != nil {
//				log.Println(err)
//				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to aggregate cart items"})
//				return
//			}
//			defer cursor.Close(ctx)
//			var listing []bson.M
//			if err = cursor.All(ctx, &listing); err != nil {
//				log.Println(err)
//				c.AbortWithStatus(http.StatusInternalServerError)
//				return
//			}
//			for _, json := range listing {
//				c.IndentedJSON(200, json["total"])
//				c.IndentedJSON(200, filledCart.UserCart)
//			}
//		}
//	}
func GetCartItems(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from context
		userId, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user id from context"})
			return
		}

		// Setup MongoDB context
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		userCollection := database.OpenCollection("users", client)
		// Fetch user document
		var user models.User
		err = userCollection.FindOne(ctx, bson.M{"userid": userId}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user cart"})
			return
		}
		// Calculate total price
		var total float64 = 0
		for _, item := range user.UserCart {
			total += item.Price
		}
		// Respond with cart and total sum
		c.JSON(http.StatusOK, gin.H{
			"usercart": user.UserCart,
			"total":    total,
		})
	}
}

func GetBillboardByID(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		billboardIDParam := c.Param("billboardId")

		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		billboardCollection := database.OpenCollection("billboards", client)

		var foundBillboard models.Billboard

		err := billboardCollection.FindOne(
			ctx,
			bson.M{"billboardid": billboardIDParam},
		).Decode(&foundBillboard)

		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "Billboard not found"})
				return
			}

			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch billboard"})
			return
		}

		c.JSON(http.StatusOK, foundBillboard)
	}
}
func AddOrUpdateReview(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		billboardID := c.Param("billboardId")

		var review models.CustomerReview
		if err := c.ShouldBindJSON(&review); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		validate := validator.New()
		if err := validate.Struct(review); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed"})
			return
		}

		userID, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		firstname, err := utils.GetUserFirstnameFromUserId(client, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "User fetch failed"})
			return
		}

		review.CustomerID = userID
		review.CustomerName = firstname

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		billboardCollection := database.OpenCollection("billboards", client)

		var billboard models.Billboard
		err = billboardCollection.FindOne(ctx, bson.M{
			"billboardid": billboardID,
		}).Decode(&billboard)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Billboard not found"})
			return
		}

		found := false
		for i, r := range billboard.Reviews {
			if r.CustomerID == userID {
				billboard.Reviews[i] = review
				found = true
				break
			}
		}

		if !found {
			billboard.Reviews = append(billboard.Reviews, review)
		}

		total := 0
		for _, r := range billboard.Reviews {
			total += r.Rating
		}

		avg := float64(total) / float64(len(billboard.Reviews))

		_, err = billboardCollection.UpdateOne(
			ctx,
			bson.M{"billboardid": billboardID},
			bson.M{
				"$set": bson.M{
					"reviews":       billboard.Reviews,
					"averagerating": avg,
				},
			},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":        "Review saved",
			"average_rating": avg,
		})
	}
}

func SearchBillboards(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		query := c.Query("query")
		var foundBillboards []models.Billboard
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		var billboardCollection *mongo.Collection = database.OpenCollection("billboards", client)
		filter := bson.M{
			"$or": []bson.M{
				{"billboardtitle": bson.M{"$regex": query, "$options": "i"}},
				{"description": bson.M{"$regex": query, "$options": "i"}},
			},
		}
		opts := options.Find().SetLimit(5).SetProjection(bson.M{
			"billboardtitle": 1,
			"description":    1,
			"billboardid":    1,
		})
		cursor, err := billboardCollection.Find(ctx, filter, opts)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch billboards"})
			return
		}
		if err = cursor.All(ctx, &foundBillboards); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to collect quered billboards"})
			return
		}
		c.JSON(http.StatusOK, foundBillboards)

	}
}
func DeleteReview(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		billboardID := c.Param("billboardId")

		userID, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		billboardCollection := database.OpenCollection("billboards", client)

		var billboard models.Billboard
		err = billboardCollection.FindOne(ctx, bson.M{
			"billboardid": billboardID,
		}).Decode(&billboard)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Billboard not found"})
			return
		}

		var updatedReviews []models.CustomerReview

		for _, r := range billboard.Reviews {
			if r.CustomerID != userID {
				updatedReviews = append(updatedReviews, r)
			}
		}

		total := 0
		for _, r := range updatedReviews {
			total += r.Rating
		}

		var avg float64
		if len(updatedReviews) > 0 {
			avg = float64(total) / float64(len(updatedReviews))
		}

		_, err = billboardCollection.UpdateOne(
			ctx,
			bson.M{"billboardid": billboardID},
			bson.M{
				"$set": bson.M{
					"reviews":       updatedReviews,
					"averagerating": avg,
				},
			},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Review deleted"})
	}
}
func GetReviews(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		billboardID := c.Param("billboardId")

		// ---- Pagination params ----
		pageStr := c.DefaultQuery("page", "1")
		limitStr := c.DefaultQuery("limit", "5")

		page, err := strconv.Atoi(pageStr)
		if err != nil || page < 1 {
			page = 1
		}

		limit, err := strconv.Atoi(limitStr)
		if err != nil || limit < 1 || limit > 50 {
			limit = 5
		}

		skip := (page - 1) * limit

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		billboardCollection := database.OpenCollection("billboards", client)

		// ---- Fetch only reviews field ----
		var result struct {
			Reviews []models.CustomerReview `bson:"reviews"`
		}

		err = billboardCollection.FindOne(
			ctx,
			bson.M{"billboardid": billboardID},
			options.FindOne().SetProjection(bson.M{
				"reviews": 1,
				"_id":     0,
			}),
		).Decode(&result)

		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Billboard not found"})
			return
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
			return
		}

		totalReviews := len(result.Reviews)

		if skip >= totalReviews {
			c.JSON(http.StatusOK, gin.H{
				"reviews": []models.CustomerReview{},
				"page":    page,
				"limit":   limit,
				"total":   totalReviews,
			})
			return
		}

		end := skip + limit
		if end > totalReviews {
			end = totalReviews
		}

		paginatedReviews := result.Reviews[skip:end]

		c.JSON(http.StatusOK, gin.H{
			"reviews": paginatedReviews,
			"page":    page,
			"limit":   limit,
			"total":   totalReviews,
		})
	}
}

func GetTopBillboards(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		// Step 1: Read query params
		lat := c.Query("lat")
		lng := c.Query("lng")
		city := c.Query("city")

		// Step 2: Detect city using Geoapify if lat/lng present
		if lat != "" && lng != "" {
			detectedCity, err := services.GetUserCity(lat, lng)
			if err == nil && detectedCity != "" {
				city = detectedCity
			}
		}

		// Step 3: Final fallback
		if city == "" {
			city = "Mangalore"
		}

		// Step 4: MongoDB Query
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		billboardCollection := database.OpenCollection("billboards", client)

		// Filter by city
		filter := bson.M{
			"city":     city,
			"isactive": true,
		}

		findOptions := options.Find()
		findOptions.SetSort(bson.D{
			{Key: "averagerating", Value: -1},
			{Key: "impressions", Value: -1},
			{Key: "totallikes", Value: -1},
		})
		findOptions.SetLimit(10)

		cursor, err := billboardCollection.Find(ctx, filter, findOptions)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch billboards",
			})
			return
		}
		defer cursor.Close(ctx)

		var billboards []bson.M
		if err = cursor.All(ctx, &billboards); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error decoding billboards",
			})
			return
		}

		// Step 5: Response
		c.JSON(http.StatusOK, gin.H{
			"city":       city,
			"count":      len(billboards),
			"billboards": billboards,
		})
	}
}
func LikeBillboard(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ok, err := utils.Like(client, c)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}

		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Unable to like billboard",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Billboard liked successfully",
		})
	}
}

func UnlikeBillboard(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ok, err := utils.Unlike(client, c)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}

		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Unable to unlike billboard",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Billboard unliked successfully",
		})
	}
}
