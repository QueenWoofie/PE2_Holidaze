import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBookingsByProfile, deleteBooking } from "../lib/bookings";
import { getToken } from "../lib/auth";
import type { Booking } from "../lib/types";

export default function MyBookings() {
  const token = getToken();
  const profileName = localStorage.getItem("holidaze_name");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const upcoming = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((b) => new Date(b.dateTo) >= now)
      .sort((a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime());
  }, [bookings]);

  async function onDeleteBooking(bookingId: string) {
    if (!token) return;

    const ok = confirm("Cancel this booking?");
    if (!ok) return;

    try {
      setError(null);
      await deleteBooking(bookingId, token);

      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to cancel booking");
    }
  }

  useEffect(() => {
    async function load() {
      if (!token || !profileName) return;

      try {
        setLoading(true);
        setError(null);
        const res = await getBookingsByProfile(profileName, token);
        setBookings(res.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, profileName]);

  if (!token || !profileName) {
    return (
      <main
        style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <h1>My bookings</h1>
        <p>You need to be logged in to view bookings.</p>
        <Link to="/login">Go to login</Link>
      </main>
    );
  }

  return (
    <main
      style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h1>My bookings</h1>

      {loading && <p>Loading bookings…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <>
          {upcoming.length === 0 ? (
            <p>No upcoming bookings yet.</p>
          ) : (
            <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
              {upcoming.map((b) => (
                <li
                  key={b.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: 12,
                    borderRadius: 8,
                    background: "#fff",
                  }}
                >
                  {b.venue?.media?.[0]?.url ? (
                    <img
                      src={b.venue.media[0].url}
                      alt={b.venue.media[0].alt || b.venue.name || "Venue image"}
                      style={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: 180,
                        borderRadius: 8,
                        background: "#f3f3f3",
                        display: "grid",
                        placeItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <span>No image</span>
                    </div>
                  )}
                  {b.venue?.id && (
                    <p>
                      <strong>Venue:</strong>{" "}
                      <Link to={`/venue/${b.venue.id}`}>{b.venue.name ?? "View venue"}</Link>
                    </p>
                  )}
                  <p>
                    <strong>From:</strong> {new Date(b.dateFrom).toLocaleDateString()}
                    {"  "}
                    <strong>To:</strong> {new Date(b.dateTo).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Guests:</strong> {b.guests}
                  </p>
                  <button type="button" onClick={() => onDeleteBooking(b.id)}>
                    Cancel booking
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
