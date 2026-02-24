package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Order struct {
	ID         primitive.ObjectID `json:"_id" bson:"_id"`
	OrderID    string             `json:"orderid" bson:"orderid"`
	CustomerID string             `json:"customerid" bson:"customerid" validate:"required"`
	PartnerID  string             `json:"partnerid" bson:"partnerid"`

	// Cart items (each contains billboardID, fromDate, toDate)
	OrderCart []BillboardCart `json:"ordercart" bson:"ordercart" validate:"required,dive"`

	// Booking status
	OrderStatus string `json:"orderstatus" bson:"orderstatus" validate:"required,oneof=PENDING CONFIRMED CANCELLED COMPLETED EXPIRED"`

	// Pricing// Pricing
	TotalCheckoutPrice float64 `json:"totalcheckoutprice" bson:"totalcheckoutprice" validate:"required,gte=1"`
	CouponCode         string  `json:"couponcode" bson:"couponcode" validate:"omitempty"`
	DiscountAmount     float64 `json:"discountamount" bson:"discountamount"`
	TotalBillboards    int     `json:"totalbillboards" bson:"totalbillboards"`

	// Payment method selected
	PaymentMethod Payment `json:"paymentmethod" bson:"paymentmethod"`

	// Razorpay integration fields
	RazorpayOrderID   string `json:"razorpayorderid" bson:"razorpayorderid"`
	RazorpayPaymentID string `json:"razorpaypaymentid" bson:"razorpaypaymentid"`
	PaymentStatus     string `json:"paymentstatus" bson:"paymentstatus"`
	// CREATED, PAID, FAILED

	// Inventory lock expiry
	ExpiresAt time.Time `json:"expiresat" bson:"expiresat"`

	// Optional metadata
	MsgFromCustomer string   `json:"msgfromcustomer" bson:"msgfromcustomer"`
	Design          []string `json:"design" bson:"design"`
	IsBulkOrder     bool     `json:"isbulkorder" bson:"isbulkorder"`

	CreatedAt        time.Time                   `json:"createdat" bson:"createdat"`
	UpdatedAt        time.Time                   `json:"updatedat" bson:"updatedat"`
	PartnerBreakdown []PartnerFinancialBreakdown `json:"partnerBreakdown" bson:"partnerbreakdown"`
	// Payment audit (Production safety)
	RazorpaySignature string    `json:"razorpaysignature" bson:"razorpaysignature"`
	PaymentVerifiedAt time.Time `json:"paymentverifiedat" bson:"paymentverifiedat"`
	PaymentCaptured   bool      `json:"paymentcaptured" bson:"paymentcaptured"`

	PaymentMethodDetails struct {
		Method string `bson:"method,omitempty" json:"method,omitempty"`
		Bank   string `bson:"bank,omitempty" json:"bank,omitempty"`
		Wallet string `bson:"wallet,omitempty" json:"wallet,omitempty"`
		UPI    string `bson:"upi,omitempty" json:"upi,omitempty"`
	} `bson:"paymentmethoddetails,omitempty" json:"paymentmethoddetails,omitempty"`
}
type Payment struct {
	Digital bool `json:"digital" bson:"digital"`
	COD     bool `json:"cod" bson:"cod"`
}
type PartnerFinancialBreakdown struct {
	PartnerID string `json:"partnerId" bson:"partnerid"`

	// 🔥 Exact cost split
	BaseRent     float64 `json:"baseRent" bson:"baserent"`
	PrintingCost float64 `json:"printingCost" bson:"printingcost"`
	MountingCost float64 `json:"mountingCost" bson:"mountingcost"`

	Commission float64 `json:"commission" bson:"commission"`

	// 🔥 Tax structure
	TaxableAmount float64 `json:"taxableAmount" bson:"taxableamount"`
	GST           float64 `json:"gst" bson:"gst"`

	GrossAmount float64 `json:"grossAmount" bson:"grossamount"` // Taxable + GST
	NetPayout   float64 `json:"netPayout" bson:"netpayout"`     // Taxable - Commission
}
