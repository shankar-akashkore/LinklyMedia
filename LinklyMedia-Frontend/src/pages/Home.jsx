import React, { useState, useEffect } from "react";
import { TrendUp, ArrowRight, Play } from "@phosphor-icons/react";

const headlines = [
  "Buy best media Ad",
  "Reach millions of customers",
  "Grow your brand faster",
];

export default function Home() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % headlines.length);
        setVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-white">

      {/* ── Background mesh ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-28 -left-28 h-[320px] w-[320px] rounded-full bg-[#507c88]/10 blur-3xl sm:-top-32 sm:-left-32 sm:h-[600px] sm:w-[600px]" />
        <div className="absolute top-1/2 -right-24 h-[280px] w-[280px] rounded-full bg-[#6b9ba8]/10 blur-3xl sm:-right-48 sm:h-[500px] sm:w-[500px]" />
        <div className="absolute bottom-0 left-1/3 h-[220px] w-[220px] rounded-full bg-sky-100/60 blur-3xl sm:h-[400px] sm:w-[400px]" />
        {/* Grid lines */}
        <svg className="absolute inset-0 hidden h-full w-full opacity-[0.035] sm:block" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#507c88" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:pt-24">

        {/* ── Badge ── */}
        <div className="mb-8 flex justify-center sm:mb-10"
          style={{ animation: "fadeSlideUp 0.6s ease both" }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#507c88]/30 bg-[#507c88]/8 px-3 py-1.5 text-xs font-medium text-[#507c88] backdrop-blur-sm sm:px-4 sm:text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#507c88] animate-pulse" />
            India's #1 Advertising Platform
          </span>
        </div>

        {/* ── Hero headline ── */}
        <div className="mb-5 text-center sm:mb-6" style={{ animation: "fadeSlideUp 0.7s 0.1s ease both" }}>
          <h1 className="text-[clamp(2.2rem,11vw,7rem)] font-medium leading-[0.95] tracking-tight text-gray-900">
            Target{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#507c88]">Smart,</span>
              <svg className="absolute -bottom-1.5 left-0 w-full sm:-bottom-2" height="8" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0,6 Q50,0 100,5 Q150,10 200,4" stroke="#507c88" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </span>
          </h1>
          <h1 className="text-[clamp(2.2rem,11vw,7rem)] font-medium leading-[0.95] tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-[#507c88] to-gray-900 bg-clip-text text-transparent">
              Grow Fast.
            </span>
          </h1>
        </div>

        {/* ── Subline ── */}
        <p className="mx-auto mb-8 max-w-xl px-2 text-center text-base leading-relaxed text-gray-500 sm:mb-10 sm:text-lg"
          style={{ animation: "fadeSlideUp 0.7s 0.2s ease both" }}>
          Connect with premium billboard spaces and top influencers to amplify your brand across India's fastest-growing markets.
        </p>

        {/* ── CTAs ── */}
        <div className="mb-12 flex flex-col items-stretch justify-center gap-3 sm:mb-16 sm:flex-row sm:items-center sm:gap-4"
          style={{ animation: "fadeSlideUp 0.7s 0.3s ease both" }}>
          <a href="/signin"
            className="group h-[45px] w-full sm:w-[225px]
            relative isolate inline-flex items-center justify-center gap-2
            px-5 py-2.5
            text-sm sm:text-base font-medium tracking-wide font-[var(--font-barriecito)]
            text-white bg-[#507c88]
            border-2 border-[#507c88] rounded-full
            overflow-hidden
            transition-all duration-300
            hover:text-[#507c88]
            active:scale-95
            
            before:absolute before:inset-0
            before:bg-white
            before:translate-y-full
            before:transition-transform before:duration-300
            before:z-0
            hover:before:translate-y-0">
            <span className="relative z-10">Get Started Today</span>
            <ArrowRight size={16} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <button className="group w-full sm:w-auto
          relative isolate inline-flex items-center justify-center gap-2.5
          px-4 py-2
          text-sm font-medium  tracking-wide font-[var(--font-barriecito)]
          text-[#507c88] bg-transparent
          border-2 border-[#507c88] rounded-full
          overflow-hidden
          transition-all duration-300
          hover:text-white
          active:scale-95
          before:absolute before:inset-0
          before:bg-[#507c88]
          before:translate-y-full
          before:transition-transform before:duration-300
          before:z-0
          hover:before:translate-y-0">
            <span className="
            relative z-10
    h-6 w-6 rounded-full
    bg-gray-100 flex items-center justify-center
    transition-colors duration-300
    group-hover:bg-white/20
            ">
              <Play size={10} weight="fill" className="ml-0.5 text-[#507c88] transition-colors duration-300 group-hover:text-white" />
            </span >
            <span className="relative z-10">
    Watch Demo
  </span>
          </button>
        </div>

        {/* ── Two-card layout ── */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2"
          style={{ animation: "fadeSlideUp 0.8s 0.4s ease both" }}>

          {/* Card 1 — Stats */}
          <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-gray-100/80 transition-transform duration-300 hover:-translate-y-1 sm:p-8">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#507c88]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="mb-5 flex items-center gap-2.5 sm:mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#507c88]/10 flex items-center justify-center">
                <TrendUp size={18} weight="fill" className="text-[#507c88]" />
              </div>
              <span className="text-sm font-semibold text-gray-600">Growing Fast</span>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2 sm:mb-6 sm:gap-4">
              {[
                { num: "10K+", label: "Ad Spaces" },
                { num: "500+", label: "Cities" },
                { num: "2M+", label: "Reach / day" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-lg font-medium text-gray-900 sm:text-2xl">{s.num}</p>
                  <p className="mt-0.5 text-[11px] text-gray-600 sm:text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Animated headline */}
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">What we offer</p>
              <p className={`text-sm font-bold text-gray-800 transition-all duration-300 sm:text-base ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                {headlines[index]}
              </p>
              <div className="flex gap-1.5 mt-3">
                {headlines.map((_, i) => (
                  <span key={i} className={"h-1.5 rounded-full transition-all duration-300 " +
                    (i === index ? "w-5 bg-[#507c88]" : "w-1.5 bg-[#507c88]/20")} />
                ))}
              </div>
            </div>
          </div>

          {/* Card 2 — Visual */}
          <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-[#507c88] to-[#3d6370] p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-8">
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="white"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>
            </div>
            <div className="relative z-10">
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">We Build</p>
              <h3 className="mb-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                Strong<br />Partnerships
              </h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Collaborate with top agencies, brands, and media owners to create campaigns that actually convert.
              </p>
              <div className="flex flex-col gap-2.5">
                {["Premium billboard network", "Real-time campaign tracking", "Verified media partners"].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                    <span className="text-white/85 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
