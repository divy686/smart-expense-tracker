import { useEffect, useState } from "react";
import API from "../api/client";
import ExpenseForm from "../components/ExpenseForm";
import { Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");

  const load = () => API.get("/expenses").then((r) => setExpenses(r.data));

  useEffect(() => { load(); }, []);

  const filteredExpenses = expenses.filter((e) =>
  e.category.toLowerCase().includes(search.toLowerCase()) ||
  (e.description || "").toLowerCase().includes(search.toLowerCase())
);

  const del = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    await API.delete(`/expenses/${id}`);
    load();
  };

  const downloadPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Expense Report", 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [["Date", "Category", "Description", "Amount"]],
    body: expenses.map((e) => [
      e.date,
      e.category,
      e.description || "-",
      `$${e.amount.toFixed(2)}`
    ]),
  });

  doc.save("expense-report.pdf");
};

  return (
    <div>
      <h2 className="text-3xl font-bold mb-1">Expenses</h2>
      <p className="text-muted mb-8">Track every rupee you spend</p>

      <ExpenseForm onAdded={load} />

      <div className="mb-4">
  <input
    type="text"
    placeholder="Search by category or description..."
    className="input"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>

      <div className="mb-4">
  <button onClick={downloadPDF} className="btn-primary">
    Download PDF Report
  </button>
</div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg border-b border-border">
            <tr className="text-left">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0 hover:bg-bg">
                <td className="px-4 py-3">{e.date}</td>
                <td className="px-4 py-3">{e.category}</td>
                <td className="px-4 py-3 text-muted">{e.description || "—"}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">
                  ${e.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => del(e.id)} className="text-danger hover:opacity-70">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted py-8">
                No expenses yet. Add one above!
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}