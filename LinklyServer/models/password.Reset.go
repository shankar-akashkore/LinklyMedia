package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PasswordReset struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	UserID    string             `bson:"userid"`
	Email     string             `bson:"email"`
	OTPHash   string             `bson:"otphash"`
	ExpiresAt time.Time          `bson:"expiresat"`
	Attempts  int                `bson:"attempts"`
	CreatedAt time.Time          `bson:"createdat"`
}
