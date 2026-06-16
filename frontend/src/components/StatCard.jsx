export default function StatCard({ label, value, accent }) {
return (
  <div className="bg-white rounded-2xl shadow-lg p-6 hover:scale-105 transition duration-300">
    <p className="text-xs uppercase tracking-widest text-gray-500">
      {label}
    </p>

    <p
      className="text-4xl font-bold mt-3"
      style={{ color: accent || "#1C372A" }}
    >
      {value}
    </p>
  </div>
);
}