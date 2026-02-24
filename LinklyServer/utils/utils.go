package utils

import (
	"LinklyMedia/database"
	"LinklyMedia/models"
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func GetUserIdFromContext(c *gin.Context) (string, error) {
	userIDValue, exists := c.Get("userid")
	if !exists {
		return "", errors.New("userid not found in context")
	}
	userID, ok := userIDValue.(string)
	if !ok || userID == "" {
		return "", errors.New("invalid or empty userid in context")
	}
	return userID, nil
}
func GetUserFirstnameFromContext(c *gin.Context) (string, error) {
	userName, exists := c.Get("firstname")
	if !exists {
		return "", errors.New("firstname not found in context")
	}
	userNamee, ok := userName.(string)
	if !ok || userNamee == "" {
		return "", errors.New("invalid or empty firstname in context")
	}
	return userNamee, nil
}

func GetRoleFromContext(c *gin.Context) (string, error) {
	role, exists := c.Get("role")
	if !exists {
		return "", errors.New("userId does not exists in this context")
	}
	id, ok := role.(string)
	if !ok {
		return "", errors.New("unable to retrive userId")
	}
	return id, nil
}

func CalculateDays(fromDate, toDate time.Time) (int, error) {
	if fromDate.IsZero() || toDate.IsZero() {
		return 0, errors.New("fromDate or toDate is zero value")
	}
	from := time.Date(fromDate.In(time.UTC).Year(), fromDate.In(time.UTC).Month(), fromDate.In(time.UTC).Day(), 0, 0, 0, 0, time.UTC)
	to := time.Date(toDate.In(time.UTC).Year(), toDate.In(time.UTC).Month(), toDate.In(time.UTC).Day(), 0, 0, 0, 0, time.UTC)
	if to.Before(from) {
		return 0, errors.New("to date must be same or after from date")
	}
	days := int(to.Sub(from).Hours()/24) + 1
	return days, nil
}
func GetUserFirstnameFromUserId(client *mongo.Client, userID string) (string, error) {

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	userCollection := database.OpenCollection("users", client)

	// Only fetch firstname field
	opts := options.FindOne().SetProjection(bson.M{
		"firstname": 1,
		"_id":       0,
	})

	var result struct {
		FirstName string `bson:"firstname"`
	}

	err := userCollection.
		FindOne(ctx, bson.M{"userid": userID}, opts).
		Decode(&result)

	if err != nil {
		return "", err
	}

	return result.FirstName, nil
}

func Like(client *mongo.Client, c *gin.Context) (bool, error) {

	userID, err := GetUserIdFromContext(c)
	if err != nil {
		return false, err
	}

	billboardID := c.Param("id")
	if billboardID == "" {
		return false, errors.New("billboard id missing")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	billboardCollection := database.OpenCollection("billboards", client)

	like := models.Like{
		UserId:  userID,
		LikedAt: time.Now(),
	}

	filter := bson.M{
		"billboardid": billboardID,
		"likes.userid": bson.M{
			"$ne": userID,
		},
	}

	update := bson.M{
		"$inc": bson.M{
			"totallikes": 1,
		},
		"$push": bson.M{
			"likes": like,
		},
	}

	res, err := billboardCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		return false, err
	}

	if res.MatchedCount == 0 || res.ModifiedCount == 0 {
		return false, errors.New("already liked or billboard not found")
	}

	return true, nil
}

func Unlike(client *mongo.Client, c *gin.Context) (bool, error) {

	userID, err := GetUserIdFromContext(c)
	if err != nil {
		return false, err
	}

	billboardID := c.Param("id")
	if billboardID == "" {
		return false, errors.New("billboard id missing")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	billboardCollection := database.OpenCollection("billboards", client)

	filter := bson.M{
		"billboardid":  billboardID,
		"likes.userid": userID,
	}

	update := bson.M{
		"$inc": bson.M{
			"totallikes": -1,
		},
		"$pull": bson.M{
			"likes": bson.M{
				"userid": userID,
			},
		},
	}

	res, err := billboardCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		return false, err
	}

	if res.MatchedCount == 0 {
		return false, errors.New("not liked yet or billboard not found")
	}

	return true, nil
}
func IsAvailableForBooking(
	fromDate, toDate time.Time,
	billboardId string,
	client *mongo.Client,
) (bool, *time.Time, error) {

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	billboardCollection := database.OpenCollection("billboards", client)

	// ---------- Step 0: Fetch billboard & validate active ----------
	var billboard models.Billboard

	err := billboardCollection.FindOne(
		ctx,
		bson.M{
			"billboardid": billboardId,
			"isactive":    true,
		},
		options.FindOne().SetProjection(bson.M{
			"_id":     1,
			"minspan": 1,
		}),
	).Decode(&billboard)

	if err == mongo.ErrNoDocuments {
		return false, nil, errors.New("billboard is currently unavailable")
	}
	if err != nil {
		return false, nil, err
	}

	// ---------- Step 1: Validate dates ----------
	if fromDate.IsZero() || toDate.IsZero() {
		return false, nil, errors.New("invalid booking dates")
	}

	from := fromDate.UTC().Truncate(24 * time.Hour)
	to := toDate.UTC().Truncate(24 * time.Hour)
	today := time.Now().UTC().Truncate(24 * time.Hour)

	const minLeadDays = 2
	earliestAllowed := today.AddDate(0, 0, minLeadDays)

	if from.Before(earliestAllowed) {
		return false, nil, errors.New("booking must be at least 2 days in advance")
	}

	if to.Before(from) {
		return false, nil, errors.New("to date must be after from date")
	}

	durationDays := int(to.Sub(from).Hours() / 24)
	if billboard.MinSpan > 0 && durationDays < billboard.MinSpan {
		return false, nil, fmt.Errorf("minimum booking duration is %d days", billboard.MinSpan)
	}

	maxAllowedEnd := from.AddDate(0, 6, 0)
	if to.After(maxAllowedEnd) {
		return false, nil, errors.New("booking duration cannot exceed 6 months")
	}

	orderCollection := database.OpenCollection("orders", client)

	// ---------- Step 2: Auto-expire parent ----------
	_, _ = orderCollection.UpdateMany(
		ctx,
		bson.M{
			"orderstatus": "PENDING",
			"expiresat":   bson.M{"$lt": time.Now()},
		},
		bson.M{
			"$set": bson.M{
				"orderstatus": "EXPIRED",
			},
		},
	)

	// ---------- Step 3: Buffers ----------
	installBuffer := 48 * time.Hour
	removalBuffer := 24 * time.Hour

	internalFrom := from.Add(-installBuffer)
	internalTo := to.Add(removalBuffer)

	// ---------- Step 4: Active lifecycle only ----------
	filter := bson.M{
		"ordercart": bson.M{
			"$elemMatch": bson.M{
				"billboardid": billboardId,
				"status": bson.M{
					"$in": []string{
						"CONFIRMED",
						"PRINTING",
						"MOUNTING",
						"LIVE",
					},
				},
			},
		},
	}

	findOptions := options.Find().SetProjection(bson.M{
		"ordercart":   1,
		"orderstatus": 1, // 🚨 MUST FETCH THIS
	})

	cursor, err := orderCollection.Find(ctx, filter, findOptions)
	if err != nil {
		return false, nil, err
	}
	defer cursor.Close(ctx)

	var earliestNextAvailable *time.Time

	// ---------- Step 5: Overlap check ----------
	for cursor.Next(ctx) {

		var existing models.Order
		if err := cursor.Decode(&existing); err != nil {
			return false, nil, err
		}

		// 🚨 CRITICAL: Ignore expired parent orders
		if existing.OrderStatus == "EXPIRED" {
			continue
		}

		for _, item := range existing.OrderCart {

			if item.BillboardID != billboardId {
				continue
			}

			// skip inactive inventory
			if item.Status == "COMPLETED" ||
				item.Status == "CANCELLED" ||
				item.Status == "EXPIRED" {
				continue
			}

			existingFrom := item.FromDate.UTC().Truncate(24 * time.Hour).Add(-installBuffer)
			existingTo := item.ToDate.UTC().Truncate(24 * time.Hour).Add(removalBuffer)

			overlap := internalFrom.Before(existingTo) && internalTo.After(existingFrom)

			if overlap {
				nextAvailable := item.ToDate.UTC().Truncate(24 * time.Hour).Add(removalBuffer)

				if earliestNextAvailable == nil || nextAvailable.Before(*earliestNextAvailable) {
					earliestNextAvailable = &nextAvailable
				}
			}
		}
	}

	// ---------- Step 6 ----------
	if earliestNextAvailable == nil {
		return true, nil, nil
	}

	return false, earliestNextAvailable, nil
}
