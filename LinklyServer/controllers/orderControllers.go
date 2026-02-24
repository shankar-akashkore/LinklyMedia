package controllers

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"math"
	"net/http"
	"os"
	"time"

	"LinklyMedia/database"
	"LinklyMedia/models"
	"LinklyMedia/utils"

	"github.com/gin-gonic/gin"
	"github.com/razorpay/razorpay-go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func buildOrderFinancials(
	ctx context.Context,
	client *mongo.Client,
	user models.User,
	couponCode string,
) (*models.Order, []CartBillboardBreakdown, float64, error) {

	billboardCollection := database.OpenCollection("billboards", client)

	// ------------------------------------
	// Fetch billboards once
	// ------------------------------------
	var billboards []models.Billboard
	for _, item := range user.UserCart {

		var bb models.Billboard
		err := billboardCollection.FindOne(
			ctx,
			bson.M{"billboardid": item.BillboardID},
		).Decode(&bb)

		if err != nil {
			return nil, nil, 0, errors.New("billboard not found")
		}

		billboards = append(billboards, bb)
	}

	// ------------------------------------
	// Calculate base pricing
	// ------------------------------------
	order := models.Order{
		CustomerID: user.UserID,
		OrderCart:  user.UserCart,
	}

	breakdown, totalPrice, err := CalculateBookingPrice(
		&order,
		billboards,
		utils.CalculateDays,
	)
	if err != nil {
		return nil, nil, 0, err
	}

	// ------------------------------------
	// Build Partner Breakdown
	// ------------------------------------
	partnerMap := make(map[string]*models.PartnerFinancialBreakdown)

	bbMap := make(map[string]models.Billboard)
	for _, bb := range billboards {
		bbMap[bb.BillboardID] = bb
	}

	for _, item := range breakdown {

		bb := bbMap[item.BillboardID]
		partnerID := bb.PartnerID

		if _, exists := partnerMap[partnerID]; !exists {
			partnerMap[partnerID] = &models.PartnerFinancialBreakdown{
				PartnerID: partnerID,
			}
		}

		baseRent := item.BasePricePerDay * float64(item.Days)

		partnerMap[partnerID].BaseRent += baseRent
		partnerMap[partnerID].PrintingCost += item.PrintingCost
		partnerMap[partnerID].MountingCost += item.MountingCost
		partnerMap[partnerID].Commission += item.Commission
		partnerMap[partnerID].TaxableAmount += item.TaxableAmount
		partnerMap[partnerID].GST += item.GST
		partnerMap[partnerID].GrossAmount += item.TaxableAmount + item.GST
		partnerRevenue := item.BaseRent + item.PrintingCost + item.MountingCost
		partnerMap[partnerID].NetPayout += partnerRevenue - item.Commission

	}

	var partnerBreakdowns []models.PartnerFinancialBreakdown
	for _, p := range partnerMap {

		p.BaseRent = roundToTwo(p.BaseRent)
		p.PrintingCost = roundToTwo(p.PrintingCost)
		p.MountingCost = roundToTwo(p.MountingCost)
		p.Commission = roundToTwo(p.Commission)
		p.TaxableAmount = roundToTwo(p.TaxableAmount)
		p.GST = roundToTwo(p.GST)
		p.GrossAmount = roundToTwo(p.GrossAmount)
		p.NetPayout = roundToTwo(p.NetPayout)

		partnerBreakdowns = append(partnerBreakdowns, *p)
	}

	order.PartnerBreakdown = partnerBreakdowns

	// ------------------------------------
	// Apply coupon
	// ------------------------------------
	finalTotal, discountAmount, err := utils.ValidateAndApplyCoupon(
		ctx,
		client,
		couponCode,
		totalPrice,
	)
	if err != nil {
		return nil, nil, 0, err
	}

	order.TotalCheckoutPrice = finalTotal
	order.DiscountAmount = discountAmount
	order.CouponCode = couponCode

	return &order, breakdown, totalPrice, nil
}
func PreviewCheckout(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
		defer cancel()

		// ------------------------------------
		// OPTIONAL COUPON INPUT
		// ------------------------------------
		var req struct {
			CouponCode string `json:"couponCode"`
		}

		// Allow empty body safely
		if err := c.ShouldBindJSON(&req); err != nil {
			req.CouponCode = ""
		}

		// ------------------------------------
		// AUTH
		// ------------------------------------
		userID, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		userCollection := database.OpenCollection("users", client)

		var user models.User
		err = userCollection.FindOne(ctx, bson.M{"userid": userID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
			return
		}

		if len(user.UserCart) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cart empty"})
			return
		}

		// ------------------------------------
		// AVAILABILITY CHECK
		// ------------------------------------
		for _, item := range user.UserCart {

			available, nextAvailable, err := utils.IsAvailableForBooking(
				item.FromDate,
				item.ToDate,
				item.BillboardID,
				client,
			)

			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			if !available {
				c.JSON(http.StatusConflict, gin.H{
					"error":              "Billboard not available",
					"billboardId":        item.BillboardID,
					"nextAvailableAfter": nextAvailable,
				})
				return
			}
		}

		// ------------------------------------
		// BUILD ORDER FINANCIALS
		// ------------------------------------
		orderPtr, breakdown, subtotal, err := buildOrderFinancials(
			ctx,
			client,
			user,
			req.CouponCode,
		)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		order := *orderPtr

		// ------------------------------------
		// RESPONSE (TRUST DB VALUE ONLY)
		// ------------------------------------
		c.JSON(http.StatusOK, gin.H{
			"cart":          user.UserCart,
			"breakdown":     breakdown,
			"subtotal":      subtotal,
			"discount":      order.DiscountAmount,
			"finalTotal":    order.TotalCheckoutPrice,
			"couponApplied": order.CouponCode, // ✅ PROD SAFE
		})
	}
}

