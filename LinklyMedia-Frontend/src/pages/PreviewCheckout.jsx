// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function PreviewCheckout() {
//   const navigate = useNavigate();

//   const [data, setData]         = useState(null);
//   const [loading, setLoading]   = useState(true);
//   const [error, setError]       = useState("");
//   const [coupon, setCoupon]     = useState("");
//   const [applying, setApplying] = useState(false);
//   const [couponMsg, setCouponMsg] = useState("");

//   // ── Fetch preview (with optional coupon) ──
//   const fetchPreview = async (couponCode = "") => {
//     try {
//       setLoading(true);
//       setError("");

//       const res = await fetch("http://localhost:8000/api/user/checkout/preview", {
//         method:  "POST",
//         headers: {
//           "Content-Type":  "application/json",
//           "Authorization": `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({ couponCode }),
//       });

//       const json = await res.json();
//       console.log("✅ Preview response:", json);

//       if (!res.ok) {
//         setError(json?.error || "Failed to load checkout preview");
//         return;
//       }

//       setData(json);

//     } catch (err) {
//       console.error(err);
//       setError("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//       setApplying(false);
//     }
//   };

//   useEffect(() => { fetchPreview(); }, []);

//   const handleApplyCoupon = () => {
//     if (!coupon.trim()) return;
//     setApplying(true);
//     setCouponMsg("");
//     fetchPreview(coupon.trim()).then(() => {
//       setCouponMsg("Coupon applied!");
//     });
//   };

//   const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

//   // ── Loading ──
//   if (loading) return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//       <div className="flex flex-col items-center gap-3">
//         <svg className="w-8 h-8 animate-spin text-[#507c88]" fill="none" viewBox="0 0 24 24">
//           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
//         </svg>
//         <p className="text-gray-400 text-sm font-medium">Loading checkout…</p>
//       </div>
//     </div>
//   );

//   // ── Error ──
//   if (error) return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//       <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-md w-full text-center">
//         <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
//           <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
//           </svg>
//         </div>
//         <h2 className="text-lg font-bold text-gray-800 mb-2">Checkout Error</h2>
//         <p className="text-sm text-red-500 font-medium mb-6">{error}</p>
//         <button onClick={() => navigate("/cart")}
//           className="px-6 py-2.5 rounded-full bg-[#507c88] text-white text-sm font-semibold hover:bg-[#3d6472] transition">
//           ← Back to Cart
//         </button>
//       </div>
//     </div>
//   );

//   const { cart = [], breakdown = [], subtotal, discount, finalTotal, couponApplied } = data || {};

//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-4">
//       <div className="max-w-5xl mx-auto">

//         {/* Header */}
//         <div className="flex items-center gap-4 mb-8">
//           <button onClick={() => navigate("/cart")}
//             className="p-2 rounded-full hover:bg-gray-200 transition text-gray-500">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
//             </svg>
//           </button>
//           <div>
//             <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Preview</h1>
//             <p className="text-sm text-gray-400 font-medium">Review your booking before confirming</p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//           {/* ── LEFT: Cart items + breakdown ── */}
//           <div className="lg:col-span-2 flex flex-col gap-4">

//             {/* Cart Items */}
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//               <h2 className="text-base font-bold text-gray-800 mb-4">
//                 Your Items ({cart.length})
//               </h2>
//               <div className="flex flex-col gap-4">
//                 {cart.map((item, idx) => {
//                   const bd = breakdown[idx] || {};
//                   const from = item.FromDate ? new Date(item.FromDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
//                   const to   = item.ToDate   ? new Date(item.ToDate).toLocaleDateString("en-IN",   { day: "numeric", month: "short", year: "numeric" }) : "—";

//                   return (
//                     <div key={idx} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
//                       {/* Billboard image */}
//                       {item.ImageURL ? (
//                         <img src={item.ImageURL} alt={item.BillboardID}
//                           className="w-20 h-16 rounded-lg object-cover flex-shrink-0"/>
//                       ) : (
//                         <div className="w-20 h-16 rounded-lg bg-gradient-to-br from-[#507c88] to-[#3d6472] flex-shrink-0"/>
//                       )}

