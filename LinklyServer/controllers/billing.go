package controllers

import (
	"LinklyMedia/models"
	"errors"
	"math"
	"strings"
	"time"
)

const (
	GST_RATE          = 0.18
	COMMISSION_LOW    = 0.05
	COMMISSION_HIGH   = 0.07
	COMMISSION_CUTOFF = 100000
)

type CartBillboardBreakdown struct {
	BillboardID string `json:"billboardId"`

	Days            int     `json:"days"`
	Area            float64 `json:"area"`
	BasePricePerDay float64 `json:"basePricePerDay"`

	BaseRent     float64 `json:"baseRent"`
	PrintingCost float64 `json:"printingCost"`
	MountingCost float64 `json:"mountingCost"`

	Commission float64 `json:"commission"`

	TaxableAmount float64 `json:"taxableAmount"`
	GST           float64 `json:"gst"`
}

func roundToTwo(val float64) float64 {
	return math.Round(val*100) / 100
}

func CalculateBookingPrice(
	order *models.Order,
	billboards []models.Billboard,
	calcDays func(time.Time, time.Time) (int, error),
) ([]CartBillboardBreakdown, float64, error) {

	if len(order.OrderCart) == 0 {
		return nil, 0, errors.New("cart is empty")
	}

	bbMap := make(map[string]models.Billboard)
	for _, bb := range billboards {
		bbMap[bb.BillboardID] = bb
	}

	totalBase := 0.0
	itemDays := make(map[string]int)

	// ================= STEP 1: TOTAL BASE RENT =================
	for _, item := range order.OrderCart {

		bb, exists := bbMap[item.BillboardID]
		if !exists {
			return nil, 0, errors.New("billboard not found: " + item.BillboardID)
		}

		days, err := calcDays(item.FromDate, item.ToDate)
		if err != nil {
			return nil, 0, err
		}
		if days <= 0 {
			return nil, 0, errors.New("invalid booking duration")
		}

		itemDays[item.BillboardID] = days
		totalBase += float64(bb.Price) * float64(days)
	}

	totalBase = roundToTwo(totalBase)

	// ================= STEP 2: COMMISSION DECISION =================
	commissionRate := COMMISSION_HIGH
	if totalBase > COMMISSION_CUTOFF {
		commissionRate = COMMISSION_LOW
	}

	// ================= STEP 3: PER ITEM CALCULATION =================
	totalTaxableUnrounded := 0.0
	var breakdown []CartBillboardBreakdown

	for _, item := range order.OrderCart {

		bb := bbMap[item.BillboardID]
		days := itemDays[item.BillboardID]

		area := float64(bb.Size.Width) * float64(bb.Size.Height)
		baseRent := float64(bb.Price) * float64(days)

		// -------- Material Lookup --------
		var materialPrice float64
		foundMaterial := false
		for _, m := range bb.Materials {
			if strings.EqualFold(strings.TrimSpace(m.MaterialType), strings.TrimSpace(item.SelectedMaterial)) {
				materialPrice = m.PricePerSqFt
				foundMaterial = true
				break
			}
		}
		if !foundMaterial {
			return nil, 0, errors.New("invalid material selected")
		}

		// -------- Mounting Lookup --------
		var mountingCost float64
		foundMounting := false
		for _, m := range bb.Mountings {
			if strings.EqualFold(strings.TrimSpace(m.MountingType), strings.TrimSpace(item.SelectedMounting)) {
				mountingCost = m.FlatCharge
				foundMounting = true
				break
			}
		}
		if !foundMounting {
			return nil, 0, errors.New("invalid mounting selected")
		}

		printingCost := area * materialPrice

		// Partner earns from rent + printing + mounting
		subtotal := baseRent + printingCost + mountingCost

		// ✅ Commission ONLY on base rent
		commission := roundToTwo(baseRent * commissionRate)

		// accumulate UNROUNDED taxable for correct GST later
		totalTaxableUnrounded += subtotal

		breakdown = append(breakdown, CartBillboardBreakdown{
			BillboardID: item.BillboardID,

			Days:            days,
			Area:            area,
			BasePricePerDay: float64(bb.Price),

			BaseRent:     roundToTwo(baseRent),
			PrintingCost: roundToTwo(printingCost),
			MountingCost: roundToTwo(mountingCost),

			Commission: commission,

			// UI display only
			TaxableAmount: roundToTwo(subtotal),
			GST:           roundToTwo(subtotal * GST_RATE),
		})
	}

	// ================= FINAL GST (ORDER LEVEL) =================
	totalTaxable := roundToTwo(totalTaxableUnrounded)
	totalGST := roundToTwo(totalTaxable * GST_RATE)

	finalTotal := roundToTwo(totalTaxable + totalGST)

	order.TotalCheckoutPrice = finalTotal
	order.TotalBillboards = len(order.OrderCart)
	order.UpdatedAt = time.Now()

	return breakdown, finalTotal, nil
}
