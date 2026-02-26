import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@phosphor-icons/react";

const STATUS_STYLES = {
  CONFIRMED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  PENDING:   "bg-amber-50 text-amber-600 border-amber-200",
  CANCELLED: "bg-red-50 text-red-500 border-red-200",
  COMPLETED: "bg-blue-50 text-blue-600 border-blue-200",
  EXPIRED:   "bg-gray-100 text-gray-500 border-gray-200",
  LIVE:      "bg-purple-50 text-purple-600 border-purple-200",
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const fmtFull = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
    <span className="text-sm text-gray-800 font-medium text-left sm:text-right break-all">{value}</span>
  </div>
);

export default function OrderDetail() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const b         = state?.booking;

  if (!b) return (
    <div className="p-4 sm:p-6">
      <button onClick={() => navigate("/partner/orders")}
        className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-gray-800 mb-4 transition">
        <ArrowLeftIcon size={16} /> Back to Orders
      </button>
      <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4">
        Order not found. Go back and try again.
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate("/partner/orders")}
        className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-gray-800 mb-4 sm:mb-5 transition">
        <ArrowLeftIcon size={16} /> Back to Orders
      </button>

      {/* Order header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Order #{b.orderId?.slice(-8)}</h1>
          <p className="text-sm text-gray-400 mt-1">Placed on {fmtFull(b.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${STATUS_STYLES[b.orderStatus] ?? STATUS_STYLES.EXPIRED}`}>
            {b.orderStatus}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${
            b.paymentStatus === "PAID"
              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
              : "bg-amber-50 text-amber-600 border-amber-200"
          }`}>
            {b.paymentStatus}
          </span>
        </div>
      </div>

      {/* Billboard items */}
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
        Billboards ({b.partnerItems?.length ?? 0})
      </p>
      <div className="space-y-4 mb-6">
        {b.partnerItems?.map((item) => (
          <div key={item.cartItemId} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            {/* Image + title row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4">
              {item.coverImage ? (
                <img src={item.coverImage} alt={item.title}
                  className="w-full sm:w-20 h-44 sm:h-14 object-cover rounded-lg border border-gray-100 shrink-0" />
              ) : (
                <div className="w-full sm:w-20 h-44 sm:h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">🪧</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-gray-800 truncate">{item.title}</p>
                  <span className={`px-2 py-0.5 rounded-full border text-xs font-medium shrink-0 ${STATUS_STYLES[item.status] ?? STATUS_STYLES.EXPIRED}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {fmt(item.fromDate)} → {fmt(item.toDate)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.selectedMaterial} · {item.selectedMounting}
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="text-base sm:text-lg font-bold text-[#507c88]">
                  ₹{Number(item.price).toLocaleString()}/ per day
                </p>
              </div>
            </div>



            {/* ── ADD THIS: Design Image ── */}
            {item.design?.url && (
              <div className="px-4 pb-4 pt-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Customer Design
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <img
                    src={item.design.url}
                    alt={item.design.alttext || "Design"}
                    className="w-full sm:w-32 h-44 sm:h-24 object-cover rounded-lg border border-gray-200 shrink-0"/>
                    <div>
                      <p className="text-xs text-gray-500">{item.design.alttext}</p>
                      <p className="text-xs text-gray-400 mt-1 break-all font-mono">{item.design.publicid}</p>
                      </div>
                      </div>
                      </div>
                    )}



            










            {/* Item details */}
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
              <div className="grid grid-cols-1">
                {/* <InfoRow label={"Total Days"}     value={<span className="font-mono text-xs">{{b.totalDays}</span>}}, */}
                <InfoRow label="Total Days" value={<span className="font-mono text-xs">{b.totalDays} Days</span>} />
                <InfoRow label="Cart Item ID"     value={<span className="font-mono text-xs">{item.cartItemId}</span>} />
                <InfoRow label="Billboard ID"     value={<span className="font-mono text-xs">{item.billboardId}</span>} />
                <InfoRow label="From Date"        value={fmtFull(item.fromDate)} />
                <InfoRow label="To Date"          value={fmtFull(item.toDate)} />
                <InfoRow label="Material"         value={item.selectedMaterial} />
                <InfoRow label="Mounting"         value={item.selectedMounting} />
                <InfoRow label="Confirmed At"     value={fmtFull(item.confirmedat)} />
                <InfoRow label="SLA Deadline"     value={fmtFull(item.sladeadline)} />
                {item.printstartedat && <InfoRow label="Print Started"  value={fmtFull(item.printstartedat)} />}
                {item.mountstartedat && <InfoRow label="Mount Started"  value={fmtFull(item.mountstartedat)} />}
                {item.liveat         && <InfoRow label="Went Live"      value={fmtFull(item.liveat)} />}
                {item.completedat    && <InfoRow label="Completed At"   value={fmtFull(item.completedat)} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial breakdown */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white mb-4">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Financial Breakdown</p>
        </div>
        <div className="p-4">
          <InfoRow label="Base Rent"        value={`₹${Number(b.baseRentTotal).toLocaleString()}`} />
          <InfoRow label="Printing Cost"    value={`₹${Number(b.printingCostTotal).toLocaleString()}`} />
          <InfoRow label="Mounting Charge"  value={`₹${Number(b.mountingChargeTotal).toLocaleString()}`} />
          <InfoRow label="Taxable Amount"   value={`₹${Number(b.taxableAmount).toLocaleString()}`} />
          <InfoRow label="GST"              value={`₹${Number(b.gst).toLocaleString()}`} />
          <InfoRow label="Gross Amount"     value={`₹${Number(b.grossAmount).toLocaleString()}`} />
          <InfoRow label="Commission"       value={`₹${Number(b.commission).toLocaleString()}`} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-3 mt-1 border-t-2 border-gray-200">
            <span className="text-sm font-bold text-gray-800">Net Payout</span>
            <span className="text-lg sm:text-xl font-bold text-[#507c88]">₹{Number(b.netPayout).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 text-left sm:text-right break-all">
        Customer ID: {b.customerId}
      </p>
    </div>
  );
}
