// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useNavigate, useLocation } from "react-router-dom";

// // ─── Validation Schema ────────────────────────────────────────────────────────
// const partnerSchema = z.object({
//   gstnumber: z
//     .string()
//     // .optional()
//     .refine(
//       (v) => !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v),
//       { message: "Enter a valid GST number (e.g. 22AAAAA0000A1Z5)" }
//     ),
//   pannumber: z
//     .string()
//     // .optional()
//     .refine((v) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v), {
//       message: "Enter a valid PAN (e.g. ABCDE1234F)",
//     }),
//   contactemail: z.string().email("Enter a valid email"),
//   contactphone: z
//     .string()
//     .min(10, "10 digits required")
//     .max(10, "10 digits required")
//     .regex(/^[0-9]+$/, "Only digits"),
//   businesstype: z.string().min(1, "Select a business type"),
//   street:   z.string().min(3, "Street is required"),
//   city:     z.string().min(2, "City is required"),
//   state:    z.string().min(2, "State is required"),
//   pincode:  z.string().length(6, "Enter a valid 6-digit PIN").regex(/^[0-9]+$/, "Only digits"),
//   country:  z.string().min(2, "Country is required"),
// });

// // ─── Shared UI Pieces (matching signup.jsx aesthetic) ────────────────────────
// const Field = ({ label, error, children, optional }) => (
//   <div className="flex flex-col gap-1.5">
//     <label className="text-[13px] font-semibold text-gray-600 tracking-wide flex items-center gap-1.5">
//       {label}
//       {optional && <span className="text-[11px] font-normal text-gray-400">(optional)</span>}
//     </label>
//     {children}
//     {error && <p className="text-[11px] text-red-500 font-semibold">{error}</p>}
//   </div>
// );

// const inputCls = (hasError) =>
//   `w-full px-3.5 py-2.5 text-sm rounded-lg border bg-gray-50 text-gray-800 placeholder-gray-300 outline-none transition-all duration-150 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-100 ${
//     hasError ? "border-red-400 bg-red-50" : "border-gray-200"
//   }`;

// // ─── Section Divider ─────────────────────────────────────────────────────────
// const SectionTitle = ({ icon, title, subtitle }) => (
//   <div className="flex items-start gap-3 mb-1 mt-2">
//     <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
//       <span className="text-base">{icon}</span>
//     </div>
//     <div>
//       <p className="text-[13px] font-bold text-gray-800">{title}</p>
//       {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
//     </div>
//   </div>
// );

// // ─── Illustration (billboard / city skyline) ──────────────────────────────────
// const PartnerIllustration = () => (
//   <svg viewBox="0 0 340 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs drop-shadow-xl">
//     {/* Ground shadow */}
//     <ellipse cx="170" cy="335" rx="110" ry="14" fill="#d1d5db" opacity="0.4"/>

//     {/* City skyline silhouette */}
//     <rect x="30"  y="230" width="30" height="90" rx="2" fill="#e5e7eb"/>
//     <rect x="32"  y="215" width="26" height="18" rx="1" fill="#d1d5db"/>
//     <rect x="70"  y="200" width="40" height="120" rx="2" fill="#e5e7eb"/>
//     <rect x="72"  y="185" width="36" height="18" rx="1" fill="#d1d5db"/>
//     <rect x="118" y="240" width="25" height="80" rx="2" fill="#e5e7eb"/>
//     <rect x="220" y="220" width="35" height="100" rx="2" fill="#e5e7eb"/>
//     <rect x="263" y="195" width="42" height="125" rx="2" fill="#e5e7eb"/>
//     <rect x="265" y="178" width="38" height="20" rx="1" fill="#d1d5db"/>

//     {/* Billboard pole */}
//     <rect x="155" y="185" width="8" height="135" rx="3" fill="#6b7280"/>
//     <rect x="143" y="308" width="32" height="12" rx="3" fill="#4b5563"/>

//     {/* Billboard board */}
//     <rect x="75" y="60" width="190" height="130" rx="12" fill="white" stroke="#e5e7eb" strokeWidth="2"/>
//     <rect x="75" y="60" width="190" height="130" rx="12" fill="url(#billboardGrad)"/>

//     {/* Billboard top stripe */}
//     <rect x="75" y="60" width="190" height="28" rx="12" fill="#0d9488"/>
//     <rect x="75" y="75" width="190" height="13" fill="#0d9488"/>

