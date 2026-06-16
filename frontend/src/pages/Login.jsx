

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  className="min-h-screen flex items-center justify-center p-6"
  style={{
    background:
      "linear-gradient(135deg, #10281E 0%, #0ea5e9 100%)",
  }}
>
      <div
  className="w-full max-w-md"
  style={{
    background: "rgba(255,255,255,0.95)",
    padding: "32px",
    borderRadius: "20px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  }}
>
        <h1 className="text-4xl font-bold mb-2 text-primary">
  Finlytic
</h1>

<p className="text-lg mb-6">
  Smart Expense Tracker 💰
</p>
        <p className="text-muted mb-6">Login to track your expenses</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted">Email</label>
            <input
              type="email"
              className="input mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted">Password</label>
            <input
              type="password"
              className="input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-muted mt-6 text-center">
          New here?{" "}
          <Link to="/register" className="text-primary font-medium underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}