// import { useEffect, useState } from "react";

// const fmt = (d) =>
//   d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// const LIFECYCLE = ["CONFIRMED", "PRINTING", "MOUNTING", "LIVE", "COMPLETED"];

// const STATUS_STYLES = {
//   CONFIRMED:  "bg-emerald-50 text-emerald-600 border-emerald-200",
//   PRINTING:   "bg-blue-50 text-blue-600 border-blue-200",
//   MOUNTING:   "bg-purple-50 text-purple-600 border-purple-200",
//   LIVE:       "bg-green-50 text-green-600 border-green-200",
//   COMPLETED:  "bg-gray-100 text-gray-500 border-gray-200",
//   SLA_BREACHED: "bg-red-50 text-red-500 border-red-200",
// };

// // What status can transition to next
// const NEXT_STATUS = {
//   CONFIRMED: "PRINTING",
//   PRINTING:  "MOUNTING",
//   MOUNTING:  "LIVE",
// };

// export default function Tracking() {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [acting, setActing] = useState(null);

//   // const token = localStorage.getItem("token");

//   const fetchBookings = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token"); // ← move token INSIDE here

//       const res = await fetch(
//         "http://localhost:8000/api/partner/bookings?status=CONFIRMED",
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const data = await res.json();
//       const active = (data.bookings || []).filter((b) =>
//         b.partnerItems?.some((item) =>
//           ["CONFIRMED", "PRINTING", "MOUNTING", "LIVE"].includes(item.status)
//         )
//       );
//       setBookings(active);
//     } catch (err) {
//       setError("Failed to load tracking data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusChange = async (orderId, cartItemId, newStatus) => {
//     const key = orderId + cartItemId;
//     setActing(key);
//     const token = localStorage.getItem("token"); // ← move token INSIDE here too
//     try {
//       const res = await fetch(
//         `http://localhost:8000/api/partner/booking/${orderId}/${cartItemId}/status`,
//         {
//           method: "PATCH",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ status: newStatus }),
//         }
//       );
//       if (!res.ok) {
//         const err = await res.json();
//         alert(err.error || "Failed to update status.");
//         return;
//       }
//       await fetchBookings();
//     } catch (err) {
//       alert("Failed to update status.");
//     } finally {
//       setActing(null);
//     }
//   };

//   useEffect(() => {
//     fetchBookings();
//   }, []); // ← ADD THIS - it's missing from your current code

//   if (loading) {
//     return (
//       <div className="p-6 space-y-4">
//         {[...Array(3)].map((_, i) => (
//           <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
//         ))}
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h2 className="text-lg font-bold text-gray-800">Tracking — Active Booking</h2>
//         <p className="text-sm text-gray-400 mt-0.5">
//           {bookings.length} active booking{bookings.length !== 1 ? "s" : ""}
//         </p>
//       </div>

//       {bookings.length === 0 ? (
//         <div className="text-center py-16 text-gray-400">
//           <p className="text-4xl mb-3">📋</p>
//           <p className="font-medium text-gray-500">No active bookings to track.</p>
//         </div>
//       ) : (
//         <div className="space-y-5">
//           {bookings.map((b) =>
//             b.partnerItems?.map((item) => {
//               const nextStatus = NEXT_STATUS[item.status];
//               const currentStep = LIFECYCLE.indexOf(item.status);
//               const isActing = acting === b.orderId + item.cartItemId;

//               return (
//                 <div key={item.cartItemId} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

//                   {/* Header */}
//                   <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
//                     <div className="flex items-center gap-3">
//                       <span className="text-xs font-mono text-gray-400">#{b.orderId?.slice(-8)}</span>
//                       <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${STATUS_STYLES[item.status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
//                         {item.status || "—"}
//                       </span>
//                       {/* SLA Warning */}
//                       {item.sladeadline && new Date(item.sladeadline) > new Date() && item.status === "CONFIRMED" && (
//                         <span className="text-xs text-amber-500 font-medium">
//                           ⚠ SLA deadline: {fmt(item.sladeadline)}
//                         </span>
//                       )}
//                     </div>
//                     <span className="text-xs text-gray-400">{fmt(b.createdAt)}</span>
//                   </div>

