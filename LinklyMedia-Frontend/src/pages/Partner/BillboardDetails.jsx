// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { ArrowLeftIcon, MapPinIcon, StarIcon, HeartIcon } from "@phosphor-icons/react";

// export default function BillboardDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [billboard, setBillboard] = useState(null);
//   const [loading, setLoading]     = useState(true);
//   const [error, setError]         = useState(null);
//   const [activeImg, setActiveImg] = useState(0);

//   const token   = localStorage.getItem("token");
//   const headers = { Authorization: "Bearer " + token };

//   useEffect(() => {
//     fetch("/api/partner/billboard/" + id, { headers })
//       .then((r) => { if (!r.ok) throw new Error("Failed to load billboard"); return r.json(); })
//       .then((d) => setBillboard(d.data ?? d))
//       .catch((e) => setError(e.message))
//       .finally(() => setLoading(false));
//   }, [id]);

//   if (loading) return (
//     <div className="p-6 space-y-4 max-w-4xl">
//       <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
//       <div className="h-6 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
//       <div className="h-4 bg-gray-100 rounded-lg w-1/3 animate-pulse" />
//     </div>
//   );

//   if (error) return (
//     <div className="p-6">
//       <button onClick={() => navigate("/partner/billboards")}
//         className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4 transition">
//         <ArrowLeftIcon size={16} /> Back to Billboards
//       </button>
//       <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4">{error}</div>
//     </div>
//   );

//   if (!billboard) return null;

//   const images    = billboard.images    ?? [];
//   const types     = billboard.type      ?? [];
//   const materials = billboard.materials ?? [];
//   const mountings = billboard.mountings ?? [];

//   const InfoRow = ({ label, value }) => !value ? null : (
//     <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
//       <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
//       <span className="text-sm text-gray-800 font-medium text-right max-w-xs">{value}</span>
//     </div>
//   );

//   return (
//     <div className="p-6 max-w-4xl">
//       {/* Back */}
//       <button onClick={() => navigate("/partner/billboards")}
//         className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5 transition">
//         <ArrowLeftIcon size={16} /> Back to Billboards
//       </button>

//       {/* Image gallery */}
//       {images.length > 0 && (
//         <div className="mb-6">
//           <div className="w-full h-72 rounded-2xl overflow-hidden bg-gray-100 mb-2">
//             <img
//               src={images[activeImg]?.url}
//               alt={images[activeImg]?.alttext ?? billboard.billboardtitle}
//               className="w-full h-full object-cover"
//             />
//           </div>
//           {images.length > 1 && (
//             <div className="flex gap-2">
//               {images.map((img, i) => (
//                 <button key={i} onClick={() => setActiveImg(i)}
//                   className={"w-16 h-11 rounded-lg overflow-hidden border-2 transition " +
//                     (activeImg === i ? "border-[#507c88]" : "border-transparent opacity-60 hover:opacity-100")}>
//                   <img src={img.url} alt="" className="w-full h-full object-cover" />
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Title + stats */}
//       <div className="flex items-start justify-between mb-4">
//         <div>
//           <h2 className="text-xl font-bold text-gray-800">{billboard.billboardtitle}</h2>
//           <p className="flex items-center gap-1 text-sm text-gray-400 mt-1">
//             <MapPinIcon size={14} /> {billboard.city}
//             {billboard.landmark && <span className="mx-1 text-gray-300">·</span>}
//             {billboard.landmark}
//           </p>
//         </div>
//         <div className="flex items-center gap-3 shrink-0">
//           <span className="flex items-center gap-1 text-sm text-amber-500 font-medium">
//             <StarIcon size={14} weight="fill" /> {Number(billboard.averagerating ?? 0).toFixed(1)}
//           </span>
//           <span className="flex items-center gap-1 text-sm text-rose-400 font-medium">
//             <HeartIcon size={14} weight="fill" /> {billboard.totallikes ?? 0}
//           </span>
//         </div>
//       </div>

//       {/* Price */}
//       <div className="flex items-center gap-2 mb-6">
//         <span className="text-2xl font-bold text-[#507c88]">
//           Rs.{Number(billboard.price ?? 0).toLocaleString()}
//         </span>
//         <span className="text-sm text-gray-400">/ day</span>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Details */}
//         <div className="bg-gray-50 rounded-xl p-4">
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Details</p>
//           <InfoRow label="Description" value={billboard.description} />
//           <InfoRow label="Locality"    value={billboard.locality} />
//           <InfoRow label="Size"        value={
//             billboard.size
//               ? billboard.size.widthinft + "ft x " + billboard.size.heightinft + "ft"
//               : null
//           } />
//           <InfoRow label="Impressions" value={billboard.impressions?.toLocaleString()} />
//           <InfoRow label="Min Span"    value={billboard.minspan ? billboard.minspan + " days" : null} />
//           {billboard.location && (
//             <div className="flex justify-between py-2 border-b border-gray-100">
//               <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</span>
//               <a href={billboard.location} target="_blank" rel="noreferrer"
//                 className="text-sm text-[#507c88] hover:underline font-medium">
//                 View on Maps
//               </a>
//             </div>
//           )}
//         </div>

//         {/* Types, Materials, Mountings */}
//         <div className="space-y-4">
//           {types.length > 0 && (
//             <div className="bg-gray-50 rounded-xl p-4">
//               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Types</p>
//               <div className="flex flex-wrap gap-2">
//                 {types.map((t, i) => (
//                   <span key={i} className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 font-medium">
//                     {t.typename ?? t.TypeName}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {materials.length > 0 && (
//             <div className="bg-gray-50 rounded-xl p-4">
//               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Materials</p>
//               <div className="space-y-2">
//                 {materials.map((m, i) => (
//                   <div key={i} className="flex justify-between text-sm">
//                     <span className="text-gray-600">{m.materialType}</span>
//                     <span className="text-gray-800 font-medium">Rs.{m.pricePerSqFt}/sq ft</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {mountings.length > 0 && (
//             <div className="bg-gray-50 rounded-xl p-4">
//               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Mountings</p>
//               <div className="space-y-2">
//                 {mountings.map((m, i) => (
//                   <div key={i} className="flex justify-between text-sm">
//                     <span className="text-gray-600">{m.mountingType}</span>
//                     <span className="text-gray-800 font-medium">Rs.{m.flatCharge} flat</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }













// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   ArrowLeftIcon, MapPinIcon, StarIcon, HeartIcon,
//   RulerIcon, EyeIcon, CalendarIcon, LinkIcon,
// } from "@phosphor-icons/react";

// export default function BillboardDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [billboard, setBillboard] = useState(null);
//   const [loading, setLoading]     = useState(true);
//   const [error, setError]         = useState(null);
//   const [activeImg, setActiveImg] = useState(0);

//   const token   = localStorage.getItem("token");
//   const headers = { Authorization: "Bearer " + token };

//   useEffect(() => {
//     fetch("/api/partner/billboard/" + id, { headers })
//       .then((r) => { if (!r.ok) throw new Error("Failed to load billboard"); return r.json(); })
//       .then((d) => setBillboard(d.data ?? d))
//       .catch((e) => setError(e.message))
//       .finally(() => setLoading(false));
//   }, [id]);

//   if (loading) return (
//     <div className="p-6 space-y-4 max-w-4xl">
//       <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
//       <div className="h-6 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
//       <div className="h-4 bg-gray-100 rounded-lg w-1/3 animate-pulse" />
//     </div>
//   );

//   if (error) return (
//     <div className="p-6 max-w-4xl">
//       <BackBtn navigate={navigate} />
//       <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4">{error}</div>
//     </div>
//   );

//   if (!billboard) return null;

//   const images    = billboard.images    ?? [];
//   const types     = billboard.type      ?? [];
//   const materials = billboard.materials ?? [];
//   const mountings = billboard.mountings ?? [];
//   const reviews   = billboard.reviews   ?? [];

//   const createdAt = billboard.createdat
//     ? new Date(billboard.createdat).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
//     : null;

//   return (
//     <div className="p-6 max-w-4xl">
//       <BackBtn navigate={navigate} />

//       {/* ── Image gallery ── */}
//       {images.length > 0 && (
//         <div className="mb-6">
//           <div className="w-full h-72 rounded-2xl overflow-hidden bg-gray-100 mb-2">
//             <img
//               src={images[activeImg]?.url}
//               alt={images[activeImg]?.alttext ?? billboard.billboardtitle}
//               className="w-full h-full object-cover"
//             />
//           </div>
//           {images.length > 1 && (
//             <div className="flex gap-2">
//               {images.map((img, i) => (
//                 <button key={i} onClick={() => setActiveImg(i)}
//                   className={"w-16 h-11 rounded-lg overflow-hidden border-2 transition " +
//                     (activeImg === i ? "border-[#507c88]" : "border-transparent opacity-50 hover:opacity-100")}>
//                   <img src={img.url} alt="" className="w-full h-full object-cover" />
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── Header ── */}
//       <div className="flex items-start justify-between gap-4 mb-2">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">{billboard.billboardtitle}</h1>
//           <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
//             <MapPinIcon size={14} className="text-[#507c88]" />
//             {billboard.city}
//             {billboard.landmark && <><span className="text-gray-300 mx-1">·</span>{billboard.landmark}</>}
//             {billboard.locality && <><span className="text-gray-300 mx-1">·</span>{billboard.locality}</>}
//           </p>
//         </div>
//         <div className="flex flex-col items-end gap-1 shrink-0">
//           <div className="flex items-center gap-3">
//             <span className="flex items-center gap-1 text-sm text-amber-500 font-semibold">
//               <StarIcon size={14} weight="fill" /> {Number(billboard.averagerating ?? 0).toFixed(1)}
//             </span>
//             <span className="flex items-center gap-1 text-sm text-rose-400 font-semibold">
//               <HeartIcon size={14} weight="fill" /> {billboard.totallikes ?? 0}
//             </span>
//           </div>
//           <span className={"px-2.5 py-0.5 rounded-full text-xs font-medium border " + (
//             billboard.isactive
//               ? "bg-emerald-50 text-emerald-600 border-emerald-200"
//               : "bg-gray-100 text-gray-500 border-gray-200"
//           )}>
//             {billboard.isactive ? "Active" : "Inactive"}
//           </span>

//         </div>
//       </div>

//       {/* Price */}
//       <div className="flex items-baseline gap-1.5 mb-6">
//         <span className="text-3xl font-bold text-[#507c88]">
//           ₹{Number(billboard.price ?? 0).toLocaleString()}
//         </span>
//         <span className="text-sm text-gray-400">/ day</span>
//       </div>

//       {/* ── Description ── */}
//       {billboard.description && (
//         <div className="mb-6">
//           <SectionLabel>Description</SectionLabel>
//           <div className="mt-2 border border-gray-200 rounded-xl p-4 bg-gray-50 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
//             {billboard.description}
//           </div>
//         </div>
//       )}



//       {/* ── Specs grid ── */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
//         {billboard.size && (
//           <SpecCard icon={<RulerIcon size={16} />} label="Size"
//             value={billboard.size.widthinft + "ft × " + billboard.size.heightinft + "ft"} />
//         )}
//         {billboard.impressions != null && (
//           <SpecCard icon={<EyeIcon size={16} />} label="Impressions"
//             value={Number(billboard.impressions).toLocaleString()} />
//         )}
//         {billboard.minspan != null && (
//           <SpecCard icon={<CalendarIcon size={16} />} label="Min Span"
//             value={billboard.minspan + " days"} />
//         )}
//         {billboard.location && (
//           <a href={billboard.location} target="_blank" rel="noreferrer"
//             className="flex flex-col items-center justify-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-center hover:border-[#507c88] hover:bg-[#507c88]/5 transition group">
//             <span className="text-[#507c88] group-hover:scale-110 transition"><LinkIcon size={16} /></span>
//             <span className="text-xs text-gray-500">Maps</span>
//             <span className="text-xs font-semibold text-[#507c88]">View ↗</span>
//           </a>
//         )}
//       </div>

