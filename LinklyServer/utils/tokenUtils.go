package utils

import (
	"LinklyMedia/database"
	"context"
	"errors"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type SignedDetails struct {
	Email     string
	FirstName string
	LastName  string
	Role      string
	UserID    string
	SessionID string
	jwt.RegisteredClaims
}

func getAccessSecret() []byte {
	secret := os.Getenv("SECRET_KEY")
	if secret == "" {
		panic("SECRET_KEY not set")
	}
	return []byte(secret)
}

func getRefreshSecret() []byte {
	secret := os.Getenv("SECRET_REFRESH_KEY")
	if secret == "" {
		panic("SECRET_REFRESH_KEY not set")
	}
	return []byte(secret)
}

// var SECRET_KEY string = os.Getenv("SECRET_KEY")
// var SECRET_REFRESH_KEY string = os.Getenv("SECRET_REFRESH_KEY")

func GenerateAllToken(email, firstName, lastName, role, userId string) (string, string, string, error) {

	sessionID := uuid.NewString()
	now := time.Now()

	// ===== ACCESS TOKEN CLAIMS =====
	accessClaims := &SignedDetails{
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Role:      role,
		UserID:    userId,
		SessionID: sessionID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "LinklyMedia",
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(24 * time.Hour)),
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	signedAccessToken, err := accessToken.SignedString(getAccessSecret())
	if err != nil {
		return "", "", "", err
	}

	// ===== REFRESH TOKEN CLAIMS =====
	refreshClaims := &SignedDetails{
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Role:      role,
		UserID:    userId,
		SessionID: sessionID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "LinklyMedia",
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(7 * 24 * time.Hour)),
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	signedRefreshToken, err := refreshToken.SignedString(getRefreshSecret())
	if err != nil {
		return "", "", "", err
	}

	return signedAccessToken, signedRefreshToken, sessionID, nil
}

func UpdateAllTokens(userId, token, refreshToken string, client *mongo.Client) (err error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	updateAt, _ := time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
	updateData := bson.M{
		"$set": bson.M{
			"token":        token,
			"refreshtoken": refreshToken,
			"updatedat":    updateAt,
		},
	}
	var userCollection *mongo.Collection = database.OpenCollection("users", client)
	_, err = userCollection.UpdateOne(ctx, bson.M{"userid": userId}, updateData)
	if err != nil {
		return err
	}
	return nil
}
func GetAccessToken(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return "", errors.New("Authorization header is required")
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return "", errors.New("invalid authorization format")
	}

	return parts[1], nil
}

