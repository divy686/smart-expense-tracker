import { useEffect, useState } from "react";
import API from "../api/client";
import StatCard from "../components/StatCard";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

const COLORS = ["#1C372A", "#2D7A5D", "#00B8D4", "#CC5A3A", "#8B5A2B", "#5B6C64", "#D4A24C", "#7B9E89", "#A67B5B", "#3B5998"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/stats/summary").then((r) => setStats(r.data));
  }, []);

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-1">Dashboard</h2>
      <p className="text-muted mb-8">Your spending at a glance</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="This Month"
          value={`$${(stats.current_month_total || 0).toFixed(2)}`}
        />
        <StatCard
          label="Projected Total"
          value={`$${(stats.projected_month_total || 0).toFixed(2)}`}
          accent="#00B8D4"
        />
        <StatCard
          label="Transactions"
          value={stats.transaction_count}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          {(stats.category_breakdown || []).length === 0 ? (
            <p className="text-muted text-sm">No expenses yet this month.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.category_breakdown || []}
                  dataKey="amount"
                  nameKey="category"
                  outerRadius={120}
                  label={(d) => `${d.category}: $${d.amount}`}
                >
                  {(stats.category_breakdown || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stats.monthly_history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E2DF" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount"stroke="#00B8D4" strokeWidth={4}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}