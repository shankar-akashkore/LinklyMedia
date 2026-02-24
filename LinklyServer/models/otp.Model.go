package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OTPVerification struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	UserID    string             `bson:"userid"`
	Type      string             `bson:"type"` // EMAIL or MOBILE
	OTPHash   string             `bson:"otphash"`
	ExpiresAt time.Time          `bson:"expiresat"`
	Attempts  int                `bson:"attempts"`
	CreatedAt time.Time          `bson:"createdat"`
}