//     {/* Billboard content */}
//     <text x="170" y="80" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="sans-serif">PARTNER WITH US</text>
//     <rect x="100" y="102" width="140" height="7" rx="3.5" fill="#ccfbf1"/>
//     <rect x="115" y="116" width="110" height="6" rx="3" fill="#99f6e4"/>
//     <rect x="108" y="130" width="50" height="18" rx="6" fill="#0d9488"/>
//     <text x="133" y="143" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="sans-serif">EXPLORE</text>
//     <rect x="168" y="130" width="65" height="18" rx="6" fill="white" stroke="#0d9488" strokeWidth="1.5"/>
//     <text x="200" y="143" textAnchor="middle" fill="#0d9488" fontSize="9" fontWeight="700" fontFamily="sans-serif">CONTACT</text>

//     {/* Billboard legs crossbar */}
//     <line x1="155" y1="230" x2="140" y2="310" stroke="#6b7280" strokeWidth="3" strokeLinecap="round"/>
//     <line x1="163" y1="230" x2="178" y2="310" stroke="#6b7280" strokeWidth="3" strokeLinecap="round"/>

//     {/* Window lights */}
//     <rect x="38"  y="240" width="7" height="7" rx="1" fill="#fde68a"/>
//     <rect x="48"  y="240" width="7" height="7" rx="1" fill="#fde68a"/>
//     <rect x="38"  y="253" width="7" height="7" rx="1" fill="#d1d5db"/>
//     <rect x="78"  y="215" width="8" height="8" rx="1" fill="#a5f3fc"/>
//     <rect x="90"  y="215" width="8" height="8" rx="1" fill="#fde68a"/>
//     <rect x="78"  y="228" width="8" height="8" rx="1" fill="#a5f3fc"/>
//     <rect x="270" y="208" width="9" height="9" rx="1" fill="#a5f3fc"/>
//     <rect x="283" y="208" width="9" height="9" rx="1" fill="#fde68a"/>
//     <rect x="296" y="208" width="9" height="9" rx="1" fill="#a5f3fc"/>
//     <rect x="270" y="222" width="9" height="9" rx="1" fill="#fde68a"/>
//     <rect x="283" y="222" width="9" height="9" rx="1" fill="#d1d5db"/>

//     <defs>
//       <linearGradient id="billboardGrad" x1="75" y1="60" x2="265" y2="190" gradientUnits="userSpaceOnUse">
//         <stop offset="0%" stopColor="#f0fdfa"/>
//         <stop offset="100%" stopColor="#e0f2fe"/>
//       </linearGradient>
//     </defs>
//   </svg>
// );

// // ─── STEP INDICATOR ───────────────────────────────────────────────────────────
// const StepIndicator = () => (
//   <div className="flex items-center gap-2 mb-8">
//     {/* Step 1 - done */}
//     <div className="flex items-center gap-1.5">
//       <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
//         <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
//         </svg>
//       </div>
//       <span className="text-[12px] font-semibold text-teal-600">Account</span>
//     </div>
//     <div className="flex-1 h-[2px] bg-teal-200 rounded-full"/>
//     {/* Step 2 - active */}
//     <div className="flex items-center gap-1.5">
//       <div className="w-6 h-6 rounded-full bg-teal-600 ring-4 ring-teal-100 flex items-center justify-center">
//         <span className="text-[10px] font-black text-white">2</span>
//       </div>
//       <span className="text-[12px] font-black text-teal-700">Business</span>
//     </div>
//     <div className="flex-1 h-[2px] bg-gray-200 rounded-full"/>
//     {/* Step 3 - upcoming */}
//     <div className="flex items-center gap-1.5">
//       <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
//         <span className="text-[10px] font-bold text-gray-500">3</span>
//       </div>
//       <span className="text-[12px] font-semibold text-gray-400">Cities</span>
//     </div>
//   </div>
// );

// // ─── INDIAN STATES ────────────────────────────────────────────────────────────
// const INDIAN_STATES = [
//   "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
//   "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
//   "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
//   "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
//   "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
//   "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
//   "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
// ];

// const BUSINESS_TYPES = [
//   { value: "INDIVIDUAL",   label: "Individual / Sole Proprietor" },
//   { value: "PARTNERSHIP",  label: "Partnership Firm" },
//   { value: "LLP",          label: "Limited Liability Partnership (LLP)" },
//   { value: "PRIVATE_LTD",  label: "Private Limited Company" },
//   { value: "PUBLIC_LTD",   label: "Public Limited Company" },
//   { value: "TRUST_NGO",    label: "Trust / NGO" },
//   { value: "OTHER",        label: "Other" },
// ];

// // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// export default function PartnerForm() {
//   const navigate  = useNavigate();
//   const location  = useLocation();

//   // Data passed from SignUp page
//   const signUpData = location.state?.SignUpData ?? {};

//   const [apiError, setApiError] = useState("");
//   const [loading,  setLoading]  = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({ resolver: zodResolver(partnerSchema) });

//   async function submitForm(data) {
//     setApiError("");
//     setLoading(true);

