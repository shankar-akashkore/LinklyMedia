// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { PlusIcon, PencilSimpleIcon, TrashIcon, ToggleRightIcon, ToggleLeftIcon } from "@phosphor-icons/react";

// const STATUS_STYLES = {
//   active:   "bg-emerald-50 text-emerald-600 border-emerald-200",
//   inactive: "bg-gray-100 text-gray-500 border-gray-200",
//   pending:  "bg-amber-50 text-amber-600 border-amber-200",
// };

// export default function PartnerBillboards() {
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError]     = useState(null);
//   const navigate = useNavigate();

//   const load = () => {
//     setLoading(true);
//     fetch("/api/partner/listings", { credentials: "include" })
//       .then((r) => { if (!r.ok) throw new Error("Failed to load listings"); return r.json(); })
//       .then((d) => setListings(Array.isArray(d) ? d : d.listings ?? []))
//       .catch((e) => setError(e.message))
//       .finally(() => setLoading(false));
//   };

//   useEffect(load, []);

//   const handleToggle = async (id) => {
//     await fetch(`/api/partner/billboard/${id}/toggle`, {
//       method: "PATCH",
//       credentials: "include",
//     });
//     load();
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this billboard?")) return;
//     await fetch(`/api/partner/billboard/${id}`, { method: "DELETE", credentials: "include" });
//     load();
//   };

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-lg font-bold text-gray-800">Billboards</h2>
//           <p className="text-sm text-gray-400">Manage your billboard listings</p>
//         </div>
//         <button
//           onClick={() => navigate("/partner/billboards/new")}
//           className="flex items-center gap-1.5 px-3 py-1.5 bg-[#507c88] text-white rounded-lg text-sm hover:bg-[#3d6370] transition"
//         >
//           <PlusIcon size={15} weight="bold" />
//           Add Billboard
//         </button>
//       </div>

//       {error && <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4">{error}</div>}

//       {loading ? (
//         <div className="space-y-3">
//           {[...Array(4)].map((_, i) => (
//             <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
//           ))}
//         </div>
//       ) : listings.length === 0 ? (
//         <div className="text-center py-16 text-gray-400">
//           <p className="text-4xl mb-3">🪧</p>
//           <p className="font-medium">No billboards yet</p>
//           <p className="text-sm mt-1">Add your first billboard to start receiving bookings.</p>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {listings.map((b) => (
//             <div key={b._id} className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
//               {/* Thumbnail */}
//               {b.images?.[0] ? (
//                 <img src={b.images[0]} alt={b.title} className="w-16 h-12 object-cover rounded-lg shrink-0" />
//               ) : (
//                 <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">🪧</div>
//               )}

//               {/* Info */}
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-semibold text-gray-800 truncate">{b.title ?? b.name ?? "Untitled"}</p>
//                 <p className="text-xs text-gray-400 truncate">{b.location ?? b.address ?? "—"}</p>
//                 <p className="text-xs text-gray-500 mt-0.5">₹{Number(b.price ?? 0).toLocaleString()} / day</p>
//               </div>

//               {/* Status badge */}
//               <span className={`px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${STATUS_STYLES[b.status] ?? STATUS_STYLES.inactive}`}>
//                 {b.status ?? "inactive"}
//               </span>

//               {/* Actions */}
//               <div className="flex items-center gap-2 shrink-0">
//                 <button
//                   onClick={() => handleToggle(b._id)}
//                   className="p-1.5 text-gray-400 hover:text-[#507c88] transition"
//                   title="Toggle status"
//                 >
//                   {b.status === "active"
//                     ? <ToggleRightIcon size={20} weight="fill" className="text-emerald-500" />
//                     : <ToggleLeftIcon size={20} />
//                   }
//                 </button>
//                 <button
//                   onClick={() => navigate(`/partner/billboards/${b._id}/edit`)}
//                   className="p-1.5 text-gray-400 hover:text-[#507c88] transition"
//                 >
//                   <PencilSimpleIcon size={16} />
//                 </button>
//                 <button
//                   onClick={() => handleDelete(b._id)}
//                   className="p-1.5 text-gray-400 hover:text-red-500 transition"
//                 >
//                   <TrashIcon size={16} />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }








// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { PlusIcon, PencilSimpleIcon, TrashIcon, ToggleRightIcon, ToggleLeftIcon } from "@phosphor-icons/react";

// const STATUS_STYLES = {
//   active:   "bg-emerald-50 text-emerald-600 border-emerald-200",
//   inactive: "bg-gray-100 text-gray-500 border-gray-200",
//   pending:  "bg-amber-50 text-amber-600 border-amber-200",
// };

// export default function PartnerBillboards() {
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [error, setError]       = useState(null);
//   const navigate = useNavigate();

//   const token   = localStorage.getItem("token");
//   const headers = { Authorization: `Bearer ${token}` };

//   const load = () => {
//     setLoading(true);
//     fetch("/api/partner/listings", { headers })
//       .then((r) => { if (!r.ok) throw new Error("Failed to load listings"); return r.json(); })
//       .then((d) => setListings(Array.isArray(d) ? d : d.listings ?? []))
//       .catch((e) => setError(e.message))
//       .finally(() => setLoading(false));
//   };

//   useEffect(load, []);

