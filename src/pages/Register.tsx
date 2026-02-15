import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../lib/auth";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // must be stud.noroff.no email per brief
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [venueManager, setVenueManager] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.toLowerCase().endsWith("@stud.noroff.no")) {
      setError("Email must end with @stud.noroff.no");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await registerUser({ name, email, password, venueManager });
      navigate("/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Register</h1>
      <p>
        <Link to="/">← Back</Link>
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Email (stud.noroff.no)
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={venueManager}
            onChange={(e) => setVenueManager(e.target.checked)}
          />
          Register as Venue Manager
        </label>

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Registering…" : "Register"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </main>
  );
}