//     try {
//       const payload = {
//         // ── From SignUp step ──────────────────────────
//         firstname:       signUpData.firstname,
//         lastname:        signUpData.lastname,
//         dob:             new Date(signUpData.dob).toISOString(),
//         mobile:          `+91${signUpData.mobile}`,
//         email:           signUpData.email,
//         password:        signUpData.password,
//         role:            "PARTNER",
//         usercart:        [],
//         favouritecities: [],
//         orderids:        [],

//         // ── Partner-specific ──────────────────────────
//         partner: {
//           gstnumber:    data.gstnumber    || "",
//           pannumber:    data.pannumber    || "",
//           contactemail: data.contactemail,
//           contactphone: `+91${data.contactphone}`,
//           businesstype: data.businesstype,
//           address: {
//             street:  data.street,
//             city:    data.city,
//             state:   data.state,
//             pincode: data.pincode,
//             country: data.country,
//           },
//         },
//       };

//       const response = await fetch("http://localhost:8000/api/register", {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify(payload),
//       });

//       const responseData = await response.json();
//       console.log("✅ Partner register response:", responseData);

//       if (!response.ok) {
//         setApiError(responseData.message || responseData.error || "Registration failed.");
//         return;
//       }

//       const userid =
//         responseData.userid     ||
//         responseData.user_id    ||
//         responseData.UserID     ||
//         responseData.id         ||
//         responseData._id        ||
//         responseData.InsertedID ||
//         null;

//       navigate("/fav-city", {
//         state: {
//           userid,
//           email: signUpData.email,
//         },
//       });

//     } catch (err) {
//       console.error(err);
//       setApiError("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <>
//       <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap'); * { font-family: 'Nunito', sans-serif !important; }`}</style>

//       <div className="flex min-h-screen w-full">

//         {/* ── LEFT: Form Panel ── */}
//         <div className="w-1/2 min-h-screen bg-white flex flex-col justify-center px-16 py-10 overflow-y-auto">
//           <div className="w-full max-w-md mx-auto">

//             {/* Back link */}
//             <button
//               type="button"
//               onClick={() => navigate(-1)}
//               className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-teal-700 font-semibold mb-6 transition-colors"
//             >
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
//               </svg>
//               Back
//             </button>

//             {/* Step Indicator */}
//             <StepIndicator />

//             <h1 className="text-[2rem] font-black text-gray-900 leading-tight tracking-tight mb-1">
//               Business Details
//             </h1>
//             <p className="text-sm text-gray-400 font-medium mb-8">
//               Tell us about your business so we can verify your partner account.
//             </p>

//             {/* API Error */}
//             {apiError && (
//               <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
//                 {apiError}
//               </div>
//             )}

//             <form onSubmit={handleSubmit(submitForm)} noValidate className="flex flex-col gap-4">

//               {/* ── Business Info ── */}
//               <SectionTitle icon="🏢" title="Business Information" subtitle="Core details about your company"/>

//               <Field label="Business Type" error={errors.businesstype?.message}>
//                 <div className="relative">
//                   <select
//                     {...register("businesstype")}
//                     defaultValue=""
//                     className={`appearance-none cursor-pointer pr-10 ${inputCls(!!errors.businesstype)}`}
//                   >
//                     <option value="" disabled>Select business type…</option>
//                     {BUSINESS_TYPES.map((bt) => (
//                       <option key={bt.value} value={bt.value}>{bt.label}</option>
//                     ))}
//                   </select>
//                   <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                     fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
//                   </svg>
//                 </div>
//               </Field>

//               <div className="grid grid-cols-2 gap-4">
//                 <Field label="GST Number" error={errors.gstnumber?.message} optional>
//                   <input
//                     {...register("gstnumber")}
//                     placeholder="22AAAAA0000A1Z5"
//                     className={inputCls(!!errors.gstnumber)}
//                     style={{ textTransform: "uppercase" }}
//                   />
//                 </Field>
//                 <Field label="PAN Number" error={errors.pannumber?.message} optional>
//                   <input
//                     {...register("pannumber")}
//                     placeholder="ABCDE1234F"
//                     className={inputCls(!!errors.pannumber)}
//                     style={{ textTransform: "uppercase" }}
//                   />
//                 </Field>
//               </div>

//               {/* ── Contact Info ── */}
//               <SectionTitle icon="📞" title="Contact Information" subtitle="How clients can reach your business"/>

//               <Field label="Business Email" error={errors.contactemail?.message}>
//                 <input
//                   type="email"
//                   {...register("contactemail")}
//                   placeholder="business@company.com"
//                   className={inputCls(!!errors.contactemail)}
//                 />
//               </Field>

