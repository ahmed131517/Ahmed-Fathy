import { Clock, CheckCircle, AlertTriangle, DollarSign, FileText, Box, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function PharmacyDashboard() {
  const prescriptions = useLiveQuery(() => db.prescriptions.toArray()) || [];
  const inventory = useLiveQuery(() => db.pharmacy_inventory.toArray()) || [];
  const patients = useLiveQuery(() => db.patients.toArray()) || [];
  const prescriptionItems = useLiveQuery(() => db.prescription_items.toArray()) || [];
  const batches = useLiveQuery(() => db.pharmacy_batches.where('isDeleted').equals(0).toArray()) || [];

  const stats = useMemo(() => {
    const pending = prescriptions.filter(p => p.status === 'Pending').length;
    const ready = prescriptions.filter(p => p.status === 'Ready').length;
    const lowStock = inventory.filter(i => i.stock <= i.minStock).length;
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const expiringSoon = batches.filter(batch => {
      const expiry = new Date(batch.expiryDate);
      return expiry <= thirtyDaysFromNow && expiry >= today;
    }).length;
    
    // Calculate today's revenue (simplified)
    const completedToday = prescriptions.filter(p => p.status === 'Completed');
    let revenue = 0;
    completedToday.forEach(p => {
      const items = prescriptionItems.filter(i => i.prescriptionId === p.id);
      items.forEach(item => {
        const invItem = inventory.find(i => i.medicationName?.toLowerCase() === item.medicationName?.toLowerCase());
        revenue += invItem?.price || 10;
      });
    });

    return { pending, ready, lowStock, revenue, expiringSoon };
  }, [prescriptions, inventory, prescriptionItems, batches]);

  const recentPrescriptions = useMemo(() => {
    return prescriptions
      .filter(p => p.status === 'Pending')
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(p => {
        const patient = patients.find(pat => pat.id === p.patientId);
        const items = prescriptionItems.filter(i => i.prescriptionId === p.id);
        const meds = items.map(i => i.medicationName).join(", ");
        
        const diff = Date.now() - p.createdAt;
        const mins = Math.floor(diff / 60000);
        const timeStr = mins < 1 ? "Just now" : mins < 60 ? `${mins} mins ago` : `${Math.floor(mins / 60)} hours ago`;

        return {
          id: p.id?.slice(0, 8).toUpperCase() || `RX-${p.localId}`,
          patient: patient?.name || "Unknown Patient",
          meds: meds || "No medications",
          time: timeStr
        };
      });
  }, [prescriptions, patients, prescriptionItems]);

  const quickInventory = useMemo(() => {
    return inventory
      .sort((a, b) => (a.stock / a.minStock) - (b.stock / b.minStock))
      .slice(0, 5)
      .map(item => {
        const status = item.stock === 0 ? "Out of Stock" : item.stock <= item.minStock ? "Low Stock" : "In Stock";
        const color = item.stock === 0 ? "bg-red-100 text-red-700" : item.stock <= item.minStock ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
        return { ...item, status, color };
      });
  }, [inventory]);

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
            <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Ready for Pickup</h3>
            <p className="text-2xl font-bold text-slate-900">{stats.ready}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Low Stock Items</h3>
            <p className="text-2xl font-bold text-slate-900">{stats.lowStock}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Expiring Soon</h3>
            <p className="text-2xl font-bold text-slate-900">{stats.expiringSoon}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-slate-900">${stats.revenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Prescriptions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Recent Prescriptions from Clinic</h3>
            </div>
            <Link to="/pharmacy-system/orders" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-4 flex-1">
            {recentPrescriptions.length > 0 ? (
              recentPrescriptions.map((rx, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:border-indigo-100 transition-colors">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">{rx.id}</span>
                      <span className="font-medium text-slate-900 truncate">{rx.patient}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{rx.meds}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-slate-400">{rx.time}</span>
                    <Link 
                      to="/pharmacy-system/orders"
                      className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors"
                    >
                      Process
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                <FileText className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">No pending prescriptions</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Inventory */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Quick Inventory Check</h3>
            </div>
            <Link to="/pharmacy-system/inventory" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Medication</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quickInventory.length > 0 ? (
                  quickInventory.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.medicationName}</td>
                      <td className="px-4 py-3 text-slate-600">{item.stock}</td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-bold", item.color)}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic">
                      No inventory items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
