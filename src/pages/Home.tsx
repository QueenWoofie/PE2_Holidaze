import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import type { NoroffResponse, Venue } from "../lib/types";

type SortOption = "name_asc" | "name_desc" | "price_asc" | "price_desc";

export default function Home() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [displayCount, setDisplayCount] = useState(24);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("name_asc");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minGuests, setMinGuests] = useState<number | "">("");

  async function loadAllVenues() {
    try {
      setLoading(true);
      setError(null);

      const all: Venue[] = [];
      let nextPage = 1;
      let last = false;

      while (!last && all.length < 1000 && nextPage <= 15) {
        const res = await apiFetch<NoroffResponse<Venue[]>>(
          `/holidaze/venues?limit=100&page=${nextPage}`,
        );

        all.push(...res.data);

        last = res.meta.isLastPage;
        nextPage = res.meta.nextPage ?? nextPage + 1;
      }

      const map = new Map(all.map((v) => [v.id, v]));
      setVenues(Array.from(map.values()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load venues");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllVenues();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return venues.filter((v) => {
      const matchesQuery =
        !q || v.name.toLowerCase().includes(q) || (v.description ?? "").toLowerCase().includes(q);

      const matchesPrice = maxPrice === "" || v.price <= maxPrice;
      const matchesGuests = minGuests === "" || v.maxGuests >= minGuests;

      return matchesQuery && matchesPrice && matchesGuests;
    });
  }, [venues, query, maxPrice, minGuests]);

  const sorted = useMemo(() => {
    const arr = [...filtered];

    const normalizeName = (name: string) =>
      name
        .trim()
        .replace(/^["'`]+|["'`]+$/g, "")
        .toLowerCase();

    arr.sort((a, b) => {
      if (sort === "name_asc") {
        return normalizeName(a.name).localeCompare(normalizeName(b.name), "en", {
          sensitivity: "base",
          ignorePunctuation: true,
          numeric: true,
        });
      }

      if (sort === "name_desc") {
        return normalizeName(b.name).localeCompare(normalizeName(a.name), "en", {
          sensitivity: "base",
          ignorePunctuation: true,
          numeric: true,
        });
      }

      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;

      return 0;
    });

    return arr;
  }, [filtered, sort]);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Venues</h1>
      <p>Glaze your holiday with Holidaze.</p>

      <section
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "1fr",
          marginTop: 16,
          marginBottom: 24,
        }}
      >
        <label>
          Search
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or description…"
          />
        </label>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          <label>
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
              <option value="name_asc">Name (A–Z)</option>
              <option value="name_desc">Name (Z–A)</option>
              <option value="price_asc">Price (Low → High)</option>
              <option value="price_desc">Price (High → Low)</option>
            </select>
          </label>

          <label>
            Max price
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 1500"
            />
          </label>

          <label>
            Min guests
            <input
              type="number"
              min={1}
              value={minGuests}
              onChange={(e) => setMinGuests(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 2"
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSort("name_asc");
              setMaxPrice("");
              setMinGuests("");
            }}
          >
            Reset filters
          </button>
        </div>
      </section>

      {loading && <p>Loading venues…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && sorted.length === 0 && <p>No venues match your filters.</p>}

      {!loading && !error && sorted.length > 0 && (
        <>
          <p style={{ margin: "0 0 12px 0" }}>
            Showing <strong>{Math.min(displayCount, sorted.length)}</strong> of{" "}
            <strong>{sorted.length}</strong> venues
          </p>

          <ul
            style={{
              display: "grid",
              gap: 12,
              padding: 0,
              listStyle: "none",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {sorted.slice(0, displayCount).map((v) => {
              const img = v.media?.[0]?.url;

              return (
                <li className="card" key={v.id}>
                  {img ? (
                    <img
                      src={img}
                      alt={v.media?.[0]?.alt || v.name}
                      style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: 180,
                        display: "grid",
                        placeItems: "center",
                        background: "#f3f3f3",
                      }}
                    >
                      <span>No image</span>
                    </div>
                  )}

                  <div style={{ padding: 12 }}>
                    <strong>
                      <Link to={`/venue/${v.id}`}>{v.name}</Link>
                    </strong>

                    <p style={{ marginTop: 8 }}>
                      {v.description?.slice(0, 120)}
                      {v.description && v.description.length > 120 ? "…" : ""}
                    </p>

                    <p style={{ margin: 0 }}>
                      <strong>Price:</strong> {v.price} — <strong>Max guests:</strong> {v.maxGuests}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          {sorted.length > displayCount && (
            <div style={{ marginTop: 16 }}>
              <button type="button" onClick={() => setDisplayCount((c) => c + 24)}>
                Show more
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