//       {/* ── Types / Materials / Mountings ── */}
//       <div className="flex flex-col gap-4 mb-6">
//         {types.length > 0 && (
//           <div>
//             <SectionLabel>Types</SectionLabel>
//             <div className="flex flex-wrap gap-2 mt-2">
//               {types.map((t, i) => (
//                 <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 font-medium">
//                   {t.typename ?? t.TypeName}
//                 </span>
//               ))}
//             </div>
//           </div>
//         )}

//         {materials.length > 0 && (
//           <div>
//             <SectionLabel>Materials</SectionLabel>
//             <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
//               {materials.map((m, i) => (
//                 <div key={i} className={"flex justify-between px-4 py-2.5 text-sm " + (i > 0 ? "border-t border-gray-100" : "")}>
//                   <span className="text-gray-600">{m.materialType}</span>
//                   <span className="font-semibold text-gray-800">₹{m.pricePerSqFt}/sq ft</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {mountings.length > 0 && (
//           <div>
//             <SectionLabel>Mountings</SectionLabel>
//             <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
//               {mountings.map((m, i) => (
//                 <div key={i} className={"flex justify-between px-4 py-2.5 text-sm " + (i > 0 ? "border-t border-gray-100" : "")}>
//                   <span className="text-gray-600">{m.mountingType}</span>
//                   <span className="font-semibold text-gray-800">₹{m.flatCharge} flat</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Reviews ── */}
//       <div>
//         <SectionLabel>Customer Reviews ({reviews.length})</SectionLabel>
//         {reviews.length === 0 ? (
//           <div className="mt-2 text-center py-8 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-sm">
//             No reviews yet.
//           </div>
//         ) : (
//           <div className="mt-2 space-y-3">
//             {reviews.map((r, i) => (
//               <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
//                 <div className="flex items-center justify-between mb-1.5">
//                   <span className="text-sm font-semibold text-gray-800">{r.customername ?? r.userid ?? "Customer"}</span>
//                   <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
//                     {[...Array(5)].map((_, s) => (
//                       <StarIcon key={s} size={11} weight={s < (r.rating ?? 0) ? "fill" : "regular"}
//                         className={s < (r.rating ?? 0) ? "text-amber-400" : "text-gray-300"} />
//                     ))}
//                     <span className="ml-1 text-gray-500">{r.rating ?? 0}/5</span>
//                   </span>
//                 </div>
//                 {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
//                 {r.createdat && (
//                   <p className="text-xs text-gray-400 mt-2">
//                     {new Date(r.createdat).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//                   </p>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Listed on */}
//       {createdAt && (
//         <p className="text-xs text-gray-400 mt-6 text-right">Listed on {createdAt}</p>
//       )}
//     </div>
//   );
// }

// function BackBtn({ navigate }) {
//   return (
//     <button onClick={() => navigate("/partner/billboards")}
//       className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5 transition">
//       <ArrowLeftIcon size={16} /> Back to Billboards
//     </button>
//   );
// }

// function SectionLabel({ children }) {
//   return <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{children}</p>;
// }

// function SpecCard({ icon, label, value }) {
//   return (
//     <div className="flex flex-col items-center justify-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
//       <span className="text-[#507c88]">{icon}</span>
//       <span className="text-xs text-gray-500">{label}</span>
//       <span className="text-sm font-semibold text-gray-800">{value}</span>
//     </div>
//   );
// }












// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   ArrowLeftIcon, MapPinIcon, StarIcon, HeartIcon,
//   RulerIcon, EyeIcon, CalendarIcon, LinkIcon,
//   PencilSimpleIcon, CheckIcon, XIcon, PlusIcon, TrashIcon,
// } from "@phosphor-icons/react";

// // ── Helpers ──────────────────────────────────────────────────────────────────
// const SectionLabel = ({ children }) => (
//   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{children}</p>
// );

// const SpecCard = ({ icon, label, value }) => (
//   <div className="flex flex-col items-center justify-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
//     <span className="text-[#507c88]">{icon}</span>
//     <span className="text-xs text-gray-500">{label}</span>
//     <span className="text-sm font-semibold text-gray-800">{value}</span>
//   </div>
// );

// const Field = ({ label, name, type = "text", value, onChange, span = false }) => (
//   <div className={span ? "col-span-2" : ""}>
//     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{label}</label>
//     <input
//       type={type}
//       name={name}
//       value={value ?? ""}
//       onChange={onChange}
//       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
//     />
//   </div>
// );

// const TextareaField = ({ label, name, value, onChange }) => (
//   <div className="col-span-2">
//     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{label}</label>
//     <textarea
//       name={name}
//       value={value ?? ""}
//       onChange={onChange}
//       rows={3}
//       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88] resize-none"
//     />
//   </div>
// );

// // ── Main component ────────────────────────────────────────────────────────────
// export default function BillboardDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [billboard, setBillboard] = useState(null);
//   const [loading, setLoading]     = useState(true);
//   const [error, setError]         = useState(null);
//   const [activeImg, setActiveImg] = useState(0);

//   // Edit state
//   const [editing,   setEditing]   = useState(false);
//   const [form,      setForm]      = useState({});
//   const [materials, setMaterials] = useState([]);
//   const [mountings, setMountings] = useState([]);
//   const [saving,    setSaving]    = useState(false);
//   const [saveError, setSaveError] = useState(null);
//   const [saveOk,    setSaveOk]    = useState(false);