func Checkout(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(c, 30*time.Second)
		defer cancel()

		// Step 1: Read optional fields only
		var req struct {
			CouponCode string `json:"couponCode"`
		}

		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Step 2: Get logged-in user
		userID, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		userCollection := database.OpenCollection("users", client)
		orderCollection := database.OpenCollection("orders", client)
		billboardCollection := database.OpenCollection("billboards", client)

		// Step 3: Fetch cart from DB
		var user models.User
		err = userCollection.FindOne(ctx, bson.M{"userid": userID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
			return
		}

		if len(user.UserCart) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
			return
		}

		// Step 4: Check availability
		for _, item := range user.UserCart {
			available, _, err := utils.IsAvailableForBooking(
				item.FromDate,
				item.ToDate,
				item.BillboardID,
				client,
			)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Availability check failed"})
				return
			}

			if !available {
				c.JSON(http.StatusConflict, gin.H{
					"error": "One or more billboards not available",
				})
				return
			}
		}

		// Step 5: Fetch billboard details
		var billboards []models.Billboard

		for _, item := range user.UserCart {
			var bb models.Billboard

			err := billboardCollection.FindOne(
				ctx,
				bson.M{"billboardid": item.BillboardID},
			).Decode(&bb)

			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Billboard not found"})
				return
			}

			billboards = append(billboards, bb)
		}

		// Step 6: Build order

		orderPtr, _, _, err := buildOrderFinancials(
			ctx,
			client,
			user,
			req.CouponCode,
		)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		order := *orderPtr
		if order.TotalCheckoutPrice <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order amount"})
			return
		}

		// Step 8: Prepare order
		order.ID = primitive.NewObjectID()
		order.OrderID = order.ID.Hex()
		order.OrderStatus = "PENDING"
		order.PaymentStatus = "CREATED"
		order.CreatedAt = time.Now()
		order.UpdatedAt = time.Now()
		order.ExpiresAt = time.Now().Add(10 * time.Minute)
		order.TotalBillboards = len(order.OrderCart)

		// Step 9: Razorpay order
		rzp := razorpay.NewClient(
			os.Getenv("RAZORPAY_KEY_ID"),
			os.Getenv("RAZORPAY_KEY_SECRET"),
		)

		amount := int(math.Round(order.TotalCheckoutPrice * 100))

		razorpayOrder, err := rzp.Order.Create(
			map[string]interface{}{
				"amount":   amount,
				"currency": "INR",
				"receipt":  order.OrderID,
			},
			nil,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Payment initialization failed"})
			return
		}

		rzpID, ok := razorpayOrder["id"].(string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid Razorpay response"})
			return
		}

		order.RazorpayOrderID = rzpID

		// Step 10: Save order
		_, err = orderCollection.InsertOne(ctx, order)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Order creation failed"})
			return
		}

		// Step 11: Increment coupon usage
		if req.CouponCode != "" {
			_ = utils.IncrementCouponUsage(ctx, client, req.CouponCode)
		}

		// Step 12: Return response
		c.JSON(http.StatusOK, gin.H{
			"orderID":           order.OrderID,
			"razorpay_order_id": order.RazorpayOrderID,
			"amount":            amount,
			"currency":          "INR",
			"key":               os.Getenv("RAZORPAY_KEY_ID"),
		})
	}
}
func VerifyPayment(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
		defer cancel()

		type VerifyRequest struct {
			OrderID           string `json:"orderID" binding:"required"`
			RazorpayOrderID   string `json:"razorpay_order_id" binding:"required"`
			RazorpayPaymentID string `json:"razorpay_payment_id" binding:"required"`
			RazorpaySignature string `json:"razorpay_signature"`
		}

		var req VerifyRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
			return
		}

		userID, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		orderCollection := database.OpenCollection("orders", client)

		var order models.Order
		err = orderCollection.FindOne(ctx, bson.M{
			"orderid":         req.OrderID,
			"customerid":      userID,
			"razorpayorderid": req.RazorpayOrderID,
			"paymentstatus":   "CREATED",
			"orderstatus":     "PENDING",
		}).Decode(&order)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or already processed order"})
			return
		}

		if time.Now().UTC().After(order.ExpiresAt) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Order expired"})
			return
		}

		// ---------------- SIGNATURE VERIFY ----------------
		if os.Getenv("RAZORPAY_STRICT_VERIFY") == "true" {
			if req.RazorpaySignature == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Missing payment signature"})
				return
			}

			data := req.RazorpayOrderID + "|" + req.RazorpayPaymentID
			h := hmac.New(sha256.New, []byte(os.Getenv("RAZORPAY_KEY_SECRET")))
			h.Write([]byte(data))
			expectedSignature := hex.EncodeToString(h.Sum(nil))

			if !hmac.Equal([]byte(expectedSignature), []byte(req.RazorpaySignature)) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment signature"})
				return
			}
		}

		// ---------------- FETCH PAYMENT FROM RAZORPAY ----------------
		rzp := razorpay.NewClient(
			os.Getenv("RAZORPAY_KEY_ID"),
			os.Getenv("RAZORPAY_KEY_SECRET"),
		)

		payment, err := rzp.Payment.Fetch(req.RazorpayPaymentID, nil, nil)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payment details"})
			return
		}

		paymentStatus, ok := payment["status"].(string)
		if !ok || paymentStatus != "captured" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Payment not captured"})
			return
		}

		method, _ := payment["method"].(string)

		paymentDetails := bson.M{
			"method": method,
		}

		if method == "upi" {
			if vpa, ok := payment["vpa"].(string); ok {
				paymentDetails["upi"] = vpa
			}
		}

		if method == "netbanking" {
			if bank, ok := payment["bank"].(string); ok {
				paymentDetails["bank"] = bank
			}
		}

		if method == "wallet" {
			if wallet, ok := payment["wallet"].(string); ok {
				paymentDetails["wallet"] = wallet
			}
		}

		// ---------------- START TRANSACTION ----------------
		session, err := client.StartSession()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Session start failed"})
			return
		}
		defer session.EndSession(ctx)

		err = mongo.WithSession(ctx, session, func(sc mongo.SessionContext) error {

			if err := session.StartTransaction(); err != nil {
				return err
			}

			now := time.Now().UTC()
			// deadline := now.Add(48 * time.Hour)

			for i := range order.OrderCart {
				order.OrderCart[i].Status = "CONFIRMED"
				order.OrderCart[i].ConfirmedAt = &now
				campaignStart := order.OrderCart[i].FromDate.UTC()
				order.OrderCart[i].SLADeadline = &campaignStart
				order.OrderCart[i].PrintStartedAt = nil
				order.OrderCart[i].MountStartedAt = nil
				order.OrderCart[i].LiveAt = nil
				order.OrderCart[i].CompletedAt = nil
			}

			update := bson.M{
				"$set": bson.M{
					"orderstatus":          "CONFIRMED",
					"paymentstatus":        "PAID",
					"razorpaypaymentid":    req.RazorpayPaymentID,
					"razorpaysignature":    req.RazorpaySignature,
					"paymentverifiedat":    now,
					"paymentcaptured":      true,
					"paymentmethoddetails": paymentDetails,
					"updatedat":            now,
					"ordercart":            order.OrderCart,
				},
			}

			result, err := orderCollection.UpdateOne(
				sc,
				bson.M{
					"orderid":         req.OrderID,
					"customerid":      userID,
					"razorpayorderid": req.RazorpayOrderID,
					"paymentstatus":   "CREATED",
				},
				update,
			)

			if err != nil || result.MatchedCount == 0 {
				session.AbortTransaction(sc)
				return errors.New("order update failed")
			}

			var purchasedCartItemIDs []string
			for _, item := range order.OrderCart {
				if item.CartItemID != "" {
					purchasedCartItemIDs = append(purchasedCartItemIDs, item.CartItemID)
				}
			}

			userCollection := database.OpenCollection("users", client)

			_, err = userCollection.UpdateOne(
				sc,
				bson.M{"userid": order.CustomerID},
				bson.M{
					"$pull": bson.M{
						"usercart": bson.M{
							"cartitemid": bson.M{
								"$in": purchasedCartItemIDs,
							},
						},
					},
				},
			)

			if err != nil {
				session.AbortTransaction(sc)
				return err
			}

			return session.CommitTransaction(sc)
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Booking confirmation failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Payment verified and booking confirmed",
		})
	}
}

