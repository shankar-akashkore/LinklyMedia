import React, { useEffect, useState } from "react";
import { CalendarIcon, ClockIcon, CheckCircleIcon } from "@phosphor-icons/react";

const STATUS_CONFIG = {
  CONFIRMED:     { label: "Confirmed",  bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   step: 1 },
  PRINT_STARTED: { label: "Printing",   bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", step: 2 },
  MOUNTING:      { label: "Mounting",   bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500", step: 3 },
  LIVE:          { label: "Live",       bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  step: 4 },
  COMPLETED:     { label: "Completed",  bg: "bg-gray-100",  text: "text-gray-600",   dot: "bg-gray-400",   step: 5 },
  PENDING:       { label: "Pending",    bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500",  step: 0 },
};

const STEPS = [
  { key: "CONFIRMED",     label: "Confirmed" },
  { key: "PRINT_STARTED", label: "Printing"  },
  { key: "MOUNTING",      label: "Mounting"  },
  { key: "LIVE",          label: "Live"      },
  { key: "COMPLETED",     label: "Completed" },
];

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const StatusPill = ({ status }) => {
  const s = STATUS_CONFIG[status] ?? { label: status, bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === "LIVE" ? "animate-pulse" : ""}`} />
      {s.label}
    </span>
  );
};

const ProgressBar = ({ status }) => {
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const done    = currentStep >= stepNum;
        const isLast  = idx === STEPS.length - 1;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${done ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                {done ? <CheckCircleIcon size={14} weight="fill" /> : stepNum}
              </div>
              <span className={`mt-1 text-[10px] font-medium whitespace-nowrap ${done ? "text-teal-600" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mb-4 mx-1 rounded transition-all ${currentStep > stepNum ? "bg-teal-500" : "bg-gray-100"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function MyOrders() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const r = await fetch("http://localhost:8000/api/user/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Failed to load orders");
        const data = await r.json();
        setBookings(data.bookings || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-400 mt-1">Track all your billboard bookings</p>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
          ⚠ {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse shadow-sm">
              <div className="flex gap-4">
                <div className="w-24 h-20 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="text-6xl mb-4">🪧</div>
          <p className="text-gray-600 font-semibold text-lg">No orders yet</p>
          <p className="text-sm text-gray-400 mt-1">Your paid billboard bookings will appear here.</p>
          <a href="/billboards" className="mt-6 px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition">
            Browse Billboards
          </a>
        </div>
      )}

      {/* Order Cards */}
      <div className="space-y-4">
        {!loading && bookings.map((b, idx) => {
          const cardKey = `${b.orderId}-${b.billboardId}-${idx}`;
          const isOpen  = expanded === cardKey;

          return (
            <div
              key={cardKey}
              className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Clickable main row */}
              <div
                className="flex gap-4 p-5 cursor-pointer"
                onClick={() => toggle(cardKey)}
              >
                {/* Billboard image */}
                <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  {b.coverImage
                    ? <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">🪧</div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">{b.title}</h3>
                    <StatusPill status={b.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <CalendarIcon size={12} weight="bold" />
                      {fmt(b.fromDate)} → {fmt(b.toDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-400">
                      Material: <span className="font-medium text-gray-600">{b.material}</span>
                    </span>
                    <span className="text-xs text-gray-400">
                      Mounting: <span className="font-medium text-gray-600">{b.mounting}</span>
                    </span>
                  </div>
                </div>

                {/* Expand arrow */}
                <div className={`self-center text-gray-300 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded section — tracking + details */}
              {isOpen && (
                <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-5 space-y-5">

                  {/* Progress tracker */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Tracking</p>
                    <ProgressBar status={b.status} />
                  </div>

                  {/* Timeline */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Timeline</p>
                    <div className="space-y-2">
                      {[
                        { label: "Order Placed", value: b.createdAt   },
                        { label: "Confirmed",    value: b.confirmedAt },
                        { label: "Went Live",    value: b.liveAt      },
                      ].filter(t => t.value).map(({ label, value }) => (
                        <div key={label} className="flex items-center gap-3">
                          <ClockIcon size={13} className="text-teal-500 flex-shrink-0" />
                          <span className="text-xs text-gray-500 w-28">{label}</span>
                          <span className="text-xs font-medium text-gray-700">{fmt(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mounting Proof */}
                  {b.mountingProof?.photos?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">📸 Mounting Proof</p>
                      <div className="flex gap-2 flex-wrap">
                        {b.mountingProof.photos.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt={`Proof ${i+1}`} className="h-24 w-32 rounded-xl object-cover border border-gray-200 hover:opacity-90 transition" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment info */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-xs text-gray-500">
                        Method: <span className="font-medium text-gray-700 capitalize">{b.paymentMethod || "—"}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        Status:{" "}
                        <span className={`font-semibold ${b.paymentCaptured ? "text-green-600" : "text-amber-600"}`}>
                          {b.paymentCaptured ? "Paid" : "Pending"}
                        </span>
                      </span>
                      {b.paymentVerifiedAt && (
                        <span className="text-xs text-gray-400">Verified: {fmt(b.paymentVerifiedAt)}</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 font-mono">Order #{b.orderId}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
    </div>
  );
}