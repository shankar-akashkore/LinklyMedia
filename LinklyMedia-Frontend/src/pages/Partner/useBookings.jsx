import { useEffect, useState } from "react";

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const reload = () => {
    setLoading(true);
    fetch("/api/partner/bookings", { headers })
      .then((r) => { if (!r.ok) throw new Error("Failed to load bookings"); return r.json(); })
      .then((d) => setBookings(Array.isArray(d) ? d : d.bookings ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  return { bookings, loading, error, reload };
}

export async function updateBookingStatus(id, status) {
  const token = localStorage.getItem("token");
  const r = await fetch(`/api/partner/booking/${id}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  if (!r.ok) throw new Error("Failed to update status");
  return r.json();
}