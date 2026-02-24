import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const CITIES = [
  {
    id: "Mumbai",
    label: "Mumbai",
    img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=80",
  },
  {
    id: "Delhi",
    label: "Delhi",
    img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80",
  },
  { id: "Hyderabad", label: "Hyderabad", img: "/public/images/Hyderabad.png" },
  {
    id: "Bangalore",
    label: "Bangalore",
    img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80",
  },
  { id: "Mangalore", label: "Mangalore", img: "/public/images/Mangaluru.png" },
  {
    id: "Chennai",
    label: "Chennai",
    img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80",
  },
  {
    id: "Kolkata",
    label: "Kolkata",
    img: "https://images.unsplash.com/photo-1558431382-27e303142255?w=400&q=80",
  },
  {
    id: "Pune",
    label: "Pune",
    img: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400&q=80",
  },
  { id: "Ahmedabad", label: "Ahmedabad", img: "/public/images/ahmedabad.png" },
  {
    id: "Jaipur",
    label: "Jaipur",
    img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&q=80",
  },
  {
    id: "Kerala",
    label: "Kerala",
    img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80",
  },
  { id: "Lucknow", label: "Lucknow", img: "/public/images/lucknow.png" },
];

const CheckIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function FavCities() {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const userid = location.state?.userid;
  const email = location.state?.email;

  const toggle = (cityId) => {
    setSelected((prev) =>
      prev.includes(cityId)
        ? prev.filter((c) => c !== cityId)
        : [...prev, cityId],
    );
    setError("");
  };

  const handleNext = async () => {
    if (selected.length === 0) {
      setError("Please select at least one city to continue.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:8000/api/user/favcities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid: userid,
          favouritecities: selected,
        }),
      });

      const data = await res.json();
      console.log("✅ FavCities save response:", data);

      if (!res.ok) {
        setError(data?.error || data?.message || "Failed to save cities.");
        return;
      }

      navigate("/verify-otp", {
        state: { userid, email },
      });
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            Select your Favourite Cities
          </h1>
          <p className="text-gray-400 font-medium text-sm">
            Choose the cities you're interested in — we'll show you relevant
            billboards.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mb-6">
          {CITIES.map((city) => {
            const isSelected = selected.includes(city.id);
            return (
              <div
                key={city.id}
                onClick={() => toggle(city.id)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200
                  ${
                    isSelected
                      ? "shadow-lg scale-[1.02]"
                      : "ring-1 ring-gray-200 hover:ring-2 hover:ring-[#507c88] hover:shadow-md hover:scale-[1.01]"
                  }`}
                style={{
                  outline: isSelected ? "3px solid #507c88" : undefined,
                }}
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-200">
                  <img
                    src={city.img}
                    alt={city.label}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                      isSelected ? "scale-105 brightness-90" : ""
                    }`}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.style.background =
                        "linear-gradient(135deg, #507c88 0%, #3d6472 100%)";
                    }}
                  />
                </div>

                <div
                  className={`px-3 py-2.5 transition-colors duration-200 ${
                    isSelected ? "bg-[#507c88]" : "bg-white"
                  }`}
                >
                  <p
                    className={`text-sm font-bold text-center ${
                      isSelected ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {city.label}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 bg-[#507c88] text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md">
                    <CheckIcon />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mb-4">
          {selected.length > 0 ? (
            <p className="text-sm text-[#507c88] font-semibold">
              {selected.length} {selected.length === 1 ? "city" : "cities"}{" "}
              selected
            </p>
          ) : (
            <p className="text-sm text-gray-400 font-medium">
              No cities selected yet
            </p>
          )}
        </div>

        {error && (
          <p className="text-center text-red-500 text-sm font-semibold mb-4">
            {error}
          </p>
        )}

        <div className="flex justify-center mt-4">
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-16 py-3.5 bg-[#507c88] hover:bg-[#3d6472] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base rounded-full shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
          >
            {loading ? (
              <>
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
                Saving…
              </>
            ) : (
              <>
                Next
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
