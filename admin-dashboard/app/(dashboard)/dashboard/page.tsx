export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-bold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-bold mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-green-600">$45,678</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-bold mb-2">Active Tables</h3>
            <p className="text-3xl font-bold text-orange-600">12</p>
        </div>
      </div>
    </div>
  );
}
