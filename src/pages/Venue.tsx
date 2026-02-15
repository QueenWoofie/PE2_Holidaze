import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import type { NoroffResponse, Venue } from "../lib/types";
import { createBooking } from "../lib/bookings";
import { getToken } from "../lib/auth";

export default function VenuePage() {
  const { id } = useParams<{ id: string }>();

  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);
  const [bookingSort, setBookingSort] = useState<"from_asc" | "from_desc">("from_asc");
  const [bookingLimit, setBookingLimit] = useState(10);

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = getToken();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [guests, setGuests] = useState(1);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const res = await apiFetch<NoroffResponse<Venue>>(`/holidaze/venues/${id}?_bookings=true`);
        setVenue(res.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load venue");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const visibleBookings = useMemo(() => {
    if (!venue?.bookings) return [];

    const now = new Date();
    let list = [...venue.bookings];

    if (showUpcomingOnly) {
      list = list.filter((b) => new Date(b.dateTo) >= now);
    }

    list.sort((a, b) => {
      const diff = new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime();
      return bookingSort === "from_asc" ? diff : -diff;
    });

    return list.slice(0, bookingLimit);
  }, [venue?.bookings, showUpcomingOnly, bookingSort, bookingLimit]);

  async function onBook() {
    if (!id) return;

    if (!token) {
      setBookingError("You must be logged in to book.");
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError(null);
      setBookingSuccess(null);

      const fromISO = new Date(dateFrom).toISOString();
      const toISO = new Date(dateTo).toISOString();

      await createBooking(
        {
          dateFrom: fromISO,
          dateTo: toISO,
          guests: Number(guests),
          venueId: id,
        },
        token,
      );

      setBookingSuccess("Booking created! Check 'My bookings'.");

      const res = await apiFetch<NoroffResponse<Venue>>(`/holidaze/venues/${id}?_bookings=true`);
      setVenue(res.data);
    } catch (e) {
      setBookingError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <main className="page">
      <p>
        <Link to="/">← Back to venues</Link>
      </p>

      {loading && <p>Loading venue…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && venue && (
        <>
          <h1>{venue.name}</h1>
          <p>{venue.description}</p>
          <div className="flexrow">
            <p>
              <strong>Price:</strong> {venue.price}
            </p>
            <p>
              <strong>Max guests:</strong> {venue.maxGuests}
            </p>
          </div>

          {venue.media?.[0]?.url && (
            <img
              src={venue.media[0].url}
              alt={venue.media[0].alt || venue.name}
              style={{ maxWidth: 600, width: "100%", borderRadius: 8, marginTop: 12 }}
            />
          )}

          <hr style={{ margin: "2rem 0" }} />

          <h2>Book this venue</h2>

          {token ? (
            <div style={{ display: "flex", gap: 12 }}>
              <label>
                Date from
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </label>

              <label>
                Date to
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </label>

              <label>
                Guests
                <input
                  type="number"
                  min={1}
                  max={venue.maxGuests}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                />
              </label>

              {bookingError && <p style={{ color: "crimson" }}>{bookingError}</p>}
              {bookingSuccess && <p style={{ color: "green" }}>{bookingSuccess}</p>}

              <button
                type="button"
                onClick={onBook}
                disabled={bookingLoading || !dateFrom || !dateTo}
              >
                {bookingLoading ? "Booking…" : "Book now"}
              </button>
            </div>
          ) : (
            <p>
              Please <Link to="/login">log in</Link> to make a booking.
            </p>
          )}

          <hr style={{ margin: "2rem 0" }} />
          <h2>Booked dates</h2>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={showUpcomingOnly}
                onChange={(e) => setShowUpcomingOnly(e.target.checked)}
              />
              Upcoming only
            </label>

            <label>
              Sort
              <select value={bookingSort} onChange={(e) => setBookingSort(e.target.value as any)}>
                <option value="from_asc">Soonest first</option>
                <option value="from_desc">Latest first</option>
              </select>
            </label>

            <label>
              Show
              <select
                value={bookingLimit}
                onChange={(e) => setBookingLimit(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>

          {venue.bookings && venue.bookings.length > 0 ? (
            visibleBookings.length > 0 ? (
              <ul>
                {visibleBookings.map((b) => (
                  <li key={b.id}>
                    {new Date(b.dateFrom).toLocaleDateString()} →{" "}
                    {new Date(b.dateTo).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No bookings match the current filters.</p>
            )
          ) : (
            <p>No bookings yet.</p>
          )}
        </>
      )}
    </main>
  );
}