//               <Field label="Business Phone" error={errors.contactphone?.message}>
//                 <div className={`flex items-center rounded-lg border overflow-hidden transition-all focus-within:ring-2 focus-within:ring-teal-100 focus-within:border-teal-600 ${errors.contactphone ? "border-red-400" : "border-gray-200"}`}>
//                   <span className="px-3 py-2.5 text-sm font-bold text-gray-400 bg-gray-100 border-r border-gray-200 select-none">+91</span>
//                   <input
//                     {...register("contactphone")}
//                     placeholder="98765 43210"
//                     maxLength={10}
//                     className="flex-1 px-3 py-2.5 text-sm bg-gray-50 outline-none text-gray-800 placeholder-gray-300 focus:bg-white"
//                   />
//                 </div>
//               </Field>

//               {/* ── Address ── */}
//               <SectionTitle icon="📍" title="Business Address" subtitle="Registered address of your business"/>

//               <Field label="Street / Area" error={errors.street?.message}>
//                 <input
//                   {...register("street")}
//                   placeholder="123, MG Road, Koramangala"
//                   className={inputCls(!!errors.street)}
//                 />
//               </Field>

//               <div className="grid grid-cols-2 gap-4">
//                 <Field label="City" error={errors.city?.message}>
//                   <input {...register("city")} placeholder="Bengaluru" className={inputCls(!!errors.city)}/>
//                 </Field>
//                 <Field label="PIN Code" error={errors.pincode?.message}>
//                   <input {...register("pincode")} placeholder="560034" maxLength={6} className={inputCls(!!errors.pincode)}/>
//                 </Field>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <Field label="State" error={errors.state?.message}>
//                   <div className="relative">
//                     <select
//                       {...register("state")}
//                       defaultValue=""
//                       className={`appearance-none cursor-pointer pr-10 ${inputCls(!!errors.state)}`}
//                     >
//                       <option value="" disabled>Select state…</option>
//                       {INDIAN_STATES.map((s) => (
//                         <option key={s} value={s}>{s}</option>
//                       ))}
//                     </select>
//                     <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                       fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
//                     </svg>
//                   </div>
//                 </Field>
//                 <Field label="Country" error={errors.country?.message}>
//                   <input
//                     {...register("country")}
//                     defaultValue="India"
//                     placeholder="India"
//                     className={inputCls(!!errors.country)}
//                   />
//                 </Field>
//               </div>

//               {/* ── Pending notice ── */}
//               <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 mt-1">
//                 <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
//                 </svg>
//                 <p className="text-[12px] text-amber-700 font-semibold leading-relaxed">
//                   Your partner account will be in <strong>PENDING</strong> status until verified by our team. You'll be notified once approved.
//                 </p>
//               </div>

//               {/* ── Submit ── */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full mt-1 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.985] text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20 transition-all duration-200"
//               >
//                 {loading ? (
//                   <>
//                     <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
//                     </svg>
//                     Registering…
//                   </>
//                 ) : (
//                   <>
//                     Next
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
//                     </svg>
//                   </>
//                 )}
//               </button>

//               <p className="text-center text-sm text-gray-400 font-medium">
//                 Not a partner?{" "}
//                 <a href="/signup" className="text-gray-800 font-extrabold hover:text-teal-700 transition">
//                   Go back to Sign Up
//                 </a>
//               </p>

//             </form>
//           </div>
//         </div>

//         {/* ── RIGHT: Illustration Panel ── */}
//         <div className="w-1/2 min-h-screen bg-gray-50 flex flex-col items-center justify-center px-10 py-10 sticky top-0">
//           <div className="flex flex-col items-center max-w-sm w-full">
//             <PartnerIllustration/>

//             <h2 className="mt-8 text-xl font-extrabold text-gray-800 text-center tracking-tight">
//               Grow your billboard business
//             </h2>
//             <p className="mt-2 text-sm text-gray-400 font-medium text-center max-w-xs leading-relaxed">
//               List your outdoor media inventory and connect with brands looking to reach audiences across India.
//             </p>

//             {/* Mini feature list */}
//             <div className="mt-6 w-full max-w-xs flex flex-col gap-3">
//               {[
//                 { icon: "📊", text: "Real-time booking dashboard" },
//                 { icon: "💰", text: "Transparent earnings & payouts" },
//                 { icon: "🛡️",  text: "Verified partner badge" },
//               ].map((f) => (
//                 <div key={f.text} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm">
//                   <span className="text-lg">{f.icon}</span>
//                   <span className="text-[13px] font-semibold text-gray-700">{f.text}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//       </div>
//     </>
//   );
// }

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";