//   const token   = localStorage.getItem("token");
//   const headers = { Authorization: "Bearer " + token };

//   useEffect(() => {
//     fetch("/api/partner/billboard/" + id, { headers })
//       .then((r) => { if (!r.ok) throw new Error("Failed to load billboard"); return r.json(); })
//       .then((d) => {
//         const b = d.data ?? d;
//         setBillboard(b);
//         initForm(b);
//       })
//       .catch((e) => setError(e.message))
//       .finally(() => setLoading(false));
//   }, [id]);

//   const initForm = (b) => {
//     setForm({
//       billboardtitle: b.billboardtitle ?? "",
//       description:    b.description    ?? "",
//       city:           b.city           ?? "",
//       locality:       b.locality       ?? "",
//       landmark:       b.landmark       ?? "",
//       location:       b.location       ?? "",
//       widthinft:      b.size?.widthinft  ?? "",
//       heightinft:     b.size?.heightinft ?? "",
//       impressions:    b.impressions    ?? "",
//       minspan:        b.minspan        ?? "",
//       price:          b.price          ?? "",
//       types:          (b.type ?? []).map((t) => t.typename ?? t.TypeName).join(", "),
//     });
//     setMaterials((b.materials ?? []).map((m) => ({ materialType: m.materialType, pricePerSqFt: String(m.pricePerSqFt) })));
//     setMountings((b.mountings ?? []).map((m) => ({ mountingType: m.mountingType, flatCharge: String(m.flatCharge) })));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setSaveError(null);
//     try {
//       const fd = new FormData();
//       Object.entries(form).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });

//       const validMaterials = materials.filter((m) => m.materialType && m.pricePerSqFt)
//         .map((m) => ({ materialType: m.materialType, pricePerSqFt: Number(m.pricePerSqFt) }));
//       const validMountings = mountings.filter((m) => m.mountingType && m.flatCharge)
//         .map((m) => ({ mountingType: m.mountingType, flatCharge: Number(m.flatCharge) }));

//       if (validMaterials.length > 0) fd.append("materials", JSON.stringify(validMaterials));
//       if (validMountings.length > 0) fd.append("mountings", JSON.stringify(validMountings));

//       const r = await fetch("/api/partner/billboard/" + billboard.billboardid, {
//         method: "PATCH",
//         headers: { Authorization: "Bearer " + token },
//         body: fd,
//       });

//       if (!r.ok) {
//         const err = await r.json().catch(() => ({}));
//         throw new Error(err.error ?? err.message ?? "Failed to save");
//       }

//       // Refetch updated billboard
//       const fresh = await fetch("/api/partner/billboard/" + id, { headers }).then((r) => r.json());
//       const b = fresh.data ?? fresh;
//       setBillboard(b);
//       initForm(b);
//       setEditing(false);
//       setSaveOk(true);
//       setTimeout(() => setSaveOk(false), 3000);
//     } catch (e) {
//       setSaveError(e.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const cancelEdit = () => {
//     initForm(billboard);
//     setEditing(false);
//     setSaveError(null);
//   };

//   if (loading) return (
//     <div className="p-6 space-y-4 max-w-4xl">
//       <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
//       <div className="h-6 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
//     </div>
//   );

//   if (error) return (
//     <div className="p-6 max-w-4xl">
//       <BackBtn navigate={navigate} />
//       <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4">{error}</div>
//     </div>
//   );

//   if (!billboard) return null;

//   const images  = billboard.images   ?? [];
//   const reviews = billboard.reviews  ?? [];
//   const createdAt = billboard.createdat
//     ? new Date(billboard.createdat).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
//     : null;

//   // ── VIEW MODE ──
//   if (!editing) {
//     const types     = billboard.type      ?? [];
//     const materials = billboard.materials ?? [];
//     const mountings = billboard.mountings ?? [];

//     return (
//       <div className="p-6 max-w-4xl">
//         <div className="flex items-center justify-between mb-5">
//           <BackBtn navigate={navigate} />
//           <button onClick={() => setEditing(true)}
//             className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition">
//             <PencilSimpleIcon size={14} /> Edit Billboard
//           </button>
//         </div>

//         {saveOk && <div className="mb-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg p-3">Billboard updated successfully.</div>}

//         {/* Images */}
//         {images.length > 0 && (
//           <div className="mb-6">
//             <div className="w-full h-72 rounded-2xl overflow-hidden bg-gray-100 mb-2">
//               <img src={images[activeImg]?.url} alt={images[activeImg]?.alttext ?? billboard.billboardtitle} className="w-full h-full object-cover" />
//             </div>
//             {images.length > 1 && (
//               <div className="flex gap-2">
//                 {images.map((img, i) => (
//                   <button key={i} onClick={() => setActiveImg(i)}
//                     className={"w-16 h-11 rounded-lg overflow-hidden border-2 transition " + (activeImg === i ? "border-[#507c88]" : "border-transparent opacity-50 hover:opacity-100")}>
//                     <img src={img.url} alt="" className="w-full h-full object-cover" />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Header */}
//         <div className="flex items-start justify-between gap-4 mb-2">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">{billboard.billboardtitle}</h1>
//             <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
//               <MapPinIcon size={14} className="text-[#507c88]" />
//               {billboard.city}
//               {billboard.landmark && <><span className="text-gray-300 mx-1">·</span>{billboard.landmark}</>}
//               {billboard.locality && <><span className="text-gray-300 mx-1">·</span>{billboard.locality}</>}
//             </p>
//           </div>
//           <div className="flex flex-col items-end gap-1 shrink-0">
//             <div className="flex items-center gap-3">
//               <span className="flex items-center gap-1 text-sm text-amber-500 font-semibold">
//                 <StarIcon size={14} weight="fill" /> {Number(billboard.averagerating ?? 0).toFixed(1)}
//               </span>
//               <span className="flex items-center gap-1 text-sm text-rose-400 font-semibold">
//                 <HeartIcon size={14} weight="fill" /> {billboard.totallikes ?? 0}
//               </span>
//             </div>
//             <span className={"px-2.5 py-0.5 rounded-full text-xs font-medium border " + (billboard.isactive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200")}>
//               {billboard.isactive ? "Active" : "Inactive"}
//             </span>
//           </div>
//         </div>

