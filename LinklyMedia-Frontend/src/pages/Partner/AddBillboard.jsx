// import React, { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeftIcon, UploadSimpleIcon, XIcon, ImageIcon } from "@phosphor-icons/react";

// const MAX_IMAGES = 5;
// const MAX_SIZE_MB = 5;

// export default function AddBillboard() {
//   const navigate = useNavigate();
//   const fileInputRef = useRef(null);

//   const [form, setForm] = useState({
//     billboardtitle: "",
//     description: "",
//     landmark: "",
//     locality: "",
//     location: "",
//     city: "",
//     impressions: "",
//     minspan: "",
//     price: "",
//     types: "",
//     widthinft: "",
//     heightinft: "",
//     materials: "",
//     mountings: "",
//     mountingcharge: "",
//     othercharges: "",
//   });
//   const [images, setImages]     = useState([]); // File objects
//   const [previews, setPreviews] = useState([]); // base64 preview URLs
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError]       = useState(null);
//   const [imgError, setImgError] = useState(null);

//   const token   = localStorage.getItem("token");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleImageDrop = (e) => {
//     e.preventDefault();
//     addImages(Array.from(e.dataTransfer.files));
//   };

//   const handleImageSelect = (e) => {
//     addImages(Array.from(e.target.files));
//     e.target.value = ""; // reset so same file can be reselected
//   };

//   const addImages = (files) => {
//     setImgError(null);
//     const remaining = MAX_IMAGES - images.length;
//     if (remaining <= 0) {
//       setImgError(`Maximum ${MAX_IMAGES} images allowed.`);
//       return;
//     }
//     const toAdd = files.slice(0, remaining);
//     const oversized = toAdd.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
//     if (oversized.length > 0) {
//       setImgError(`Each image must be under ${MAX_SIZE_MB}MB.`);
//       return;
//     }
//     const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
//     const invalid = toAdd.filter((f) => !validTypes.includes(f.type));
//     if (invalid.length > 0) {
//       setImgError("Only JPG, PNG, WEBP images are allowed.");
//       return;
//     }

//     // Generate previews
//     toAdd.forEach((file) => {
//       const reader = new FileReader();
//       reader.onload = (ev) => {
//         setPreviews((prev) => [...prev, ev.target.result]);
//       };
//       reader.readAsDataURL(file);
//     });
//     setImages((prev) => [...prev, ...toAdd]);
//   };

//   const removeImage = (index) => {
//     setImages((prev)   => prev.filter((_, i) => i !== index));
//     setPreviews((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);

//     if (images.length === 0) {
//       setError("Please upload at least one image.");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const fd = new FormData();

//       // Append all text fields
//       Object.entries(form).forEach(([key, val]) => {
//         if (val !== "") fd.append(key, val);
//       });

//       // Append images (multiple files under same key "images")
//       images.forEach((img) => fd.append("images", img));

//       const r = await fetch("/api/partner/billboard", {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         // ⚠️ Do NOT set Content-Type — browser sets it automatically with boundary for FormData
//         body: fd,
//       });

//       if (!r.ok) {
//         const err = await r.json().catch(() => ({}));
//         throw new Error(err.message ?? err.error ?? "Failed to add billboard");
//       }

