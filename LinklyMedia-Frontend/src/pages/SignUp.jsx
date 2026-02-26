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
      {/* <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap'); * { font-family: 'Nunito', sans-serif !important; }`}</style> */}
      <div className="w-full font-light text-sm text-center bg-[#507c88] h-[40px] text-white pt-2">LinklyMedia | Outdoor Advertising Platform</div>
      <div className="flex flex-col lg:flex-row min-h-screen w-full">
        <div className="w-full lg:w-1/2 min-h-screen bg-white flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-6 sm:py-10 overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl sm:text-[2rem] font-semibold text-gray-900 leading-tight tracking-tight mb-1 font-[var(--font-barriecito)]">
              Create Account
            </h1>
            <p className="text-sm text-gray-400 font-medium mb-6 sm:mb-8">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full mt-1 py-3 rounded-full bg-[#507c88]/90 hover:bg-[#507c88]/60 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.985] text-white font-semibold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20 transition-all duration-200"
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

        <div className="hidden lg:flex lg:w-1/2 min-h-screen bg-gray-50 flex-col items-center justify-center px-10 py-10 ">
          <div className="flex flex-col items-center max-w-sm w-full">
            <img
              src="/images/Log1.png"
              alt="Signup visual"
              className="w-full max-w-xs object-contain drop-shadow-2xl"
            />
            <h2 className="mt-8 text-xl font-semibold text-gray-800 text-center tracking-tight">
            Build your next campaign with us
            </h2>
            <p className="mt-2 text-sm text-gray-400 font-medium text-center max-w-xs leading-relaxed">
            Sign up and access premium billboard spaces nationwide.
            </p>
          </div>
        </div>
        <br></br><br></br><br></br><br></br><br></br><br></br>
        
      </div>

      
    </>
  );
}
