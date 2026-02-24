package services

import (
	"LinklyMedia/database"
	"LinklyMedia/models"
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func NotifyUserProofAvailable(
	client *mongo.Client,
	customerID string,
	cartItemID string,
	token string,
) {

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userCollection := database.OpenCollection("users", client)

	var user models.User

	err := userCollection.FindOne(
		ctx,
		bson.M{"userid": customerID},
	).Decode(&user)

	if err != nil {
		log.Println("User fetch failed:", err)
		return
	}

	link := os.Getenv("FRONTEND_URL") + "/campaign-proof/" + token

	subject := "Your Campaign is Now LIVE 🎉"

	body := fmt.Sprintf(`
Your Linkly campaign has been installed successfully.

Please review installation proof here:
%s

Regards,
Team Linkly
`, link)

	err = SendGenericEmail(user.Email, subject, body)
	if err != nil {
		log.Println("Email send failed:", err)
	}

	log.Println("User notified for LIVE proof:", cartItemID)
}