func ValidateToken(tokenString string) (*SignedDetails, error) {
	claims := &SignedDetails{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {

		if token.Method != jwt.SigningMethodHS256 {
			return nil, errors.New("invalid signing method")
		}

		return getAccessSecret(), nil

	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}

	if claims.Issuer != "LinklyMedia" {
		return nil, errors.New("invalid issuer")
	}

	return claims, nil
}

func ValidateRefreshToken(tokenString string) (*SignedDetails, error) {
	claims := &SignedDetails{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {

		if token.Method != jwt.SigningMethodHS256 {
			return nil, errors.New("invalid signing method")
		}

		return getRefreshSecret(), nil

	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired refresh token")
	}

	if claims.Issuer != "LinklyMedia" {
		return nil, errors.New("invalid issuer")
	}

	return claims, nil
}

// package utils

// import (
// 	"LinklyMedia/database"
// 	"context"
// 	"errors"
// 	"os"
// 	"strings"
// 	"time"

// 	"github.com/gin-gonic/gin"
// 	jwt "github.com/golang-jwt/jwt/v5"
// 	"go.mongodb.org/mongo-driver/mongo"
// 	"go.mongodb.org/mongo-driver/v2/bson"
// )

// type SignedDetails struct {
// 	Email     string
// 	FirstName string
// 	LastName  string
// 	Role      string
// 	UserID    string
// 	jwt.RegisteredClaims
// }

// var SECRET_KEY = os.Getenv("SECRET_KEY")
// var SECRET_REFRESH_KEY = os.Getenv("SECRET_REFRESH_KEY")

// // ================= GENERATE TOKENS =================

// func GenerateAllToken(email, firstName, lastName, role, userId string) (string, string, error) {

// 	if SECRET_KEY == "" || SECRET_REFRESH_KEY == "" {
// 		return "", "", errors.New("secret keys not configured")
// 	}

// 	now := time.Now()

// 	claims := &SignedDetails{
// 		Email:     email,
// 		FirstName: firstName,
// 		LastName:  lastName,
// 		Role:      role,
// 		UserID:    userId,
// 		RegisteredClaims: jwt.RegisteredClaims{
// 			Issuer:    "LinklyMedia",
// 			IssuedAt:  jwt.NewNumericDate(now),
// 			ExpiresAt: jwt.NewNumericDate(now.Add(24 * time.Hour)),
// 		},
// 	}

// 	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

// 	signedToken, err := token.SignedString([]byte(SECRET_KEY))
// 	if err != nil {
// 		return "", "", err
// 	}

// 	refreshClaims := *claims
// 	refreshClaims.ExpiresAt = jwt.NewNumericDate(now.Add(7 * 24 * time.Hour))

// 	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)

// 	signedRefreshToken, err := refreshToken.SignedString([]byte(SECRET_REFRESH_KEY))
// 	if err != nil {
// 		return "", "", err
// 	}

// 	return signedToken, signedRefreshToken, nil
// }

// // ================= STORE TOKENS =================

// func UpdateAllTokens(userId, token, refreshToken string, client *mongo.Client) error {

// 	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
// 	defer cancel()

// 	updateData := bson.M{
// 		"$set": bson.M{
// 			"token":        token,
// 			"refreshtoken": refreshToken,
// 			"updatedat":    time.Now(),
// 		},
// 	}

// 	userCollection := database.OpenCollection("users", client)

// 	result, err := userCollection.UpdateOne(ctx, bson.M{"userid": userId}, updateData)
// 	if err != nil {
// 		return err
// 	}

// 	if result.MatchedCount == 0 {
// 		return errors.New("user not found")
// 	}

// 	return nil
// }

// // ================= GET ACCESS TOKEN =================

// func GetAccessToken(c *gin.Context) (string, error) {

// 	authHeader := c.GetHeader("Authorization")
// 	if authHeader == "" {
// 		return "", errors.New("authorization header is required")
// 	}

// 	parts := strings.Split(authHeader, " ")
// 	if len(parts) != 2 || parts[0] != "Bearer" {
// 		return "", errors.New("invalid authorization format")
// 	}

// 	return parts[1], nil
// }

// // ================= VALIDATE ACCESS TOKEN =================

// func ValidateToken(tokenString string) (*SignedDetails, error) {

// 	if SECRET_KEY == "" {
// 		return nil, errors.New("secret key not configured")
// 	}

// 	claims := &SignedDetails{}

// 	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {

// 		if token.Method != jwt.SigningMethodHS256 {
// 			return nil, errors.New("invalid signing method")
// 		}

// 		return []byte(SECRET_KEY), nil
// 	})

// 	if err != nil || !token.Valid {
// 		return nil, errors.New("invalid or expired token")
// 	}

// 	if claims.Issuer != "LinklyMedia" {
// 		return nil, errors.New("invalid token issuer")
// 	}

// 	return claims, nil
// }

// // ================= VALIDATE REFRESH TOKEN =================

// func ValidateRefreshToken(tokenString string) (*SignedDetails, error) {

// 	if SECRET_REFRESH_KEY == "" {
// 		return nil, errors.New("refresh secret not configured")
// 	}

// 	claims := &SignedDetails{}

// 	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {

// 		if token.Method != jwt.SigningMethodHS256 {
// 			return nil, errors.New("invalid signing method")
// 		}

// 		return []byte(SECRET_REFRESH_KEY), nil
// 	})

// 	if err != nil || !token.Valid {
// 		return nil, errors.New("invalid or expired refresh token")
// 	}

// 	if claims.Issuer != "LinklyMedia" {
// 		return nil, errors.New("invalid token issuer")
// 	}

// 	return claims, nil
// }
