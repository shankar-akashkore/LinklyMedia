package utils

import (
	"crypto/rand"
	"fmt"
	"math/big"
)

func GenerateOTP() string {
	n, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		// fallback or panic depending on your style
		return "000000"
	}
	return fmt.Sprintf("%06d", n.Int64())
}