func GetOrdersByUser(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		userID, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authorised"})
			return
		}

		orderCollection := database.OpenCollection("orders", client)

		filter := bson.M{"customerid": userID}

		cursor, err := orderCollection.Find(ctx, filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
			return
		}
		defer cursor.Close(ctx)

		var orders []models.Order
		if err = cursor.All(ctx, &orders); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, orders)
	}
}
func GetOrderByID(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
		defer cancel()

		orderID := c.Param("orderId")

		userID, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		orderCollection := database.OpenCollection("orders", client)

		pipeline := mongo.Pipeline{

			{{"$match", bson.M{
				"orderid":       orderID,
				"customerid":    userID,
				"paymentstatus": "PAID",
			}}},

			{{"$unwind", "$ordercart"}},

			{{"$match", bson.M{
				"ordercart.status": bson.M{
					"$ne": "CANCELLED",
				},
			}}},

			{{"$project", bson.M{
				"_id": 0,

				"orderId":     "$orderid",
				"billboardId": "$ordercart.billboardid",

				"title":      "$ordercart.title",
				"coverImage": "$ordercart.coverimage",

				"fromDate": "$ordercart.fromdate",
				"toDate":   "$ordercart.todate",

				"material": "$ordercart.selectedmaterial",
				"mounting": "$ordercart.selectedmounting",

				"status": "$ordercart.status",

				"confirmedAt": "$ordercart.confirmedat",
				"liveAt":      "$ordercart.liveat",

				// SAFE mounting proof
				"mountingProof": bson.M{
					"photos": "$ordercart.mountingproof.photos",
					"video":  "$ordercart.mountingproof.video",
				},

				"createdAt": "$createdat",
			}}},
		}

		cursor, err := orderCollection.Aggregate(ctx, pipeline)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch order"})
			return
		}
		defer cursor.Close(ctx)

		var bookings []bson.M
		if err := cursor.All(ctx, &bookings); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Decode failed"})
			return
		}

		if len(bookings) == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"items":   bookings,
		})
	}
}

