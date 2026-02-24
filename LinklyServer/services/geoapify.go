package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

type GeoapifyResponse struct {
	Features []struct {
		Properties struct {
			City   string `json:"city"`
			County string `json:"county"`
			State  string `json:"state"`
		} `json:"properties"`
	} `json:"features"`
}

func normalizeCity(city string) string {
	city = strings.TrimSpace(strings.ToLower(city))

	switch city {
	case "bengaluru":
		return "Bangalore"
	case "mangaluru":
		return "Mangalore"
	default:
		return strings.Title(city)
	}
}
func GetUserCity(lat string, lon string)(string, error){
	if lat == "" || lon == ""{
		return "Bangalore",nil
	}
	apiKey := os.Getenv("GEOAPIFY_API_KEY")
	if apiKey==""{
		return "",fmt.Errorf("Geoapify API key missing")
	}
	url :=fmt.Sprintf(
		"https://api.geoapify.com/v1/geocode/reverse?lat=%s&lon=%s&apiKey=%s",
		lat, lon, apiKey,
	)
	ctx,cancel :=context.WithTimeout(context.Background(),5*time.Second)
	defer cancel()
	req, err:=http.NewRequestWithContext(ctx,"GET",url,nil)
	if err!=nil{
		return "Bangalore",nil
	}
	client:=&http.Client{}
	resp,err:=client.Do(req)
	if err!=nil{
		return "Bangalore",nil
	}
	defer resp.Body.Close()
	if resp.StatusCode!=http.StatusOK{
		return "Bangalore",nil
	}
	var result GeoapifyResponse
	err= json.NewDecoder(resp.Body).Decode(&result)
	if err!=nil{
		return "Bangalore",nil
	}
	props:= result.Features[0].Properties
	city:= props.City
	if city==""{
		city=props.County
	}
	if city==""{
		return "Bangalore",nil
	}
	city=normalizeCity(city)
	return city, nil
}