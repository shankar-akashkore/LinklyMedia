package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Connect() *mongo.Client {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	// err := godotenv.Load(".env")
	// if err != nil {
	// 	log.Println("Warning unable to find .env file")
	// }
	MongoDb := os.Getenv("MONGODB_URI")
	if MongoDb == "" {
		log.Fatal("MONGODB_URI not set")
	}
	//fmt.Println("MongoDB URI: ", MongoDb)
	clientOptions := options.Client().ApplyURI(MongoDb)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	return client
}

func OpenCollection(collectionName string, client *mongo.Client) *mongo.Collection {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Warning: unable to find .env file")
	}
	databaseName := os.Getenv("DATABASE_NAME")
	fmt.Println("DATABASE_NAME: ", databaseName)
	collection := client.Database(databaseName).Collection(collectionName)
	if collection == nil {
		return nil
	}
	return collection
}