//         <div className="flex items-baseline gap-1.5 mb-6">
//           <span className="text-3xl font-bold text-[#507c88]">₹{Number(billboard.price ?? 0).toLocaleString()}</span>
//           <span className="text-sm text-gray-400">/ day</span>
//         </div>

//         {billboard.description && (
//           <div className="mb-6">
//             <SectionLabel>Description</SectionLabel>
//             <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
//               {billboard.description}
//             </div>
//           </div>
//         )}

//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
//           {billboard.size && <SpecCard icon={<RulerIcon size={16} />} label="Size" value={billboard.size.widthinft + "ft × " + billboard.size.heightinft + "ft"} />}
//           {billboard.impressions != null && <SpecCard icon={<EyeIcon size={16} />} label="Impressions" value={Number(billboard.impressions).toLocaleString()} />}
//           {billboard.minspan != null && <SpecCard icon={<CalendarIcon size={16} />} label="Min Span" value={billboard.minspan + " days"} />}
//           {billboard.location && (
//             <a href={billboard.location} target="_blank" rel="noreferrer"
//               className="flex flex-col items-center justify-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-center hover:border-[#507c88] hover:bg-[#507c88]/5 transition group">
//               <span className="text-[#507c88]"><LinkIcon size={16} /></span>
//               <span className="text-xs text-gray-500">Maps</span>
//               <span className="text-xs font-semibold text-[#507c88]">View ↗</span>
//             </a>
//           )}
//         </div>

//         <div className="flex flex-col gap-4 mb-6">
//           {types.length > 0 && (
//             <div>
//               <SectionLabel>Types</SectionLabel>
//               <div className="flex flex-wrap gap-2">
//                 {types.map((t, i) => (
//                   <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 font-medium">
//                     {t.typename ?? t.TypeName}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}
//           {materials.length > 0 && (
//             <div>
//               <SectionLabel>Materials</SectionLabel>
//               <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
//                 {materials.map((m, i) => (
//                   <div key={i} className={"flex justify-between px-4 py-2.5 text-sm " + (i > 0 ? "border-t border-gray-100" : "")}>
//                     <span className="text-gray-600">{m.materialType}</span>
//                     <span className="font-semibold text-gray-800">₹{m.pricePerSqFt}/sq ft</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//           {mountings.length > 0 && (
//             <div>
//               <SectionLabel>Mountings</SectionLabel>
//               <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
//                 {mountings.map((m, i) => (
//                   <div key={i} className={"flex justify-between px-4 py-2.5 text-sm " + (i > 0 ? "border-t border-gray-100" : "")}>
//                     <span className="text-gray-600">{m.mountingType}</span>
//                     <span className="font-semibold text-gray-800">₹{m.flatCharge} flat</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Reviews */}
//         <div>
//           <SectionLabel>Customer Reviews ({reviews.length})</SectionLabel>
//           {reviews.length === 0 ? (
//             <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-sm">No reviews yet.</div>
//           ) : (
//             <div className="space-y-3">
//               {reviews.map((r, i) => (
//                 <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
//                   <div className="flex items-center justify-between mb-1.5">
//                     <span className="text-sm font-semibold text-gray-800">{r.customername ?? r.userid ?? "Customer"}</span>
//                     <span className="flex items-center gap-0.5 text-xs">
//                       {[...Array(5)].map((_, s) => (
//                         <StarIcon key={s} size={11} weight={s < (r.rating ?? 0) ? "fill" : "regular"}
//                           className={s < (r.rating ?? 0) ? "text-amber-400" : "text-gray-300"} />
//                       ))}
//                       <span className="ml-1 text-gray-500">{r.rating ?? 0}/5</span>
//                     </span>
//                   </div>
//                   {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
//                   {r.createdat && <p className="text-xs text-gray-400 mt-2">{new Date(r.createdat).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {createdAt && <p className="text-xs text-gray-400 mt-6 text-right">Listed on {createdAt}</p>}
//       </div>
//     );
//   }

//   // ── EDIT MODE ──
//   return (
//     <div className="p-6 max-w-4xl">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-3">
//           <button onClick={cancelEdit} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
//             <ArrowLeftIcon size={18} />
//           </button>
//           <div>
//             <h2 className="text-lg font-bold text-gray-800">Edit Billboard</h2>
//             <p className="text-sm text-gray-400">Update your billboard details</p>
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <button onClick={cancelEdit}
//             className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition">
//             <XIcon size={14} /> Cancel
//           </button>
//           <button onClick={handleSave} disabled={saving}
//             className="flex items-center gap-1.5 px-4 py-1.5 bg-[#507c88] text-white rounded-lg text-sm font-medium hover:bg-[#3d6370] transition disabled:opacity-60">
//             <CheckIcon size={14} /> {saving ? "Saving…" : "Save Changes"}
//           </button>
//         </div>
//       </div>

//       {saveError && <div className="mb-5 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">{saveError}</div>}

//       <div className="space-y-7">

//         {/* Basic Info */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Basic Info</p>
//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Billboard Title" name="billboardtitle" value={form.billboardtitle} onChange={handleChange} span />
//             <TextareaField label="Description" name="description" value={form.description} onChange={handleChange} />
//           </div>
//         </div>

//         {/* Location */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Location</p>
//           <div className="grid grid-cols-2 gap-4">
//             <Field label="City"            name="city"     value={form.city}     onChange={handleChange} />
//             <Field label="Locality"        name="locality" value={form.locality} onChange={handleChange} />
//             <Field label="Landmark"        name="landmark" value={form.landmark} onChange={handleChange} />
//             <Field label="Google Maps URL" name="location" value={form.location} onChange={handleChange} />
//           </div>
//         </div>

