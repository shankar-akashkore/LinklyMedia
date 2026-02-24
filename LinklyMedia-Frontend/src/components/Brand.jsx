import React from "react";

export default function Brand() {
  return (
    <section className="relative mt-16 flex w-full flex-col items-center overflow-hidden px-4 pb-8 text-center sm:mt-20 sm:px-6 md:mt-24 md:pb-10">

      {/* Big faded background word */}
      <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[3.1rem] font-bold leading-none tracking-tight text-slate-100 sm:text-[5.5rem] md:text-[8.5rem] lg:text-[12rem]">
        LINKLY MEDIA
      </span>

      {/* Content sits on top */}
      <div className="relative z-10 flex max-w-3xl flex-col items-center">

        {/* Small label */}
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#507c88] sm:mb-5 sm:text-xs sm:tracking-[0.3em]">
          Premium Services
        </p>

        {/* Heading — mixed weight for contrast */}
        <h1 className="max-w-[17ch] text-3xl font-semibold leading-tight text-slate-900 sm:max-w-3xl sm:text-4xl md:text-5xl lg:text-6xl">
          Ready to{" "}
          <span className="font-black text-[#507c88]">amplify</span>
          <br />your brand?
        </h1>

        {/* Thin divider */}
        <div className="mt-6 h-px w-10 bg-[#507c88]/40 sm:mt-8 sm:w-12" />

        {/* Subtext */}
        <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-500 sm:mt-6 sm:max-w-xl sm:text-base">
          A comprehensive suite of advertising solutions designed to maximize
          impact and drive measurable results.
        </p>

      </div>
    </section>
  );
}
