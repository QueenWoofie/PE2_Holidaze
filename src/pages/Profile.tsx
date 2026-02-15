import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clearAuth, getToken } from "../lib/auth";
import { getProfile, updateAvatar } from "../lib/profiles";

export default function Profile() {
  const token = getToken();
  const profileName = localStorage.getItem("holidaze_name");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!token || !profileName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await getProfile(profileName, token);
        const url = res.data.avatar?.url ?? "";

        setCurrentAvatar(url || null);
        setAvatarUrl(url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load profile");
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
        <h1>Profile</h1>
        <p>You are not logged in.</p>
        <Link to="/login">Go to login</Link>
      </main>
    );
  }

  async function onSaveAvatar(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !profileName) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const res = await updateAvatar(profileName, avatarUrl, token);
      const url = res.data.avatar?.url ?? "";

      setCurrentAvatar(url || null);
      setSuccess("Avatar updated!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update avatar");
    } finally {
      setSaving(false);
    }
  }

  function logoutHere() {
    clearAuth();
    window.location.href = "/";
  }

  return (
    <main>
      <h1>Profile</h1>

      {loading && <p>Loading profile…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {!loading && (
        <>
          <div style={{ marginTop: 12, marginBottom: 16 }}>
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="Profile avatar"
                style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "#eee",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                No avatar
              </div>
            )}
          </div>

          <form onSubmit={onSaveAvatar} style={{ display: "grid", gap: 12 }}>
            <label>
              Avatar URL
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
              />
            </label>

            <button type="submit" disabled={saving || !avatarUrl}>
              {saving ? "Saving…" : "Update avatar"}
            </button>
          </form>

          <hr style={{ margin: "2rem 0" }} />

          <button type="button" onClick={logoutHere}>
            Logout
          </button>
        </>
      )}
    </main>
  );
}
