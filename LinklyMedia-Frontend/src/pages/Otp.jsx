import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Otp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const userid = location.state?.userid;

  console.log("OTP page state:", { email, userid });

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const updated = [...otp];
    pasted.split("").forEach((char, i) => {
      updated[i] = char;
    });
    setOtp(updated);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    const payload = {
      userid: userid,
      otp: finalOtp,
      type: "EMAIL",
    };

    console.log("📤 Sending to /api/verify-otp:", payload);

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:8000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      // console.log("📥 Backend response FULL:", JSON.stringify(data, null, 2));

      if (!res.ok) {
        setError(data?.error || data?.message || "Invalid or expired OTP");
        return;
      }
      navigate("/signin");
    } catch (err) {
      // console.error("❌ Fetch error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const payload = {
      userid: userid,
      type: "EMAIL",
    };

    console.log("📤 Sending to /api/resend-otp:", payload);

    try {
      setResending(true);
      setError("");
      setResent(false);

      const res = await fetch("http://localhost:8000/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      // console.log("📥 Resend response:", data);

      if (!res.ok) {
        setError(data?.error || data?.message || "Failed to resend OTP");
        return;
      }

      setOtp(["", "", "", "", "", ""]);
      setResent(true);
      inputRefs.current[0]?.focus();
    } catch (err) {
      // console.error("❌ Fetch error:", err);
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
       <div className="w-full font-light text-sm text-center bg-[#507c88] h-[40px] text-white pt-2">LinklyMedia | Outdoor Advertising Platform</div>
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6 sm:py-8">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-8 md:p-10 w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          Verify Your Account
        </h1>

        <p className="text-gray-500 text-sm mb-6 sm:mb-8 leading-relaxed">
          We've sent a 6-digit verification code to your{" "}
          <br></br>
          <span className="font-bold text-gray-800 break-all">{email}</span>
        </p>

        <div className="grid grid-cols-6 gap-2 sm:gap-3 mb-4 max-w-[320px] mx-auto">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className={`w-full h-11 sm:h-14 text-center text-lg sm:text-xl font-semibold border rounded-lg outline-none transition-all duration-150
                focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                ${digit ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-300 bg-white text-gray-800"}
                ${error ? "!border-red-400" : ""}
              `}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-2 font-medium">
            {error}
          </p>
        )}

        {resent && (
          <p className="text-[#507c88] text-sm text-center mb-2 font-medium">
            ✓ OTP resent successfully
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="mt-6 sm:mt-8 w-full py-3 bg-[#507c88] hover:bg-[#3d6472] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm sm:text-base font-semibold rounded-full transition-all duration-200 shadow-md shadow-teal-700/20"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Verifying…
            </span>
          ) : (
            "Verify"
          )}
        </button>

        <p
          onClick={!resending ? handleResend : undefined}
          className={`text-sm text-center mt-4 transition-colors ${
            resending
              ? "text-gray-400 cursor-not-allowed"
              : "text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
          }`}
        >
          {resending ? "Resending…" : "Resend OTP"}
        </p>
      </div>
    </div>
    </div>
  );
}