//                       <div className="flex-1 min-w-0">
//                         <p className="font-bold text-gray-800 text-sm truncate">
//                           {item.BillboardTitle || item.BillboardID}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-0.5">{from} → {to}</p>
//                         <div className="flex gap-3 mt-1.5 flex-wrap">
//                           {item.SelectedMaterial && (
//                             <span className="text-[11px] bg-[#507c88]/10 text-[#507c88] px-2 py-0.5 rounded-full font-semibold">
//                               {item.SelectedMaterial}
//                             </span>
//                           )}
//                           {item.SelectedMounting && (
//                             <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
//                               {item.SelectedMounting}
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       {/* Item total */}
//                       <div className="text-right flex-shrink-0">
//                         <p className="font-bold text-[#507c88] text-sm">
//                           {fmt(bd.ItemTotal || bd.total || 0)}
//                         </p>
//                         {bd.Days && (
//                           <p className="text-[11px] text-gray-400 mt-0.5">{bd.Days} days</p>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Price Breakdown */}
//             {breakdown.length > 0 && (
//               <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//                 <h2 className="text-base font-bold text-gray-800 mb-4">Price Breakdown</h2>
//                 <div className="flex flex-col gap-3">
//                   {breakdown.map((bd, idx) => (
//                     <div key={idx} className="text-sm">
//                       <p className="font-semibold text-gray-700 mb-1.5 truncate">
//                         {bd.BillboardTitle || cart[idx]?.BillboardID || `Item ${idx + 1}`}
//                       </p>
//                       <div className="space-y-1 pl-3 border-l-2 border-gray-100">
//                         {bd.BaseRate !== undefined && (
//                           <div className="flex justify-between text-gray-500">
//                             <span>Base rate × {bd.Days} days</span>
//                             <span>{fmt(bd.BaseRate * bd.Days)}</span>
//                           </div>
//                         )}
//                         {bd.MaterialCost > 0 && (
//                           <div className="flex justify-between text-gray-500">
//                             <span>Material ({bd.Material})</span>
//                             <span>{fmt(bd.MaterialCost)}</span>
//                           </div>
//                         )}
//                         {bd.MountingCost > 0 && (
//                           <div className="flex justify-between text-gray-500">
//                             <span>Mounting ({bd.Mounting})</span>
//                             <span>{fmt(bd.MountingCost)}</span>
//                           </div>
//                         )}
//                         <div className="flex justify-between font-semibold text-gray-800 pt-1">
//                           <span>Item total</span>
//                           <span>{fmt(bd.ItemTotal || bd.total)}</span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* ── RIGHT: Summary + Coupon + Confirm ── */}
//           <div className="flex flex-col gap-4">

//             {/* Coupon */}
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
//               <h2 className="text-sm font-bold text-gray-800 mb-3">Have a coupon?</h2>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={coupon}
//                   onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponMsg(""); }}
//                   placeholder="COUPON CODE"
//                   className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#507c88] font-mono tracking-widest"
//                 />
//                 <button
//                   onClick={handleApplyCoupon}
//                   disabled={applying || !coupon.trim()}
//                   className="px-4 py-2 bg-[#507c88] hover:bg-[#3d6472] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
//                 >
//                   {applying ? "…" : "Apply"}
//                 </button>
//               </div>
//               {couponMsg && (
//                 <p className="text-xs text-green-600 font-semibold mt-2">✓ {couponMsg}</p>
//               )}
//               {couponApplied && (
//                 <p className="text-xs text-[#507c88] font-semibold mt-1">
//                   Coupon <span className="font-mono">{couponApplied}</span> applied
//                 </p>
//               )}
//             </div>

//             {/* Order Summary */}
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
//               <h2 className="text-sm font-bold text-gray-800 mb-4">Order Summary</h2>

//               <div className="space-y-2.5 text-sm">
//                 <div className="flex justify-between text-gray-500">
//                   <span>Subtotal</span>
//                   <span className="font-medium text-gray-700">{fmt(subtotal)}</span>
//                 </div>

//                 {discount > 0 && (
//                   <div className="flex justify-between text-green-600">
//                     <span>Discount</span>
//                     <span className="font-semibold">− {fmt(discount)}</span>
//                   </div>
//                 )}

//                 <div className="flex justify-between text-gray-500">
//                   <span>Taxes</span>
//                   <span className="font-medium text-gray-700">₹0</span>
//                 </div>