type PartnerBookingResponse struct {
	OrderID       string    `json:"orderId"`
	CustomerID    string    `json:"customerId"`
	OrderStatus   string    `json:"orderStatus"`
	PaymentStatus string    `json:"paymentStatus"`
	CreatedAt     time.Time `json:"createdAt"`

	PartnerItems []models.BillboardCart `json:"partnerItems"`

	// 🔥 Detailed Financials
	TotalDays           int     `json:"totalDays"`
	BaseRentTotal       float64 `json:"baseRentTotal"`
	PrintingCostTotal   float64 `json:"printingCostTotal"`
	MountingChargeTotal float64 `json:"mountingChargeTotal"`

	TaxableAmount float64 `json:"taxableAmount"`
	GST           float64 `json:"gst"`
	GrossAmount   float64 `json:"grossAmount"`
	Commission    float64 `json:"commission"`
	NetPayout     float64 `json:"netPayout"`

	//OrderTotal float64 `json:"orderTotal"`
	//Discount   float64 `json:"discount"`
}

func AutoExpirePendingOrders(client *mongo.Client) error {

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	orderCollection := database.OpenCollection("orders", client)

	now := time.Now().UTC()

	filter := bson.M{
		"orderstatus": "PENDING",
		"expiresat":   bson.M{"$lt": now},
	}

	update := bson.M{
		"$set": bson.M{
			"orderstatus": "EXPIRED",
			"updatedat":   now,
		},
	}

	_, err := orderCollection.UpdateMany(ctx, filter, update)
	return err
}
func AutoCompleteBookings(client *mongo.Client) error {

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	orderCollection := database.OpenCollection("orders", client)

	now := time.Now().UTC()

	filter := bson.M{
		"orderstatus": "CONFIRMED",
		"ordercart": bson.M{
			"$elemMatch": bson.M{
				"status": "LIVE",
				"todate": bson.M{"$lt": now},
			},
		},
	}

	update := bson.M{
		"$set": bson.M{
			"ordercart.$[elem].status":      "COMPLETED",
			"ordercart.$[elem].completedat": now,
			"updatedat":                     now,
		},
	}

	arrayFilters := options.Update().SetArrayFilters(options.ArrayFilters{
		Filters: []interface{}{
			bson.M{
				"elem.status": "LIVE",
				"elem.todate": bson.M{"$lt": now},
			},
		},
	})

	_, err := orderCollection.UpdateMany(ctx, filter, update, arrayFilters)
	return err
}
func StartOrderLifecycleWorker(client *mongo.Client) {

	ticker := time.NewTicker(5 * time.Minute)

	go func() {
		for range ticker.C {

			_ = AutoExpirePendingOrders(client)
			_ = AutoMarkSLABreach(client)
			_ = AutoCompleteBookings(client)

		}
	}()
}
func AutoMarkSLABreach(client *mongo.Client) error {

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	orderCollection := database.OpenCollection("orders", client)

	now := time.Now().UTC()

	filter := bson.M{
		"orderstatus": "CONFIRMED",
		"ordercart": bson.M{
			"$elemMatch": bson.M{
				"status":         "CONFIRMED",
				"sladeadline":    bson.M{"$lt": now},
				"printstartedat": bson.M{"$exists": false},
			},
		},
	}

	update := bson.M{
		"$set": bson.M{
			"ordercart.$[elem].status": "SLA_BREACHED",
			"updatedat":                now,
		},
	}

	arrayFilters := options.Update().SetArrayFilters(options.ArrayFilters{
		Filters: []interface{}{
			bson.M{
				"elem.status":         "CONFIRMED",
				"elem.sladeadline":    bson.M{"$lt": now},
				"elem.printstartedat": bson.M{"$exists": false},
			},
		},
	})

	_, err := orderCollection.UpdateMany(ctx, filter, update, arrayFilters)
	return err
}
func GetPartnerOrderHistory(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
		defer cancel()

		partnerID, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		orderCollection := database.OpenCollection("orders", client)

		pipeline := mongo.Pipeline{

			// FAST INDEX MATCH
			{{"$match", bson.M{
				"paymentstatus": "PAID",
				"ordercart": bson.M{
					"$elemMatch": bson.M{
						"partnerid": partnerID,
						"status":    "COMPLETED",
					},
				},
			}}},

			// FLATTEN CART
			{{"$unwind", "$ordercart"}},

			// ISOLATE THIS PARTNER ONLY
			{{"$match", bson.M{
				"ordercart.partnerid": partnerID,
				"ordercart.status":    "COMPLETED",
			}}},

			// SAFE RESPONSE
			{{"$project", bson.M{
				"_id": 0,

				"orderId":    "$orderid",
				"customerId": "$customerid",

				"title":      "$ordercart.title",
				"coverImage": "$ordercart.coverimage",

				"fromDate": "$ordercart.fromdate",
				"toDate":   "$ordercart.todate",

				"material": "$ordercart.selectedmaterial",
				"mounting": "$ordercart.selectedmounting",

				"status":      "$ordercart.status",
				"completedAt": "$ordercart.completedat",

				"createdAt": "$createdat",
			}}},

			// LATEST FIRST
			{{"$sort", bson.M{
				"completedAt": -1,
			}}},
		}

		cursor, err := orderCollection.Aggregate(ctx, pipeline)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch history"})
			return
		}
		defer cursor.Close(ctx)

		var history []bson.M
		if err := cursor.All(ctx, &history); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Decode failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"count":   len(history),
			"history": history,
		})
	}
}