//   const handleToggle = async (id) => {
//     await fetch(`/api/partner/billboard/${id}/toggle`, { method: "PATCH", headers });
//     load();
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this billboard?")) return;
//     await fetch(`/api/partner/billboard/${id}`, { method: "DELETE", headers });
//     load();
//   };

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-lg font-bold text-gray-800">Billboards</h2>
//           <p className="text-sm text-gray-400">Manage your billboard listings</p>
//         </div>
//         <button
//           onClick={() => navigate("/partner/billboards/new")}
//           className="flex items-center gap-1.5 px-3 py-1.5 bg-[#507c88] text-white rounded-lg text-sm hover:bg-[#3d6370] transition"
//         >
//           <PlusIcon size={15} weight="bold" /> Add Billboard
//         </button>
//       </div>

//       {error && <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4">{error}</div>}

//       {loading ? (
//         <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
//       ) : listings.length === 0 ? (
//         <div className="text-center py-16 text-gray-400">
//           <p className="text-4xl mb-3">🪧</p>
//           <p className="font-medium">No billboards yet</p>
//           <p className="text-sm mt-1">Add your first billboard to start receiving bookings.</p>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {listings.map((b) => (
//             <div key={b._id} className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
//               {b.images?.[0] ? (
//                 <img src={b.images[0]} alt={b.title} className="w-16 h-12 object-cover rounded-lg shrink-0" />
//               ) : (
//                 <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">🪧</div>
//               )}
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-semibold text-gray-800 truncate">{b.title ?? b.name ?? "Untitled"}</p>
//                 <p className="text-xs text-gray-400 truncate">{b.location ?? b.address ?? "—"}</p>
//                 <p className="text-xs text-gray-500 mt-0.5">₹{Number(b.price ?? 0).toLocaleString()} / day</p>
//               </div>
//               <span className={`px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${STATUS_STYLES[b.status] ?? STATUS_STYLES.inactive}`}>
//                 {b.status ?? "inactive"}
//               </span>
//               <div className="flex items-center gap-2 shrink-0">
//                 <button onClick={() => handleToggle(b._id)} className="p-1.5 text-gray-400 hover:text-[#507c88] transition" title="Toggle status">
//                   {b.status === "active"
//                     ? <ToggleRightIcon size={20} weight="fill" className="text-emerald-500" />
//                     : <ToggleLeftIcon size={20} />}
//                 </button>
//                 <button onClick={() => navigate(`/partner/billboards/${b._id}/edit`)} className="p-1.5 text-gray-400 hover:text-[#507c88] transition">
//                   <PencilSimpleIcon size={16} />
//                 </button>
//                 <button onClick={() => handleDelete(b._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition">
//                   <TrashIcon size={16} />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }







// import React, { useEffect, useState } from "react";
// import { TrashIcon, ToggleRightIcon, ToggleLeftIcon } from "@phosphor-icons/react";

// const STATUS_STYLES = {
//   active:   "bg-emerald-50 text-emerald-600 border-emerald-200",
//   inactive: "bg-gray-100   text-gray-500   border-gray-200",
//   pending:  "bg-amber-50   text-amber-600  border-amber-200",
// };

// export default function PartnerBillboards() {
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [error, setError]       = useState(null);

//   const token   = localStorage.getItem("token");
//   const headers = { Authorization: `Bearer ${token}` };

//   const load = () => {
//     setLoading(true);
//     setError(null);
//     fetch("/api/partner/listings", { headers })
//       .then((r) => { if (!r.ok) throw new Error("Failed to load listings"); return r.json(); })
//       .then((d) => {
//         // Handle all possible response shapes from Go backend
//         const list = Array.isArray(d)
//           ? d
//           : d.listings ?? d.billboards ?? d.data ?? [];
//         setListings(list);
//       })
//       .catch((e) => setError(e.message))
//       .finally(() => setLoading(false));
//   };

//   useEffect(load, []);

//   const handleToggle = async (id) => {
//     await fetch(`/api/partner/billboard/${id}/toggle`, { method: "PATCH", headers });
//     load();
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this billboard?")) return;
//     await fetch(`/api/partner/billboard/${id}`, { method: "DELETE", headers });
//     load();
//   };

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="mb-6">
//         <h2 className="text-lg font-bold text-gray-800">Billboards</h2>
//         <p className="text-sm text-gray-400">All your billboard listings</p>
//       </div>

//       {error && (
//         <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">{error}</div>
//       )}

//       {/* Loading skeletons */}
//       {loading && (
//         <div className="space-y-3">
//           {[...Array(4)].map((_, i) => (
//             <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
//           ))}
//         </div>
//       )}

//       {/* Empty state */}
//       {!loading && listings.length === 0 && (
//         <div className="text-center py-20 text-gray-400">
//           <p className="text-5xl mb-4">🪧</p>
//           <p className="font-semibold text-gray-600">No billboards yet</p>
//           <p className="text-sm mt-1">Your listings will appear here once added.</p>
//         </div>
//       )}