//       navigate("/partner/billboards");
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const Input = ({ label, name, type = "text", placeholder = "", required = false }) => (
//     <div className="space-y-1">
//       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//         {label} {required && <span className="text-red-400">*</span>}
//       </label>
//       <input
//         type={type}
//         name={name}
//         value={form[name]}
//         onChange={handleChange}
//         placeholder={placeholder}
//         required={required}
//         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
//       />
//     </div>
//   );

//   const Textarea = ({ label, name, placeholder = "", required = false }) => (
//     <div className="space-y-1">
//       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//         {label} {required && <span className="text-red-400">*</span>}
//       </label>
//       <textarea
//         name={name}
//         value={form[name]}
//         onChange={handleChange}
//         placeholder={placeholder}
//         required={required}
//         rows={3}
//         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88] resize-none"
//       />
//     </div>
//   );

//   return (
//     <div className="p-6 max-w-3xl">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-6">
//         <button
//           onClick={() => navigate("/partner/billboards")}
//           className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
//         >
//           <ArrowLeftIcon size={18} />
//         </button>
//         <div>
//           <h2 className="text-lg font-bold text-gray-800">Add Billboard</h2>
//           <p className="text-sm text-gray-400">Fill in the details to list your billboard</p>
//         </div>
//       </div>

//       {error && (
//         <div className="mb-5 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">

//         {/* ── Images ── */}
//         <div className="space-y-2">
//           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//             Images <span className="text-red-400">*</span>
//             <span className="ml-2 text-gray-400 normal-case font-normal">
//               (max {MAX_IMAGES} images, {MAX_SIZE_MB}MB each)
//             </span>
//           </label>

//           {/* Drop zone */}
//           <div
//             onDrop={handleImageDrop}
//             onDragOver={(e) => e.preventDefault()}
//             onClick={() => images.length < MAX_IMAGES && fileInputRef.current?.click()}
//             className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer
//               ${images.length >= MAX_IMAGES
//                 ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
//                 : "border-[#507c88]/40 hover:border-[#507c88] hover:bg-[#507c88]/5"
//               }`}
//           >
//             <UploadSimpleIcon size={28} className="mx-auto text-gray-300 mb-2" />
//             <p className="text-sm text-gray-500">
//               {images.length >= MAX_IMAGES
//                 ? "Maximum images reached"
//                 : "Drag & drop images here, or click to browse"}
//             </p>
//             <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB each</p>
//           </div>

//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/jpeg,image/png,image/webp"
//             multiple
//             onChange={handleImageSelect}
//             className="hidden"
//           />

//           {imgError && <p className="text-xs text-red-500">{imgError}</p>}

//           {/* Previews */}
//           {previews.length > 0 && (
//             <div className="flex gap-3 flex-wrap mt-2">
//               {previews.map((src, i) => (
//                 <div key={i} className="relative group">
//                   <img
//                     src={src}
//                     alt={`preview-${i}`}
//                     className="w-24 h-16 object-cover rounded-lg border border-gray-200"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => removeImage(i)}
//                     className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
//                   >
//                     <XIcon size={10} weight="bold" />
//                   </button>
//                 </div>
//               ))}
//               {images.length < MAX_IMAGES && (
//                 <button
//                   type="button"
//                   onClick={() => fileInputRef.current?.click()}
//                   className="w-24 h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300 hover:border-[#507c88] hover:text-[#507c88] transition"
//                 >
//                   <ImageIcon size={20} />
//                 </button>
//               )}
//             </div>
//           )}
//         </div>

//         {/* ── Basic Info ── */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Basic Info</p>
//           <div className="grid grid-cols-1 gap-4">
//             <Input label="Billboard Title"  name="billboardtitle" required placeholder="e.g. City Center Mall Billboard" />
//             <Textarea label="Description"   name="description"    required placeholder="Describe the billboard location and visibility..." />
//           </div>
//         </div>

//         {/* ── Location ── */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Location</p>
//           <div className="grid grid-cols-2 gap-4">
//             <Input label="City"      name="city"      required placeholder="e.g. Mangalore" />
//             <Input label="Locality"  name="locality"  placeholder="e.g. Kaikamba" />
//             <Input label="Landmark"  name="landmark"  placeholder="e.g. Near SBI Bank" />
//             <Input label="Google Maps URL" name="location" placeholder="https://maps.google.com/..." />
//           </div>
//         </div>

//         {/* ── Dimensions & Specs ── */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dimensions & Specs</p>
//           <div className="grid grid-cols-2 gap-4">
//             <Input label="Width (ft)"   name="widthinft"   type="number" placeholder="e.g. 60" />
//             <Input label="Height (ft)"  name="heightinft"  type="number" placeholder="e.g. 40" />
//             <Input label="Impressions"  name="impressions" type="number" placeholder="e.g. 5000" />
//             <Input label="Min Span (days)" name="minspan"  type="number" placeholder="e.g. 15" />
//             <Input label="Types"        name="types"       placeholder="e.g. city square, lighting" />
//             <Input label="Materials"    name="materials"   placeholder="e.g. flex, metal" />
//             <Input label="Mountings"    name="mountings"   placeholder="e.g. wall mount, pole" />
//           </div>
//         </div>

//         {/* ── Pricing ── */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pricing</p>
//           <div className="grid grid-cols-3 gap-4">
//             <Input label="Price / Day (₹)"       name="price"          type="number" required placeholder="e.g. 160" />
//             <Input label="Mounting Charge (₹)"   name="mountingcharge" type="number" placeholder="e.g. 1500" />
//             <Input label="Other Charges (₹)"     name="othercharges"   type="number" placeholder="e.g. 500" />
//           </div>
//         </div>

//         {/* ── Submit ── */}
//         <div className="flex gap-3 pt-2">
//           <button
//             type="button"
//             onClick={() => navigate("/partner/billboards")}
//             className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={submitting}
//             className="px-6 py-2 bg-[#507c88] text-white rounded-lg text-sm font-medium hover:bg-[#3d6370] transition disabled:opacity-60"
//           >
//             {submitting ? "Saving…" : "Add Billboard"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// import React, { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeftIcon, UploadSimpleIcon, XIcon, ImageIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";

// const MAX_IMAGES = 5;
// const MAX_SIZE_MB = 5;

// // ── Moved OUTSIDE component to prevent remount on every keystroke ──
// const Input = ({ label, name, type = "text", placeholder = "", required = false, value, onChange }) => (
//   <div className="space-y-1">
//     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//       {label} {required && <span className="text-red-400">*</span>}
//     </label>
//     <input
//       type={type}
//       name={name}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       required={required}
//       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
//     />
//   </div>
// );

// const Textarea = ({ label, name, placeholder = "", required = false, value, onChange }) => (
//   <div className="space-y-1">
//     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//       {label} {required && <span className="text-red-400">*</span>}
//     </label>
//     <textarea
//       name={name}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       required={required}
//       rows={3}
//       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88] resize-none"
//     />
//   </div>
// );

// // ── Dynamic row builder for materials ──
// const MaterialsBuilder = ({ rows, onChange }) => {
//   const addRow    = () => onChange([...rows, { materialType: "", pricePerSqFt: "" }]);
//   const removeRow = (i) => onChange(rows.filter((_, idx) => idx !== i));
//   const updateRow = (i, field, val) => {
//     const updated = rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
//     onChange(updated);
//   };

//   return (
//     <div className="space-y-2">
//       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Materials</label>
//       {rows.map((row, i) => (
//         <div key={i} className="flex gap-2 items-center">
//           <input
//             type="text"
//             placeholder="Material Type (e.g. Flex)"
//             value={row.materialType}
//             onChange={(e) => updateRow(i, "materialType", e.target.value)}
//             className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
//           />
//           <input
//             type="number"
//             placeholder="₹/sq ft"
//             value={row.pricePerSqFt}
//             onChange={(e) => updateRow(i, "pricePerSqFt", e.target.value)}
//             className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
//           />
//           <button type="button" onClick={() => removeRow(i)}
//             className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
//             <TrashIcon size={15} />
//           </button>
//         </div>
//       ))}
//       <button type="button" onClick={addRow}
//         className="flex items-center gap-1.5 text-xs text-[#507c88] hover:text-[#3d6370] font-medium mt-1">
//         <PlusIcon size={13} weight="bold" /> Add Material
//       </button>
//     </div>
//   );
// };

// // ── Dynamic row builder for mountings ──
// const MountingsBuilder = ({ rows, onChange }) => {
//   const addRow    = () => onChange([...rows, { mountingType: "", flatCharge: "" }]);
//   const removeRow = (i) => onChange(rows.filter((_, idx) => idx !== i));
//   const updateRow = (i, field, val) => {
//     const updated = rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
//     onChange(updated);
//   };

//   return (
//     <div className="space-y-2">
//       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mountings</label>
//       {rows.map((row, i) => (
//         <div key={i} className="flex gap-2 items-center">
//           <input
//             type="text"
//             placeholder="Mounting Type (e.g. Normal)"
//             value={row.mountingType}
//             onChange={(e) => updateRow(i, "mountingType", e.target.value)}
//             className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
//           />
//           <input
//             type="number"
//             placeholder="Flat charge (₹)"
//             value={row.flatCharge}
//             onChange={(e) => updateRow(i, "flatCharge", e.target.value)}
//             className="w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
//           />
//           <button type="button" onClick={() => removeRow(i)}
//             className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
//             <TrashIcon size={15} />
//           </button>
//         </div>
//       ))}
//       <button type="button" onClick={addRow}
//         className="flex items-center gap-1.5 text-xs text-[#507c88] hover:text-[#3d6370] font-medium mt-1">
//         <PlusIcon size={13} weight="bold" /> Add Mounting
//       </button>
//     </div>
//   );
// };

// // ── Main component ──
// export default function AddBillboard() {
//   const navigate    = useNavigate();
//   const fileInputRef = useRef(null);
//   const token       = localStorage.getItem("token");

//   const [form, setForm] = useState({
//     billboardtitle: "", description: "", landmark: "", locality: "",
//     location: "", city: "", impressions: "", minspan: "", price: "",
//     types: "", widthinft: "", heightinft: "", mountingcharge: "", othercharges: "",
//   });

//   const [materials,  setMaterials]  = useState([{ materialType: "", pricePerSqFt: "" }]);
//   const [mountings,  setMountings]  = useState([{ mountingType: "", flatCharge: "" }]);
//   const [images,     setImages]     = useState([]);
//   const [previews,   setPreviews]   = useState([]);
//   const [submitting, setSubmitting] = useState(false);
//   const [error,      setError]      = useState(null);
//   const [imgError,   setImgError]   = useState(null);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleImageDrop = (e) => {
//     e.preventDefault();
//     addImages(Array.from(e.dataTransfer.files));
//   };

//   const addImages = (files) => {
//     setImgError(null);
//     const remaining = MAX_IMAGES - images.length;
//     if (remaining <= 0) { setImgError(`Max ${MAX_IMAGES} images allowed.`); return; }
//     const toAdd = files.slice(0, remaining);
//     if (toAdd.some((f) => f.size > MAX_SIZE_MB * 1024 * 1024)) {
//       setImgError(`Each image must be under ${MAX_SIZE_MB}MB.`); return;
//     }
//     const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
//     if (toAdd.some((f) => !validTypes.includes(f.type))) {
//       setImgError("Only JPG, PNG, WEBP allowed."); return;
//     }
//     toAdd.forEach((file) => {
//       const reader = new FileReader();
//       reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target.result]);
//       reader.readAsDataURL(file);
//     });
//     setImages((prev) => [...prev, ...toAdd]);
//   };

//   const removeImage = (i) => {
//     setImages((prev)   => prev.filter((_, idx) => idx !== i));
//     setPreviews((prev) => prev.filter((_, idx) => idx !== i));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     if (images.length === 0) { setError("Please upload at least one image."); return; }

//     setSubmitting(true);
//     try {
//       const fd = new FormData();
//       Object.entries(form).forEach(([key, val]) => { if (val !== "") fd.append(key, val); });

//       // Append materials and mountings as JSON strings
//       const validMaterials = materials.filter((m) => m.materialType && m.pricePerSqFt);
//       const validMountings = mountings.filter((m) => m.mountingType && m.flatCharge);
//       if (validMaterials.length > 0) fd.append("materials", JSON.stringify(validMaterials));
//       if (validMountings.length > 0) fd.append("mountings", JSON.stringify(validMountings));

//       images.forEach((img) => fd.append("images", img));

//       const r = await fetch("/api/partner/billboard", {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       });

//       if (!r.ok) {
//         const err = await r.json().catch(() => ({}));
//         throw new Error(err.message ?? err.error ?? "Failed to add billboard");
//       }
//       navigate("/partner/billboards");
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-3xl">
//       <div className="flex items-center gap-3 mb-6">
//         <button onClick={() => navigate("/partner/billboards")}
//           className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
//           <ArrowLeftIcon size={18} />
//         </button>
//         <div>
//           <h2 className="text-lg font-bold text-gray-800">Add Billboard</h2>
//           <p className="text-sm text-gray-400">Fill in the details to list your billboard</p>
//         </div>
//       </div>

//       {error && <div className="mb-5 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

//       <form onSubmit={handleSubmit} className="space-y-7">

//         {/* Images */}
//         <div className="space-y-2">
//           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//             Images <span className="text-red-400">*</span>
//             <span className="ml-2 text-gray-400 normal-case font-normal">(max {MAX_IMAGES}, {MAX_SIZE_MB}MB each)</span>
//           </label>
//           <div
//             onDrop={handleImageDrop}
//             onDragOver={(e) => e.preventDefault()}
//             onClick={() => images.length < MAX_IMAGES && fileInputRef.current?.click()}
//             className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer
//               ${images.length >= MAX_IMAGES ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
//                 : "border-[#507c88]/40 hover:border-[#507c88] hover:bg-[#507c88]/5"}`}
//           >
//             <UploadSimpleIcon size={28} className="mx-auto text-gray-300 mb-2" />
//             <p className="text-sm text-gray-500">
//               {images.length >= MAX_IMAGES ? "Maximum images reached" : "Drag & drop or click to browse"}
//             </p>
//             <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB each</p>
//           </div>
//           <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
//             multiple onChange={(e) => { addImages(Array.from(e.target.files)); e.target.value = ""; }}
//             className="hidden" />
//           {imgError && <p className="text-xs text-red-500">{imgError}</p>}
//           {previews.length > 0 && (
//             <div className="flex gap-3 flex-wrap mt-2">
//               {previews.map((src, i) => (
//                 <div key={i} className="relative group">
//                   <img src={src} alt="" className="w-24 h-16 object-cover rounded-lg border border-gray-200" />
//                   <button type="button" onClick={() => removeImage(i)}
//                     className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
//                     <XIcon size={10} weight="bold" />
//                   </button>
//                 </div>
//               ))}
//               {images.length < MAX_IMAGES && (
//                 <button type="button" onClick={() => fileInputRef.current?.click()}
//                   className="w-24 h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300 hover:border-[#507c88] hover:text-[#507c88] transition">
//                   <ImageIcon size={20} />
//                 </button>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Basic Info */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Basic Info</p>
//           <div className="grid grid-cols-1 gap-4">
//             <Input label="Billboard Title" name="billboardtitle" required value={form.billboardtitle} onChange={handleChange} placeholder="e.g. City Center Mall Billboard" />
//             <Textarea label="Description" name="description" required value={form.description} onChange={handleChange} placeholder="Describe the billboard location and visibility..." />
//           </div>
//         </div>

//         {/* Location */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Location</p>
//           <div className="grid grid-cols-2 gap-4">
//             <Input label="City"            name="city"     required value={form.city}     onChange={handleChange} placeholder="e.g. Mangalore" />
//             <Input label="Locality"        name="locality"          value={form.locality}  onChange={handleChange} placeholder="e.g. Kaikamba" />
//             <Input label="Landmark"        name="landmark"          value={form.landmark}  onChange={handleChange} placeholder="e.g. Near SBI Bank" />
//             <Input label="Google Maps URL" name="location"          value={form.location}  onChange={handleChange} placeholder="https://maps.google.com/..." />
//           </div>
//         </div>

//         {/* Dimensions */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dimensions & Specs</p>
//           <div className="grid grid-cols-2 gap-4">
//             <Input label="Width (ft)"        name="widthinft"   type="number" value={form.widthinft}   onChange={handleChange} placeholder="e.g. 60" />
//             <Input label="Height (ft)"       name="heightinft"  type="number" value={form.heightinft}  onChange={handleChange} placeholder="e.g. 40" />
//             <Input label="Impressions"       name="impressions" type="number" value={form.impressions} onChange={handleChange} placeholder="e.g. 5000" />
//             <Input label="Min Span (days)"   name="minspan"     type="number" value={form.minspan}     onChange={handleChange} placeholder="e.g. 15" />
//             <Input label="Types"             name="types"                     value={form.types}       onChange={handleChange} placeholder="e.g. city square, lighting" />
//           </div>
//         </div>

//         {/* Materials & Mountings */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Materials & Mountings</p>
//           <div className="grid grid-cols-1 gap-6">
//             <MaterialsBuilder rows={materials} onChange={setMaterials} />
//             <MountingsBuilder rows={mountings} onChange={setMountings} />
//           </div>
//         </div>

//         {/* Pricing */}
//         <div>
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pricing</p>
//           <div className="grid grid-cols-3 gap-4">
//             <Input label="Price / Day (₹)"     name="price"          type="number" required value={form.price}          onChange={handleChange} placeholder="e.g. 160" />
//             <Input label="Mounting Charge (₹)" name="mountingcharge" type="number"          value={form.mountingcharge} onChange={handleChange} placeholder="e.g. 1500" />
//             <Input label="Other Charges (₹)"   name="othercharges"   type="number"          value={form.othercharges}   onChange={handleChange} placeholder="e.g. 500" />
//           </div>
//         </div>

//         {/* Submit */}
//         <div className="flex gap-3 pt-2">
//           <button type="button" onClick={() => navigate("/partner/billboards")}
//             className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition">
//             Cancel
//           </button>
//           <button type="submit" disabled={submitting}
//             className="px-6 py-2 bg-[#507c88] text-white rounded-lg text-sm font-medium hover:bg-[#3d6370] transition disabled:opacity-60">
//             {submitting ? "Saving…" : "Add Billboard"}
//           </button>
//         </div>

//       </form>
//     </div>
//   );
// }

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  UploadSimpleIcon,
  XIcon,
  ImageIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

// ── Moved OUTSIDE component to prevent remount on every keystroke ──
const Input = ({
  label,
  name,
  type = "text",
  placeholder = "",
  required = false,
  value,
  onChange,
}) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
    />
  </div>
);