//                 <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-gray-900 text-base">
//                   <span>Total</span>
//                   <span className="text-[#507c88]">{fmt(finalTotal)}</span>
//                 </div>
//               </div>

//               <button
//                 onClick={() => navigate("/confirm-order")}
//                 className="mt-5 w-full py-3.5 bg-[#507c88] hover:bg-[#3d6472] active:scale-[0.98] text-white font-bold text-sm rounded-full shadow-lg shadow-[#507c88]/20 transition-all duration-200 flex items-center justify-center gap-2"
//               >
//                 Confirm & Place Order
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
//                 </svg>
//               </button>

//               <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
//                 By confirming, you agree to our booking terms and cancellation policy.
//               </p>
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function PreviewCheckout() {
//   const navigate = useNavigate();

//   const [data, setData]           = useState(null);
//   const [loading, setLoading]     = useState(true);
//   const [error, setError]         = useState("");
//   const [coupon, setCoupon]       = useState("");
//   const [applying, setApplying]   = useState(false);
//   const [couponMsg, setCouponMsg] = useState("");

//   const fetchPreview = async (couponCode = "") => {
//     try {
//       setLoading(true);
//       setError("");

//       const res = await fetch("http://localhost:8000/api/user/checkout/preview", {
//         method:  "POST",
//         headers: {
//           "Content-Type":  "application/json",
//           "Authorization": `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({ couponCode }),
//       });

//       const json = await res.json();
//       console.log("✅ Preview response:", json);

//       if (!res.ok) {
//         setError(json?.error || "Failed to load checkout preview");
//         return;
//       }

//       setData(json);
//     } catch (err) {
//       console.error(err);
//       setError("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//       setApplying(false);
//     }
//   };

//   useEffect(() => { fetchPreview(); }, []);

//   const handleApplyCoupon = () => {
//     if (!coupon.trim()) return;
//     setApplying(true);
//     setCouponMsg("");
//     fetchPreview(coupon.trim()).then(() => setCouponMsg("Coupon applied!"));
//   };

//   const fmt  = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
//   const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

//   const diffDays = (from, to) => {
//     if (!from || !to) return 0;
//     return Math.round((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24));
//   };

//   // ── Loading ──
//   if (loading) return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//       <div className="flex flex-col items-center gap-3">
//         <svg className="w-8 h-8 animate-spin text-[#507c88]" fill="none" viewBox="0 0 24 24">
//           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
//         </svg>
//         <p className="text-gray-400 text-sm font-medium">Loading checkout…</p>
//       </div>
//     </div>
//   );

//   // ── Error ──
//   if (error) return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//       <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-md w-full text-center">
//         <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
//           <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
//           </svg>
//         </div>
//         <h2 className="text-lg font-bold text-gray-800 mb-2">Checkout Error</h2>
//         <p className="text-sm text-red-500 font-medium mb-6">{error}</p>
//         <button onClick={() => navigate("/cart")}
//           className="px-6 py-2.5 rounded-full bg-[#507c88] text-white text-sm font-semibold hover:bg-[#3d6472] transition">
//           ← Back to Cart
//         </button>
//       </div>
//     </div>
//   );

//   const {
//     cart      = [],
//     breakdown = [],
//     subtotal,
//     discount,
//     finalTotal,
//     couponApplied,
//   } = data || {};

//   // Total GST across all items
//   const totalGST = breakdown.reduce((sum, bd) => sum + (bd.gst || 0), 0);
//   const grandTotal = finalTotal || subtotal;

//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-4">
//       <div className="max-w-5xl mx-auto">

//         {/* Header */}
//         <div className="flex items-center gap-4 mb-8">
//           <button onClick={() => navigate("/cart")}
//             className="p-2 rounded-full hover:bg-gray-200 transition text-gray-500">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
//             </svg>
//           </button>
//           <div>
//             <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Preview</h1>
//             <p className="text-sm text-gray-400 font-medium">Review your booking before confirming</p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//           {/* ── LEFT: Cart items + detailed breakdown ── */}
//           <div className="lg:col-span-2 flex flex-col gap-4">

//             {cart.map((item, idx) => {
//               const bd   = breakdown[idx] || {};
//               const days = bd.days || diffDays(item.fromDate, item.toDate);

//               return (
//                 <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

//                   {/* Item header with image */}
//                   <div className="flex gap-4 p-5 border-b border-gray-50">
//                     {item.coverImage ? (
//                       <img
//                         src={item.coverImage}
//                         alt={item.title}
//                         className="w-24 h-20 rounded-xl object-cover flex-shrink-0 border border-gray-100"
//                         onError={(e) => {
//                           e.target.style.display = "none";
//                           e.target.nextSibling.style.display = "flex";
//                         }}
//                       />
//                     ) : null}
//                     <div
//                       className="w-24 h-20 rounded-xl bg-gradient-to-br from-[#507c88] to-[#3d6472] flex-shrink-0 items-center justify-center"
//                       style={{ display: item.coverImage ? "none" : "flex" }}
//                     >
//                       <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909"/>
//                       </svg>
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <p className="font-bold text-gray-900 text-base truncate">{item.title || item.billboardId}</p>

//                       {/* Dates */}
//                       <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
//                         <span className="font-medium">{fmtDate(item.fromDate)}</span>
//                         <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
//                         </svg>
//                         <span className="font-medium">{fmtDate(item.toDate)}</span>
//                         <span className="text-[#507c88] font-semibold bg-[#507c88]/10 px-2 py-0.5 rounded-full">
//                           {days} days
//                         </span>
//                       </div>

//                       {/* Tags */}
//                       <div className="flex gap-2 mt-2 flex-wrap">
//                         {item.selectedMaterial && (
//                           <span className="text-[11px] bg-[#507c88]/10 text-[#507c88] px-2.5 py-0.5 rounded-full font-semibold">
//                             {item.selectedMaterial}
//                           </span>
//                         )}
//                         {item.selectedMounting && (
//                           <span className="text-[11px] bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full font-semibold">
//                             {item.selectedMounting}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Price Breakdown for this item */}
//                   <div className="p-5">
//                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Price Breakdown</p>
//                     <div className="space-y-2.5">

//                       {bd.basePricePerDay !== undefined && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-500">
//                             Base rate ({fmt(bd.basePricePerDay)} × {days} days)
//                           </span>
//                           <span className="font-medium text-gray-700">
//                             {fmt(bd.basePricePerDay * days)}
//                           </span>
//                         </div>
//                       )}

//                       {bd.executionCharge > 0 && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-500">Execution / Material charge</span>
//                           <span className="font-medium text-gray-700">{fmt(bd.executionCharge)}</span>
//                         </div>
//                       )}

//                       {bd.commission > 0 && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-500">Platform commission</span>
//                           <span className="font-medium text-gray-700">{fmt(bd.commission)}</span>
//                         </div>
//                       )}

//                       {/* Subtotal line */}
//                       <div className="flex justify-between text-sm border-t border-gray-100 pt-2.5 mt-1">
//                         <span className="font-semibold text-gray-700">Subtotal</span>
//                         <span className="font-semibold text-gray-800">{fmt(bd.subtotal)}</span>
//                       </div>

//                       {/* GST */}
//                       {bd.gst > 0 && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-500">GST (18%)</span>
//                           <span className="font-medium text-gray-700">{fmt(bd.gst)}</span>
//                         </div>
//                       )}

//                       {/* Item Grand Total */}
//                       <div className="flex justify-between text-sm bg-[#507c88]/5 rounded-xl px-3 py-2.5 mt-1">
//                         <span className="font-bold text-gray-800">Item Total (incl. GST)</span>
//                         <span className="font-bold text-[#507c88]">
//                           {fmt((bd.subtotal || 0) + (bd.gst || 0))}
//                         </span>
//                       </div>

//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* ── RIGHT: Coupon + Order Summary ── */}
//           <div className="flex flex-col gap-4">

//             {/* Coupon */}
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
//               <h2 className="text-sm font-bold text-gray-800 mb-3">Have a coupon?</h2>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={coupon}
//                   onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponMsg(""); }}
//                   placeholder="COUPON CODE"
//                   className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#507c88] font-mono tracking-widest"
//                 />
//                 <button
//                   onClick={handleApplyCoupon}
//                   disabled={applying || !coupon.trim()}
//                   className="px-4 py-2 bg-[#507c88] hover:bg-[#3d6472] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
//                 >
//                   {applying ? "…" : "Apply"}
//                 </button>
//               </div>
//               {couponMsg && (
//                 <p className="text-xs text-green-600 font-semibold mt-2">✓ {couponMsg}</p>
//               )}
//               {couponApplied && (
//                 <p className="text-xs text-[#507c88] font-semibold mt-1">
//                   Coupon <span className="font-mono">{couponApplied}</span> applied
//                 </p>
//               )}
//             </div>

//             {/* Order Summary */}
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
//               <h2 className="text-sm font-bold text-gray-800 mb-4">Order Summary</h2>

//               <div className="space-y-2.5 text-sm">

//                 <div className="flex justify-between text-gray-500">
//                   <span>Subtotal (excl. GST)</span>
//                   <span className="font-medium text-gray-700">{fmt(subtotal)}</span>
//                 </div>

//                 {discount > 0 && (
//                   <div className="flex justify-between text-green-600">
//                     <span>Discount</span>
//                     <span className="font-semibold">− {fmt(discount)}</span>
//                   </div>
//                 )}

//                 {totalGST > 0 && (
//                   <div className="flex justify-between text-gray-500">
//                     <span>GST (18%)</span>
//                     <span className="font-medium text-gray-700">{fmt(totalGST)}</span>
//                   </div>
//                 )}

//                 <div className="border-t border-gray-100 pt-3 mt-1">
//                   <div className="flex justify-between font-black text-gray-900 text-base">
//                     <span>Total</span>
//                     <span className="text-[#507c88]">{fmt(grandTotal)}</span>
//                   </div>
//                   <p className="text-[11px] text-gray-400 mt-1">Inclusive of all taxes</p>
//                 </div>
//               </div>

//               <button
//                 onClick={() => navigate("/confirm-order")}
//                 className="
//                 mt-6 w-full py-3
//                 relative isolate inline-flex items-center justify-center
//                 text-base font-semibold tracking-wide
//                 text-[#507c88] bg-transparent
//                 border-2 border-[#507c88] rounded-full
//                 overflow-hidden
//                 transition-all duration-300
//                 before:absolute before:inset-0
//                 before:bg-[#507c88]
//                 before:translate-y-full
//                 before:transition-transform before:duration-300
//                 before:z-0
//                 hover:text-white
//                 hover:before:translate-y-0
//                 active:scale-95">
//                 <span className="relative z-10">Confirm & Place Order</span>
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
//                 </svg>
//               </button>

//               <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
//                 By confirming, you agree to our booking terms and cancellation policy.
//               </p>
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }import React, { useEffect, useState } from "react";
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

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

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
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {cart.map((item, idx) => {
            const bd = breakdown[idx] || {};
            const days = bd.days || 0;
            const baseRent = (bd.basePricePerDay || 0) * days;

            return (
              <div key={idx} className="bg-white rounded-xl shadow border p-5">
                <div className="flex gap-5">
                  <div className="w-32 h-24 bg-gray-100 rounded flex items-center justify-center border">
                    {item.coverImage && (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="font-semibold text-lg">{item.title}</h2>
                    <p className="text-sm text-gray-500 mb-3">
                      {fmtDate(item.fromDate)} → {fmtDate(item.toDate)} ({days}{" "}
                      days)
                    </p>

                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Base Rent</span>
                        <span>{fmt(baseRent)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Printing</span>
                        <span>{fmt(bd.printingCost)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Mounting</span>
                        <span>{fmt(bd.mountingCost)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>GST</span>
                        <span>{fmt(bd.gst)}</span>
                      </div>

                      <div className="flex justify-between font-bold border-t pt-2 mt-2">
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

        {/* RIGHT */}
        <div className="bg-white rounded-xl shadow border p-5 h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>GST</span>
              <span>{fmt(totalGST)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- {fmt(discount)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg border-t pt-3">
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
                className="flex-1 border px-3 py-2 rounded"
              />
              <button
                disabled={applying}
                onClick={handleApplyCoupon}
                className="bg-[#507c88] text-white px-4 py-2 rounded"
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
            className="mt-6 w-full bg-[#507c88] text-white py-3 rounded-lg font-semibold hover:bg-[#3d6472]"
          >
            Confirm & Place Order
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
