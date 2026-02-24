import React, { useState, useEffect, useMemo } from "react";
import {
  UsersThree,
  CurrencyInr,
  MapPin,
  FunnelSimple,
  Star,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

export default function Billboards() {
  const [billboards, setBillboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [sortBy, setSortBy] = useState("reach-high");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/billboards")
      .then((res) => res.json())
      .then((data) => {
        setBillboards(Array.isArray(data) ? data : []);
        setError("");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching billboards:", err);
        setError("Unable to load billboards right now.");
        setLoading(false);
      });
  }, []);

  const filteredBillboards = useMemo(() => {
    const query = locationQuery.trim().toLowerCase();

    const filtered = billboards.filter((billboard) => {
      if (!query) return true;
      const locationText = [billboard.city, billboard.location, billboard.landmark]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return locationText.includes(query);
    });

    const toNumber = (value) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : 0;
    };

    return [...filtered].sort((a, b) => {
      if (sortBy === "low-high") return toNumber(a.price) - toNumber(b.price);
      if (sortBy === "high-low") return toNumber(b.price) - toNumber(a.price);
      if (sortBy === "reach-high")
        return toNumber(b.impressions) - toNumber(a.impressions);
      if (sortBy === "reach-low")
        return toNumber(a.impressions) - toNumber(b.impressions);
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt || b.created_at || 0).getTime() -
          new Date(a.createdAt || a.created_at || 0).getTime()
        );
      }
      if (sortBy === "oldest") {
        return (
          new Date(a.createdAt || a.created_at || 0).getTime() -
          new Date(b.createdAt || b.created_at || 0).getTime()
        );
      }
      return 0;
    });
  }, [billboards, locationQuery, sortBy]);

  const filterPanel = (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-semibold text-slate-900">Filters</h2>

      <div className="mt-5">
        <div className="mb-2 flex items-center gap-1.5 text-slate-700">
          <MapPin size={16} weight="regular" />
          <span className="text-sm font-medium">Location</span>
        </div>
        <input
          type="text"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          placeholder="Search city or landmark"
          className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-[#507c88] focus:ring-2 focus:ring-[#507c88]/20"
        />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center gap-1.5 text-slate-700">
          <FunnelSimple size={16} weight="regular" />
          <span className="text-sm font-medium">Sort by</span>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-[#507c88] focus:ring-2 focus:ring-[#507c88]/20"
        >
          <option value="low-high">Price: Low to High</option>
          <option value="high-low">Price: High to Low</option>
          <option value="reach-high">Reach: High to Low</option>
          <option value="reach-low">Reach: Low to High</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>
  );

  return (
    <section className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#507c88]">
              Outdoor Inventory
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Outdoor Advertising Agency
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? "Loading billboards..." : `${filteredBillboards.length} listings available`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm md:hidden"
          >
            <FunnelSimple size={16} weight="bold" />
            Filters
          </button>
        </div>

        {showMobileFilters && (
          <div className="mt-4 md:hidden">{filterPanel}</div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[270px_minmax(0,1fr)] lg:gap-7">
          <aside className="hidden md:block md:sticky md:top-24 md:h-fit">{filterPanel}</aside>

          <div>
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm animate-pulse "
                  >
                    <div className="h-44 bg-slate-100" />
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-3/4 rounded bg-slate-100" />
                      <div className="h-3 w-1/2 rounded bg-slate-100" />
                      <div className="h-3 w-2/3 rounded bg-slate-100" />
                      <div className="mt-3 h-9 w-2/5 rounded-full bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredBillboards.length > 0 && (
              <div className="grid grid-cols-1 gap-5 pb-4 pr-2 sm:grid-cols-2 xl:grid-cols-3">
                {filteredBillboards.map((billboard, idx) => {
                  const image =
                    billboard.images?.find((img) => img.isprimary)?.url ||
                    billboard.images?.[0]?.url;
                  const rating = Number(billboard.averagerating ?? 0);
                  const impressions = Number(billboard.impressions ?? 0);
                  const price = Number(billboard.price ?? 0);
                  const rate = Number(
                    billboard.rate ?? billboard.price_per_day ?? billboard.price ?? 0,
                  );
                  const billboardId =
                    billboard.billboardid || billboard._id?.$oid || billboard._id || idx;

                  return (
                    <article
                      key={billboardId}
                      className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-shadow duration-200 hover:shadow-xl"
                    >
                      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#507c88] to-[#3d6472]">
                        {image && (
                          <img
                            src={image}
                            alt={billboard.billboardtitle || "Billboard"}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
                          <Star size={11} weight="fill" color="#f59e0b" />
                          {rating > 0 ? rating.toFixed(1) : "New"}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <h2 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">
                          {billboard.billboardtitle || "Untitled Billboard"}
                        </h2>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {billboard.landmark || billboard.location || "Location not specified"}
                        </p>

                        <div className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-[#507c88]/10 px-3 py-1 text-xs font-semibold text-[#2f5965]">
                          <CurrencyInr size={13} weight="bold" />
                          {rate.toLocaleString("en-IN")} / day
                        </div>

                        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <UsersThree size={15} weight="regular" className="text-[#507c88]" />
                            {(impressions / 1000).toFixed(1)}K Unique Reach
                          </p>
                          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <CurrencyInr size={14} weight="regular" className="text-[#507c88]" />
                            ₹{price.toLocaleString("en-IN")} Min Spend
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(`/billboards/${billboardId}`)}
                          className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-[#507c88] transition-colors duration-200 hover:bg-[#507c88] hover:text-white"
                        >
                          View Details
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {!loading && filteredBillboards.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <p className="text-sm text-slate-500">No billboards match your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
