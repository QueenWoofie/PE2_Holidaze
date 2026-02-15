import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../lib/auth";
import type { Booking, Venue } from "../lib/types";
import {
  createVenue,
  deleteVenue,
  getMyVenues,
  getVenueWithBookings,
  updateVenue,
} from "../lib/venues";

type VenueFormState = {
  name: string;
  description: string;
  mediaUrl: string;
  price: number;
  maxGuests: number;
};

const emptyForm: VenueFormState = {
  name: "",
  description: "",
  mediaUrl: "",
  price: 1000,
  maxGuests: 2,
};

export default function Admin() {
  const token = getToken();
  const profileName = localStorage.getItem("holidaze_name");

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<VenueFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [openBookingsFor, setOpenBookingsFor] = useState<string | null>(null);
  const [bookingsLoadingId, setBookingsLoadingId] = useState<string | null>(null);

  async function refresh() {
    if (!token || !profileName) return;

    try {
      setLoading(true);
      setError(null);
      const res = await getMyVenues(profileName, token);
      setVenues(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load your venues");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function toggleBookings(venueId: string) {
    if (!token) return;

    if (openBookingsFor === venueId) {
      setOpenBookingsFor(null);
      return;
    }

    try {
      setBookingsLoadingId(venueId);
      setError(null);
      setSuccess(null);

      const res = await getVenueWithBookings(venueId, token);

      setVenues((prev) => prev.map((v) => (v.id === venueId ? res.data : v)));

      setOpenBookingsFor(venueId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load venue bookings");
    } finally {
      setBookingsLoadingId(null);
    }
  }

  if (!token || !profileName) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>Venue Manager</h1>
        <p>You must be logged in as a venue manager to manage venues.</p>
        <Link to="/login">Go to login</Link>
      </main>
    );
  }

  function startEdit(v: Venue) {
    setEditingId(v.id);
    setSuccess(null);
    setForm({
      name: v.name ?? "",
      description: v.description ?? "",
      mediaUrl: v.media?.[0]?.url ?? "",
      price: v.price ?? 1000,
      maxGuests: v.maxGuests ?? 2,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        maxGuests: Number(form.maxGuests),
        media: form.mediaUrl ? [{ url: form.mediaUrl, alt: form.name }] : [],
      };

      if (editingId) {
        await updateVenue(editingId, payload, token);
        setSuccess("Venue updated!");
      } else {
        await createVenue(payload, token);
        setSuccess("Venue created!");
      }

      setForm(emptyForm);
      setEditingId(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!token) return;
    const ok = confirm("Delete this venue?");
    if (!ok) return;

    try {
      setError(null);
      setSuccess(null);
      await deleteVenue(id, token);
      setSuccess("Venue deleted!");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <main
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
        alignContent: "center",
      }}
    >
      <h1>Venue Manager</h1>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>{editingId ? "Edit venue" : "Create venue"}</h2>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              required
              rows={4}
            />
          </label>

          <label>
            Image URL (optional)
            <input
              value={form.mediaUrl}
              onChange={(e) => setForm((s) => ({ ...s, mediaUrl: e.target.value }))}
            />
          </label>

          <label>
            Price (per night)
            <input
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) }))}
              required
            />
          </label>

          <label>
            Max guests
            <input
              type="number"
              min={1}
              value={form.maxGuests}
              onChange={(e) => setForm((s) => ({ ...s, maxGuests: Number(e.target.value) }))}
              required
            />
          </label>

          {error && <p style={{ color: "crimson" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Create venue"}
            </button>

            {editingId && (
              <button type="button" onClick={cancelEdit} disabled={saving}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <hr style={{ margin: "2rem 0" }} />

      <section>
        <h2>My venues</h2>

        {loading && <p>Loading your venues…</p>}
        {!loading && venues.length === 0 && <p>You have no venues yet.</p>}

        <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
          {venues.map((v) => (
            <li
              key={v.id}
              style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, background: "#fff" }}
            >
              {v.media?.[0]?.url ? (
                <img
                  src={v.media[0].url}
                  alt={v.media[0].alt || v.name}
                  style={{
                    width: "100%",
                    maxWidth: 520,
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                  loading="lazy"
                />
              ) : null}
              <div>
                <strong>{v.name}</strong>
                <p>{v.description}</p>
              </div>
              <p>
                Price: {v.price} — Max guests: {v.maxGuests}
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" onClick={() => startEdit(v)}>
                  Edit
                </button>
                <button type="button" onClick={() => onDelete(v.id)}>
                  Delete
                </button>

                <button type="button" onClick={() => toggleBookings(v.id)}>
                  {bookingsLoadingId === v.id
                    ? "Loading…"
                    : openBookingsFor === v.id
                      ? "Hide bookings"
                      : "View bookings"}
                </button>
              </div>

              {openBookingsFor === v.id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
                  <strong>Bookings for this venue</strong>

                  {!v.bookings || v.bookings.length === 0 ? (
                    <p>No bookings yet.</p>
                  ) : (
                    <ul
                      style={{
                        display: "grid",
                        gap: 8,
                        padding: 0,
                        listStyle: "none",
                        marginTop: 8,
                      }}
                    >
                      {v.bookings
                        .filter((b: Booking) => new Date(b.dateTo) >= new Date()) // ✅ upcoming only
                        .slice()
                        .sort(
                          (a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime(),
                        )
                        .map((b) => (
                          <li
                            key={b.id}
                            style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}
                          >
                            <div>
                              <strong>From:</strong> {new Date(b.dateFrom).toLocaleDateString()}{" "}
                              <strong>To:</strong> {new Date(b.dateTo).toLocaleDateString()}
                            </div>
                            <div>
                              <strong>Guests:</strong> {b.guests}
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
