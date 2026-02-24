package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Coupon struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Code            string             `bson:"code" json:"code"`
	DiscountPercent float64            `bson:"discountpercent" json:"discountpercent"`
	MaxDiscount     float64            `bson:"maxdiscount" json:"maxdiscount"`
	MinOrderValue   float64            `bson:"minordervalue" json:"minordervalue"`
	ExpiryDate      time.Time          `bson:"expirydate" json:"expirydate"`
	IsActive        bool               `bson:"isactive" json:"isactive"`
	UsageLimit      int                `bson:"usagelimit" json:"usagelimit"`
	UsedCount       int                `bson:"usedcount" json:"usedcount"`
	CreatedAt       time.Time          `bson:"createdat" json:"createdat"`
	UpdatedAt       time.Time          `bson:"updatedat" json:"updatedat"`
}
