import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, TrashIcon, ToggleRightIcon, ToggleLeftIcon } from "@phosphor-icons/react";

export default function PartnerBillboards() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const navigate = useNavigate();

  const token   = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const normalize = (b) => {
    let image = b.thumbnail ?? null;
    if (!image && Array.isArray(b.images) && b.images.length > 0) {
      const primary = b.images.find((img) => img.isprimary) ?? b.images[0];
      image = primary?.url ?? null;
    }
    return {
      id:       b.billboardid ?? b.id ?? b.ID,   // for toggle/delete
      mongoId:  b.ID ?? b.id,                    // MongoDB _id string for detail page
      title:    b.billboardtitle ?? b.title ?? "Untitled",
      city:     b.city ?? "—",
      price:    b.price ?? 0,
      image,
      isActive: b.isActive ?? b.isactive ?? false,
    };
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r1 = await fetch("/api/partner/listings?page=1&limit=50", { headers });
      if (!r1.ok) throw new Error("Failed to load listings");
      const d1 = await r1.json();
      const firstPage  = Array.isArray(d1.data) ? d1.data.map(normalize) : [];
      const totalPages = d1.pagination?.totalPages ?? 1;

      if (totalPages <= 1) { setListings(firstPage); return; }

      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          fetch("/api/partner/listings?page=" + (i + 2) + "&limit=50", { headers })
            .then((r) => r.json())
            .then((d) => Array.isArray(d.data) ? d.data.map(normalize) : [])
        )
      );
      setListings([...firstPage, ...rest.flat()]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    setListings((prev) => prev.map((b) => b.id === id ? { ...b, isActive: !b.isActive } : b));
    const r = await fetch("/api/partner/billboard/" + id + "/toggle", { method: "PATCH", headers });
    if (r.ok) {
      const data = await r.json();
      setListings((prev) => prev.map((b) => b.id === id ? { ...b, isActive: data.isActive } : b));
    } else {
      load();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this billboard?")) return;
    await fetch("/api/partner/billboard/" + id, { method: "DELETE", headers });
    load();
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800">
            Billboards
          </h2>
          <p className="text-sm text-gray-400">
            {listings.length > 0 ? listings.length + " listings" : "All your billboard listings"}
          </p>
        </div>
        <button
          onClick={() => navigate("/partner/billboards/new")}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#507c88] text-white rounded-full text-sm font-medium hover:bg-[#3d6370] transition"
        >
          <PlusIcon size={15} weight="bold" /> Add Billboard
        </button>
      </div>

      {error && <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">{error}</div>}

      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      )}

      {!loading && listings.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🪧</p>
          <p className="font-semibold text-gray-600">No billboards yet</p>
          <p className="text-sm mt-1">Click "Add Billboard" to create your first listing.</p>
        </div>
      )}

      {!loading && listings.length > 0 && (
        <div className="space-y-3">
          {listings.map((b) => (
            <div
              key={b.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* Thumbnail — click to open detail */}
                <div
                  className="w-full sm:w-20 h-40 sm:h-14 shrink-0 cursor-pointer"
                  onClick={() => navigate("/partner/billboards/" + b.mongoId)}
                >
                  {b.image ? (
                    <img src={b.image} alt={b.title} className="w-full h-full object-cover rounded-lg border border-gray-100" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-3xl">🪧</div>
                  )}
                </div>

                {/* Info — click to open detail */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate("/partner/billboards/" + b.mongoId)}
                >
                  <p className="text-sm font-semibold text-gray-800 truncate">{b.title}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{b.city}</p>
                  <p className="text-xs text-gray-500 mt-1">₹{Number(b.price).toLocaleString()} / day</p>
                </div>

                {/* Status badge */}
                <span className={"self-start sm:self-center px-2.5 py-0.5 rounded-full border text-xs font-medium shrink-0 " + (
                  b.isActive
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                )}>
                  {b.isActive ? "Active" : "Inactive"}
                </span>

                {/* Actions — stopPropagation so card click doesn't fire */}
                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggle(b.id); }}
                    title={b.isActive ? "Deactivate" : "Activate"}
                    className="p-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    {b.isActive
                      ? <ToggleRightIcon size={22} weight="fill" className="text-emerald-500" />
                      : <ToggleLeftIcon  size={22} className="text-gray-400" />
                    }
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }}
                    title="Delete billboard"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                  >
                    <TrashIcon size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