//                   {/* Billboard Info */}
//                   <div className="flex items-center gap-4 px-4 py-4">
//                     {item.coverImage ? (
//                       <img src={item.coverImage} alt={item.title}
//                         className="w-20 h-14 object-cover rounded-lg border border-gray-100 shrink-0" />
//                     ) : (
//                       <div className="w-20 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">🪧</div>
//                     )}
//                     <div className="flex-1">
//                       <p className="font-semibold text-gray-800">{item.title}</p>
//                       <p className="text-xs text-gray-400 mt-0.5">
//                         {fmt(item.fromDate)} → {fmt(item.toDate)}
//                       </p>
//                       <p className="text-xs text-gray-400">{item.selectedMaterial} · {item.selectedMounting}</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm font-bold text-gray-800">₹{Number(item.price).toLocaleString()}/day</p>
//                       <p className="text-xs text-gray-400 mt-0.5">Net: ₹{Number(b.netPayout).toLocaleString()}</p>
//                     </div>
//                   </div>

//                   {/* Progress Bar */}
//                   <div className="px-4 pb-4">
//                     <div className="flex items-center gap-1 mb-3">
//                       {LIFECYCLE.slice(0, -1).map((step, i) => (
//                         <div key={step} className="flex items-center flex-1">
//                           <div className={`flex-1 h-1.5 rounded-full ${i <= currentStep - 1 ? "bg-[#507c88]" : "bg-gray-200"}`} />
//                           <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
//                             i < currentStep ? "bg-[#507c88] border-[#507c88]" :
//                             i === currentStep ? "bg-white border-[#507c88]" :
//                             "bg-white border-gray-300"
//                           }`} />
//                         </div>
//                       ))}
//                       <div className={`flex-1 h-1.5 rounded-full ${currentStep >= LIFECYCLE.length - 1 ? "bg-[#507c88]" : "bg-gray-200"}`} />
//                     </div>

//                     {/* Step Labels */}
//                     <div className="flex justify-between text-[10px] text-gray-400 mb-4">
//                       {LIFECYCLE.map((step, i) => (
//                         <span key={step} className={i <= currentStep ? "text-[#507c88] font-medium" : ""}>
//                           {step}
//                         </span>
//                       ))}
//                     </div>

//                     {/* Action Button */}
//                     {nextStatus && (
//                       <button
//                         disabled={isActing}
//                         onClick={() => handleStatusChange(b.orderId, item.cartItemId, nextStatus)}
//                         className="w-full py-2.5 bg-[#507c88] hover:bg-[#3d6472] text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
//                       >
//                         {isActing ? "Updating…" : `Mark as ${nextStatus} →`}
//                       </button>
//                     )}

//                     {item.status === "LIVE" && (
//                       <div className="text-center text-sm text-green-600 font-medium py-2">
//                         🟢 Billboard is LIVE
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// import { useEffect, useState, useRef } from "react";

// const fmt = (d) =>
//   d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// const LIFECYCLE = ["CONFIRMED", "PRINTING", "MOUNTING", "LIVE", "COMPLETED"];

// const STATUS_STYLES = {
//   CONFIRMED:  "bg-emerald-50 text-emerald-600 border-emerald-200",
//   PRINTING:   "bg-blue-50 text-blue-600 border-blue-200",
//   MOUNTING:   "bg-purple-50 text-purple-600 border-purple-200",
//   LIVE:       "bg-green-50 text-green-600 border-green-200",
//   COMPLETED:  "bg-gray-100 text-gray-500 border-gray-200",
//   SLA_BREACHED: "bg-red-50 text-red-500 border-red-200",
// };

// const NEXT_STATUS = {
//   CONFIRMED: "PRINTING",
//   PRINTING:  "MOUNTING",
//   MOUNTING:  "LIVE",
// };

// export default function Tracking() {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [acting, setActing] = useState(null);

//   // Modal state
//   const [showModal, setShowModal] = useState(false);
//   const [modalTarget, setModalTarget] = useState(null); // { orderId, cartItemId }
//   const [photos, setPhotos] = useState([]);
//   const [video, setVideo] = useState(null);
//   const [previews, setPreviews] = useState([]);
//   const fileRef = useRef();

