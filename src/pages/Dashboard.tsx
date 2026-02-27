export function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Today's Patients</h3>
          <p className="mt-2 text-3xl font-semibold text-slate-900">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending Labs</h3>
          <p className="mt-2 text-3xl font-semibold text-slate-900">4</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Messages</h3>
          <p className="mt-2 text-3xl font-semibold text-slate-900">2</p>
        </div>
      </div>
    </div>
  );
}
