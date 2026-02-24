package utils

import (
	"context"
	"errors"
	"time"

	"LinklyMedia/database"
	"LinklyMedia/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	ErrCouponNotFound       = errors.New("invalid coupon code")
	ErrCouponInactive       = errors.New("coupon is inactive")
	ErrCouponExpired        = errors.New("coupon expired")
	ErrCouponUsageExceeded  = errors.New("coupon usage limit reached")
	ErrCouponMinOrderNotMet = errors.New("minimum order value not met")
)

func ValidateAndApplyCoupon(
	ctx context.Context,
	client *mongo.Client,
	couponCode string,
	orderTotal float64,
) (finalTotal float64, discountAmount float64, err error) {

	// If no coupon provided → return original price
	if couponCode == "" {
		return orderTotal, 0, nil
	}

	couponCollection := database.OpenCollection("coupons", client)

	var coupon models.Coupon

	err = couponCollection.FindOne(ctx, bson.M{
		"code": couponCode,
	}).Decode(&coupon)

	if err != nil {
		return orderTotal, 0, ErrCouponNotFound
	}

	// Check active
	if !coupon.IsActive {
		return orderTotal, 0, ErrCouponInactive
	}

	// Check expiry
	if time.Now().After(coupon.ExpiryDate) {
		return orderTotal, 0, ErrCouponExpired
	}

	// Check usage limit
	if coupon.UsageLimit > 0 && coupon.UsedCount >= coupon.UsageLimit {
		return orderTotal, 0, ErrCouponUsageExceeded
	}

	// Check minimum order value
	if orderTotal < coupon.MinOrderValue {
		return orderTotal, 0, ErrCouponMinOrderNotMet
	}

	// Calculate discount
	discountAmount = (orderTotal * coupon.DiscountPercent) / 100

	// Cap discount
	if discountAmount > coupon.MaxDiscount {
		discountAmount = coupon.MaxDiscount
	}

	finalTotal = orderTotal - discountAmount

	if finalTotal < 0 {
		finalTotal = 0
	}

	return finalTotal, discountAmount, nil
}
func IncrementCouponUsage(
	ctx context.Context,
	client *mongo.Client,
	couponCode string,
) error {

	if couponCode == "" {
		return nil
	}

	couponCollection := database.OpenCollection("coupons", client)

	_, err := couponCollection.UpdateOne(
		ctx,
		bson.M{"code": couponCode},
		bson.M{
			"$inc": bson.M{
				"usedcount": 1,
			},
			"$set": bson.M{
				"updatedat": time.Now(),
			},
		},
	)

	return err
}
