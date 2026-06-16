import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Receipt, Target, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/budgets", label: "Budgets", icon: Target },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
return (
    <div className="min-h-screen flex bg-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-[#10281E] text-white p-6 flex flex-col shadow-xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-cyan-400">Finlytic</h1>
          <p className="text-xs text-gray-300 mt-1 uppercase tracking-widest">Smart Tracker</p>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                  active
                    ? "bg-cyan-500 text-white shadow-lg"
                    : "text-muted hover:bg-bg hover:text-primary"
                }`}
            >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border pt-4 mt-4">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted truncate">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-sm text-danger hover:opacity-80"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">

  <div className="bg-gradient-to-r from-green-800 to-cyan-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
    <h1 className="text-3xl font-bold">
      Welcome Back 👋
    </h1>

    <p className="mt-2 opacity-90">
      Track expenses, manage budgets and get AI-powered financial insights.
    </p>
  </div>

  {children}

 </main>

 </div>
    );
}
    