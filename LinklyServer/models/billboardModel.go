package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Billboard struct {
	ID             primitive.ObjectID `bson:"_id"`
	BillboardID    string             `json:"billboardid" bson:"billboardid"`
	BillboardTitle string             `json:"billboardtitle" bson:"billboardtitle" validate:"required"`
	Description    string             `json:"description" bson:"description" validate:"required,min=2,max=1000"`
	Landmark       string             `json:"landmark" bson:"landmark" validate:"required"`
	Locality       string             `json:"locality" bson:"locality" validate:"required"`
	Location       string             `json:"location" bson:"location" validate:"required"`
	City           string             `json:"city" bson:"city" validate:"required"`
	Impressions    int                `json:"impressions" bson:"impressions" validate:"required"`
	MinSpan        int                `json:"minspan" bson:"minspan" validate:"required"`
	Price          int                `json:"price" bson:"price" validate:"required,gte=1"`
	Type           []Type             `json:"type" bson:"type" validate:"required,dive"`
	PartnerID      string             `json:"partnerid" bson:"partnerid"`
	Images         []BillboardImage   `json:"images" bson:"images" validate:"omitempty,dive"`
	CreatedAt      time.Time          `json:"createdat" bson:"createdat"`
	UpdatedAt      time.Time          `json:"updatedat" bson:"updatedat"`
	Size           Size               `json:"size" bson:"size" validateexecutioncharge:"required"`
	AverageRating  float64            `json:"averagerating" bson:"averagerating"`
	Reviews        []CustomerReview   `json:"reviews" bson:"reviews"`
	Likes          []Like             `json:"like" bson:"like"`
	Materials      []MaterialPricing  `bson:"materials" json:"materials"`
	Mountings      []MountingPricing  `bson:"mountings" json:"mountings"`
	TotalLikes     int                `json:"totallikes" bson:"totallikes"`
	IsActive       bool               `json:"isactive" bson:"isactive"`

	//ExecutionCharge ExecutionCharges   `json:"executioncharge" bson:"executioncharge"`
}
type BillboardCart struct {
	CartItemID       string      `json:"cartItemId" bson:"cartitemid" validate:"required"`
	BillboardID      string      `json:"billboardId" bson:"billboardid" validate:"required"`
	PartnerID        string      `json:"partnerId" bson:"partnerid" validate:"required"`
	Title            string      `json:"title" bson:"title" validate:"required"`
	CoverImage       string      `json:"coverImage" bson:"coverimage"`
	Price            float64     `json:"price" bson:"price" validate:"required,gte=0"`
	FromDate         time.Time   `json:"fromDate" bson:"fromdate" validate:"required"`
	ToDate           time.Time   `json:"toDate" bson:"todate" validate:"required,gtfield=FromDate"`
	SelectedMaterial string      `json:"selectedMaterial" bson:"selectedmaterial" validate:"required"`
	SelectedMounting string      `json:"selectedMounting" bson:"selectedmounting" validate:"required"`
	Design           DesignImage `json:"design" bson:"design" validate:"omitempty"`

	// ================= LIFECYCLE =================

	Status string `json:"status" bson:"status" validate:"omitempty,oneof=CONFIRMED PRINTING MOUNTING LIVE COMPLETED CANCELLED"`

	ConfirmedAt    *time.Time `json:"confirmedat,omitempty" bson:"confirmedat,omitempty"`
	SLADeadline    *time.Time `json:"sladeadline,omitempty" bson:"sladeadline,omitempty"`
	PrintStartedAt *time.Time `json:"printstartedat,omitempty" bson:"printstartedat,omitempty"`
	MountStartedAt *time.Time `json:"mountstartedat,omitempty" bson:"mountstartedat,omitempty"`
	LiveAt         *time.Time `json:"liveat,omitempty" bson:"liveat,omitempty"`
	CompletedAt    *time.Time `json:"completedat,omitempty" bson:"completedat,omitempty"`

	SLABreached   bool `json:"slabreach,omitempty" bson:"slabreach,omitempty"`
	IsRemoved     bool `json:"isremoved,omitempty" bson:"isremoved,omitempty"`
	MountingProof struct {
		Photos     []string   `bson:"photos,omitempty" json:"photos,omitempty"`
		Video      string     `bson:"video,omitempty" json:"video,omitempty"`
		Token      string     `bson:"token,omitempty" json:"token,omitempty"`
		UploadedAt *time.Time `bson:"uploadedat,omitempty" json:"uploadedat,omitempty"`
	} `bson:"mountingproof,omitempty" json:"mountingproof,omitempty"`
}
type BillboardFilterQuery struct {
	Location  string   `form:"location"`
	MinPrice  int      `form:"minPrice"`
	MaxPrice  int      `form:"maxPrice"`
	MinReach  int      `form:"minReach"`
	MaxReach  int      `form:"maxReach"`
	Types     []string `form:"types[]"`
	MinRating float64  `form:"minRating"`
	SortBy    string   `form:"sortBy"`
	Page      int64    `form:"page"`
	Limit     int64    `form:"limit"`
}

