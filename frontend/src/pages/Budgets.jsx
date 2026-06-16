import { useEffect, useState } from "react";
import API from "../api/client";

export default function Budgets() {
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ category: "", monthly_limit: "" });

  const load = async () => {
    const [c, b, s] = await Promise.all([
      API.get("/categories"),
      API.get("/budgets"),
      API.get("/stats/summary"),
    ]);
    setCategories(c.data.categories);
    setBudgets(b.data);
    setStats(s.data);
    if (c.data.categories[0]) setForm((f) => ({ ...f, category: c.data.categories[0] }));
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await API.post("/budgets", {
      category: form.category,
      monthly_limit: parseFloat(form.monthly_limit),
    });
    setForm({ ...form, monthly_limit: "" });
    load();
  };

  const spentFor = (cat) =>
    stats?.category_breakdown.find((c) => c.category === cat)?.amount || 0;

  const overBudget = (spent, limit) => {
  return spent >= limit;
};

  return (
    <div>
      <h2 className="text-3xl font-bold mb-1">Budgets</h2>
      <p className="text-muted mb-8">Set monthly limits per category</p>

      <form onSubmit={save} className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Set Budget</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input
            type="number" step="0.01" placeholder="Monthly limit" className="input"
            value={form.monthly_limit}
            onChange={(e) => setForm({ ...form, monthly_limit: e.target.value })}
            required
          />
          <button className="btn-primary">Save Budget</button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const spent = spentFor(b.category);
          const pct = Math.min((spent / b.monthly_limit) * 100, 100);
          const over = spent > b.monthly_limit;
          return (
            <div key={b.id} className="card">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">{b.category}</h4>
                <span className={`text-sm font-mono ${over ? "text-danger" : "text-muted"}`}>
                  ${spent.toFixed(2)} / ${b.monthly_limit.toFixed(2)}
                </span>
              </div>
              <div className="h-2 bg-bg rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${over ? "bg-danger" : pct > 80 ? "bg-yellow-500" : "bg-success"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {overBudget(spent, b.monthly_limit) && (
  <div
    style={{
      background: "#FEE2E2",
      color: "#DC2626",
      padding: "10px",
      borderRadius: "8px",
      marginTop: "10px",
      fontWeight: "bold",
    }}
  >
    ⚠ Budget Exceeded!
  </div>
)}
            </div>
          );
        })}
        {budgets.length === 0 && (
          <p className="text-muted">No budgets set yet.</p>
        )}
      </div>
    </div>
  );
}