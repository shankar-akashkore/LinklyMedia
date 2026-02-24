import React from "react";
import { useBookings } from "./useBookings";
import BookingsTable from "./BookingsTable";
import Tracking from "./Tracking";
import History from "./History"


export function PartnerOrders() {
  const { bookings, loading, error, reload } = useBookings();
  return <BookingsTable bookings={bookings} loading={loading} error={error} onRefresh={reload} title="Orders" emptyMsg="No orders yet." />;
}

export function PartnerTracking() {
  return <Tracking />;
}

export function PartnerPending() {
  const { bookings, loading, error, reload } = useBookings();
  const filtered = bookings.filter((b) => b.status === "pending");
  return <BookingsTable bookings={filtered} loading={loading} error={error} onRefresh={reload} title="Pending — Awaiting Approval" emptyMsg="No pending bookings." />;
}

export function PartnerHistory() {
  return <History />
}