// ─── Validation Schema ────────────────────────────────────────────────────────
const partnerSchema = z.object({
  // Business info
  businessname: z.string().min(2, "Business name is required"),
  businesstype: z.string().min(1, "Select a business type"),
  gstnumber: z
    .string()
    .optional()
    .refine(
      (v) =>
        !v ||
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v),
      { message: "Enter a valid GST number (e.g. 22AAAAA0000A1Z5)" },
    ),
  pannumber: z
    .string()
    .optional()
    .refine((v) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v), {
      message: "Enter a valid PAN (e.g. ABCDE1234F)",
    }),

  // Contact
  contactemail: z.string().email("Enter a valid email"),
  contactphone: z
    .string()
    .min(10, "10 digits required")
    .max(10, "10 digits required")
    .regex(/^[0-9]+$/, "Only digits"),

  // Address
  street: z.string().min(3, "Street is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z
    .string()
    .length(6, "Enter a valid 6-digit PIN")
    .regex(/^[0-9]+$/, "Only digits"),
  country: z.string().min(2, "Country is required"),

  // Bank details
  accountholdername: z.string().min(2, "Account holder name is required"),
  accountnumber: z
    .string()
    .min(9, "Enter a valid account number")
    .max(18, "Too long")
    .regex(/^[0-9]+$/, "Only digits"),
  ifsccode: z
    .string()
    .regex(
      /^[A-Z]{4}0[A-Z0-9]{6}$/,
      "Enter a valid IFSC code (e.g. SBIN0001234)",
    ),
  bankname: z.string().min(2, "Bank name is required"),
  upiid: z
    .string()
    .min(3, "UPI ID is required")
    .regex(/^[\w.\-]+@[\w]+$/, "Enter a valid UPI ID (e.g. name@upi)"),
});

// ─── Shared UI ───────────────────────────────────────────────────────────────
const Field = ({ label, error, children, optional }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-semibold text-gray-600 tracking-wide flex items-center gap-1.5">
      {label}
      {optional && (
        <span className="text-[11px] font-normal text-gray-400">
          (optional)
        </span>
      )}
    </label>
    {children}
    {error && <p className="text-[11px] text-red-500 font-semibold">{error}</p>}
  </div>
);

const inputCls = (hasError) =>
  `w-full px-3.5 py-2.5 text-sm rounded-lg border bg-gray-50 text-gray-800 placeholder-gray-300 outline-none transition-all duration-150 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-100 ${
    hasError ? "border-red-400 bg-red-50" : "border-gray-200"
  }`;

