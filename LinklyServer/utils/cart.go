package utils

import (
	"LinklyMedia/models"

	"context"
	"time"

	"errors"
	"log"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	ErrCantFindProduct    = errors.New("can't find the product")
	ErrCantDecodeProducts = errors.New("can't find the product")
	ErrUserIdIsNotValid   = errors.New("this user is not valid")
	ErrCantUpdateUser     = errors.New("cannot update user")
	ErrCantRemoveCartItem = errors.New("cannot remove thid item from the cart")
	ErrCantGetItem        = errors.New("was unabale to get item from the cart")
	ErrCantBuyCartItem    = errors.New("cannot buy cart items")
)

func AddBillboardToCart(
	ctx context.Context,
	c *gin.Context,
	billboardCollection *mongo.Collection,
	userCollection *mongo.Collection,
	billboardID string,
	selectedMaterial string,
	selectedMounting string,
	fromDate time.Time,
	toDate time.Time,
	design models.DesignImage,
) error {

	// ========= 1. Fetch Billboard =========
	var billboard models.Billboard
	err := billboardCollection.FindOne(ctx, bson.M{"billboardid": billboardID}).Decode(&billboard)
	if err != nil {
		return ErrCantFindProduct
	}

	// ========= 2. Validate Material =========
	var materialValid bool
	for _, m := range billboard.Materials {
		if m.MaterialType == selectedMaterial {
			materialValid = true
			break
		}
	}
	if !materialValid {
		return errors.New("invalid material selected")
	}

	// ========= 3. Validate Mounting =========
	var mountingValid bool
	for _, m := range billboard.Mountings {
		if m.MountingType == selectedMounting {
			mountingValid = true
			break
		}
	}
	if !mountingValid {
		return errors.New("invalid mounting selected")
	}

	// ========= 4. Extract Cover Image =========
	coverImage := ""
	if len(billboard.Images) > 0 {
		coverImage = billboard.Images[0].URL
	}

	// ========= 5. Get User =========
	userID, err := GetUserIdFromContext(c)
	if err != nil {
		return ErrUserIdIsNotValid
	}

	var user models.User
	err = userCollection.FindOne(ctx, bson.M{"userid": userID}).Decode(&user)
	if err != nil {
		return errors.New("failed to fetch user")
	}

	// ========= 6. Overlap Check =========
	for _, item := range user.UserCart {
		if item.BillboardID == billboardID {
			if fromDate.Before(item.ToDate) && toDate.After(item.FromDate) {
				return errors.New("booking dates overlap with existing cart entry")
			}
		}
	}

	// ========= 7. Build Cart Item =========
	cartItem := models.BillboardCart{
		CartItemID:       primitive.NewObjectID().Hex(),
		BillboardID:      billboard.BillboardID,
		PartnerID:        billboard.PartnerID,
		Title:            billboard.BillboardTitle,
		Price:            float64(billboard.Price),
		CoverImage:       coverImage,
		SelectedMaterial: selectedMaterial,
		SelectedMounting: selectedMounting,
		FromDate:         fromDate,
		ToDate:           toDate,
		Design:           design,
		Status:           "CONFIRMED",
		IsRemoved:        false,
	}

	// ========= 8. Push to Cart =========
	update := bson.M{
		"$push": bson.M{
			"usercart": cartItem,
		},
	}

	result, err := userCollection.UpdateOne(
		ctx,
		bson.M{"userid": userID},
		update,
	)

	if err != nil || result.MatchedCount == 0 {
		return ErrCantUpdateUser
	}

	return nil
}

func RemoveCartItem(
	ctx context.Context,
	userCollection *mongo.Collection,
	cartItemID string,
	userID string,
) error {

	filter := bson.M{"userid": userID}

	update := bson.M{
		"$pull": bson.M{
			"usercart": bson.M{
				"cartitemid": cartItemID,
			},
		},
	}

	result, err := userCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Println("Error removing item from cart:", err)
		return ErrCantRemoveCartItem
	}

	if result.ModifiedCount == 0 {
		return errors.New("cart item not found")
	}

	return nil
}
