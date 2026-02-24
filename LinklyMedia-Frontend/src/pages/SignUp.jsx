import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

const formSchema = z
  .object({
    firstname: z.string().min(2, "Min 2 characters").max(100, "Too long"),
    lastname: z.string().min(1, "Last name is required"),
    dob: z.string().min(1, "Date of birth is required"),
    mobile: z
      .string()
      .min(10, "10 digits required")
      .max(10, "10 digits required")
      .regex(/^[0-9]+$/, "Only digits"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["USER", "ADMIN", "PARTNER"], {
      errorMap: () => ({ message: "Please select an account type" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const PhoneIllustration = () => (
  <svg
    viewBox="0 0 340 390"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-xs drop-shadow-2xl"
  >
    <ellipse cx="150" cy="345" rx="85" ry="12" fill="#d1d5db" opacity="0.5" />
    <rect
      x="55"
      y="25"
      width="190"
      height="305"
      rx="30"
      fill="white"
      stroke="#e5e7eb"
      strokeWidth="2"
    />
    <rect x="115" y="25" width="70" height="18" rx="9" fill="#e5e7eb" />
    <rect
      x="78"
      y="62"
      width="144"
      height="100"
      rx="14"
      fill="#f8fafc"
      stroke="#e5e7eb"
      strokeWidth="1.5"
    />
    <circle cx="120" cy="112" r="18" fill="#d1d5db" />
    <circle cx="138" cy="112" r="18" fill="#c7d2fe" />
    <circle cx="156" cy="112" r="18" fill="#4f46e5" />
    <circle cx="88" cy="188" r="5.5" fill="#93c5fd" />
    <circle cx="103" cy="188" r="5.5" fill="#93c5fd" />
    <circle cx="118" cy="188" r="5.5" fill="#93c5fd" />
    <line
      x1="134"
      y1="188"
      x2="196"
      y2="188"
      stroke="#e5e7eb"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="88" cy="212" r="5.5" fill="#a5b4fc" />
    <circle cx="103" cy="212" r="5.5" fill="#a5b4fc" />
    <circle cx="118" cy="212" r="5.5" fill="#a5b4fc" />
    <line
      x1="134"
      y1="212"
      x2="196"
      y2="212"
      stroke="#e5e7eb"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <rect x="128" y="258" width="74" height="28" rx="9" fill="#4f46e5" />
    <rect x="120" y="310" width="60" height="5" rx="3" fill="#e5e7eb" />
    <ellipse cx="263" cy="345" rx="22" ry="7" fill="#d1d5db" opacity="0.6" />
    <ellipse cx="254" cy="338" rx="13" ry="8" fill="#111827" />
    <ellipse cx="274" cy="338" rx="13" ry="8" fill="#111827" />
    <rect x="246" y="275" width="16" height="64" rx="7" fill="#1e1b4b" />
    <rect x="266" y="275" width="16" height="64" rx="7" fill="#1e1b4b" />
    <rect x="240" y="210" width="46" height="68" rx="12" fill="#6366f1" />
    <path
      d="M240 222 Q220 245 224 268"
      stroke="#fbbf7c"
      strokeWidth="11"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M286 222 Q302 240 296 262"
      stroke="#fbbf7c"
      strokeWidth="11"
      strokeLinecap="round"
      fill="none"
    />
    <rect x="256" y="195" width="14" height="16" rx="5" fill="#fbbf7c" />
    <circle cx="263" cy="180" r="22" fill="#fbbf7c" />
    <path
      d="M241 172 Q242 148 263 148 Q284 148 285 172 Q278 162 263 163 Q248 162 241 172Z"
      fill="#1e1b4b"
    />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-semibold text-gray-600 tracking-wide">
      {label}
    </label>
    {children}
    {error && <p className="text-[11px] text-red-500 font-semibold">{error}</p>}
  </div>
);

const inputCls = (hasError) =>
  `w-full px-3.5 py-2.5 text-sm rounded-lg border bg-gray-50 text-gray-800 placeholder-gray-300 outline-none transition-all duration-150 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-100 ${
    hasError ? "border-red-400 bg-red-50" : "border-gray-200"
  }`;

export default function SignUp() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  async function submitForm(data) {
    setApiError("");

    if (data.role === "PARTNER") {
      navigate("/partnerform", { state: { SignUpData: data } });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: data.firstname,
          lastname: data.lastname,
          dob: new Date(data.dob).toISOString(),
          mobile: `+91${data.mobile}`,
          email: data.email,
          password: data.password,
          role: data.role,
          usercart: [],
          favouritecities: [],
          orderids: [],
        }),
      });

      const responseData = await response.json();
      console.log("✅ Register response:", responseData);

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

      // console.log("✅ userid:", userid);

      navigate("/fav-city", {
        state: {
          userid,
          email: data.email,
        },
      });
    } catch (error) {
      console.error(error);
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap'); * { font-family: 'Nunito', sans-serif !important; }`}</style>

      <div className="flex min-h-screen w-full">
        <div className="w-1/2 min-h-screen bg-white flex flex-col justify-center px-16 py-10 overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-[2rem] font-black text-gray-900 leading-tight tracking-tight mb-1">
              Create Account
            </h1>
            <p className="text-sm text-gray-400 font-medium mb-8">
              Start your journey with us today.
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
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" error={errors.firstname?.message}>
                  <input
                    {...register("firstname")}
                    placeholder="Jane"
                    className={inputCls(!!errors.firstname)}
                  />
                </Field>
                <Field label="Last Name" error={errors.lastname?.message}>
                  <input
                    {...register("lastname")}
                    placeholder="Doe"
                    className={inputCls(!!errors.lastname)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="DOB" error={errors.dob?.message}>
                  <input
                    type="date"
                    {...register("dob")}
                    className={inputCls(!!errors.dob)}
                  />
                </Field>
                <Field label="Mobile No" error={errors.mobile?.message}>
                  <div
                    className={`flex items-center rounded-lg border overflow-hidden transition-all focus-within:ring-2 focus-within:ring-teal-100 focus-within:border-teal-600 ${errors.mobile ? "border-red-400" : "border-gray-200"}`}
                  >
                    <span className="px-3 py-2.5 text-sm font-bold text-gray-400 bg-gray-100 border-r border-gray-200 select-none">
                      +91
                    </span>
                    <input
                      {...register("mobile")}
                      placeholder="98765 43210"
                      maxLength={10}
                      className="flex-1 px-3 py-2.5 text-sm bg-gray-50 outline-none text-gray-800 placeholder-gray-300 focus:bg-white"
                    />
                  </div>
                </Field>
              </div>

              <Field label="Email Address" error={errors.email?.message}>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="jane@example.com"
                  className={inputCls(!!errors.email)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Password" error={errors.password?.message}>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      {...register("password")}
                      placeholder="••••••"
                      className={`${inputCls(!!errors.password)} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-700 transition"
                    >
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                </Field>
                <Field label="Confirm" error={errors.confirmPassword?.message}>
                  <div className="relative">
                    <input
                      type={showCpw ? "text" : "password"}
                      {...register("confirmPassword")}
                      placeholder="••••••"
                      className={`${inputCls(!!errors.confirmPassword)} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCpw((p) => !p)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-700 transition"
                    >
                      <EyeIcon open={showCpw} />
                    </button>
                  </div>
                </Field>
              </div>

              <Field label="Account Type" error={errors.role?.message}>
                <div className="relative">
                  <select
                    {...register("role")}
                    defaultValue=""
                    className={`appearance-none cursor-pointer pr-10 ${inputCls(!!errors.role)}`}
                  >
                    <option value="" disabled>
                      Select account type…
                    </option>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="PARTNER">Partner</option>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.985] text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20 transition-all duration-200"
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
                    Creating account…
                  </>
                ) : (
                  <>
                    Sign Up{" "}
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
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-gray-800 font-extrabold hover:text-teal-700 transition"
                >
                  Sign In
                </a>
              </p>
            </form>
          </div>
        </div>

        <div className="w-1/2 min-h-screen bg-gray-50 flex flex-col items-center justify-center px-10 py-10">
          <div className="flex flex-col items-center max-w-sm w-full">
            <PhoneIllustration />
            <h2 className="mt-8 text-xl font-extrabold text-gray-800 text-center tracking-tight">
              Manage your projects with ease
            </h2>
            <p className="mt-2 text-sm text-gray-400 font-medium text-center max-w-xs leading-relaxed">
              Connect with premium billboard inventory across India and grow
              your reach.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
