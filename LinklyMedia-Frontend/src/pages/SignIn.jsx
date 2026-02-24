import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resp, getResp] = useState({});

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);

    const check = {
      email: email,
      password: password,
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/api/login",
        check,
      );
      console.log("BACKEND RESPONSE:", response.data);
      getResp(response.data);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));

      if (response.data.role === "USER") {
        navigate("/");
      } else if (response.data.role === "PARTNER") {
        navigate("/partner");
      } else if (response.data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false); // ✅ always clears after request completes
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#507c88]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#507c88]/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-10 animate-fade-in">
            {/* <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#507c88] to-[#3d5f6a] mb-6 shadow-lg shadow-[#507c88]/30">
              <Sparkles className="w-7 h-7 text-white" />
            </div> */}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group animate-slide-up">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-[#507c88]"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#507c88] focus:border-transparent transition-all duration-300 hover:border-[#507c88]/50"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="group animate-slide-up animation-delay-200">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-[#507c88]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#507c88] focus:border-transparent transition-all duration-300 hover:border-[#507c88]/50 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#507c88] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between animate-slide-up animation-delay-400">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#507c88] focus:ring-2 focus:ring-[#507c88] focus:ring-offset-0 transition-all cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-[#507c88] hover:text-[#3d5f6a] transition-colors font-medium hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative px-6 py-3.5 bg-[#507c88] to-[#3d5f6a] text-white rounded-full font-semibold shadow-lg shadow-[#507c88]/30 hover:shadow-[#507c88]/50 transition-all duration-300  active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up animation-delay-600 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#5d8d9a] to-[#507c88] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="relative my-6 animate-slide-up animation-delay-800">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 animate-slide-up animation-delay-1000">
            <button className="flex items-center justify-center  px-4 py-3 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 hover:border-[#507c88] transition-all duration-300 group">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6 animate-slide-up animation-delay-1200">
            Don't have an account?{" "}
            <span className='underline underline-offset-4" text-blue-800'>
              <NavLink to="/signup">Signup</NavLink>
            </span>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2  bg-white items-center justify-center  relative overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96  rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <div
          className="absolute inset-0 opacity-10"
          //   style={{
          //     backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          //   }}
        ></div>

        {/* Placeholder Content - Replace this with your own content */}
        {/* Image */}
        <div className="relative flex items-center justify-center">
          <img
            src="/images/Password 6.png"
            alt="Auth Illustration"
            className="w-[420px] max-w-full drop-shadow-2xl"
          />
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=:wght@400;500;600;700;800&display=swap');

        * {
          font-family: 'Inter', sans-serif;
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 10px) scale(1.05);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-1200 {
          animation-delay: 1.2s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        /* Ensure animations only play once */
        .animate-fade-in,
        .animate-slide-up {
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}