//         {/* Dimensions */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dimensions & Specs</p>
//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Width (ft)"      name="widthinft"   type="number" value={form.widthinft}   onChange={handleChange} />
//             <Field label="Height (ft)"     name="heightinft"  type="number" value={form.heightinft}  onChange={handleChange} />
//             <Field label="Impressions"     name="impressions" type="number" value={form.impressions} onChange={handleChange} />
//             <Field label="Min Span (days)" name="minspan"     type="number" value={form.minspan}     onChange={handleChange} />
//             <Field label="Types (comma-separated)" name="types" value={form.types} onChange={handleChange} span />
//           </div>
//         </div>

//         {/* Materials */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Materials</p>
//           <div className="space-y-2">
//             {materials.map((m, i) => (
//               <div key={i} className="flex gap-2 items-center">
//                 <input type="text" placeholder="Material Type" value={m.materialType}
//                   onChange={(e) => setMaterials((prev) => prev.map((r, idx) => idx === i ? { ...r, materialType: e.target.value } : r))}
//                   className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]" />
//                 <input type="number" placeholder="₹/sq ft" value={m.pricePerSqFt}
//                   onChange={(e) => setMaterials((prev) => prev.map((r, idx) => idx === i ? { ...r, pricePerSqFt: e.target.value } : r))}
//                   className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]" />
//                 <button type="button" onClick={() => setMaterials((prev) => prev.filter((_, idx) => idx !== i))}
//                   className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
//                   <TrashIcon size={15} />
//                 </button>
//               </div>
//             ))}
//             <button type="button" onClick={() => setMaterials((prev) => [...prev, { materialType: "", pricePerSqFt: "" }])}
//               className="flex items-center gap-1.5 text-xs text-[#507c88] font-medium mt-1 hover:text-[#3d6370]">
//               <PlusIcon size={13} weight="bold" /> Add Material
//             </button>
//           </div>
//         </div>

//         {/* Mountings */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Mountings</p>
//           <div className="space-y-2">
//             {mountings.map((m, i) => (
//               <div key={i} className="flex gap-2 items-center">
//                 <input type="text" placeholder="Mounting Type" value={m.mountingType}
//                   onChange={(e) => setMountings((prev) => prev.map((r, idx) => idx === i ? { ...r, mountingType: e.target.value } : r))}
//                   className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]" />
//                 <input type="number" placeholder="Flat charge (₹)" value={m.flatCharge}
//                   onChange={(e) => setMountings((prev) => prev.map((r, idx) => idx === i ? { ...r, flatCharge: e.target.value } : r))}
//                   className="w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]" />
//                 <button type="button" onClick={() => setMountings((prev) => prev.filter((_, idx) => idx !== i))}
//                   className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
//                   <TrashIcon size={15} />
//                 </button>
//               </div>
//             ))}
//             <button type="button" onClick={() => setMountings((prev) => [...prev, { mountingType: "", flatCharge: "" }])}
//               className="flex items-center gap-1.5 text-xs text-[#507c88] font-medium mt-1 hover:text-[#3d6370]">
//               <PlusIcon size={13} weight="bold" /> Add Mounting
//             </button>
//           </div>
//         </div>

//         {/* Pricing */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pricing</p>
//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Price / Day (₹)" name="price" type="number" value={form.price} onChange={handleChange} />
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// function BackBtn({ navigate }) {
//   return (
//     <button onClick={() => navigate("/partner/billboards")}
//       className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
//       <ArrowLeftIcon size={16} /> Back to Billboards
//     </button>
//   );
// }







import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon, MapPinIcon, StarIcon, HeartIcon,
  RulerIcon, EyeIcon, CalendarIcon, LinkIcon,
  PencilSimpleIcon, CheckIcon, XIcon, PlusIcon, TrashIcon,
} from "@phosphor-icons/react";

// ── Helpers ──────────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">{children}</p>
);

const SpecCard = ({ icon, label, value }) => (
  <div className="flex flex-col items-center justify-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
    <span className="text-[#507c88]">{icon}</span>
    <span className="text-xs text-gray-800">{label}</span>
    <span className="text-sm font-semibold text-gray-800">{value}</span>
  </div>
);

const Field = ({ label, name, type = "text", value, onChange, span = false }) => (
  <div className={span ? "col-span-2" : ""}>
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
    />
  </div>
);