type BillboardUpdate struct {
	BillboardTitle *string            `json:"billboardtitle,omitempty" validate:"omitempty,min=2,max=100"`
	Description    *string            `json:"description,omitempty" validate:"omitempty,min=2,max=500"`
	Landmark       *string            `json:"landmark,omitempty" validate:"omitempty,min=2,max=100"`
	Locality       *string            `json:"locality,omitempty" validate:"omitempty,min=2,max=100"`
	Location       *string            `json:"location,omitempty"`
	City           *string            `json:"city,omitempty" validate:"omitempty,min=2,max=100"`
	Impressions    *int               `json:"impressions,omitempty" validate:"omitempty,gte=0"`
	MinSpan        *int               `json:"minspan,omitempty" validate:"omitempty,gte=1"`
	Price          *int               `json:"price,omitempty" validate:"omitempty,gte=1"`
	Type           *[]Type            `json:"type,omitempty" validate:"omitempty,dive"`
	Images         *[]BillboardImage  `json:"images,omitempty" validate:"omitempty,dive"`
	Size           *Size              `json:"size,omitempty" validate:"omitempty"`
	Materials      *[]MaterialPricing `json:"materials,omitempty" validate:"omitempty,dive"`
	Mountings      *[]MountingPricing `json:"mountings,omitempty" validate:"omitempty,dive"`
}

type Type struct {
	TypeID   int    `bson:"typeid" json:"typeid" validate:"required"`
	TypeName string `bson:"typename" json:"typename" validate:"required,min=2,max=30"`
}

type Size struct {
	Width  int `json:"widthinft" bson:"widthinft" validate:"required,min=1,max=500"`
	Height int `json:"heightinft" bson:"heightinft" validate:"required,min=1,max=500"`
}
type CustomerReview struct {
	Review       string `json:"review" bson:"review" validate:"max=500"`
	Rating       int    `json:"rating" bson:"rating" validate:"required,min=1,max=5"`
	CustomerID   string `json:"customerid" bson:"customerid"`
	CustomerName string `json:"customername" bson:"customername"`
}
type AddToCartRequest struct {
	BillboardID      string    `json:"billboardId" binding:"required"`
	SelectedMaterial string    `json:"selectedMaterial" binding:"required"`
	SelectedMounting string    `json:"selectedMounting" binding:"required"`
	FromDate         time.Time `json:"fromdate" binding:"required"`
	ToDate           time.Time `json:"todate" binding:"required"`
}

type BillboardImage struct {
	URL       string `json:"url" bson:"url" validate:"required,url"`
	PublicID  string `json:"publicid" bson:"publicid" validate:"required"`
	AltText   string `json:"alttext,omitempty" bson:"alttext,omitempty"`
	IsPrimary bool   `json:"isprimary" bson:"isprimary"`
}
type DesignImage struct {
	URL      string `json:"url" bson:"url" validate:"required,url"`
	PublicID string `json:"publicid" bson:"publicid" validate:"required"`
	AltText  string `json:"alttext,omitempty" bson:"alttext,omitempty"`
	//IsPrimary bool   `json:"isprimary" bson:"isprimary"`
}
type Like struct {
	UserId  string    `json:"userId" bson:"userId"`
	LikedAt time.Time `json:"likedat" bson:"likedat"`
}
type ExecutionCharges struct {
	PrintingCharge int `json:"printingcharge" bson:"printingcharge" validate:"required"`
	MountingCharge int `json:"mountingcharge" bson:"mountingcharge" validate:"required"`
	OtherCharges   int `json:"othercharges" bson:"othercharges" validate:"omitempty"`
}
type MaterialPricing struct {
	MaterialType string  `bson:"materialType" json:"materialType"`
	PricePerSqFt float64 `bson:"pricePerSqFt" json:"pricePerSqFt"`
}

type MountingPricing struct {
	MountingType string  `bson:"mountingType" json:"mountingType"`
	FlatCharge   float64 `bson:"flatCharge" json:"flatCharge"`
}