//       {/* Billboard list */}
//       {!loading && listings.length > 0 && (
//         <div className="space-y-3">
//           {listings.map((b) => (
//             <div
//               key={b._id ?? b.id}
//               className="flex items-center gap-4 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow bg-white"
//             >
//               {/* Thumbnail */}
//               {b.images?.[0] ? (
//                 <img
//                   src={b.images[0]}
//                   alt={b.title ?? "Billboard"}
//                   className="w-20 h-14 object-cover rounded-lg shrink-0 border border-gray-100"
//                 />
//               ) : (
//                 <div className="w-20 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-3xl shrink-0">
//                   🪧
//                 </div>
//               )}

//               {/* Info */}
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-semibold text-gray-800 truncate">
//                   {b.title ?? b.name ?? "Untitled Billboard"}
//                 </p>
//                 <p className="text-xs text-gray-400 truncate mt-0.5">
//                   {b.location ?? b.address ?? b.city ?? "—"}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   ₹{Number(b.price ?? b.priceperday ?? 0).toLocaleString()} / day
//                 </p>
//               </div>

//               {/* Status badge */}
//               <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium capitalize shrink-0 ${STATUS_STYLES[b.status?.toLowerCase()] ?? STATUS_STYLES.inactive}`}>
//                 {b.status ?? "inactive"}
//               </span>

//               {/* Actions */}
//               <div className="flex items-center gap-1 shrink-0">
//                 {/* Toggle active/inactive */}
//                 <button
//                   onClick={() => handleToggle(b._id ?? b.id)}
//                   title={b.status === "active" ? "Deactivate" : "Activate"}
//                   className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition"
//                 >
//                   {b.status?.toLowerCase() === "active"
//                     ? <ToggleRightIcon size={22} weight="fill" className="text-emerald-500" />
//                     : <ToggleLeftIcon  size={22} className="text-gray-400" />
//                   }
//                 </button>

//                 {/* Delete */}
//                 <button
//                   onClick={() => handleDelete(b._id ?? b.id)}
//                   title="Delete billboard"
//                   className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
//                 >
//                   <TrashIcon size={17} />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }










// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { PlusIcon, TrashIcon, ToggleRightIcon, ToggleLeftIcon } from "@phosphor-icons/react";

// const STATUS_STYLES = {
//   active:   "bg-emerald-50 text-emerald-600 border-emerald-200",
//   inactive: "bg-gray-100   text-gray-500   border-gray-200",
//   pending:  "bg-amber-50   text-amber-600  border-amber-200",
// };

// export default function PartnerBillboards() {
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [error, setError]       = useState(null);
//   const navigate = useNavigate();

//   const token   = localStorage.getItem("token");
//   const headers = { Authorization: `Bearer ${token}` };

//   const load = () => {
//     setLoading(true);
//     setError(null);
//     fetch("/api/partner/listings", { headers })
//       .then((r) => { if (!r.ok) throw new Error("Failed to load listings"); return r.json(); })
//       .then((d) => {
//         // Response shape: { data: [...] | null, pagination: {}, success: true }
//         const list = Array.isArray(d)
//           ? d
//           : Array.isArray(d.data)
//             ? d.data
//             : d.listings ?? d.billboards ?? [];
//         setListings(list);
//       })
//       .catch((e) => setError(e.message))
//       .finally(() => setLoading(false));
//   };

//   useEffect(load, []);

//   const handleToggle = async (id) => {
//     await fetch(`/api/partner/billboard/${id}/toggle`, { method: "PATCH", headers });
//     load();
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this billboard?")) return;
//     await fetch(`/api/partner/billboard/${id}`, { method: "DELETE", headers });
//     load();
//   };

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-lg font-bold text-gray-800">Billboards</h2>
//           <p className="text-sm text-gray-400">All your billboard listings</p>
//         </div>
//         <button
//           onClick={() => navigate("/partner/billboards/new")}
//           className="flex items-center gap-1.5 px-4 py-2 bg-[#507c88] text-white rounded-lg text-sm font-medium hover:bg-[#3d6370] transition"
//         >
//           <PlusIcon size={15} weight="bold" />
//           Add Billboard
//         </button>
//       </div>

//       {error && (
//         <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">{error}</div>
//       )}

//       {/* Loading skeletons */}
//       {loading && (
//         <div className="space-y-3">
//           {[...Array(4)].map((_, i) => (
//             <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
//           ))}
//         </div>
//       )}

//       {/* Empty state */}
//       {!loading && listings.length === 0 && (
//         <div className="text-center py-20 text-gray-400">
//           <p className="text-5xl mb-4">🪧</p>
//           <p className="font-semibold text-gray-600">No billboards yet</p>
//           <p className="text-sm mt-1">Click "Add Billboard" to create your first listing.</p>
//         </div>
//       )}

//       {/* Billboard list */}
//       {!loading && listings.length > 0 && (
//         <div className="space-y-3">
//           {listings.map((b) => (
//             <div
//               key={b._id ?? b.id}
//               className="flex items-center gap-4 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow bg-white"
//             >
//               {/* Thumbnail */}
//               {b.images?.[0] ? (
//                 <img
//                   src={b.images[0]}
//                   alt={b.title ?? "Billboard"}
//                   className="w-20 h-14 object-cover rounded-lg shrink-0 border border-gray-100"
//                 />
//               ) : (
//                 <div className="w-20 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-3xl shrink-0">
//                   🪧
//                 </div>
//               )}