const TextareaField = ({ label, name, value, onChange }) => (
  <div className="col-span-2">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{label}</label>
    <textarea
      name={name}
      value={value ?? ""}
      onChange={onChange}
      rows={3}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88] resize-none"
    />
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function BillboardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [billboard, setBillboard] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  // Edit state
  const [editing,   setEditing]   = useState(false);
  const [form,      setForm]      = useState({});
  const [materials, setMaterials] = useState([]);
  const [mountings, setMountings] = useState([]);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveOk,    setSaveOk]    = useState(false);

  const token   = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  useEffect(() => {
    fetch("http://localhost:8000/api/partner/billboard/" + id, { headers })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load billboard");
        return r.json();
      })
      .then((d) => {
        const b = d.data ?? d;
        setBillboard(b);
        initForm(b);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const initForm = (b) => {
    setForm({
      billboardtitle: b.billboardtitle ?? "",
      description:    b.description    ?? "",
      city:           b.city           ?? "",
      locality:       b.locality       ?? "",
      landmark:       b.landmark       ?? "",
      location:       b.location       ?? "",
      widthinft:      b.size?.widthinft  ?? "",
      heightinft:     b.size?.heightinft ?? "",
      impressions:    b.impressions    ?? "",
      minspan:        b.minspan        ?? "",
      price:          b.price          ?? "",
      types:          (b.type ?? []).map((t) => t.typename ?? t.TypeName).join(", "),
    });
    setMaterials((b.materials ?? []).map((m) => ({ materialType: m.materialType, pricePerSqFt: String(m.pricePerSqFt) })));
    setMountings((b.mountings ?? []).map((m) => ({ mountingType: m.mountingType, flatCharge: String(m.flatCharge) })));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });

      const validMaterials = materials.filter((m) => m.materialType && m.pricePerSqFt)
        .map((m) => ({ materialType: m.materialType, pricePerSqFt: Number(m.pricePerSqFt) }));
      const validMountings = mountings.filter((m) => m.mountingType && m.flatCharge)
        .map((m) => ({ mountingType: m.mountingType, flatCharge: Number(m.flatCharge) }));

      if (validMaterials.length > 0) fd.append("materials", JSON.stringify(validMaterials));
      if (validMountings.length > 0) fd.append("mountings", JSON.stringify(validMountings));

      const r = await fetch("/api/partner/billboard/" + billboard.billboardid, {
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
        body: fd,
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error ?? err.message ?? "Failed to save");
      }

      // Refetch updated billboard
      const fresh = await fetch("/api/partner/billboard/" + id, { headers }).then((r) => r.json());
      const b = fresh.data ?? fresh;
      setBillboard(b);
      initForm(b);
      setEditing(false);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 3000);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    initForm(billboard);
    setEditing(false);
    setSaveError(null);
  };

  if (loading) return (
    <div className="p-6 space-y-4 max-w-4xl">
      <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="h-6 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
    </div>
  );

  if (error) return (
    <div className="p-6 max-w-4xl">
      <BackBtn navigate={navigate} />
      <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4">{error}</div>
    </div>
  );

  if (!billboard) return null;

  const images  = billboard.images   ?? [];
  const reviews = billboard.reviews  ?? [];
  const createdAt = billboard.createdat
    ? new Date(billboard.createdat).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  // ── VIEW MODE ──
  if (!editing) {
    const types     = billboard.type      ?? [];
    const materials = billboard.materials ?? [];
    const mountings = billboard.mountings ?? [];

    return (
      <div className="p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-5">
          <BackBtn navigate={navigate} />
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-[#507c88] rounded-lg text-sm text-white hover:bg-[#507c88]/80 transition">
            <PencilSimpleIcon size={14} /> Edit Billboard
          </button>
        </div>

        {saveOk && <div className="mb-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg p-3">Billboard updated successfully.</div>}

        {/* Images */}
        {images.length > 0 && (
          <div className="mb-6">
            <div className="w-full h-72 rounded-2xl overflow-hidden bg-gray-100 mb-2">
              <img src={images[activeImg]?.url} alt={images[activeImg]?.alttext ?? billboard.billboardtitle} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={"w-16 h-11 rounded-lg overflow-hidden border-2 transition " + (activeImg === i ? "border-[#507c88]" : "border-transparent opacity-50 hover:opacity-100")}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{billboard.billboardtitle}</h1>
            <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
              <MapPinIcon size={14} className="text-[#507c88]" />
              {billboard.city}
              {billboard.landmark && <><span className="text-gray-300 mx-1">·</span>{billboard.landmark}</>}
              {billboard.locality && <><span className="text-gray-300 mx-1">·</span>{billboard.locality}</>}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sm text-amber-500 font-semibold">
                <StarIcon size={14} weight="fill" /> {Number(billboard.averagerating ?? 0).toFixed(1)}
              </span>
              <span className="flex items-center gap-1 text-sm text-rose-400 font-semibold">
                <HeartIcon size={14} weight="fill" /> {billboard.totallikes ?? 0}
              </span>
            </div>
            <span className={"px-2.5 py-0.5 rounded-full text-xs font-medium border " + (billboard.isactive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200")}>
              {billboard.isactive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mb-6">
          <span className="text-3xl font-bold text-[#507c88]">₹{Number(billboard.price ?? 0).toLocaleString()}</span>
          <span className="text-sm text-gray-400">/ day</span>
        </div>

        {billboard.description && (
          <div className="mb-6">
            <SectionLabel>Description</SectionLabel>
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {billboard.description}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {billboard.size && <SpecCard icon={<RulerIcon size={16} />} label="Size" value={billboard.size.widthinft + "ft × " + billboard.size.heightinft + "ft"} />}
          {billboard.impressions != null && <SpecCard icon={<EyeIcon size={16} />} label="Impressions" value={Number(billboard.impressions).toLocaleString()} />}
          {billboard.minspan != null && <SpecCard icon={<CalendarIcon size={16} />} label="Min Span" value={billboard.minspan + " days"} />}
          {billboard.location && (
            <a href={billboard.location} target="_blank" rel="noreferrer"
              className="flex flex-col items-center justify-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-center hover:border-[#507c88] hover:bg-[#507c88]/5 transition group">
              <span className="text-[#507c88]"><LinkIcon size={16} /></span>
              <span className="text-xs text-gray-500">Maps</span>
              <span className="text-xs font-semibold text-[#507c88]">View ↗</span>
            </a>
          )}
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {types.length > 0 && (
            <div>
              <SectionLabel>Types</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {types.map((t, i) => (
                  <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 font-medium">
                    {t.typename ?? t.TypeName}
                  </span>
                ))}
              </div>
            </div>
          )}
          {materials.length > 0 && (
            <div>
              <SectionLabel>Materials</SectionLabel>
              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                {materials.map((m, i) => (
                  <div key={i} className={"flex justify-between px-4 py-2.5 text-sm " + (i > 0 ? "border-t border-gray-100" : "")}>
                    <span className="text-gray-600">{m.materialType}</span>
                    <span className="font-semibold text-gray-800">₹{m.pricePerSqFt}/sq ft</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {mountings.length > 0 && (
            <div>
              <SectionLabel>Mountings</SectionLabel>
              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                {mountings.map((m, i) => (
                  <div key={i} className={"flex justify-between px-4 py-2.5 text-sm " + (i > 0 ? "border-t border-gray-100" : "")}>
                    <span className="text-gray-600">{m.mountingType}</span>
                    <span className="font-semibold text-gray-800">₹{m.flatCharge} flat</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div>
          <SectionLabel>Customer Reviews ({reviews.length})</SectionLabel>
          {reviews.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-sm">No reviews yet.</div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-800">{r.customername ?? r.userid ?? "Customer"}</span>
                    <span className="flex items-center gap-0.5 text-xs">
                      {[...Array(5)].map((_, s) => (
                        <StarIcon key={s} size={11} weight={s < (r.rating ?? 0) ? "fill" : "regular"}
                          className={s < (r.rating ?? 0) ? "text-amber-400" : "text-gray-300"} />
                      ))}
                      <span className="ml-1 text-gray-500">{r.rating ?? 0}/5</span>
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                  {r.createdat && <p className="text-xs text-gray-400 mt-2">{new Date(r.createdat).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {createdAt && <p className="text-xs text-gray-400 mt-6 text-right">Listed on {createdAt}</p>}
      </div>
    );
  }

  // ── EDIT MODE ──
  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={cancelEdit} className="p-1.5 rounded-lg text-gray-1000 hover:bg-gray-100 transition">
            <ArrowLeftIcon size={18} />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Edit Billboard</h2>
            <p className="text-md text-gray-400">Update your billboard details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={cancelEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition">
            <XIcon size={14} /> Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#507c88] text-white rounded-lg text-sm font-medium hover:bg-[#3d6370] transition disabled:opacity-60">
            <CheckIcon size={14} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {saveError && <div className="mb-5 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">{saveError}</div>}

      <div className="space-y-7">

        {/* Basic Info */}
        <div>
          <p className="text-md font-semibold text-gray-800 uppercase tracking-widest mb-3">Basic Info</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Billboard Title" name="billboardtitle" value={form.billboardtitle} onChange={handleChange} span />
            <TextareaField label="Description" name="description" value={form.description} onChange={handleChange} />
          </div>
        </div>

        {/* Location */}
        <div>
          <p className="text-md font-semibold text-gray-800 uppercase tracking-widest mb-3">Location</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City"            name="city"     value={form.city}     onChange={handleChange} />
            <Field label="Locality"        name="locality" value={form.locality} onChange={handleChange} />
            <Field label="Landmark"        name="landmark" value={form.landmark} onChange={handleChange} />
            <Field label="Google Maps URL" name="location" value={form.location} onChange={handleChange} />
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <p className="text-md font-semibold text-gray-800 uppercase tracking-widest mb-3">Dimensions & Specs</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Width (ft)"      name="widthinft"   type="number" value={form.widthinft}   onChange={handleChange} />
            <Field label="Height (ft)"     name="heightinft"  type="number" value={form.heightinft}  onChange={handleChange} />
            <Field label="Impressions"     name="impressions" type="number" value={form.impressions} onChange={handleChange} />
            <Field label="Min Span (days)" name="minspan"     type="number" value={form.minspan}     onChange={handleChange} />
            <Field label="Types (comma-separated)" name="types" value={form.types} onChange={handleChange} span />
          </div>
        </div>

        {/* Materials */}
        <div>
          <p className="text-md font-semibold text-gray-800 uppercase tracking-widest mb-3">Materials</p>
          <div className="space-y-2">
            {materials.map((m, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" placeholder="Material Type" value={m.materialType}
                  onChange={(e) => setMaterials((prev) => prev.map((r, idx) => idx === i ? { ...r, materialType: e.target.value } : r))}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]" />
                <input type="number" placeholder="₹/sq ft" value={m.pricePerSqFt}
                  onChange={(e) => setMaterials((prev) => prev.map((r, idx) => idx === i ? { ...r, pricePerSqFt: e.target.value } : r))}
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]" />
                <button type="button" onClick={() => setMaterials((prev) => prev.filter((_, idx) => idx !== i))}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                  <TrashIcon size={15} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setMaterials((prev) => [...prev, { materialType: "", pricePerSqFt: "" }])}
              className="flex items-center gap-1.5 text-xs text-[#507c88] font-medium mt-1 hover:text-[#3d6370]">
              <PlusIcon size={13} weight="bold" /> Add Material
            </button>
          </div>
        </div>

        {/* Mountings */}
        <div>
          <p className="text-md font-semibold text-gray-800 uppercase tracking-widest mb-3">Mountings</p>
          <div className="space-y-2">
            {mountings.map((m, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" placeholder="Mounting Type" value={m.mountingType}
                  onChange={(e) => setMountings((prev) => prev.map((r, idx) => idx === i ? { ...r, mountingType: e.target.value } : r))}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]" />
                <input type="number" placeholder="Flat charge (₹)" value={m.flatCharge}
                  onChange={(e) => setMountings((prev) => prev.map((r, idx) => idx === i ? { ...r, flatCharge: e.target.value } : r))}
                  className="w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]" />
                <button type="button" onClick={() => setMountings((prev) => prev.filter((_, idx) => idx !== i))}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                  <TrashIcon size={15} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setMountings((prev) => [...prev, { mountingType: "", flatCharge: "" }])}
              className="flex items-center gap-1.5 text-xs text-[#507c88] font-medium mt-1 hover:text-[#3d6370]">
              <PlusIcon size={13} weight="bold" /> Add Mounting
            </button>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <p className="text-md font-semibold text-gray-800 uppercase tracking-widest mb-3">Pricing</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price / Day (₹)" name="price" type="number" value={form.price} onChange={handleChange} />
          </div>
        </div>

      </div>
    </div>
  );
}

function BackBtn({ navigate }) {
  return (
    <button onClick={() => navigate("/partner/billboards")}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
      <ArrowLeftIcon size={16} /> Back to Billboards
    </button>
  );
}