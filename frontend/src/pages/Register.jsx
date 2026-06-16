import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form.email, form.password, form.name);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div
  className="min-h-screen flex items-center justify-center p-6"
  style={{
    background: "linear-gradient(135deg, #10281E 0%, #0ea5e9 100%)",
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

<p className="text-lg text-muted mb-6">
  Create your smart expense account 💰
</p>
        

        <form onSubmit={submit} className="space-y-4">
          <input
            className="input"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={6}
            required
          />

          {error && <p className="text-danger text-sm">{error}</p>}

          <button className="btn-primary w-full">Sign up</button>
        </form>

        <p className="text-sm text-muted mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}