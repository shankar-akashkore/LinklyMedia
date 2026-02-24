package constants

var ValidBillboardTransitions = map[string][]string{
	"CONFIRMED": {"PRINTING"},
	"PRINTING":  {"MOUNTING"},
	"MOUNTING":  {"LIVE"},
	"LIVE":      {"COMPLETED"},
}