//   const fetchBookings = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
//       const res = await fetch(
//         "http://localhost:8000/api/partner/bookings?status=CONFIRMED",
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const data = await res.json();
//       const active = (data.bookings || []).filter((b) =>
//         b.partnerItems?.some((item) =>
//           ["CONFIRMED", "PRINTING", "MOUNTING", "LIVE"].includes(item.status)
//         )
//       );
//       setBookings(active);
//     } catch (err) {
//       setError("Failed to load tracking data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchBookings(); }, []);

//   // Regular status change (no photo needed)
//   const handleStatusChange = async (orderId, cartItemId, newStatus) => {
//     // If LIVE, show photo upload modal instead
//     if (newStatus === "LIVE") {
//       setModalTarget({ orderId, cartItemId });
//       setShowModal(true);
//       return;
//     }

//     const key = orderId + cartItemId;
//     setActing(key);
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch(
//         `http://localhost:8000/api/partner/booking/${orderId}/${cartItemId}/status`,
//         {
//           method: "PATCH",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ status: newStatus }),
//         }
//       );
//       if (!res.ok) {
//         const err = await res.json();
//         alert(err.error || "Failed to update status.");
//         return;
//       }
//       await fetchBookings();
//     } catch (err) {
//       alert("Failed to update status.");
//     } finally {
//       setActing(null);
//     }
//   };

//   // LIVE status change with multipart photos
//   const handleLiveSubmit = async () => {
//     if (photos.length === 0) {
//       alert("Please upload at least one photo.");
//       return;
//     }

//     const { orderId, cartItemId } = modalTarget;
//     const key = orderId + cartItemId;
//     setActing(key);

//     const token = localStorage.getItem("token");
//     const formData = new FormData();
//     formData.append("status", "LIVE");
//     photos.forEach((p) => formData.append("photos", p));
//     if (video) formData.append("video", video);

//     try {
//       const res = await fetch(
//         `http://localhost:8000/api/partner/booking/${orderId}/${cartItemId}/status`,
//         {
//           method: "PATCH",
//           headers: { Authorization: `Bearer ${token}` }, // NO Content-Type — browser sets it with boundary
//           body: formData,
//         }
//       );
//       if (!res.ok) {
//         const err = await res.json();
//         alert(err.error || "Failed to mark LIVE.");
//         return;
//       }
//       setShowModal(false);
//       setPhotos([]);
//       setVideo(null);
//       setPreviews([]);
//       await fetchBookings();
//     } catch (err) {
//       alert("Failed to mark LIVE.");
//     } finally {
//       setActing(null);
//     }
//   };

//   const handlePhotoSelect = (e) => {
//     const files = Array.from(e.target.files);
//     setPhotos(files);
//     setPreviews(files.map((f) => URL.createObjectURL(f)));
//   };

//   if (loading) {
//     return (
//       <div className="p-6 space-y-4">
//         {[...Array(3)].map((_, i) => (
//           <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
//         ))}
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">

//       {/* ── Photo Upload Modal ── */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
//             <h3 className="text-lg font-bold text-gray-800 mb-1">Upload Mounting Proof</h3>
//             <p className="text-sm text-gray-400 mb-4">
//               Upload at least one photo of the mounted billboard to mark it as LIVE.
//             </p>

//             {/* Photo Upload */}
//             <div
//               onClick={() => fileRef.current.click()}
//               className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#507c88] transition mb-3"
//             >
//               <p className="text-sm text-gray-400">
//                 {photos.length > 0 ? `${photos.length} photo(s) selected` : "Click to upload photos"}
//               </p>
//               <p className="text-xs text-gray-300 mt-1">JPG, PNG, WEBP supported</p>
//               <input
//                 ref={fileRef}
//                 type="file"
//                 accept="image/*"
//                 multiple
//                 className="hidden"
//                 onChange={handlePhotoSelect}
//               />
//             </div>

//             {/* Previews */}
//             {previews.length > 0 && (
//               <div className="flex gap-2 flex-wrap mb-3">
//                 {previews.map((src, i) => (
//                   <img key={i} src={src} className="w-16 h-16 object-cover rounded-lg border border-gray-100" />
//                 ))}
//               </div>
//             )}

//             {/* Optional Video */}
//             <label className="block text-xs text-gray-400 mb-1">Video (optional)</label>
//             <input
//               type="file"
//               accept="video/*"
//               className="text-xs text-gray-500 mb-4 w-full"
//               onChange={(e) => setVideo(e.target.files[0])}
//             />

//             {/* Buttons */}
//             <div className="flex gap-3">
//               <button
//                 onClick={() => { setShowModal(false); setPhotos([]); setPreviews([]); setVideo(null); }}
//                 className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleLiveSubmit}
//                 disabled={!!acting}
//                 className="flex-1 py-2.5 bg-[#507c88] hover:bg-[#3d6472] text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
//               >
//                 {acting ? "Uploading…" : "Mark as LIVE →"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="mb-6">
//         <h2 className="text-lg font-bold text-gray-800">Tracking — Active Bookings</h2>
//         <p className="text-sm text-gray-400 mt-0.5">
//           {bookings.length} active booking{bookings.length !== 1 ? "s" : ""}
//         </p>
//       </div>

//       {bookings.length === 0 ? (
//         <div className="text-center py-16 text-gray-400">
//           <p className="text-4xl mb-3">📋</p>
//           <p className="font-medium text-gray-500">No active bookings to track.</p>
//         </div>
//       ) : (
//         <div className="space-y-5">
//           {bookings.map((b) =>
//             b.partnerItems?.map((item) => {
//               const nextStatus = NEXT_STATUS[item.status];
//               const currentStep = LIFECYCLE.indexOf(item.status);
//               const isActing = acting === b.orderId + item.cartItemId;

//               return (
//                 <div key={item.cartItemId} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
//                   <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
//                     <div className="flex items-center gap-3">
//                       <span className="text-xs font-mono text-gray-600">#{b.orderId?.slice(-8)}</span>
//                       <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${STATUS_STYLES[item.status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
//                         {item.status || "—"}
//                       </span>
//                       {item.sladeadline && new Date(item.sladeadline) > new Date() && item.status === "CONFIRMED" && (
//                         <span className="text-xs text-amber-500 font-medium">
//                           ⚠ SLA deadline: {fmt(item.sladeadline)}
//                         </span>
//                       )}
//                     </div>
//                     <span className="text-xs text-gray-600">{fmt(b.createdAt)}</span>
//                   </div>

//                   <div className="flex items-center gap-4 px-4 py-4">
//                     {item.coverImage ? (
//                       <img src={item.coverImage} alt={item.title}
//                         className="w-20 h-14 object-cover rounded-lg border border-gray-100 shrink-0" />
//                     ) : (
//                       <div className="w-20 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">🪧</div>
//                     )}
//                     <div className="flex-1">
//                       <p className="font-semibold text-gray-800">{item.title}</p>
//                       <p className="text-xs text-gray-500 mt-0.5">{fmt(item.fromDate)} → {fmt(item.toDate)}</p>
//                       <p className="text-xs text-gray-400">{item.selectedMaterial} · {item.selectedMounting}</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm font-bold text-gray-800">₹{Number(item.price).toLocaleString()}/day</p>
//                       <p className="text-xs text-gray-500 mt-0.5">Net: ₹{Number(b.netPayout).toLocaleString()}</p>
//                     </div>
//                   </div>

//                   <div className="px-4 pb-4">
//                     <div className="flex items-center gap-1 mb-3">
//                       {LIFECYCLE.slice(0, -1).map((step, i) => (
//                         <div key={step} className="flex items-center flex-1">
//                           <div className={`flex-1 h-1.5 rounded-full ${i <= currentStep - 1 ? "bg-[#507c88]" : "bg-gray-200"}`} />
//                           <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
//                             i < currentStep ? "bg-[#507c88] border-[#507c88]" :
//                             i === currentStep ? "bg-white border-[#507c88]" :
//                             "bg-white border-gray-300"
//                           }`} />
//                         </div>
//                       ))}
//                       <div className={`flex-1 h-1.5 rounded-full ${currentStep >= LIFECYCLE.length - 1 ? "bg-[#507c88]" : "bg-gray-200"}`} />
//                     </div>

//                     <div className="flex justify-between text-[10px] text-gray-400 mb-4">
//                       {LIFECYCLE.map((step, i) => (
//                         <span key={step} className={i <= currentStep ? "text-[#507c88] font-semibold" : ""}>{step}</span>
//                       ))}
//                     </div>

//                     {nextStatus && (
//                       <button
//                         disabled={isActing}
//                         onClick={() => handleStatusChange(b.orderId, item.cartItemId, nextStatus)}
//                         className="w-full py-2.5 bg-[#507c88] hover:bg-[#3d6472] text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
//                       >
//                         {isActing ? "Updating…" : `Mark as ${nextStatus} →`}
//                       </button>
//                     )}

//                     {item.status === "LIVE" && (
//                       <div className="text-center text-sm text-green-600 bg-green-100 font-medium py-2">
//                         Billboard is LIVE
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState, useRef } from "react";

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const LIFECYCLE = ["CONFIRMED", "PRINTING", "MOUNTING", "LIVE", "COMPLETED"];

