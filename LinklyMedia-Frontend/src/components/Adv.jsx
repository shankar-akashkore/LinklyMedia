import { useRef, useState, useEffect } from "react";
import { Star } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

const SkeletonCard = () => (
  <div className="w-[82vw] max-w-[300px] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-gray-100 bg-white shadow animate-pulse sm:w-[300px]">
    <div className="h-44 bg-gray-200 sm:h-52" />
    <div className="space-y-3 p-4 sm:p-5">
      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
      <div className="h-3 bg-gray-100 rounded-full w-full" />
      <div className="h-3 bg-gray-100 rounded-full w-2/3" />
      <div className="flex justify-between items-center pt-4 mt-1 border-t border-gray-100">
        <div className="h-5 bg-gray-200 rounded-full w-1/3" />
        <div className="h-8 bg-gray-100 rounded-lg w-28" />
      </div>
    </div>
  </div>
);

export default function Adv() {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const [billboards, setBillboards] = useState([]);
  const [city, setCity] = useState("BANGALORE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBillboards = async (lat, lng) => {
    try {
      setLoading(true);
      setError("");
      let url = "http://localhost:8000/api/topBillboards";
      if (lat && lng) url += `?lat=${lat}&lng=${lng}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to fetch billboards");
        return;
      }
      setBillboards(data.billboards || []);
      if (data.city) setCity(data.city.toUpperCase());
    } catch {
      setError("Failed to load billboards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchBillboards(pos.coords.latitude, pos.coords.longitude),
        () => fetchBillboards(),
        { timeout: 5000 },
      );
    } else {
      fetchBillboards();
    }
  }, []);

  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);
  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="mt-10 px-4 pb-14 sm:mt-12 sm:px-6 md:mt-16 md:px-12 md:pb-20">
      <hr className="border-gray-200" />

      {/* Section Header */}
      <div className="mb-6 mt-8 flex flex-col gap-3 sm:mb-8 sm:mt-10 md:mb-10 md:mt-12 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-600 sm:text-xs sm:tracking-[0.2em]">
            <span className="inline-block w-6 h-px bg-teal-600" />
            Featured Locations
          </p>
          <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-4xl">
            Top Billboards in <span className="text-[#507c88]">{city}</span>
          </h2>
        </div>
        <p className="text-xs text-gray-400 select-none md:mb-1 md:text-sm">
          Swipe or drag to explore →
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-sm font-medium mb-6 bg-red-50 border border-red-100 rounded-xl px-4 py-3 inline-block">
          ⚠ {error}
        </p>
      )}

      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 touch-pan-x sm:gap-5 md:cursor-grab md:active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {loading && [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}

        {!loading &&
          billboards.map((board, idx) => {
            const id =
              typeof board._id === "string"
                ? board._id
                : board._id?.$oid || board.billboardid || String(idx);
            const title =
              board.billboardtitle ||
              board.title ||
              board.name ||
              `Billboard ${idx + 1}`;
            const description =
              board.description ||
              "High traffic commercial area with maximum visibility";
            const price = board.price ?? board.price_per_day ?? 0;
            const rating =
              board.averagerating ?? board.rating ?? board.traffic_score ?? 4.8;
            const isLive = board.is_active ?? board.isactive ?? true;
            const primaryImg = board.images?.find(
              (img) => img.isprimary === true,
            )?.url;
            const image = primaryImg || board.images?.[0]?.url || null;

            return (
              <div
                key={id}
                className="group flex w-[82vw] max-w-[300px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-teal-100 hover:shadow-lg hover:-translate-y-1 sm:w-[300px]"
              >
                {/* Image Area */}
                <div className="relative h-44 flex-shrink-0 overflow-hidden bg-gradient-to-br from-teal-700 to-teal-900 sm:h-52">
                  {image && (
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold px-2.5 py-1.5 rounded-full shadow-sm">
                    <Star size={11} weight="fill" color="#f59e0b" />
                    {typeof rating === "number" ? rating.toFixed(1) : rating}
                  </div>

                  {/* Live badge */}
                  {isLive && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-green-600/20 backdrop-blur-sm border border-green-400/40 text-green-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Live
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.8rem]">
                    {title}
                  </h3>
                  <p className="text-xs text-gray-800 mt-2 line-clamp-2 leading-relaxed">
                    {description}
                  </p>

                  {/* Footer */}
                  <div className="mt-auto border-t border-gray-100 pt-3.5 sm:pt-4">
                    <div className="mb-2.5 sm:mb-3">
                      <span className="text-base font-bold text-teal-700 sm:text-lg">
                        ₹{Number(price).toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-gray-400 ml-0.5">/day</span>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/billboards/${board.billboardid}`)
                      }
                      className="group relative isolate inline-flex w-full items-center justify-center gap-1.5
                       px-4 py-2
                       text-[13px] sm:text-sm font-medium tracking-wide
                       text-[#507c88]
                       bg-slate-100
                       rounded-full
                       overflow-hidden
                       transition-all duration-300
                       before:absolute before:inset-0
                       before:bg-[#507c88]
                       before:translate-y-full
                       before:transition-transform before:duration-300
                       before:z-0
                       hover:text-white
                       hover:before:translate-y-0
                       active:scale-95
                    "
                    >
                      <span className="relative z-10">View Details</span>
                      <svg
                        className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

        {!loading && !error && billboards.length === 0 && (
          <p className="text-gray-400 text-sm py-12">
            No billboards found in {city}.
          </p>
        )}
      </div>
    </div>
  );
}
