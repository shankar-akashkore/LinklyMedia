import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_STYLES = {
  CONFIRMED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  PENDING:   "bg-amber-50 text-amber-600 border-amber-200",
  // CANCELLED: "bg-red-50 text-red-500 border-red-200",
  // COMPLETED: "bg-blue-50 text-blue-600 border-blue-200",
  EXPIRED:   "bg-gray-100 text-gray-500 border-gray-200",
  LIVE:      "bg-purple-50 text-purple-600 border-purple-200",
};

const STATUS_ACTIONS = {
  PENDING:   ["CONFIRMED", "CANCELLED"],
  // CONFIRMED: ["COMPLETED", "CANCELLED"],
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function BookingsTable({ bookings, loading, error, onRefresh, title, emptyMsg }) {
  const [acting, setActing] = useState(null);
  const navigate = useNavigate();

  const handleAction = async (orderId, cartItemId, status) => {
    const key = orderId + cartItemId + status;
    setActing(key);
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(
        `http://localhost:8000/api/partner/booking/${orderId}/${cartItemId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );
      if (r.ok) onRefresh?.();
    } catch (_) {}
    finally { setActing(null); }
  };

  return (
    <div className="p-4 sm:p-6">
      {title && (
        <div className="mb-5 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-800">{title}</h2>
          {bookings?.length > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">{bookings.length} booking{bookings.length > 1 ? "s" : ""}</p>
          )}
        </div>
      )}

      {error && <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">{error}</div>}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : !bookings?.length ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium text-gray-500">{emptyMsg ?? "No bookings found"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.orderId} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
              {/* Order header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition" onClick={() => navigate("/partner/orders/" + b.orderId, { state: { booking: b } })}>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs font-mono text-gray-600">#{b.orderId?.slice(-8)}</span>
                  <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${STATUS_STYLES[b.orderStatus] ?? STATUS_STYLES.EXPIRED}`}>
                    {b.orderStatus}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${
                    b.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"
                  }`}>
                    {b.paymentStatus}
                  </span>
                </div>
                <span className="text-xs text-gray-800 sm:text-right">{fmt(b.createdAt)}</span>
              </div>

              {/* Partner items */}
              <div className="divide-y divide-gray-50">
                {b.partnerItems?.map((item) => {
                  const actions = STATUS_ACTIONS[item.status] ?? [];
                  return (
                    <div key={item.cartItemId} className="px-4 py-3">
                      <div className="flex items-start gap-3 sm:gap-4">
                      {/* Cover image */}
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={item.title}
                          className="w-16 h-11 object-cover rounded-lg border border-gray-100 shrink-0" />
                      ) : (
                        <div className="w-16 h-11 bg-gray-100 rounded-lg flex items-center justify-center text-xl shrink-0">🪧</div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.title ?? "—"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {fmt(item.fromDate)} → {fmt(item.toDate)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.selectedMaterial} · {item.selectedMounting}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-800">₹{Number(item.price).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">/ day</p>
                      </div>
                      </div>

                      {/* Item status */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full border text-xs font-medium shrink-0 ${STATUS_STYLES[item.status] ?? STATUS_STYLES.EXPIRED}`}>
                          {item.status}
                        </span>

                        {/* Actions */}
                        {actions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 shrink-0">
                            {actions.map((s) => {
                              const key = b.orderId + item.cartItemId + s;
                              return (
                                <button key={s} disabled={!!acting}
                                  onClick={() => handleAction(b.orderId, item.cartItemId, s)}
                                  className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition capitalize disabled:opacity-50 ${
                                    s === "CONFIRMED" || s === "COMPLETED"
                                      ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                      : "border-red-200 text-red-500 hover:bg-red-50"
                                  }`}>
                                  {acting === key ? "…" : s.toLowerCase()}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial summary */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <span>Base Rent: <strong className="text-gray-700">₹{Number(b.baseRentTotal).toLocaleString()}</strong></span>
                    <span>GST: <strong className="text-gray-700">₹{Number(b.gst).toLocaleString()}</strong></span>
                    <span>Commission: <strong className="text-gray-700">₹{Number(b.commission).toLocaleString()}</strong></span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-gray-500">Net Payout: </span>
                    <strong className="text-[#507c88] text-sm">₹{Number(b.netPayout).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
