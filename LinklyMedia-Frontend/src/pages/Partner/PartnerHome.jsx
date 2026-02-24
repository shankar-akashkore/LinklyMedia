import React, { useEffect, useState } from "react";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  SpinnerIcon,
  CalendarIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";

const STAT_CONFIG = [
  {
    key: "totalRevenue",
    label: "Total Revenue",
    icon: CurrencyDollarIcon,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    valueColor: "text-emerald-700",
    format: (v) => `₹${Number(v ?? 0).toLocaleString("en-IN")}`,
  },
  {
    key: "totalOrders",
    label: "Total Bookings",
    icon: ShoppingCartIcon,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    valueColor: "text-blue-700",
    format: (v) => Number(v ?? 0).toLocaleString(),
  },
  {
    key: "activeListings",
    label: "Active Billboards",
    icon: ChartBarIcon,
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    valueColor: "text-violet-700",
    format: (v) => Number(v ?? 0).toLocaleString(),
  },
  {
    key: "liveOrders",
    label: "Live Orders",
    icon: ClockIcon,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    valueColor: "text-amber-700",
    format: (v) => Number(v ?? 0).toLocaleString(),
  },
  {
    key: "completedOrders",
    label: "Completed Orders",
    icon: CheckCircleIcon,
    bg: "bg-teal-50",
    iconColor: "text-teal-600",
    valueColor: "text-teal-700",
    format: (v) => Number(v ?? 0).toLocaleString(),
  },
  {
    key: "inProductionOrders",
    label: "In Production",
    icon: SpinnerIcon,
    bg: "bg-orange-50",
    iconColor: "text-orange-500",
    valueColor: "text-orange-600",
    format: (v) => Number(v ?? 0).toLocaleString(),
  },
  {
    key: "todayOrders",
    label: "Today's Orders",
    icon: CalendarIcon,
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
    valueColor: "text-sky-700",
    format: (v) => Number(v ?? 0).toLocaleString(),
  },
  {
    key: "todayRevenue",
    label: "Today's Revenue",
    icon: TrendUpIcon,
    bg: "bg-pink-50",
    iconColor: "text-pink-600",
    valueColor: "text-pink-700",
    format: (v) => `₹${Number(v ?? 0).toLocaleString("en-IN")}`,
  },
];

function getNameFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "Partner";
    const payload = JSON.parse(atob(token.split(".")[1]));
    const name = `${payload.FirstName ?? ""} ${payload.LastName ?? ""}`.trim();
    return name || "Partner";
  } catch {
    return "Partner";
  }
}

const SkeletonStat = () => (
  <div className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse shadow-sm">
    <div className="w-10 h-10 rounded-xl bg-gray-100 mb-4" />
    <div className="h-7 bg-gray-200 rounded-lg w-2/3 mb-2" />
    <div className="h-3 bg-gray-100 rounded w-1/2" />
  </div>
);

export default function PartnerHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const partnerName = getNameFromToken();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/api/partner/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load dashboard");
        return r.json();
      })
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#507c88] to-[#3d6370] p-7 text-white shadow-md relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 right-24 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

        <p className="text-sm text-white/70 mb-1 font-medium">Welcome back,</p>
        <h1 className="text-3xl font-bold tracking-tight">{partnerName}</h1>
        <p className="text-sm text-white/60 mt-1.5">
          Here's what's happening with your listings today.
        </p>
      </div>

      {/* Error */}
      {!loading && error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
          ⚠ Dashboard stats unavailable — {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonStat key={i} />
          ))}
        </div>
      )}

      {/* Stats Grid */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CONFIG.map(
            ({ key, label, icon: Icon, bg, iconColor, valueColor, format }) => (
              <div
                key={key}
                className="rounded-2xl bg-white border border-gray-200 p-5 flex flex-col gap-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}
                >
                  <Icon size={20} weight="fill" className={iconColor} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${valueColor}`}>
                    {format(data[key])}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 font-black pt-2">
                    {label}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