const SectionTitle = ({ icon, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-1 mt-3">
    <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      <span className="text-base">{icon}</span>
    </div>
    <div>
      <p className="text-[13px] font-bold text-gray-800">{title}</p>
      {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

// ─── Illustration ─────────────────────────────────────────────────────────────
const PartnerIllustration = () => (
  <svg
    viewBox="0 0 340 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-xs drop-shadow-xl"
  >
    <ellipse cx="170" cy="335" rx="110" ry="14" fill="#d1d5db" opacity="0.4" />
    <rect x="30" y="230" width="30" height="90" rx="2" fill="#e5e7eb" />
    <rect x="32" y="215" width="26" height="18" rx="1" fill="#d1d5db" />
    <rect x="70" y="200" width="40" height="120" rx="2" fill="#e5e7eb" />
    <rect x="72" y="185" width="36" height="18" rx="1" fill="#d1d5db" />
    <rect x="118" y="240" width="25" height="80" rx="2" fill="#e5e7eb" />
    <rect x="220" y="220" width="35" height="100" rx="2" fill="#e5e7eb" />
    <rect x="263" y="195" width="42" height="125" rx="2" fill="#e5e7eb" />
    <rect x="265" y="178" width="38" height="20" rx="1" fill="#d1d5db" />
    <rect x="155" y="185" width="8" height="135" rx="3" fill="#6b7280" />
    <rect x="143" y="308" width="32" height="12" rx="3" fill="#4b5563" />
    <rect
      x="75"
      y="60"
      width="190"
      height="130"
      rx="12"
      fill="white"
      stroke="#e5e7eb"
      strokeWidth="2"
    />
    <rect
      x="75"
      y="60"
      width="190"
      height="130"
      rx="12"
      fill="url(#billboardGrad)"
    />
    <rect x="75" y="60" width="190" height="28" rx="12" fill="#0d9488" />
    <rect x="75" y="75" width="190" height="13" fill="#0d9488" />
    <text
      x="170"
      y="80"
      textAnchor="middle"
      fill="white"
      fontSize="11"
      fontWeight="700"
      fontFamily="sans-serif"
    >
      PARTNER WITH US
    </text>
    <rect x="100" y="102" width="140" height="7" rx="3.5" fill="#ccfbf1" />
    <rect x="115" y="116" width="110" height="6" rx="3" fill="#99f6e4" />
    <rect x="108" y="130" width="50" height="18" rx="6" fill="#0d9488" />
    <text
      x="133"
      y="143"
      textAnchor="middle"
      fill="white"
      fontSize="9"
      fontWeight="700"
      fontFamily="sans-serif"
    >
      EXPLORE
    </text>
    <rect
      x="168"
      y="130"
      width="65"
      height="18"
      rx="6"
      fill="white"
      stroke="#0d9488"
      strokeWidth="1.5"
    />
    <text
      x="200"
      y="143"
      textAnchor="middle"
      fill="#0d9488"
      fontSize="9"
      fontWeight="700"
      fontFamily="sans-serif"
    >
      CONTACT
    </text>
    <line
      x1="155"
      y1="230"
      x2="140"
      y2="310"
      stroke="#6b7280"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="163"
      y1="230"
      x2="178"
      y2="310"
      stroke="#6b7280"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <rect x="38" y="240" width="7" height="7" rx="1" fill="#fde68a" />
    <rect x="48" y="240" width="7" height="7" rx="1" fill="#fde68a" />
    <rect x="78" y="215" width="8" height="8" rx="1" fill="#a5f3fc" />
    <rect x="90" y="215" width="8" height="8" rx="1" fill="#fde68a" />
    <rect x="270" y="208" width="9" height="9" rx="1" fill="#a5f3fc" />
    <rect x="283" y="208" width="9" height="9" rx="1" fill="#fde68a" />
    <rect x="270" y="222" width="9" height="9" rx="1" fill="#fde68a" />
    <defs>
      <linearGradient
        id="billboardGrad"
        x1="75"
        y1="60"
        x2="265"
        y2="190"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#f0fdfa" />
        <stop offset="100%" stopColor="#e0f2fe" />
      </linearGradient>
    </defs>
  </svg>
);

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = () => (
  <div className="flex items-center gap-2 mb-6 sm:mb-8 overflow-x-auto pb-1">
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-6 rounded-full bg-[#507c88] flex items-center justify-center">
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <span className="text-[11px] sm:text-[12px] font-semibold text-teal-600 whitespace-nowrap">
        Account
      </span>
    </div>
    <div className="flex-1 h-[2px] bg-teal-200 rounded-full" />
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-6 rounded-full bg-[#507c88] ring-4 ring-teal-100 flex items-center justify-center">
        <span className="text-[10px] font-black text-white">2</span>
      </div>
      <span className="text-[11px] sm:text-[12px] font-black text-teal-700 whitespace-nowrap">
        Business
      </span>
    </div>
    <div className="flex-1 h-[2px] bg-gray-200 rounded-full" />
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-6 rounded-full bg-[#507c88] flex items-center justify-center">
        <span className="text-[10px] font-bold text-gray-100">3</span>
      </div>
      <span className="text-[11px] sm:text-[12px] font-semibold text-gray-400 whitespace-nowrap">
        Cities
      </span>
    </div>
  </div>
);

// ─── Static Data ──────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const BUSINESS_TYPES = [
  { value: "INDIVIDUAL", label: "Individual / Sole Proprietor" },
  { value: "PARTNERSHIP", label: "Partnership Firm" },
  { value: "LLP", label: "Limited Liability Partnership (LLP)" },
  { value: "PRIVATE_LTD", label: "Private Limited Company" },
  { value: "PUBLIC_LTD", label: "Public Limited Company" },
  { value: "TRUST_NGO", label: "Trust / NGO" },
  { value: "OTHER", label: "Other" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PartnerForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const signUpData = location.state?.SignUpData ?? {};

  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(partnerSchema),
  });

  async function submitForm(data) {
    setApiError("");
    setLoading(true);

    try {
      const payload = {
        // ── From SignUp step ──────────────────────────────────
        firstname: signUpData.firstname,
        lastname: signUpData.lastname,
        dob: new Date(signUpData.dob).toISOString(),
        mobile: `+91${signUpData.mobile}`,
        email: signUpData.email,
        password: signUpData.password,
        role: "PARTNER",
        usercart: [],
        favouritecities: [],
        orderids: [],

        // ── Partner object (matches Go Partner struct) ────────
        partner: {
          businessname: data.businessname,
          businesstype: data.businesstype,
          gstnumber: data.gstnumber || "",
          pannumber: data.pannumber || "",
          contactemail: data.contactemail,
          contactphone: `+91${data.contactphone}`,
          address: {
            street: data.street,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            country: data.country,
          },
          bankdetails: {
            accountholdername: data.accountholdername,
            accountnumber: data.accountnumber,
            ifsccode: data.ifsccode.toUpperCase(),
            bankname: data.bankname,
            upiid: data.upiid,
          },
        },
      };

      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("✅ Partner register response:", responseData);

      if (!response.ok) {
        setApiError(
          responseData.message || responseData.error || "Registration failed.",
        );
        return;
      }

      const userid =
        responseData.userid ||
        responseData.user_id ||
        responseData.UserID ||
        responseData.id ||
        responseData._id ||
        responseData.InsertedID ||
        null;

      navigate("/fav-city", { state: { userid, email: signUpData.email } });
    } catch (err) {
      console.error(err);
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap'); * { font-family: 'Nunito', sans-serif !important; }`}</style> */}
      <div className="w-full font-light text-sm text-center bg-[#507c88] h-[40px] text-white pt-2">LinklyMedia | Outdoor Advertising Platform</div>
      <div className="flex flex-col lg:flex-row min-h-screen w-full">
        {/* ── LEFT: Form Panel ── */}
        <div className="w-full lg:w-1/2 min-h-screen bg-white flex flex-col justify-start px-4 sm:px-8 lg:px-16 py-6 sm:py-10 overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-teal-700 font-semibold mb-6 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>

            <StepIndicator />

            <h1 className="text-3xl sm:text-[2rem] font-semibold text-gray-900 leading-tight tracking-tight mb-1">
              Business Details
            </h1>
            <p className="text-sm text-gray-400 font-medium mb-6 sm:mb-8">
              Tell us about your business so we can verify your partner account.
            </p>

            {apiError && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
                {apiError}
              </div>
            )}

            <form
              onSubmit={handleSubmit(submitForm)}
              noValidate
              className="flex flex-col gap-4"
            >
              {/* ── Business Info ── */}
              {/* <SectionTitle
                icon="🏢"
                title="Business Information"
                subtitle="Core details about your company"
              /> */}

              <Field label="Business Name" error={errors.businessname?.message}>
                <input
                  {...register("businessname")}
                  placeholder="Linkly Media Pvt. Ltd."
                  className={inputCls(!!errors.businessname)}
                />
              </Field>

              <Field label="Business Type" error={errors.businesstype?.message}>
                <div className="relative">
                  <select
                    {...register("businesstype")}
                    defaultValue=""
                    className={`appearance-none cursor-pointer pr-10 ${inputCls(!!errors.businesstype)}`}
                  >
                    <option value="" disabled>
                      Select business type…
                    </option>
                    {BUSINESS_TYPES.map((bt) => (
                      <option key={bt.value} value={bt.value}>
                        {bt.label}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="GST Number"
                  error={errors.gstnumber?.message}
                  optional
                >
                  <input
                    {...register("gstnumber")}
                    placeholder="22AAAAA0000A1Z5"
                    className={inputCls(!!errors.gstnumber)}
                    style={{ textTransform: "uppercase" }}
                  />
                </Field>
                <Field
                  label="PAN Number"
                  error={errors.pannumber?.message}
                  optional
                >
                  <input
                    {...register("pannumber")}
                    placeholder="ABCDE1234F"
                    className={inputCls(!!errors.pannumber)}
                    style={{ textTransform: "uppercase" }}
                  />
                </Field>
              </div>

              {/* ── Contact ── */}
              {/* <SectionTitle
                title="Contact Information"
                subtitle="How clients can reach your business"
              /> */}
              
              <div className="pt-5">
              <h1 className="font-semibold">Contact Information</h1>
              <p className="text-xs text-gray-400">How clients can reach your business</p>
              </div>

              <Field
                label="Business Email"
                error={errors.contactemail?.message}
              >
                <input
                  type="email"
                  {...register("contactemail")}
                  placeholder="business@company.com"
                  className={inputCls(!!errors.contactemail)}
                />
              </Field>

              <Field
                label="Business Phone"
                error={errors.contactphone?.message}
              >
                <div
                  className={`flex items-center rounded-lg border overflow-hidden transition-all focus-within:ring-2 focus-within:ring-teal-100 focus-within:border-teal-600 ${errors.contactphone ? "border-red-400" : "border-gray-200"}`}
                >
                  <span className="px-3 py-2.5 text-sm font-bold text-gray-400 bg-gray-100 border-r border-gray-200 select-none">
                    +91
                  </span>
                  <input
                    {...register("contactphone")}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="flex-1 px-3 py-2.5 text-sm bg-gray-50 outline-none text-gray-800 placeholder-gray-300 focus:bg-white"
                  />
                </div>
              </Field>

              {/* ── Address ── */}
              {/* <SectionTitle
            
                title="Business Address"
                subtitle="Registered address of your business"
              /> */}
              <div className="pt-5">
              <h1 className="font-semibold">Business Address</h1>
              <p className="text-xs text-gray-400">Registered address of your business</p>
              </div>

              <Field label="Street / Area" error={errors.street?.message}>
                <input
                  {...register("street")}
                  placeholder="123, MG Road, Koramangala"
                  className={inputCls(!!errors.street)}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="City" error={errors.city?.message}>
                  <input
                    {...register("city")}
                    placeholder="Bengaluru"
                    className={inputCls(!!errors.city)}
                  />
                </Field>
                <Field label="PIN Code" error={errors.pincode?.message}>
                  <input
                    {...register("pincode")}
                    placeholder="560034"
                    maxLength={6}
                    className={inputCls(!!errors.pincode)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="State" error={errors.state?.message}>
                  <div className="relative">
                    <select
                      {...register("state")}
                      defaultValue=""
                      className={`appearance-none cursor-pointer pr-10 ${inputCls(!!errors.state)}`}
                    >
                      <option value="" disabled>
                        Select state…
                      </option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </Field>
                <Field label="Country" error={errors.country?.message}>
                  <input
                    {...register("country")}
                    defaultValue="India"
                    placeholder="India"
                    className={inputCls(!!errors.country)}
                  />
                </Field>
              </div>

              {/* ── Bank Details ── */}
              {/* <SectionTitle
                icon="🏦"
                title="Bank Details"
                subtitle="For receiving payouts from bookings"
              /> */}
              <div className="pt-5">
              <h1 className="font-semibold">Bank Details</h1>
              <p className="text-xs text-gray-400">For receiving payouts from bookings</p>
              </div>

              <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg bg-blue-50 border border-blue-100">
                <svg
                  className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-[11px] text-blue-700 font-semibold">
                  Your bank information is encrypted and used solely for payout
                  processing.
                </p>
              </div>

              <Field
                label="Account Holder Name"
                error={errors.accountholdername?.message}
              >
                <input
                  {...register("accountholdername")}
                  placeholder="As it appears on your bank account"
                  className={inputCls(!!errors.accountholdername)}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Bank Name" error={errors.bankname?.message}>
                  <input
                    {...register("bankname")}
                    placeholder="State Bank of India"
                    className={inputCls(!!errors.bankname)}
                  />
                </Field>
                <Field label="IFSC Code" error={errors.ifsccode?.message}>
                  <input
                    {...register("ifsccode")}
                    placeholder="SBIN0001234"
                    className={inputCls(!!errors.ifsccode)}
                    style={{ textTransform: "uppercase" }}
                  />
                </Field>
              </div>

              <Field
                label="Account Number"
                error={errors.accountnumber?.message}
              >
                <input
                  {...register("accountnumber")}
                  placeholder="Enter your account number"
                  type="password"
                  autoComplete="off"
                  className={inputCls(!!errors.accountnumber)}
                />
              </Field>

              <Field label="UPI ID" error={errors.upiid?.message}>
                <input
                  {...register("upiid")}
                  placeholder="yourname@upi"
                  className={inputCls(!!errors.upiid)}
                />
              </Field>

              {/* ── Pending Notice ── */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 mt-1">
                <svg
                  className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-[12px] text-amber-700 font-semibold leading-relaxed">
                  Your partner account will be in <strong>PENDING</strong>{" "}
                  status until verified by our team. You'll be notified once
                  approved.
                </p>
              </div>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3 rounded-full bg-[#507c88]/90 hover:bg-[#507c88] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.985] text-white font-bold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20 transition-all duration-200"
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Registering…
                  </>
                ) : (
                  <>
                    Next
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-400 font-medium">
                Not a partner?{" "}
                <a
                  href="/signup"
                  className="text-gray-800 font-extrabold hover:text-teal-700 transition"
                >
                  Go back to Sign Up
                </a>
              </p>
            </form>
          </div>
        </div>

        {/* ── RIGHT: Illustration Panel ── */}
        <div className="hidden lg:flex lg:w-1/2 min-h-screen bg-gray-50 flex-col items-center justify-center px-10 py-10 sticky top-0 self-start">
          <div className="flex flex-col items-center max-w-sm w-full">
            <PartnerIllustration />
            <h2 className="mt-8 text-xl font-semibold text-gray-800 text-center tracking-tight">
              Grow your billboard business
            </h2>
            <p className="mt-2 text-sm text-gray-400 font-medium text-center max-w-xs leading-relaxed">
              List your outdoor media inventory and connect with brands looking
              to reach audiences across India.
            </p>
            <div className="mt-6 w-full max-w-xs flex flex-col gap-3">
              {[
                { icon: "", text: "Real-time booking dashboard" },
                { icon: "", text: "Transparent earnings & payouts" },
                { icon: "", text: "Verified partner badge" },
              ].map((f) => (
                <div
                  key={f.text}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm"
                >
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-[13px] font-semibold text-gray-700">
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <br></br><br></br><br></br><br></br><br></br><br></br>
      </div>
    </>
  );
}
