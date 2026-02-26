
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PreviewCheckout() {
  const navigate = useNavigate();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coupon, setCoupon] = useState("");
  const [applying, setApplying] = useState(false);

  const fetchPreview = async (couponCode = "") => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        "http://localhost:8000/api/user/checkout/preview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ couponCode }),
        },
      );

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error || "Failed to load preview");
        return;
      }

      setData(json);
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
      setApplying(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  const handleApplyCoupon = () => {
    if (!coupon.trim()) return;
    setApplying(true);
    fetchPreview(coupon.trim());
  };

  const fmt = (n) =>
    `₹${Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  const fmtNumber = (n) => Number(n || 0).toLocaleString("en-IN");

  const fmtDate = (d) => {
    if (!d) return "—";

    const date = new Date(d);

    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 p-10 text-center text-slate-500">
        Loading checkout preview...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-slate-50 p-10 text-center text-red-500">
        {error}
      </div>
    );

  const cart = data?.cart || [];
  const breakdown = data?.breakdown || [];
  const discount = data?.discount || 0;
  const couponApplied = data?.couponApplied || "";

  const subtotal = breakdown.reduce(
    (sum, item) => sum + (item.taxableAmount || 0),
    0,
  );

  const totalGST = breakdown.reduce((sum, item) => sum + (item.gst || 0), 0);

  const finalTotal = subtotal + totalGST - discount;

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3 sm:py-8 sm:px-6 pb-8">
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
          Preview Checkout
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review pricing details before placing your order
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* LEFT */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {cart.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <p className="text-slate-600 font-medium">No items in checkout</p>
              <button
                onClick={() => navigate("/billboards")}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#507c88] text-white text-sm font-semibold hover:bg-[#3d6472] transition"
              >
                Browse Billboards
              </button>
            </div>
          )}

          {cart.map((item, idx) => {
            const bd = breakdown[idx] || {};
            const days = bd.days || 0;
            const area = bd.area || 0;
            const baseRent = (bd.basePricePerDay || 0) * days;

            return (
              <div
                key={item.cartItemId || idx}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="w-full sm:w-36 h-24 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden">
                    {item.coverImage && (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="font-semibold text-base sm:text-lg text-slate-800 break-words">
                      {item.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 break-words">
                      {fmtDate(item.fromDate)} → {fmtDate(item.toDate)} ({days}{" "}
                      days)
                    </p>

                    <div className="flex gap-2 flex-wrap mb-3">
                      <span className="text-xs bg-slate-100 text-slate-900 px-2.5 py-1 rounded-full">
                        Days: {days}
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-900 px-2.5 py-1 rounded-full">
                        Area: {fmtNumber(area)} sq.ft
                      </span>
                    </div>

                    <div className="text-sm space-y-2 text-slate-600">
                      <div className="flex justify-between">
                        <span>Base Rent</span>
                        <span className="font-medium text-slate-800">
                          {fmt(baseRent)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Printing</span>
                        <span className="font-medium text-slate-800">
                          {fmt(bd.printingCost)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Mounting</span>
                        <span className="font-medium text-slate-800">
                          {fmt(bd.mountingCost)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>GST</span>
                        <span className="font-medium text-slate-800">
                          {fmt(bd.gst)}
                        </span>
                      </div>

                      <div className="flex justify-between font-bold border-t border-slate-200 pt-2 mt-2 text-slate-900">
                        <span>Total</span>
                        <span>
                          {fmt((bd.taxableAmount || 0) + (bd.gst || 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Order Summary */}
        <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 h-fit">
          <h2 className="font-semibold text-slate-800 mb-4">Order Summary</h2>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-slate-800">{fmt(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>GST</span>
              <span className="font-medium text-slate-800">{fmt(totalGST)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- {fmt(discount)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg border-t border-slate-200 pt-3">
              <span>Total</span>
              <span className="text-[#507c88]">{fmt(finalTotal)}</span>
            </div>
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                className="flex-1 border border-slate-300 px-3 py-2 rounded-xl text-center text-sm outline-none focus:ring-2 focus:ring-[#507c88]/25"
              />
              <button
                disabled={applying}
                onClick={handleApplyCoupon}
                className="bg-[#507c88] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#3d6472] disabled:opacity-50"
              >
                {applying ? "Applying..." : "Apply"}
              </button>
            </div>

            {couponApplied && (
              <p className="text-green-600 text-xs mt-2">
                Applied: {couponApplied}
              </p>
            )}
          </div>

          <button
            onClick={() => navigate("/payment")}
            disabled={cart.length === 0}
            className="mt-6 w-full py-3 font-semibold transition 
            items-center justify-center rounded-full 
            relative isolate gap-2
            px-1 py-1
            text-xs sm:text-base font-normal tracking-wide font-[var(--font-barriecito)]
            text-white bg-[#507c88]
            border-1 border-[#507c88] 
            overflow-hidden
            transition-all duration-300
            hover:text-[#507c88]
            active:scale-95
            
            before:absolute before:inset-0
            before:bg-white
            before:translate-y-full
            before:transition-transform before:duration-300
            before:z-0
            hover:before:translate-y-0">
            <span className="relative z-10">Confirm & Place Order</span>
          </button>
        </div>

        {/* RIGHT */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-200 p-5 h-fit sticky top-6">
          <h2 className="font-semibold text-slate-800 mb-4">Order Summary</h2>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-slate-800">{fmt(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>GST</span>
              <span className="font-medium text-slate-800">{fmt(totalGST)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- {fmt(discount)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg border-t border-slate-200 pt-3">
              <span>Total</span>
              <span className="text-[#507c88]">{fmt(finalTotal)}</span>
            </div>
          </div>

          {/* COUPON */}
          <div className="mt-4 border-t pt-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                className="flex-1 border border-slate-300 px-3 py-2 rounded-xl text-center text-sm outline-none focus:ring-2 focus:ring-[#507c88]/25"
              />
              <button
                disabled={applying}
                onClick={handleApplyCoupon}
                className="bg-[#507c88] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#3d6472] disabled:opacity-50"
              >
                {applying ? "Applying..." : "Apply"}
              </button>
            </div>

            {couponApplied && (
              <p className="text-green-600 text-xs mt-2">
                Applied: {couponApplied}
              </p>
            )}
          </div>

          <button
            onClick={() => navigate("/payment")}
            className="mt-6 w-full py-3 font-semibold transition 
            items-center justify-center rounded-full 
            relative isolate gap-2
            px-1 py-1
            text-xs sm:text-base font-normal tracking-wide font-[var(--font-barriecito)]
            text-white bg-[#507c88]
            border-1 border-[#507c88] 
            overflow-hidden
            transition-all duration-300
            hover:text-[#507c88]
            active:scale-95
            
            before:absolute before:inset-0
            before:bg-white
            before:translate-y-full
            before:transition-transform before:duration-300
            before:z-0
            hover:before:translate-y-0">
            <span className="relative z-10">Confirm & Place Order</span>
          </button>
          {/* <button
          onClick={() => navigate("/payment", { state: { cartData: checkoutData } })}
          className="mt-6 w-full bg-[#507c88] text-white py-3 rounded-lg font-semibold hover:bg-[#3d6472]">
            Confirm & Place Order
          </button> */}
        </div>
      </div>

    </div>
  );
}
