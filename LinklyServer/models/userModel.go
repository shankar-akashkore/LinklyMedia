package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID              primitive.ObjectID   `json:"_id,omitempty" bson:"_id,omitempty"`
	UserID          string               `json:"userid" bson:"userid"`
	FirstName       string               `json:"firstname" bson:"firstname" validate:"required,min=2,max=100"`
	LastName        string               `json:"lastname" bson:"lastname" validate:"required"`
	DOB             time.Time            `json:"dob" bson:"dob" validate:"required"`
	Mobile          string               `json:"mobile" bson:"mobile" validate:"required,e164"`
	Email           string               `json:"email" bson:"email" validate:"required,email"`
	Password        string               `json:"password" bson:"password" validate:"required,min=6"`
	Role            string               `json:"role" bson:"role" validate:"oneof=ADMIN USER PARTNER"`
	UserCart        []BillboardCart      `json:"usercart" bson:"usercart"`
	CreatedAt       time.Time            `json:"createdat" bson:"createdat"`
	UpdatedAt       time.Time            `json:"updatedat" bson:"updatedat"`
	Token           string               `json:"token" bson:"token"`
	RefreshToken    string               `json:"refreshtoken" bson:"refreshtoken"`
	Partner         *Partner             `json:"partner,omitempty" bson:"partner,omitempty"`
	OrderIDs        []primitive.ObjectID `json:"orderids" bson:"orderids"`
	EmailVerified   bool                 `json:"emailverified" bson:"emailverified"`
	MobileVerified  bool                 `json:"mobileverified" bson:"mobileverified"`
	IsActive        bool                 `json:"isactive" bson:"isactive"`
	FavouriteCities []string             `json:"favouritecities" bson:"favouritecities" validate:"dive"`
}
type Partner struct {
	PartnerID     string               `json:"partnerid" bson:"partnerid"`
	BusinessName  string               `json:"businessname" bson:"businessname" validate:"required"`
	GSTNumber     string               `json:"gstnumber,omitempty" bson:"gstnumber"`
	PANNumber     string               `json:"pannumber,omitempty" bson:"pannumber"`
	ContactEmail  string               `json:"contactemail" bson:"contactemail" validate:"required,email"`
	ContactPhone  string               `json:"contactphone" bson:"contactphone" validate:"required,e164"`
	Address       PartnerAddress       `json:"address" bson:"address"`
	IsVerified    bool                 `json:"isverified" bson:"isverified"`
	Status        string               `json:"status" bson:"status" validate:"oneof=PENDING APPROVED REJECTED SUSPENDED"`
	JoinedAt      time.Time            `json:"joinedat" bson:"joinedat"`
	ApprovedAt    time.Time            `json:"approvedat,omitempty" bson:"approvedat,omitempty"`
	Listings      Listings             `json:"listings" bson:"listings"`
	OrderIDs      []primitive.ObjectID `json:"orderids" bson:"orderids"`
	TotalListings int                  `json:"totallistings" bson:"totallistings"`
	TotalEarnings float64              `json:"totalearnings" bson:"totalearnings"`
	Rating        float64              `json:"rating" bson:"rating"`
	BusinessType  string               `json:"businesstype" bson:"businesstype" validate:"required"`
	BankDetails   BankDetails          `json:"bankdetails" bson:"bankdetails" validate:"required"`
}
type PartnerAddress struct {
	Street  string `json:"street" bson:"street"`
	City    string `json:"city" bson:"city"`
	State   string `json:"state" bson:"state"`
	Pincode string `json:"pincode" bson:"pincode"`
	Country string `json:"country" bson:"country"`
}

type Listings struct {
	BillboardIDs []string `json:"billboardids" bson:"billboardids"`
}

type UserLogin struct {
	Email    string `json:"email" bson:"email" validate:"required,email"`
	Password string `json:"password" bson:"password" validate:"required,min=6"`
}

type UserResponse struct {
	UserID       string `json:"userid"`
	FirstName    string `json:"firstname"`
	LastName     string `json:"lastname"`
	Email        string `json:"email"`
	Role         string `json:"role"`
	Token        string `json:"token"`
	RefreshToken string `json:"refreshtoken"`
}
type BankDetails struct {
	AccountHolderName string `json:"accountholdername" bson:"accountholdername" validate:"required"`
	AccountNumber     string `json:"accountnumber" bson:"accountnumber" validate:"required"`
	IFSCCode          string `json:"ifsccode" bson:"ifsccode" validate:"required"`
	BankName          string `json:"bankname" bson:"bankname" validate:"required"`
	UpiID             string `json:"upiid" bson:"upiid" validate:"required"`
}