//               {/* Info */}
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-semibold text-gray-800 truncate">
//                   {b.title ?? b.name ?? "Untitled Billboard"}
//                 </p>
//                 <p className="text-xs text-gray-400 truncate mt-0.5">
//                   {b.location ?? b.address ?? b.city ?? "—"}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   ₹{Number(b.price ?? b.priceperday ?? 0).toLocaleString()} / day
//                 </p>
//               </div>

//               {/* Status badge */}
//               <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium capitalize shrink-0 ${STATUS_STYLES[b.status?.toLowerCase()] ?? STATUS_STYLES.inactive}`}>
//                 {b.status ?? "inactive"}
//               </span>

//               {/* Actions */}
//               <div className="flex items-center gap-1 shrink-0">
//                 <button
//                   onClick={() => handleToggle(b._id ?? b.id)}
//                   title={b.status === "active" ? "Deactivate" : "Activate"}
//                   className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition"
//                 >
//                   {b.status?.toLowerCase() === "active"
//                     ? <ToggleRightIcon size={22} weight="fill" className="text-emerald-500" />
//                     : <ToggleLeftIcon  size={22} />
//                   }
//                 </button>
//                 <button
//                   onClick={() => handleDelete(b._id ?? b.id)}
//                   title="Delete billboard"
//                   className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
//                 >
//                   <TrashIcon size={17} />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }










// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { PlusIcon, TrashIcon, ToggleRightIcon, ToggleLeftIcon } from "@phosphor-icons/react";

// export default function PartnerBillboards() {
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [error, setError]       = useState(null);
//   const navigate = useNavigate();

//   const token   = localStorage.getItem("token");
//   const headers = { Authorization: `Bearer ${token}` };

//   const load = () => {
//     setLoading(true);
//     setError(null);
//     fetch("/api/partner/listings", { headers })
//       .then((r) => { if (!r.ok) throw new Error("Failed to load listings"); return r.json(); })
//       .then((d) => {
//         const list = Array.isArray(d) ? d : Array.isArray(d.data) ? d.data : [];
//         setListings(list);
//       })
//       .catch((e) => setError(e.message))
//       .finally(() => setLoading(false));
//   };

//   useEffect(load, []);

//   const handleToggle = async (id) => {
//     await fetch(`/api/partner/billboard/${id}/toggle`, { method: "PATCH", headers });
//     load();
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this billboard?")) return;
//     await fetch(`/api/partner/billboard/${id}`, { method: "DELETE", headers });
//     load();
//   };

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-lg font-bold text-gray-800">Billboards</h2>
//           <p className="text-sm text-gray-400">All your billboard listings</p>
//         </div>
//         <button
//           onClick={() => navigate("/partner/billboards/new")}
//           className="flex items-center gap-1.5 px-4 py-2 bg-[#507c88] text-white rounded-lg text-sm font-medium hover:bg-[#3d6370] transition"
//         >
//           <PlusIcon size={15} weight="bold" />
//           Add Billboard
//         </button>
//       </div>

//       {error && (
//         <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">{error}</div>
//       )}

//       {loading && (
//         <div className="space-y-3">
//           {[...Array(4)].map((_, i) => (
//             <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
//           ))}
//         </div>
//       )}

//       {!loading && listings.length === 0 && (
//         <div className="text-center py-20 text-gray-400">
//           <p className="text-5xl mb-4">🪧</p>
//           <p className="font-semibold text-gray-600">No billboards yet</p>
//           <p className="text-sm mt-1">Click "Add Billboard" to create your first listing.</p>
//         </div>
//       )}

//       {!loading && listings.length > 0 && (
//         <div className="space-y-3">
//           {listings.map((b) => {
//             const isActive = b.isActive === true || b.status === "active";
//             return (
//               <div
//                 key={b.id ?? b._id}
//                 className="flex items-center gap-4 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow bg-white"
//               >
//                 {/* Thumbnail — field is "thumbnail" from API */}
//                 {b.thumbnail ? (
//                   <img
//                     src={b.thumbnail}
//                     alt={b.title ?? "Billboard"}
//                     className="w-20 h-14 object-cover rounded-lg shrink-0 border border-gray-100"
//                   />
//                 ) : (
//                   <div className="w-20 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-3xl shrink-0">
//                     🪧
//                   </div>
//                 )}

//                 {/* Info */}
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-gray-800 truncate">
//                     {b.title ?? "Untitled Billboard"}
//                   </p>
//                   <p className="text-xs text-gray-400 truncate mt-0.5">
//                     {b.city ?? b.location ?? "—"}
//                   </p>
//                   <p className="text-xs text-gray-500 mt-1">
//                     ₹{Number(b.price ?? 0).toLocaleString()} / day
//                   </p>
//                 </div>

//                 {/* Status badge — derived from isActive boolean */}
//                 <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium shrink-0 ${
//                   isActive
//                     ? "bg-emerald-50 text-emerald-600 border-emerald-200"
//                     : "bg-gray-100 text-gray-500 border-gray-200"
//                 }`}>
//                   {isActive ? "Active" : "Inactive"}
//                 </span>

