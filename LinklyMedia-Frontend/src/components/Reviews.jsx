import { useState } from "react";
import { Star } from "@phosphor-icons/react";

export default function BillboardReviews({ billboard }) {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState(billboard.reviews || []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reviewText.trim()) {
      setError("Please write a review.");
      return;
    }
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8000/api/review/${billboard.billboardid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            review: reviewText,
            rating: rating,
          }),
        },
      );

      const data = await res.json();
      console.log("Review response:", data);

      if (res.ok) {
        const newReview = {
          customername: data.customername || "You",
          review: reviewText,
          rating: rating,
        };
        setReviews((prev) => [newReview, ...prev]);

        setReviewText("");
        setRating(0);
        setSuccess("Review submitted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data?.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStarColor = (star) => {
    const active = hoveredStar || rating;
    return star <= active ? "#f59e0b" : "#d1d5db";
  };

  return (
    <div className="mb-10 mt-8 px-4 sm:mt-12 sm:px-0">
      <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Review Section</h1>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white p-4 shadow-sm sm:p-5"
      >
        <h2 className="mb-3 text-base font-medium text-gray-700">
          Write a Review
        </h2>

        <div className="mb-4 flex flex-wrap items-center gap-1">
          <span className="mr-2 w-full text-sm text-gray-500 sm:w-auto">
            Your Rating:
          </span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                size={28}
                weight={star <= (hoveredStar || rating) ? "fill" : "regular"}
                color={getStarColor(star)}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-amber-500 font-medium">
              {rating}/5
            </span>
          )}
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this billboard..."
          rows={3}
          className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#507c88] resize-none"
        />

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        {success && <p className="text-xs text-green-600 mt-2">{success}</p>}

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#507c88] px-6 py-2 text-sm font-medium text-white
            sm:w-auto
            hover:bg-[#3f6570] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        <h1 className="text-base font-medium">All Reviews</h1>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-semibold text-gray-800">
                  {review.customername}
                </h2>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      weight={star <= review.rating ? "fill" : "regular"}
                      color={star <= review.rating ? "#f59e0b" : "#d1d5db"}
                    />
                  ))}
                  <span className="ml-1 text-xs text-gray-400">
                    {review.rating}/5
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600">{review.review}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
            <p className="text-sm">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
}
