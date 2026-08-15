import { Clock, CheckCircle, AlertTriangle, DollarSign, FileText, Box, ArrowRight, ShieldAlert, Barcode, Check, Cpu, Sparkles, Printer, Zap } from "lucide-react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PharmacyDashboard() {
  const prescriptions = useLiveQuery(() => db.prescriptions.toArray()) || [];
  const inventory = useLiveQuery(() => db.pharmacy_inventory.toArray()) || [];
  const patients = useLiveQuery(() => db.patients.toArray()) || [];
  const prescriptionItems = useLiveQuery(() => db.prescription_items.toArray()) || [];
  const batches = useLiveQuery(async () => {
    const all = await db.pharmacy_batches.toArray();
    return all.filter(b => !b.isDeleted);
  }) || [];

  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannedMed, setScannedMed] = useState<any>(null);

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
    
    // Calculate today's revenue
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

  const handleBarcodeVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const match = inventory.find(i => 
      (i as any).barcode === barcodeInput.trim() || 
      i.medicationName.toLowerCase().includes(barcodeInput.trim().toLowerCase())
    );

    if (match) {
      setScannedMed(match);
      toast.success(`Verified: ${match.medicationName} (Stock: ${match.stock} ${match.unit || 'units'})`);
    } else {
      setScannedMed(null);
      toast.error(`No medication match found for barcode or keyword "${barcodeInput}"`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pharmacist Clinical Guardrail & Barcode Quick-Verification Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-md border border-indigo-800/50 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> AI Pharmacist Assistant Active
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 uppercase tracking-widest flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-emerald-400" /> FEFO Dispensing Enabled
              </span>
            </div>
            <h2 className="text-xl font-bold">Pharmacist Clinical Safety & Verification Hub</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Verify prescription barcodes, scan batch expiration dates (FEFO), check drug-drug interactions (DDI), and print SIG labels in real time.
            </p>
          </div>

          <form onSubmit={handleBarcodeVerify} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan GTIN or type med..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> Verify
            </button>
          </form>
        </div>

        {scannedMed && (
          <div className="p-3 bg-indigo-950/80 border border-indigo-700/60 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white">{scannedMed.medicationName}</span>
                <span className="text-slate-300 ml-2 font-mono">Stock: {scannedMed.stock} | Price: ${scannedMed.price}</span>
              </div>
            </div>
            <button 
              onClick={() => { setScannedMed(null); setBarcodeInput(""); }}
              className="text-slate-400 hover:text-white font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500">Pending Orders</h3>
            <p className="text-xl font-bold text-slate-900">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500">Ready for Pickup</h3>
            <p className="text-xl font-bold text-slate-900">{stats.ready}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500">Low Stock Items</h3>
            <p className="text-xl font-bold text-slate-900">{stats.lowStock}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500">Expiring Soon</h3>
            <p className="text-xl font-bold text-slate-900">{stats.expiringSoon}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 col-span-1 md:col-span-2 lg:col-span-1">
          <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500">Total Revenue</h3>
            <p className="text-xl font-bold text-slate-900">${stats.revenue.toFixed(2)}</p>
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

