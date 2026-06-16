import { useEffect, useState } from "react";
import API from "../api/client";

export default function ExpenseForm({ onAdded }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    API.get("/categories").then((r) => {
      setCategories(r.data.categories);
      setForm((f) => ({ ...f, category: r.data.categories[0] }));
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await API.post("/expenses", {
      ...form,
      amount: parseFloat(form.amount),
    });
    setForm({ ...form, amount: "", description: "" });
    onAdded();
  };

  return (
    <form onSubmit={submit} className="card mb-6">
      <h3 className="text-lg font-semibold mb-4">Add Expense</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="number" step="0.01" placeholder="Amount" className="input"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <select
          className="input"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input
          type="text" placeholder="Description" className="input"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="date" className="input"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <button className="btn-primary">Add</button>
      </div>
    </form>
  );
}