import { useState, useMemo } from "react";
import { Search, Eye } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { toast } from "sonner";

export function PharmacyPatients() {
  const [searchQuery, setSearchQuery] = useState("");

  const patientsData = useLiveQuery(() => db.patients.toArray());
  const prescriptionsData = useLiveQuery(() => db.prescriptions.toArray());

  const patients = useMemo(() => {
    if (!patientsData) return [];

    return patientsData.map(patient => {
      const patientPrescriptions = prescriptionsData?.filter(p => p.patientId === patient.id || p.patientId === String(patient.localId)) || [];
      
      // Sort prescriptions by createdAt descending to find the latest
      const sortedPrescriptions = [...patientPrescriptions].sort((a, b) => b.createdAt - a.createdAt);
      const lastRx = sortedPrescriptions.length > 0 
        ? new Date(sortedPrescriptions[0].createdAt).toLocaleDateString() 
        : "No prescriptions";

      return {
        id: patient.id || String(patient.localId),
        name: patient.name,
        lastRx,
        orders: patientPrescriptions.length,
        status: patient.status === "active" ? "Active" : "Inactive"
      };
    });
  }, [patientsData, prescriptionsData]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by name or ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Clinic ID</th>
                <th className="px-6 py-4">Last Prescription</th>
                <th className="px-6 py-4">Total Orders</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-900">{patient.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-500 text-xs">{patient.id}</td>
                    <td className="px-6 py-4 text-slate-600">{patient.lastRx}</td>
                    <td className="px-6 py-4 text-slate-600">{patient.orders}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        patient.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toast.info("Patient history functionality coming soon!")}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-xs flex items-center justify-end gap-1 ml-auto"
                      >
                        <Eye className="w-3 h-3" /> View History
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic">
                    No patients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
