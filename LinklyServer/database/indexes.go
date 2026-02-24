package database

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func EnsureOTPIndexes(client *mongo.Client) error {

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := OpenCollection("otpVerifications", client)

	indexModel := mongo.IndexModel{
		Keys: bson.D{
			{Key: "expiresat", Value: 1},
		},
		Options: options.Index().SetExpireAfterSeconds(0),
	}

	_, err := collection.Indexes().CreateOne(ctx, indexModel)
	return err
}