//                 {/* Actions */}
//                 <div className="flex items-center gap-1 shrink-0">
//                   <button
//                     onClick={() => handleToggle(b.id ?? b._id)}
//                     title={isActive ? "Deactivate" : "Activate"}
//                     className="p-2 rounded-lg hover:bg-gray-50 transition"
//                   >
//                     {isActive
//                       ? <ToggleRightIcon size={22} weight="fill" className="text-emerald-500" />
//                       : <ToggleLeftIcon  size={22} className="text-gray-400" />
//                     }
//                   </button>
//                   <button
//                     onClick={() => handleDelete(b.id ?? b._id)}
//                     title="Delete billboard"
//                     className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
//                   >
//                     <TrashIcon size={17} />
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }












// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { PlusIcon, TrashIcon, ToggleRightIcon, ToggleLeftIcon } from "@phosphor-icons/react";

// export default function PartnerBillboards() {
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [error, setError]       = useState(null);
//   const navigate = useNavigate();

//   const token   = localStorage.getItem("token");
//   const headers = { Authorization: `Bearer ${token}` };

//   const load = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // Step 1: fetch page 1 to get totalPages
//       const r1   = await fetch("/api/partner/listings?page=1&limit=50", { headers });
//       if (!r1.ok) throw new Error("Failed to load listings");
//       const d1   = await r1.json();
//       const firstPage   = Array.isArray(d1.data) ? d1.data : [];
//       const totalPages  = d1.pagination?.totalPages ?? 1;

//       if (totalPages <= 1) {
//         setListings(firstPage);
//         return;
//       }

//       // Step 2: fetch remaining pages in parallel
//       const pagePromises = [];
//       for (let p = 2; p <= totalPages; p++) {
//         pagePromises.push(
//           fetch(`/api/partner/listings?page=${p}&limit=50`, { headers })
//             .then((r) => r.json())
//             .then((d) => Array.isArray(d.data) ? d.data : [])
//         );
//       }
//       const rest = await Promise.all(pagePromises);
//       setListings([...firstPage, ...rest.flat()]);
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, []);

//   const handleToggle = async (id) => {
//     await fetch(`/api/partner/billboard/${id}/toggle`, { method: "PATCH", headers });
//     load();
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this billboard?")) return;
//     await fetch(`/api/partner/billboard/${id}`, { method: "DELETE", headers });
//     load();
//   };

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-lg font-bold text-gray-800">Billboards</h2>
//           <p className="text-sm text-gray-400">
//             {listings.length > 0 ? `${listings.length} listings` : "All your billboard listings"}
//           </p>
//         </div>
//         <button
//           onClick={() => navigate("/partner/billboards/new")}
//           className="flex items-center gap-1.5 px-4 py-2 bg-[#507c88] text-white rounded-lg text-sm font-medium hover:bg-[#3d6370] transition"
//         >
//           <PlusIcon size={15} weight="bold" />
//           Add Billboard
//         </button>
//       </div>

//       {error && (
//         <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">{error}</div>
//       )}

//       {loading && (
//         <div className="space-y-3">
//           {[...Array(5)].map((_, i) => (
//             <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
//           ))}
//         </div>
//       )}

//       {!loading && listings.length === 0 && (
//         <div className="text-center py-20 text-gray-400">
//           <p className="text-5xl mb-4">🪧</p>
//           <p className="font-semibold text-gray-600">No billboards yet</p>
//           <p className="text-sm mt-1">Click "Add Billboard" to create your first listing.</p>
//         </div>
//       )}

//       {!loading && listings.length > 0 && (
//         <div className="space-y-3">
//           {listings.map((b) => {
//             const isActive = b.isActive === true || b.status === "active";
//             return (
//               <div
//                 key={b.id ?? b._id}
//                 className="flex items-center gap-4 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow bg-white"
//               >
//                 {b.thumbnail ? (
//                   <img
//                     src={b.thumbnail}
//                     alt={b.title ?? "Billboard"}
//                     className="w-20 h-14 object-cover rounded-lg shrink-0 border border-gray-100"
//                   />
//                 ) : (
//                   <div className="w-20 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-3xl shrink-0">🪧</div>
//                 )}

//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-gray-800 truncate">{b.title ?? "Untitled Billboard"}</p>
//                   <p className="text-xs text-gray-400 truncate mt-0.5">{b.city ?? b.location ?? "—"}</p>
//                   <p className="text-xs text-gray-500 mt-1">₹{Number(b.price ?? 0).toLocaleString()} / day</p>
//                 </div>

//                 <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium shrink-0 ${
//                   isActive
//                     ? "bg-emerald-50 text-emerald-600 border-emerald-200"
//                     : "bg-gray-100 text-gray-500 border-gray-200"
//                 }`}>
//                   {isActive ? "Active" : "Inactive"}
//                 </span>

//                 <div className="flex items-center gap-1 shrink-0">
//                   <button
//                     onClick={() => handleToggle(b.billboardid)}
//                     title={isActive ? "Deactivate" : "Activate"}
//                     className="p-2 rounded-lg hover:bg-gray-50 transition"
//                   >
//                     {isActive
//                       ? <ToggleRightIcon size={22} weight="fill" className="text-emerald-500" />
//                       : <ToggleLeftIcon  size={22} className="text-gray-400" />
//                     }
//                   </button>
//                   <button
//                     onClick={() => handleDelete(b.id ?? b._id)}
//                     title="Delete billboard"
//                     className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
//                   >
//                     <TrashIcon size={17} />
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }












// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { PlusIcon, TrashIcon, ToggleRightIcon, ToggleLeftIcon } from "@phosphor-icons/react";

// export default function PartnerBillboards() {
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [error, setError]       = useState(null);
//   const navigate = useNavigate();

//   const token   = localStorage.getItem("token");
//   const headers = { Authorization: `Bearer ${token}` };

//   // Normalize a raw billboard doc from the API into a consistent shape
//   const normalize = (b) => {
//     // Image: try thumbnail string first, then images array
//     let image = b.thumbnail ?? null;
//     if (!image && Array.isArray(b.images) && b.images.length > 0) {
//       const primary = b.images.find((img) => img.isprimary) ?? b.images[0];
//       image = primary?.url ?? null;
//     }

//     return {
//       id:       b.billboardid ?? b.id ?? b._id ?? b.ID,   // use billboardid string for toggle
//       title:    b.billboardtitle ?? b.title ?? "Untitled",
//       city:     b.city ?? b.location ?? "—",
//       price:    b.price ?? 0,
//       image,
//       isActive: b.isActive ?? b.isactive ?? false,         // handle both casings
//     };
//   };

//   const load = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const r1 = await fetch("/api/partner/listings?page=1&limit=50", { headers });
//       if (!r1.ok) throw new Error("Failed to load listings");
//       const d1 = await r1.json();
//       const firstPage  = Array.isArray(d1.data) ? d1.data.map(normalize) : [];
//       const totalPages = d1.pagination?.totalPages ?? 1;

//       if (totalPages <= 1) { setListings(firstPage); return; }

//       const rest = await Promise.all(
//         Array.from({ length: totalPages - 1 }, (_, i) =>
//           fetch(`/api/partner/listings?page=${i + 2}&limit=50`, { headers })
//             .then((r) => r.json())
//             .then((d) => Array.isArray(d.data) ? d.data.map(normalize) : [])
//         )
//       );
//       setListings([...firstPage, ...rest.flat()]);
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, []);

//   const handleToggle = async (id) => {
//     // Optimistic update
//     setListings((prev) =>
//       prev.map((b) => b.id === id ? { ...b, isActive: !b.isActive } : b)
//     );
//     const r = await fetch(`/api/partner/billboard/${id}/toggle`, { method: "PATCH", headers });
//     if (r.ok) {
//       const data = await r.json();
//       // data.isActive is the server truth
//       setListings((prev) =>
//         prev.map((b) => b.id === id ? { ...b, isActive: data.isActive } : b)
//       );
//     } else {
//       load(); // revert on failure
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this billboard?")) return;
//     await fetch(`/api/partner/billboard/${id}`, { method: "DELETE", headers });
//     load();
//   };

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-lg font-bold text-gray-800">Billboards</h2>
//           <p className="text-sm text-gray-400">
//             {listings.length > 0 ? `${listings.length} listings` : "All your billboard listings"}
//           </p>
//         </div>
//         <button
//           onClick={() => navigate("/partner/billboards/new")}
//           className="flex items-center gap-1.5 px-4 py-2 bg-[#507c88] text-white rounded-lg text-sm font-medium hover:bg-[#3d6370] transition"
//         >
//           <PlusIcon size={15} weight="bold" /> Add Billboard
//         </button>
//       </div>

//       {error && (
//         <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">{error}</div>
//       )}

//       {loading && (
//         <div className="space-y-3">
//           {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
//         </div>
//       )}

//       {!loading && listings.length === 0 && (
//         <div className="text-center py-20 text-gray-400">
//           <p className="text-5xl mb-4">🪧</p>
//           <p className="font-semibold text-gray-600">No billboards yet</p>
//           <p className="text-sm mt-1">Click "Add Billboard" to create your first listing.</p>
//         </div>
//       )}

//       {!loading && listings.length > 0 && (
//         <div className="space-y-3">
//           {listings.map((b) => (
//             <div
//               key={b.id}
//               className="flex items-center gap-4 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow bg-white"
//             >
//               {/* Thumbnail */}
//               {b.image ? (
//                 <img
//                   src={b.image}
//                   alt={b.title}
//                   className="w-20 h-14 object-cover rounded-lg shrink-0 border border-gray-100"
//                 />
//               ) : (
//                 <div className="w-20 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-3xl shrink-0">🪧</div>
//               )}

//               {/* Info */}
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-semibold text-gray-800 truncate">{b.title}</p>
//                 <p className="text-xs text-gray-400 truncate mt-0.5">{b.city}</p>
//                 <p className="text-xs text-gray-500 mt-1">₹{Number(b.price).toLocaleString()} / day</p>
//               </div>

//               {/* Status badge */}
//               <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium shrink-0 ${
//                 b.isActive
//                   ? "bg-emerald-50 text-emerald-600 border-emerald-200"
//                   : "bg-gray-100 text-gray-500 border-gray-200"
//               }`}>
//                 {b.isActive ? "Active" : "Inactive"}
//               </span>

