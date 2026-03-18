import { Clock, CheckCircle, AlertTriangle, DollarSign, FileText, Box } from "lucide-react";

export function PharmacyDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Pending Orders</h3>
            <p className="text-2xl font-bold text-slate-900">12</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Ready for Pickup</h3>
            <p className="text-2xl font-bold text-slate-900">8</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Low Stock Items</h3>
            <p className="text-2xl font-bold text-slate-900">5</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Today's Revenue</h3>
            <p className="text-2xl font-bold text-slate-900">$1,245.00</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Prescriptions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Recent Prescriptions from Clinic</h3>
          </div>
          <div className="p-4 space-y-4">
            {[
              { id: "RX-9901", patient: "John Smith", meds: "Lisinopril 10mg", time: "10 mins ago" },
              { id: "RX-9902", patient: "Emily Davis", meds: "Atorvastatin 20mg", time: "25 mins ago" },
              { id: "RX-9903", patient: "Michael Brown", meds: "Metformin 500mg", time: "45 mins ago" }
            ].map((rx, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:border-indigo-100 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{rx.id}</span>
                    <span className="font-medium text-slate-900">{rx.patient}</span>
                  </div>
                  <p className="text-xs text-slate-500">{rx.meds}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-slate-400">{rx.time}</span>
                  <button className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors">
                    Process
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Inventory */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-2">
            <Box className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Quick Inventory Check</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Medication</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: "Lisinopril 10mg", stock: 150, status: "In Stock", color: "bg-emerald-100 text-emerald-700" },
                  { name: "Atorvastatin 20mg", stock: 12, status: "Low Stock", color: "bg-amber-100 text-amber-700" },
                  { name: "Amoxicillin 500mg", stock: 85, status: "In Stock", color: "bg-emerald-100 text-emerald-700" },
                  { name: "Metformin 500mg", stock: 0, status: "Out of Stock", color: "bg-red-100 text-red-700" }
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.color}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