const STATUS_STYLES = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-300",
  PRINTING: "bg-blue-50 text-blue-700 border-blue-300",
  MOUNTING: "bg-purple-50 text-purple-700 border-purple-300",
  LIVE: "bg-green-50 text-green-700 border-green-300",
  COMPLETED: "bg-gray-100 text-gray-500 border-gray-300",
  SLA_BREACHED: "bg-red-50 text-red-600 border-red-300",
};

const STEP_COLORS = {
  CONFIRMED: "bg-emerald-500",
  PRINTING: "bg-blue-500",
  MOUNTING: "bg-purple-500",
  LIVE: "bg-green-500",
  COMPLETED: "bg-gray-400",
};

const NEXT_STATUS = {
  CONFIRMED: "PRINTING",
  PRINTING: "MOUNTING",
  MOUNTING: "LIVE",
};

const NEXT_BUTTON_STYLE = {
  PRINTING: "bg-blue-600 hover:bg-blue-700",
  MOUNTING: "bg-purple-600 hover:bg-purple-700",
  LIVE: "bg-green-600 hover:bg-green-700",
};

export default function Tracking() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acting, setActing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTarget, setModalTarget] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [previews, setPreviews] = useState([]);
  const fileRef = useRef();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:8000/api/partner/bookings?status=CONFIRMED",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      const active = (data.bookings || []).filter((b) =>
        b.partnerItems?.some((item) =>
          ["CONFIRMED", "PRINTING", "MOUNTING", "LIVE"].includes(item.status),
        ),
      );
      setBookings(active);
    } catch {
      setError("Failed to load tracking data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (orderId, cartItemId, newStatus) => {
    if (newStatus === "LIVE") {
      setModalTarget({ orderId, cartItemId });
      setShowModal(true);
      return;
    }
    const key = orderId + cartItemId;
    setActing(key);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8000/api/partner/booking/${orderId}/${cartItemId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (!res.ok) {
        const e = await res.json();
        alert(e.error || "Failed.");
        return;
      }
      await fetchBookings();
    } catch {
      alert("Failed to update status.");
    } finally {
      setActing(null);
    }
  };

  const handleLiveSubmit = async () => {
    if (photos.length === 0) {
      alert("Please upload at least one photo.");
      return;
    }
    const { orderId, cartItemId } = modalTarget;
    setActing(orderId + cartItemId);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("status", "LIVE");
    photos.forEach((p) => formData.append("photos", p));
    if (video) formData.append("video", video);
    try {
      const res = await fetch(
        `http://localhost:8000/api/partner/booking/${orderId}/${cartItemId}/status`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      if (!res.ok) {
        const e = await res.json();
        alert(e.error || "Failed.");
        return;
      }
      setShowModal(false);
      setPhotos([]);
      setVideo(null);
      setPreviews([]);
      await fetchBookings();
    } catch {
      alert("Failed to mark LIVE.");
    } finally {
      setActing(null);
    }
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  if (loading)
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
        {error}
      </div>
    );

  return (
    <div className="p-6">
      {/* ── Photo Upload Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Upload Mounting Proof
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Upload at least one photo of the mounted billboard.
            </p>
            <div
              onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition mb-3"
            >
              <p className="text-2xl mb-1">📸</p>
              <p className="text-sm text-gray-500 font-medium">
                {photos.length > 0
                  ? `${photos.length} photo(s) selected`
                  : "Click to upload photos"}
              </p>
              <p className="text-xs text-gray-300 mt-1">
                JPG, PNG, WEBP supported
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>
            {previews.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            )}
            <label className="block text-xs text-gray-400 mb-1">
              Video (optional)
            </label>
            <input
              type="file"
              accept="video/*"
              className="text-xs text-gray-500 mb-4 w-full"
              onChange={(e) => setVideo(e.target.files[0])}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setPhotos([]);
                  setPreviews([]);
                  setVideo(null);
                }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLiveSubmit}
                disabled={!!acting}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
              >
                {acting ? "Uploading…" : "🟢 Mark as LIVE"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Tracking — Active Bookings
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {bookings.length} active booking{bookings.length !== 1 ? "s" : ""}
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium text-gray-500">
            No active bookings to track.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((b) =>
            b.partnerItems?.map((item) => {
              const nextStatus = NEXT_STATUS[item.status];
              const currentStep = LIFECYCLE.indexOf(item.status);
              const isActing = acting === b.orderId + item.cartItemId;
              const barColor = STEP_COLORS[item.status] ?? "bg-gray-400";

              return (
                <div
                  key={item.cartItemId}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-400">
                        #{b.orderId?.slice(-8)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full border text-xs font-bold ${STATUS_STYLES[item.status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}
                      >
                        ● {item.status || "—"}
                      </span>
                      {item.sladeadline &&
                        new Date(item.sladeadline) > new Date() &&
                        item.status === "CONFIRMED" && (
                          <span className="text-xs text-amber-500 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            ⚠ SLA: {fmt(item.sladeadline)}
                          </span>
                        )}
                    </div>
                    <span className="text-xs text-gray-600">
                      {fmt(b.createdAt)}
                    </span>
                  </div>

                  {/* Billboard Info */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-20 h-14 object-cover rounded-xl border border-gray-100 shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        🪧
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-base">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {fmt(item.fromDate)} → {fmt(item.toDate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.selectedMaterial} · {item.selectedMounting}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-gray-800">
                        ₹{Number(item.price).toLocaleString()}
                        <span className="text-xs font-normal text-gray-400">
                          /day
                        </span>
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Net: ₹{Number(b.netPayout).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="px-5 pb-5">
                    {/* Step dots + lines */}
                    <div className="relative flex items-center mb-2">
                      {LIFECYCLE.map((step, i) => {
                        const done = i < currentStep;
                        const active = i === currentStep;
                        return (
                          <div
                            key={step}
                            className="flex items-center flex-1 last:flex-none"
                          >
                            <div
                              className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                                done
                                  ? `${barColor} border-transparent`
                                  : active
                                    ? `bg-white border-current ${STEP_COLORS[item.status]?.replace("bg-", "border-") ?? "border-gray-400"}`
                                    : "bg-white border-gray-200"
                              }`}
                            >
                              {done && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                              {active && (
                                <div
                                  className={`w-2 h-2 rounded-full ${barColor}`}
                                />
                              )}
                            </div>
                            {i < LIFECYCLE.length - 1 && (
                              <div
                                className={`flex-1 h-1.5 mx-1 rounded-full ${i < currentStep ? barColor : "bg-gray-100"}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Labels */}
                    <div className="flex justify-between mb-4">
                      {LIFECYCLE.map((step, i) => (
                        <span
                          key={step}
                          className={`text-[10px] font-semibold ${
                            i < currentStep
                              ? "font-semibold text-gray-800"
                              : i === currentStep
                                ? "text-[#507c88]"
                                : "text-gray-300"
                          }`}
                        >
                          {step}
                        </span>
                      ))}
                    </div>

                    {/* Action Button */}
                    {nextStatus && (
                      <button
                        disabled={isActing}
                        onClick={() =>
                          handleStatusChange(
                            b.orderId,
                            item.cartItemId,
                            nextStatus,
                          )
                        }
                        className={`w-full py-3 text-white text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 ${NEXT_BUTTON_STYLE[nextStatus] ?? "bg-[#507c88] hover:bg-[#3d6472]"}`}
                      >
                        {isActing ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                            Updating…
                          </>
                        ) : (
                          <>
                            Mark as <strong>{nextStatus}</strong> →
                          </>
                        )}
                      </button>
                    )}

                    {item.status === "LIVE" && (
                      <div className="flex items-center justify-center gap-2 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold text-sm">
                        {/* <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> */}
                        Billboard is LIVE
                      </div>
                    )}
                  </div>
                </div>
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}