//               {/* Actions */}
//               <div className="flex items-center gap-1 shrink-0">
//                 <button
//                   onClick={() => handleToggle(b.id)}
//                   title={b.isActive ? "Deactivate" : "Activate"}
//                   className="p-2 rounded-lg hover:bg-gray-50 transition"
//                 >
//                   {b.isActive
//                     ? <ToggleRightIcon size={22} weight="fill" className="text-emerald-500" />
//                     : <ToggleLeftIcon  size={22} className="text-gray-400" />
//                   }
//                 </button>
//                 <button
//                   onClick={() => handleDelete(b.id)}
//                   title="Delete billboard"
//                   className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
//                 >
//                   <TrashIcon size={17} />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }






// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { PlusIcon, TrashIcon, ToggleRightIcon, ToggleLeftIcon } from "@phosphor-icons/react";

// export default function PartnerBillboards() {
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [error, setError]       = useState(null);
//   const navigate = useNavigate();

//   const token   = localStorage.getItem("token");
//   const headers = { Authorization: `Bearer ${token}` };

//   // Normalize a raw billboard doc from the API into a consistent shape
//   const normalize = (b) => {
//     // Image: try thumbnail string first, then images array
//     let image = b.thumbnail ?? null;
//     if (!image && Array.isArray(b.images) && b.images.length > 0) {
//       const primary = b.images.find((img) => img.isprimary) ?? b.images[0];
//       image = primary?.url ?? null;
//     }

//     return {
//       id:       b.billboardid ?? b.id ?? b._id ?? b.ID,   // billboardid string for toggle/delete
//       mongoId:  b.ID ?? b._id,                             // MongoDB _id for detail page
//       title:    b.billboardtitle ?? b.title ?? "Untitled",
//       city:     b.city ?? b.location ?? "—",
//       price:    b.price ?? 0,
//       image,
//       isActive: b.isActive ?? b.isactive ?? false,
//     };
//   };

//   const load = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const r1 = await fetch("/api/partner/listings?page=1&limit=50", { headers });
//       if (!r1.ok) throw new Error("Failed to load listings");
//       const d1 = await r1.json();
//       const firstPage  = Array.isArray(d1.data) ? d1.data.map(normalize) : [];
//       const totalPages = d1.pagination?.totalPages ?? 1;

//       if (totalPages <= 1) { setListings(firstPage); return; }

//       const rest = await Promise.all(
//         Array.from({ length: totalPages - 1 }, (_, i) =>
//           fetch(`/api/partner/listings?page=${i + 2}&limit=50`, { headers })
//             .then((r) => r.json())
//             .then((d) => Array.isArray(d.data) ? d.data.map(normalize) : [])
//         )
//       );
//       setListings([...firstPage, ...rest.flat()]);
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, []);

//   const handleToggle = async (id) => {
//     // Optimistic update
//     setListings((prev) =>
//       prev.map((b) => b.id === id ? { ...b, isActive: !b.isActive } : b)
//     );
//     const r = await fetch(`/api/partner/billboard/${id}/toggle`, { method: "PATCH", headers });
//     if (r.ok) {
//       const data = await r.json();
//       // data.isActive is the server truth
//       setListings((prev) =>
//         prev.map((b) => b.id === id ? { ...b, isActive: data.isActive } : b)
//       );
//     } else {
//       load(); // revert on failure
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this billboard?")) return;
//     await fetch(`/api/partner/billboard/${id}`, { method: "DELETE", headers });
//     load();
//   };

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-lg font-bold text-gray-800">Billboards</h2>
//           <p className="text-sm text-gray-400">
//             {listings.length > 0 ? `${listings.length} listings` : "All your billboard listings"}
//           </p>
//         </div>
//         <button
//           onClick={() => navigate("/partner/billboards/new")}
//           className="flex items-center gap-1.5 px-4 py-2 bg-[#507c88] text-white rounded-lg text-sm font-medium hover:bg-[#3d6370] transition"
//         >
//           <PlusIcon size={15} weight="bold" /> Add Billboard
//         </button>
//       </div>

//       {error && (
//         <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">{error}</div>
//       )}

//       {loading && (
//         <div className="space-y-3">
//           {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
//         </div>
//       )}

//       {!loading && listings.length === 0 && (
//         <div className="text-center py-20 text-gray-400">
//           <p className="text-5xl mb-4">🪧</p>
//           <p className="font-semibold text-gray-600">No billboards yet</p>
//           <p className="text-sm mt-1">Click "Add Billboard" to create your first listing.</p>
//         </div>
//       )}

//       {!loading && listings.length > 0 && (
//         <div className="space-y-3">
//           {listings.map((b) => (
//             <div
//               key={b.id}
//               className="flex items-center gap-4 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow bg-white"
//             >
//               {/* Thumbnail */}
//               {b.image ? (
//                 <img
//                   src={b.image}
//                   alt={b.title}
//                   className="w-20 h-14 object-cover rounded-lg shrink-0 border border-gray-100"
//                 />
//               ) : (
//                 <div className="w-20 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-3xl shrink-0">🪧</div>
//               )}

//               {/* Info */}
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-semibold text-gray-800 truncate">{b.title}</p>
//                 <p className="text-xs text-gray-400 truncate mt-0.5">{b.city}</p>
//                 <p className="text-xs text-gray-500 mt-1">₹{Number(b.price).toLocaleString()} / day</p>
//               </div>

