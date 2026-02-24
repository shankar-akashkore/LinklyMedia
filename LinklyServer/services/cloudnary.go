package services

import (
	"LinklyMedia/models"
	"context"
	"fmt"
	"mime/multipart"
	"os"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

// func UploadToCloudinary(file *multipart.FileHeader) (models.BillboardImage, error) {
// 	cld, _ := cloudinary.NewFromURL("cloudinary://<api_key>:<api_secret>@<cloud_name>")

// 	f, _ := file.Open()
// 	defer f.Close()

// 	uploadResult, err := cld.Upload.Upload(context.Background(), f, uploader.UploadParams{
// 		Folder: "billboards",
// 	})
// 	if err != nil {
// 		return models.BillboardImage{}, err
// 	}

//		return models.BillboardImage{
//			URL:      uploadResult.SecureURL,
//			PublicID: uploadResult.PublicID,
//		}, nil
//	}-
func UploadToCloudinary(file *multipart.FileHeader) (models.BillboardImage, error) {
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")
	fmt.Println("🔹 Cloud name:", cloudName)
	fmt.Println("🔹 API key:", apiKey)
	fmt.Println("🔹 API secret (first 4 chars):", apiSecret[:4])

	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		fmt.Println("❌ Cloudinary init error:", err)
		return models.BillboardImage{}, err
	}

	f, err := file.Open()
	if err != nil {
		fmt.Println("❌ File open error:", err)
		return models.BillboardImage{}, err
	}
	defer f.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	uploadResult, err := cld.Upload.Upload(ctx, f, uploader.UploadParams{
		Folder: "billboards",
	})
	if err != nil {
		fmt.Println("❌ Upload error:", err)
		return models.BillboardImage{}, err
	}

	fmt.Println("✅ Cloudinary Upload Success:")
	fmt.Println("Secure URL:", uploadResult.SecureURL)
	fmt.Println("Public ID:", uploadResult.PublicID)

	return models.BillboardImage{
		URL:       uploadResult.SecureURL,
		PublicID:  uploadResult.PublicID,
		AltText:   file.Filename,
		IsPrimary: false,
	}, nil
}
func DeleteFromCloudinary(publicID string) error {
	cld, _ := cloudinary.NewFromParams(
		os.Getenv("CLOUDINARY_CLOUD_NAME"),
		os.Getenv("CLOUDINARY_API_KEY"),
		os.Getenv("CLOUDINARY_API_SECRET"),
	)
	ctx := context.Background()
	_, err := cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})
	return err
}