const Textarea = ({
  label,
  name,
  placeholder = "",
  required = false,
  value,
  onChange,
}) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={3}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88] resize-none"
    />
  </div>
);

// ── Dynamic row builder for materials ──
const MaterialsBuilder = ({ rows, onChange }) => {
  const addRow = () =>
    onChange([...rows, { materialType: "", pricePerSqFt: "" }]);
  const removeRow = (i) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) => {
    const updated = rows.map((r, idx) =>
      idx === i ? { ...r, [field]: val } : r,
    );
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Materials
      </label>
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Material Type (e.g. Flex)"
            value={row.materialType}
            onChange={(e) => updateRow(i, "materialType", e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
          />
          <input
            type="number"
            placeholder="₹/sq ft"
            value={row.pricePerSqFt}
            onChange={(e) => updateRow(i, "pricePerSqFt", e.target.value)}
            className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <TrashIcon size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-xs text-[#507c88] hover:text-[#3d6370] font-medium mt-1"
      >
        <PlusIcon size={13} weight="bold" /> Add Material
      </button>
    </div>
  );
};

// ── Dynamic row builder for mountings ──
const MountingsBuilder = ({ rows, onChange }) => {
  const addRow = () =>
    onChange([...rows, { mountingType: "", flatCharge: "" }]);
  const removeRow = (i) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) => {
    const updated = rows.map((r, idx) =>
      idx === i ? { ...r, [field]: val } : r,
    );
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Mountings
      </label>
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Mounting Type (e.g. Normal)"
            value={row.mountingType}
            onChange={(e) => updateRow(i, "mountingType", e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
          />
          <input
            type="number"
            placeholder="Flat charge (₹)"
            value={row.flatCharge}
            onChange={(e) => updateRow(i, "flatCharge", e.target.value)}
            className="w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <TrashIcon size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-xs text-[#507c88] hover:text-[#3d6370] font-medium mt-1"
      >
        <PlusIcon size={13} weight="bold" /> Add Mounting
      </button>
    </div>
  );
};

// ── Main component ──
export default function AddBillboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    billboardtitle: "",
    description: "",
    landmark: "",
    locality: "",
    location: "",
    city: "",
    impressions: "",
    minspan: "",
    price: "",
    types: "",
    widthinft: "",
    heightinft: "",
    mountingcharge: "",
    othercharges: "",
  });

  const [materials, setMaterials] = useState([
    { materialType: "", pricePerSqFt: "" },
  ]);
  const [mountings, setMountings] = useState([
    { mountingType: "", flatCharge: "" },
  ]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    addImages(Array.from(e.dataTransfer.files));
  };

  const addImages = (files) => {
    setImgError(null);
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setImgError(`Max ${MAX_IMAGES} images allowed.`);
      return;
    }
    const toAdd = files.slice(0, remaining);
    if (toAdd.some((f) => f.size > MAX_SIZE_MB * 1024 * 1024)) {
      setImgError(`Each image must be under ${MAX_SIZE_MB}MB.`);
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (toAdd.some((f) => !validTypes.includes(f.type))) {
      setImgError("Only JPG, PNG, WEBP allowed.");
      return;
    }
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPreviews((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
    setImages((prev) => [...prev, ...toAdd]);
  };

  const removeImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== "") fd.append(key, val);
      });

      // Append materials and mountings as JSON strings
      const validMaterials = materials
        .filter((m) => m.materialType && m.pricePerSqFt)
        .map((m) => ({
          materialType: m.materialType,
          pricePerSqFt: Number(m.pricePerSqFt),
        }));
      const validMountings = mountings
        .filter((m) => m.mountingType && m.flatCharge)
        .map((m) => ({
          mountingType: m.mountingType,
          flatCharge: Number(m.flatCharge),
        }));
      if (validMaterials.length > 0)
        fd.append("materials", JSON.stringify(validMaterials));
      if (validMountings.length > 0)
        fd.append("mountings", JSON.stringify(validMountings));

      images.forEach((img) => fd.append("images", img));

      const r = await fetch("/api/partner/billboard", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.message ?? err.error ?? "Failed to add billboard");
      }
      navigate("/partner/billboards");
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/partner/billboards")}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
        >
          <ArrowLeftIcon size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Add Billboard</h2>
          <p className="text-sm text-gray-400">
            Fill in the details to list your billboard
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Images */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Images <span className="text-red-400">*</span>
            <span className="ml-2 text-gray-400 normal-case font-normal">
              (max {MAX_IMAGES}, {MAX_SIZE_MB}MB each)
            </span>
          </label>
          <div
            onDrop={handleImageDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() =>
              images.length < MAX_IMAGES && fileInputRef.current?.click()
            }
            className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer
              ${
                images.length >= MAX_IMAGES
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                  : "border-[#507c88]/40 hover:border-[#507c88] hover:bg-[#507c88]/5"
              }`}
          >
            <UploadSimpleIcon
              size={28}
              className="mx-auto text-gray-300 mb-2"
            />
            <p className="text-sm text-gray-500">
              {images.length >= MAX_IMAGES
                ? "Maximum images reached"
                : "Drag & drop or click to browse"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB each
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => {
              addImages(Array.from(e.target.files));
              e.target.value = "";
            }}
            className="hidden"
          />
          {imgError && <p className="text-xs text-red-500">{imgError}</p>}
          {previews.length > 0 && (
            <div className="flex gap-3 flex-wrap mt-2">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img
                    src={src}
                    alt=""
                    className="w-24 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <XIcon size={10} weight="bold" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300 hover:border-[#507c88] hover:text-[#507c88] transition"
                >
                  <ImageIcon size={20} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div>
          <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">
            Basic Info
          </p>
          <div className="grid grid-cols-1 gap-4 text-gray-600">
            <Input
              label="Billboard Title"
              name="billboardtitle"
              required
              value={form.billboardtitle}
              onChange={handleChange}
              placeholder="e.g. City Center Mall Billboard"
            />
            <Textarea
              label="Description"
              name="description"
              required
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the billboard location and visibility..."
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">
            Location
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              name="city"
              required
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. Mangalore"
            />
            <Input
              label="Locality"
              name="locality"
              value={form.locality}
              onChange={handleChange}
              placeholder="e.g. Kaikamba"
            />
            <Input
              label="Landmark"
              name="landmark"
              value={form.landmark}
              onChange={handleChange}
              placeholder="e.g. Near SBI Bank"
            />
            <Input
              label="Google Maps URL"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">
            Dimensions & Specs
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Width (ft)"
              name="widthinft"
              type="number"
              value={form.widthinft}
              onChange={handleChange}
              placeholder="e.g. 60"
            />
            <Input
              label="Height (ft)"
              name="heightinft"
              type="number"
              value={form.heightinft}
              onChange={handleChange}
              placeholder="e.g. 40"
            />
            <Input
              label="Impressions"
              name="impressions"
              type="number"
              value={form.impressions}
              onChange={handleChange}
              placeholder="e.g. 5000"
            />
            <Input
              label="Min Span (days)"
              name="minspan"
              type="number"
              value={form.minspan}
              onChange={handleChange}
              placeholder="e.g. 15"
            />
            <Input
              label="Types"
              name="types"
              value={form.types}
              onChange={handleChange}
              placeholder="e.g. city square, lighting"
            />
          </div>
        </div>

        {/* Materials & Mountings */}
        <div>
          <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">
            Materials & Mountings
          </p>
          <div className="grid grid-cols-1 gap-6">
            <MaterialsBuilder rows={materials} onChange={setMaterials} />
            <MountingsBuilder rows={mountings} onChange={setMountings} />
          </div>
        </div>

        {/* Pricing */}
        <div>
          <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Price / Day (₹)"
              name="price"
              type="number"
              required
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 160"
            />
            {/* <Input label="Mounting Charge (₹)" name="mountingcharge" type="number"          value={form.mountingcharge} onChange={handleChange} placeholder="e.g. 1500" />
            <Input label="Other Charges (₹)"   name="othercharges"   type="number"          value={form.othercharges}   onChange={handleChange} placeholder="e.g. 500" /> */}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/partner/billboards")}
            className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-[#507c88] text-white rounded-lg text-sm font-medium hover:bg-[#3d6370] transition disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Add Billboard"}
          </button>
        </div>
      </form>
    </div>
  );
}