//               {/* Status badge */}
//               <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium shrink-0 ${
//                 b.isActive
//                   ? "bg-emerald-50 text-emerald-600 border-emerald-200"
//                   : "bg-gray-100 text-gray-500 border-gray-200"
//               }`}>
//                 {b.isActive ? "Active" : "Inactive"}
//               </span>

//               {/* Actions */}
//               <div className="flex items-center gap-1 shrink-0">
//                 <button
//                   onClick={() => handleToggle(b.id)}
//                   title={b.isActive ? "Deactivate" : "Activate"}
//                   className="p-2 rounded-lg hover:bg-gray-50 transition"
//                 >
//                   {b.isActive
//                     ? <ToggleRightIcon size={22} weight="fill" className="text-emerald-500" />
//                     : <ToggleLeftIcon  size={22} className="text-gray-400" />
//                   }
//                 </button>
//                 <button
//                   onClick={() => handleDelete(b.id)}
//                   title="Delete billboard"
//                   className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
//                 >
//                   <TrashIcon size={17} />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }








import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, TrashIcon, ToggleRightIcon, ToggleLeftIcon } from "@phosphor-icons/react";

export default function PartnerBillboards() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const navigate = useNavigate();

  const token   = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const normalize = (b) => {
    let image = b.thumbnail ?? null;
    if (!image && Array.isArray(b.images) && b.images.length > 0) {
      const primary = b.images.find((img) => img.isprimary) ?? b.images[0];
      image = primary?.url ?? null;
    }
    return {
      id:       b.billboardid ?? b.id ?? b.ID,   // for toggle/delete
      mongoId:  b.ID ?? b.id,                    // MongoDB _id string for detail page
      title:    b.billboardtitle ?? b.title ?? "Untitled",
      city:     b.city ?? "—",
      price:    b.price ?? 0,
      image,
      isActive: b.isActive ?? b.isactive ?? false,
    };
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r1 = await fetch("/api/partner/listings?page=1&limit=50", { headers });
      if (!r1.ok) throw new Error("Failed to load listings");
      const d1 = await r1.json();
      const firstPage  = Array.isArray(d1.data) ? d1.data.map(normalize) : [];
      const totalPages = d1.pagination?.totalPages ?? 1;

      if (totalPages <= 1) { setListings(firstPage); return; }

      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          fetch("/api/partner/listings?page=" + (i + 2) + "&limit=50", { headers })
            .then((r) => r.json())
            .then((d) => Array.isArray(d.data) ? d.data.map(normalize) : [])
        )
      );
      setListings([...firstPage, ...rest.flat()]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    setListings((prev) => prev.map((b) => b.id === id ? { ...b, isActive: !b.isActive } : b));
    const r = await fetch("/api/partner/billboard/" + id + "/toggle", { method: "PATCH", headers });
    if (r.ok) {
      const data = await r.json();
      setListings((prev) => prev.map((b) => b.id === id ? { ...b, isActive: data.isActive } : b));
    } else {
      load();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this billboard?")) return;
    await fetch("/api/partner/billboard/" + id, { method: "DELETE", headers });
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Billboards</h2>
          <p className="text-sm text-gray-400">
            {listings.length > 0 ? listings.length + " listings" : "All your billboard listings"}
          </p>
        </div>
        <button
          onClick={() => navigate("/partner/billboards/new")}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#507c88] text-white rounded-lg text-sm font-medium hover:bg-[#3d6370] transition"
        >
          <PlusIcon size={15} weight="bold" /> Add Billboard
        </button>
      </div>

      {error && <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">{error}</div>}

      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      )}

      {!loading && listings.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🪧</p>
          <p className="font-semibold text-gray-600">No billboards yet</p>
          <p className="text-sm mt-1">Click "Add Billboard" to create your first listing.</p>
        </div>
      )}

      {!loading && listings.length > 0 && (
        <div className="space-y-3">
          {listings.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-4 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow bg-white"
            >
              {/* Thumbnail — click to open detail */}
              <div
                className="w-20 h-14 shrink-0 cursor-pointer"
                onClick={() => navigate("/partner/billboards/" + b.mongoId)}
              >
                {b.image ? (
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover rounded-lg border border-gray-100" />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-3xl">🪧</div>
                )}
              </div>

              {/* Info — click to open detail */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate("/partner/billboards/" + b.mongoId)}
              >
                <p className="text-sm font-semibold text-gray-800 truncate">{b.title}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{b.city}</p>
                <p className="text-xs text-gray-500 mt-1">₹{Number(b.price).toLocaleString()} / day</p>
              </div>

              {/* Status badge */}
              <span className={"px-2.5 py-0.5 rounded-full border text-xs font-medium shrink-0 " + (
                b.isActive
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              )}>
                {b.isActive ? "Active" : "Inactive"}
              </span>

              {/* Actions — stopPropagation so card click doesn't fire */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(b.id); }}
                  title={b.isActive ? "Deactivate" : "Activate"}
                  className="p-2 rounded-lg hover:bg-gray-50 transition"
                >
                  {b.isActive
                    ? <ToggleRightIcon size={22} weight="fill" className="text-emerald-500" />
                    : <ToggleLeftIcon  size={22} className="text-gray-400" />
                  }
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }}
                  title="Delete billboard"
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <TrashIcon size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}