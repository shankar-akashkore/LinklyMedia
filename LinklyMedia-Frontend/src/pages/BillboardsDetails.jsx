import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Lightbulb, HeartStraight, Tag } from "@phosphor-icons/react";
import MapboxMap from "../components/MapboxMap";
import { extractPlaceFromGoogleUrl } from "../utils/location";
import { geocodePlace } from "../utils/map";
import Reviews from "../components/Reviews.jsx";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BillboardsDetails() {
  const { id } = useParams();
  const [billboard, setBillboard] = useState(null);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showDateModal, setShowDateModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedMounting, setSelectedMounting] = useState(null);
  const [designFile, setDesignFile] = useState(null);

  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [bookingStartMinDate] = useState(
    () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  );

  useEffect(() => {
    fetch(`http://localhost:8000/api/billboard/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched billboard data:", data);
        setBillboard(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!billboard?.location) return;
    const place = extractPlaceFromGoogleUrl(billboard.location);
    if (!place) return;
    const fetchCoordinates = async () => {
      const result = await geocodePlace(place);
      if (result) setCoords(result);
    };
    fetchCoordinates();
  }, [billboard]);

  const getDurationDays = () => {
    if (!fromDate || !toDate) return 0;
    return Math.ceil(
      (new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24),
    );
  };

  const getMaterialCost = () => {
    if (!selectedMaterial) return 0;
    const area =
      (billboard?.size?.widthinft || 0) * (billboard?.size?.heightinft || 0);
    return selectedMaterial.pricePerSqFt * area;
  };

  const getTotalPrice = () => {
    const days = getDurationDays();
    const base = (billboard?.price || 0) * days;
    const matCost = getMaterialCost();
    const mountCost = selectedMounting?.flatCharge || 0;
    return base + matCost + mountCost;
  };

  const closeModal = () => {
    setShowDateModal(false);
    setModalStep(1);
    setFromDate("");
    setToDate("");
    setSelectedMaterial(null);
    setSelectedMounting(null);
    setCartError("");
  };
  const handleAddToCart = async () => {
    if (!fromDate || !toDate || !selectedMaterial || !selectedMounting) return;

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("billboardId", billboard.billboardid);
      formData.append("fromDate", new Date(fromDate).toISOString());
      formData.append("toDate", new Date(toDate).toISOString());
      formData.append("selectedMaterial", selectedMaterial.materialType);
      formData.append("selectedMounting", selectedMounting.mountingType);

      if (designFile) {
        formData.append("design", designFile);
      }

      const res = await fetch("http://localhost:8000/api/user/cart/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ❗ DO NOT set Content-Type manually
        },
        body: formData,
      });

      const data = await res.json();
      console.log("AddToCart Response:", data);

      if (res.ok) {
        closeModal();
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 3000);
      } else {
        setCartError(data?.error || "Failed to add to cart.");
      }
    } catch (err) {
      console.error(err);
      setCartError("Something went wrong. Please try again.");
    }
  };

  if (loading) return <p className="p-8">Loading…</p>;
  if (!billboard) return <p className="p-8">Billboard not found</p>;

  const materials = billboard?.materials || [];
  const mountings = billboard?.mountings || [];
  const primaryImage =
    billboard.images?.[activeImage]?.url || billboard.images?.[0]?.url;

  return (
    <div className="min-h-screen bg-[#f6f8fa] pb-10">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex">
          <Link
            to="/billboards"
            className="inline-flex items-center rounded-full border border-gray-200 bg-white pr-3 hover:text-blue"
          >
          <h1 className="flex">
            <ArrowLeftIcon size={18} className="ml-2 mt-1.5" />
            &nbsp;
          </h1>
          <h1 className="mt-2 text-xs hover:text-gray-500">
            Back to Billboards
          </h1>
          </Link>
        </div>

        <div>
          <h1 className="pb-4 pt-6 text-2xl font-semibold sm:text-3xl lg:pt-8">
            {billboard.billboardtitle}
          </h1>
        </div>

        {cartSuccess && (
          <div className="fixed right-3 top-3 z-50 rounded-xl bg-[#507c88] px-4 py-2.5 text-xs font-medium text-white shadow-lg sm:right-5 sm:top-5 sm:px-5 sm:py-3 sm:text-sm">
            ✓ Added to cart successfully!
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
              <div className="relative h-[230px] w-full overflow-hidden rounded-xl sm:h-[320px] lg:h-[410px]">
                <img
                  src={primaryImage}
                  alt={
                    billboard.images?.[activeImage]?.alttext ||
                    billboard.billboardtitle
                  }
                  className="h-full w-full object-cover transition-opacity duration-300"
                />
                {billboard.images?.length > 1 && (
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                    {activeImage + 1} / {Math.min(billboard.images.length, 5)}
                  </span>
                )}
              </div>

              {billboard.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 pt-3">
                  {billboard.images.slice(0, 5).map((image, index) => (
                    <button
                      key={image.publicid}
                      onClick={() => setActiveImage(index)}
                      className={`h-[64px] w-[90px] flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 sm:h-[80px] sm:w-[120px] ${
                        activeImage === index
                          ? "border-[#507c88] opacity-100"
                          : "border-transparent opacity-60 hover:opacity-90"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alttext || `Image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="flex items-start gap-4">
                  <img
                    src="/images/billboard-index.png"
                    alt="Media Type"
                    className="h-10 w-14"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs tracking-wide text-gray-500">
                      MEDIA TYPE
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {billboard.type?.[0]?.typename}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4 pl-3">
                  <Lightbulb size={38} weight="light" />
                  <div className="flex flex-col">
                    <span className="text-xs tracking-wide text-gray-500">
                      LIGHTING
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {billboard.type[1]?.typename || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:ml-2 sm:mt-2">
                  <span className="text-xs tracking-wide text-gray-500">ID</span>
                  <span className="break-all text-[14px] font-semibold text-gray-900">
                    {billboard.billboardid}
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:ml-2">
                  <HeartStraight size={30} weight="fill" color="#507c88" />
                  <span className="text-2xl font-semibold">
                    {billboard.totallikes}
                  </span>
                </div>
              </div>

              <div className="mt-5 sm:mt-6">
                <h1 className="pb-3 text-lg font-medium underline decoration-[#507c88] md:underline-offset-4">
                  About {billboard.billboardtitle}
                </h1>
                <p className="text-md text-gray-700">{billboard.description}</p>
              </div>
            </div>
          </div>

          <div className="h-fit rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:sticky lg:top-4">
            <h1 className="px-1 pb-3 text-2xl font-semibold">Top Choice</h1>
            <div className="overflow-hidden rounded-xl">
              <img
                src={billboard.images?.[0]?.url}
                alt={billboard.billboardtitle}
                className="h-[175px] w-full object-cover"
              />
            </div>
            <h1 className="pt-4 text-xl font-semibold">{billboard.billboardtitle}</h1>
            <h1 className="pt-3">Partner ID :</h1>
            <p className="pt-1.5 font-semibold">{billboard.partnerid}</p>

            <div className="mt-5 overflow-hidden">
              <div className="flex h-[64px] w-full overflow-hidden rounded-xl bg-[#507c88]/20 p-2">
                <Tag size={22} weight="fill" className="pl-2" />
                <div className="flex flex-col">
                  <h1>Base Rate</h1>
                  <h1 className="font-semibold">₹{billboard.price}</h1>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setShowDateModal(true)}
                className="h-[40px] w-full rounded-2xl text-xs
                relative inline-block text-center text-[18px] tracking-[1px]
                text-[#507c88] bg-transparent cursor-pointer
                border-2 border-[#507c88] rounded-full
                shadow-[inset_0_0_0_0_#507c88]
                transition-all duration-500 ease-out
                hover:text-white hover:shadow-[inset_0_-100px_0_0_#507c88]
                active:scale-90"
              >
                <h1 className="flex justify-center text-center">Add to cart</h1>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="h-auto grid grid-cols-1 gap-3 rounded-xl p-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-6 lg:divide-x-2 lg:divide-[#4e92a3]">
              <div className="flex pt-2 pl-2">
                <h1 className="text-2xl font-semibold">Key Insights</h1>
              </div>
              <div className="flex">
                <span className="flex flex-col">
                  <h1 className="text-sm font-light underline decoration-[#507c88] md:underline-offset-4">
                    Landmark
                  </h1>
                  <h1 className="font-semibold pt-0.5">{billboard.landmark}</h1>
                </span>
              </div>
              <div className="flex">
                <span className="flex flex-col">
                  <h1 className="text-sm font-light underline decoration-[#507c88] md:underline-offset-4">
                    Unique Reach(Per day)
                  </h1>
                  <h1 className="font-semibold pt-0.5">{billboard.impressions}</h1>
                </span>
              </div>
              <div className="flex">
                <span>
                  <h1 className="text-sm font-light underline decoration-[#507c88] md:underline-offset-4">
                    Min Span
                  </h1>
                  <h1 className="text-sm font-semibold pt-0.5">
                    {billboard.minspan}+ Days
                  </h1>
                </span>
              </div>
              <div className="flex">
                <span>
                  <h1 className="text-sm font-light underline decoration-[#507c88] md:underline-offset-4">
                    Quantity
                  </h1>
                  <h1 className="pl-1 font-semibold pt-0.5">1</h1>
                </span>
              </div>
              <div className="flex gap-2">
                <span>
                  <h1 className="text-sm font-light underline decoration-[#507c88] md:underline-offset-4">
                    Size
                  </h1>
                  <h1 className="font-semibold pt-0.5">
                    {billboard.size.widthinft} x {billboard.size.heightinft}
                  </h1>
                </span>
              </div>
            </div>
          </div>
        </div>

        {showDateModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-2 sm:items-center sm:p-4">
            <div className="max-h-[90vh] w-full max-w-[420px] overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6">
              <div className="flex items-center gap-1 mb-5">
                {["Dates", "Options", "Confirm"].map((label, i) => {
                  const step = i + 1;
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                          ${modalStep >= step ? "bg-[#507c88] text-white" : "bg-gray-100 text-gray-400"}`}
                        >
                          {step}
                        </div>
                        <span
                          className={`text-[10px] ${modalStep === step ? "text-[#507c88] font-semibold" : "text-gray-400"}`}
                        >
                          {label}
                        </span>
                      </div>
                      {step < 3 && (
                        <div
                          className={`h-[2px] w-10 mb-4 rounded transition-colors
                          ${modalStep > step ? "bg-[#507c88]" : "bg-gray-100"}`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {modalStep === 1 && (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    Select Booking Dates
                  </h2>
                  <p className="text-sm text-gray-400 mb-5">
                    Choose the duration for your billboard
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">
                        From Date
                      </label>
                      <DatePicker
                        selected={fromDate ? new Date(fromDate) : null}
                        onChange={(date) =>
                          setFromDate(date.toISOString().split("T")[0])
                        }
                        minDate={bookingStartMinDate}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select from date"
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#507c88]"
                        wrapperClassName="w-full"
                        inline={false}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">
                        To Date
                      </label>
                      <DatePicker
                        selected={toDate ? new Date(toDate) : null}
                        onChange={(date) =>
                          setToDate(date.toISOString().split("T")[0])
                        }
                        minDate={
                          fromDate
                            ? new Date(
                                new Date(fromDate).getTime() +
                                  billboard.minspan * 24 * 60 * 60 * 1000,
                              )
                            : bookingStartMinDate
                        }
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select to date"
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#507c88]"
                        wrapperClassName="w-full"
                      />
                    </div>
                  </div>

                  {fromDate && toDate && (
                    <p className="text-xs text-gray-400 mt-3">
                      Duration:{" "}
                      <span className="font-semibold text-[#507c88]">
                        {getDurationDays()} days
                      </span>
                    </p>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => setModalStep(2)}
                      disabled={!fromDate || !toDate}
                      className="flex-1 py-2 rounded-lg bg-[#507c88]/80 text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3f6570] transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}

              {modalStep === 2 && (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    Choose Options
                  </h2>
                  <p className="text-sm text-gray-400 mb-5">
                    Select material and mounting type
                  </p>

                  {materials.length === 0 && mountings.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No options available for this billboard.
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {materials.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 block mb-1">
                            Material
                          </label>
                          <select
                            value={selectedMaterial?.materialType || ""}
                            onChange={(e) => {
                              const mat = materials.find(
                                (m) => m.materialType === e.target.value,
                              );
                              setSelectedMaterial(mat || null);
                            }}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#507c88] bg-white"
                          >
                            <option value="">-- Select Material --</option>
                            {materials.map((m) => (
                              <option
                                key={m.materialType}
                                value={m.materialType}
                              >
                                {m.materialType} — ₹{m.pricePerSqFt}/sq.ft
                              </option>
                            ))}
                          </select>
                          {selectedMaterial && (
                            <p className="text-xs text-gray-400 mt-1">
                              Material cost: ₹
                              {getMaterialCost().toLocaleString()}
                              <span className="text-gray-300">
                                {" "}
                                ({billboard.size.widthinft}×
                                {billboard.size.heightinft} sq.ft × ₹
                                {selectedMaterial.pricePerSqFt})
                              </span>
                            </p>
                          )}
                        </div>
                      )}

                      {mountings.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 block mb-1">
                            Mounting Type
                          </label>
                          <select
                            value={selectedMounting?.mountingType || ""}
                            onChange={(e) => {
                              const mnt = mountings.find(
                                (m) => m.mountingType === e.target.value,
                              );
                              setSelectedMounting(mnt || null);
                            }}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#507c88] bg-white"
                          >
                            <option value="">-- Select Mounting --</option>
                            {mountings.map((m) => (
                              <option
                                key={m.mountingType}
                                value={m.mountingType}
                              >
                                {m.mountingType} — ₹
                                {m.flatCharge.toLocaleString()} flat charge
                              </option>
                            ))}
                          </select>
                          {selectedMounting && (
                            <p className="text-xs text-gray-400 mt-1">
                              Mounting charge: ₹
                              {selectedMounting.flatCharge.toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">
                          Upload Your's Design
                        </label>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setDesignFile(e.target.files[0])}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#507c88] bg-white"
                        />

                        {designFile && (
                          <div className="mt-2 flex items-center gap-3">
                            <img
                              src={URL.createObjectURL(designFile)}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                            <span className="text-xs text-gray-500 truncate">
                              {designFile.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setModalStep(1)}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setModalStep(3)}
                      disabled={!selectedMaterial || !selectedMounting}
                      className="flex-1 py-2 rounded-lg bg-[#507c88]/80 text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3f6570] transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}

              {modalStep === 3 && (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    Order Summary
                  </h2>
                  <p className="text-sm text-gray-400 mb-4">
                    Review your selection before adding to cart
                  </p>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Billboard</span>
                      <span className="font-medium text-right max-w-[180px] truncate">
                        {billboard?.billboardtitle}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">From</span>
                      <span className="font-medium">{fromDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">To</span>
                      <span className="font-medium">{toDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium">
                        {getDurationDays()} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Material</span>
                      <span className="font-medium">
                        {selectedMaterial?.materialType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mounting</span>
                      <span className="font-medium">
                        {selectedMounting?.mountingType}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-2 mt-1 space-y-1">
                      <div className="flex justify-between text-gray-500">
                        <span>
                          Base (₹{billboard?.price} × {getDurationDays()} days)
                        </span>
                        <span>
                          ₹
                          {(
                            (billboard?.price || 0) * getDurationDays()
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Material cost</span>
                        <span>₹{getMaterialCost().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Mounting charge</span>
                        <span>
                          ₹
                          {(selectedMounting?.flatCharge || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-[#507c88] text-base">
                      <span>Total</span>
                      <span>₹{getTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>

                  {cartError && (
                    <p className="text-xs text-red-500 mt-3 text-center">
                      {cartError}
                    </p>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setModalStep(2)}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 py-2 rounded-lg bg-[#507c88] text-white text-sm hover:bg-[#3f6570] transition-colors font-medium"
                    >
                      Confirm & Add ✓
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h1 className="pb-5 text-2xl">Your Billboard's Exact Location</h1>
          <div className="overflow-hidden rounded-xl">
            {coords ? (
              <MapboxMap lat={coords.lat} lng={coords.lng} />
            ) : (
              <p>Loading map…</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Reviews billboard={billboard} />
        </div>
      </div>
    </div>
  );
}
