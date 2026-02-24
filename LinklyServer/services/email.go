package services

import (
	"fmt"
	"net/smtp"
	"os"
)

func SendEmailOTP(toEmail, otp string) error {

	username := os.Getenv("BREVO_SMTP_USER")
	password := os.Getenv("BREVO_SMTP_KEY")
	from := os.Getenv("BREVO_FROM_EMAIL")
	host := os.Getenv("BREVO_SMTP_HOST")
	port := os.Getenv("BREVO_SMTP_PORT")

	// Debug logs (temporary for testing)
	fmt.Println("SMTP USER:", username)
	fmt.Println("SMTP HOST:", host)
	fmt.Println("SMTP PORT:", port)
	fmt.Println("SMTP FROM:", from)

	if username == "" || password == "" || from == "" || host == "" || port == "" {
		return fmt.Errorf("SMTP environment variables not set properly")
	}

	auth := smtp.PlainAuth("", username, password, host)

	body := fmt.Sprintf(
		"Your OTP is: %s\nThis OTP is valid for 5 minutes.\nIf you did not request this, ignore this email.",
		otp,
	)

	// Proper email headers (important for SMTP servers)
	message := []byte(
		"From: " + from + "\r\n" +
			"To: " + toEmail + "\r\n" +
			"Subject: LinklyMedia OTP Verification \r\n" +
			"MIME-Version: 1.0\r\n" +
			"Content-Type: text/plain; charset=\"UTF-8\"\r\n" +
			"\r\n" +
			body,
	)

	err := smtp.SendMail(host+":"+port, auth, from, []string{toEmail}, message)
	if err != nil {
		fmt.Println("SMTP ERROR:", err)
		return err
	}

	fmt.Println("Email sent successfully")
	return nil
}
func SendGenericEmail(toEmail, subject, body string) error {

	username := os.Getenv("BREVO_SMTP_USER")
	password := os.Getenv("BREVO_SMTP_KEY")
	from := os.Getenv("BREVO_FROM_EMAIL")
	host := os.Getenv("BREVO_SMTP_HOST")
	port := os.Getenv("BREVO_SMTP_PORT")

	auth := smtp.PlainAuth("", username, password, host)

	message := []byte(
		"From: " + from + "\r\n" +
			"To: " + toEmail + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"MIME-Version: 1.0\r\n" +
			"Content-Type: text/plain; charset=\"UTF-8\"\r\n" +
			"\r\n" +
			body,
	)

	return smtp.SendMail(host+":"+port, auth, from, []string{toEmail}, message)
}
