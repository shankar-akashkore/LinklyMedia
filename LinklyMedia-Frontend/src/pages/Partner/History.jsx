import React, { useEffect, useState } from "react";
import { CalendarIcon, ClockIcon } from "@phosphor-icons/react";

const fmt = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const fmtCurrency = (v) => `₹${Number(v ?? 0).toLocaleString("en-IN")}`;

export default function PartnerHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/api/partner/bookings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load history");
        return r.json();
      })
      .then((d) => {
        // Only show orders where ALL partnerItems are COMPLETED
        const completed = (d.bookings || []).filter((order) =>
          order.partnerItems.every((item) => item.status === "COMPLETED"),
        );
        setBookings(completed);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
          <p className="text-sm text-gray-400 mt-0.5">Completed orders</p>
        </div>
        {!loading && !error && (
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full">
            {bookings.length} {bookings.length === 1 ? "order" : "orders"}
          </span>
        )}
      </div>

      {/* Error */}
      {!loading && error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">
          ⚠ {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse shadow-sm"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500 font-medium">No completed orders yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Completed orders will appear here once a campaign ends.
          </p>
        </div>
      )}

      {/* Booking Cards */}
      {!loading &&
        bookings.map((order) => {
          const isOpen = expanded === order.orderId;
          return (
            <div
              key={order.orderId}
              className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {order.partnerItems.map((item, idx) => (
                <div key={item.cartItemId}>
                  {idx > 0 && <hr className="border-gray-100 mx-5" />}
                  <div
                    className="flex gap-4 p-5 cursor-pointer"
                    onClick={() => toggle(order.orderId)}
                  >
                    {/* Billboard Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                          🖼
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {item.title}
                        </h3>
                        {/* Completed badge */}
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
                          ✓ Completed
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <CalendarIcon size={12} weight="bold" />
                          {fmt(item.fromDate)} → {fmt(item.toDate)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <ClockIcon size={12} weight="bold" />
                          {order.totalDays} days
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-xs text-gray-500">
                          Material:{" "}
                          <span className="font-medium text-gray-700">
                            {item.selectedMaterial}
                          </span>
                        </span>
                        <span className="text-xs text-gray-500">
                          Mounting:{" "}
                          <span className="font-medium text-gray-700">
                            {item.selectedMounting}
                          </span>
                        </span>
                        <span className="text-xs font-semibold text-teal-700">
                          ₹{item.price}/day
                        </span>
                      </div>
                    </div>

                    {/* Expand arrow */}
                    <div
                      className={`self-center text-gray-300 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}

              {/* Expanded Financial Details */}
              {isOpen && (
                <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4 space-y-4">
                  {/* Design Preview */}
                  {order.partnerItems[0]?.design?.url && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Design
                      </p>
                      <img
                        src={order.partnerItems[0].design.url}
                        alt="Design"
                        className="h-28 rounded-xl object-cover border border-gray-200"
                      />
                    </div>
                  )}

                  {/* Mounting Proof */}
                  {order.partnerItems[0]?.mountingproof?.photos?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Mounting Proof
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {order.partnerItems[0].mountingproof.photos.map(
                          (url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt={`Proof ${i + 1}`}
                              className="h-24 w-32 rounded-xl object-cover border border-gray-200"
                            />
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Financials */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Financials
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        {
                          label: "Base Rent",
                          value: fmtCurrency(order.baseRentTotal),
                          color: "text-gray-800",
                        },
                        {
                          label: "Printing Cost",
                          value: fmtCurrency(order.printingCostTotal),
                          color: "text-gray-800",
                        },
                        {
                          label: "Mounting",
                          value: fmtCurrency(order.mountingChargeTotal),
                          color: "text-gray-800",
                        },
                        {
                          label: "GST (18%)",
                          value: fmtCurrency(order.gst),
                          color: "text-gray-800",
                        },
                        {
                          label: "Gross Amount",
                          value: fmtCurrency(order.grossAmount),
                          color: "text-gray-800",
                        },
                        {
                          label: "Commission",
                          value: fmtCurrency(order.commission),
                          color: "text-red-600",
                        },
                        {
                          label: "Net Payout",
                          value: fmtCurrency(order.netPayout),
                          color: "text-teal-700",
                        },
                      ].map(({ label, value, color }) => (
                        <div
                          key={label}
                          className="bg-white rounded-xl border border-gray-100 px-4 py-3"
                        >
                          <p className="text-xs text-gray-400 mb-1">{label}</p>
                          <p className={`text-sm font-semibold ${color}`}>
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap pt-1">
                    <span>
                      Order ID:{" "}
                      <span className="font-mono text-gray-500">
                        {order.orderId}
                      </span>
                    </span>
                    <span>
                      Payment:{" "}
                      <span
                        className={`font-semibold ${order.paymentStatus === "PAID" ? "text-green-600" : "text-amber-600"}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </span>
                    <span>Placed: {fmt(order.createdAt)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
