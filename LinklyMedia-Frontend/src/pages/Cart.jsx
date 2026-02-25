import React, { useEffect, useState } from "react";
import { Trash, ShoppingCart } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/user/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCartItems(data.usercart || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (cartItemId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/api/user/cart/remove/${cartItemId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok)
        setCartItems((prev) =>
          prev.filter((item) => item.cartItemId !== cartItemId),
        );
    } catch (err) {
      console.error("Remove failed:", err);
    }
  };

  const getDurationDays = (item) => {
    if (!item.fromdate || !item.todate) return null;
    const days = Math.ceil(
      (new Date(item.todate) - new Date(item.fromdate)) / (1000 * 60 * 60 * 24),
    );
    return days > 0 ? days : null;
  };

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const getItemTotal = (item) => item.totalprice || item.price || 0;
  const subtotal = cartItems.reduce((sum, item) => sum + getItemTotal(item), 0);
  const total = subtotal;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 rounded-2xl bg-white/80 backdrop-blur border border-slate-200 px-5 py-4 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight">
            Your Cart
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your
            cart
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
          {/* ── Cart Items ── */}
          <div className="flex-1">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-white rounded-2xl animate-pulse border border-slate-200"
                  />
                ))}
              </div>
            ) : cartItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center shadow-sm">
                <ShoppingCart
                  size={48}
                  className="mx-auto text-slate-300 mb-4"
                />
                <p className="text-slate-600 font-semibold">Your cart is empty</p>
                <p className="text-slate-400 text-sm mt-1">
                  Browse billboards and add them to your cart
                </p>
                <button
                  onClick={() => navigate("/billboards")}
                  className="mt-6 px-6 py-2.5 bg-[#2c6e7d] text-white text-sm font-semibold rounded-xl hover:bg-[#235865] transition"
                >
                  Browse Billboards
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const days = getDurationDays(item);
                  const itemTotal = getItemTotal(item);

                  return (
                    <div
                      key={item.cartItemId}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Image */}
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-full sm:w-40 h-28 object-cover rounded-xl shrink-0 border border-slate-200"
                        />

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                              {item.title}
                            </h2>
                            <button
                              onClick={() => handleRemove(item.cartItemId)}
                              className="shrink-0 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash size={16} />
                            </button>
                          </div>

                          {/* Dates */}
                          {item.fromdate && item.todate && (
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-xs text-slate-500">
                                {fmt(item.fromdate)} → {fmt(item.todate)}
                              </span>
                              {days && (
                                <span className="text-[10px] bg-[#2c6e7d]/10 text-[#2c6e7d] px-2 py-0.5 rounded-full font-semibold">
                                  {days} days
                                </span>
                              )}
                            </div>
                          )}

                          {/* Material / Mounting tags */}
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {item.selectedmaterial && (
                              <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
                                📄 {item.selectedmaterial}
                              </span>
                            )}
                            {item.selectedmounting && (
                              <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
                                🔩 {item.selectedmounting}
                              </span>
                            )}
                          </div>

                          {/* Price breakdown */}
                          <div className="flex items-end justify-between mt-3">
                            <div className="text-xs text-slate-500 space-y-0.5">
                              {item.price > 0 && (
                                <p>
                                  Base: ₹{Number(item.price).toLocaleString()}
                                </p>
                              )}
                              {item.materialcost > 0 && (
                                <p>
                                  Material: +₹
                                  {Number(item.materialcost).toLocaleString()}
                                </p>
                              )}
                              {item.mountingcost > 0 && (
                                <p>
                                  Mounting: +₹
                                  {Number(item.mountingcost).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <p className="text-xl font-extrabold text-[#2c6e7d]">
                              ₹{Number(itemTotal).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Order Summary ── */}
          <div className="w-full xl:w-[340px] shrink-0 sticky top-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
              <h2 className="text-base font-bold text-slate-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium text-slate-700">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="font-bold text-slate-800">Total</span>
                  <span className="font-bold text-xl text-[#2c6e7d]">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/preview-checkout")}
                disabled={cartItems.length === 0}
                className="w-full mt-5 py-3  font-semibold text-sm rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed
                items-center justify-center
                relative isolate gap-2
                px-1 py-1
                text-xs sm:text-base font-normal tracking-wide font-[var(--font-barriecito)]
                text-white bg-[#507c88]
                border-1 border-[#507c88] rounded-full
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
               <span className="relative z-10">Proceed to Checkout →</span>
              </button>

              <p className="text-center text-xs text-slate-400 mt-3">
                Secure checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
