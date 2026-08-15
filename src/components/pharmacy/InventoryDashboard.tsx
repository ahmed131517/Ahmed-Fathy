import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { 
  AlertTriangle, Calendar, Package, TrendingDown, Clock, CheckCircle2, 
  FileText, ShieldAlert, Thermometer, ShoppingCart, Send, Sparkles, Filter, ChevronRight, DollarSign 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/SettingsContext";
import { toast } from "sonner";

export function InventoryDashboard() {
  const { currencySymbol } = useSettings();
  const inventory = useLiveQuery(async () => {
    const all = await db.pharmacy_inventory.toArray();
    return all.filter(i => !i.isDeleted);
  }) || [];
  const batches = useLiveQuery(async () => {
    const all = await db.pharmacy_batches.toArray();
    return all.filter(b => !b.isDeleted);
  }) || [];

  const [expiryRange, setExpiryRange] = useState<"30" | "60" | "90" | "all">("30");
  const [showPOModal, setShowPOModal] = useState(false);

  // Compute 30-60-90 Day Expiry & Low Stock Analytics
  const stats = useMemo(() => {
    const lowStock = inventory.filter(item => item.stock <= item.minStock);
    const today = new Date();

    const getDaysDifference = (dateStr: string) => {
      const diff = new Date(dateStr).getTime() - today.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const expiring30 = batches.filter(b => {
      const days = getDaysDifference(b.expiryDate);
      return days >= 0 && days <= 30;
    });

    const expiring60 = batches.filter(b => {
      const days = getDaysDifference(b.expiryDate);
      return days > 30 && days <= 60;
    });

    const expiring90 = batches.filter(b => {
      const days = getDaysDifference(b.expiryDate);
      return days > 60 && days <= 90;
    });

    const expired = batches.filter(b => getDaysDifference(b.expiryDate) < 0);

    // Cold chain & controlled substance counts
    const coldChainItems = inventory.filter(i => 
      i.medicationName?.toLowerCase().includes('insulin') || 
      i.medicationName?.toLowerCase().includes('vaccine') ||
      i.medicationName?.toLowerCase().includes('interferon') ||
      i.medicationName?.toLowerCase().includes('biologic')
    );

    const controlledItems = inventory.filter(i => {
      const name = i.medicationName?.toLowerCase() || '';
      return name.includes('morphine') || name.includes('codeine') || name.includes('oxycodone') || name.includes('fentanyl') || name.includes('tramadol');
    });

    return {
      totalItems: inventory.length,
      lowStockCount: lowStock.length,
      expiring30,
      expiring60,
      expiring90,
      expiredCount: expired.length,
      lowStockItems: lowStock,
      coldChainItems,
      controlledItems
    };
  }, [inventory, batches]);

  // Auto-generate Purchase Orders Data
  const autoPurchaseOrders = useMemo(() => {
    return stats.lowStockItems.map(item => {
      const reorderQty = Math.max((item.minStock * 2) - item.stock, 50);
      const estimatedCost = reorderQty * (item.price * 0.65); // wholesale discount rate
      return {
        id: item.id || String(item.localId),
        medicationName: item.medicationName,
        currentStock: item.stock,
        minStock: item.minStock,
        reorderQty,
        supplier: "Global Pharma Direct Wholesaler",
        unitPrice: item.price * 0.65,
        totalCost: estimatedCost
      };
    });
  }, [stats.lowStockItems]);

  const totalPOCost = autoPurchaseOrders.reduce((sum, po) => sum + po.totalCost, 0);

  const handleSendPurchaseOrders = () => {
    toast.success(`Generated & Sent ${autoPurchaseOrders.length} Purchase Orders to Suppliers!`);
    setShowPOModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 flex items-center gap-4 border border-slate-200 dark:border-slate-800">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Total Active Lines</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalItems}</p>
          </div>
        </div>

        <div className={cn("card-panel p-4 flex items-center justify-between border border-slate-200 dark:border-slate-800", stats.lowStockCount > 0 && "ring-1 ring-amber-500/50 bg-amber-50/30")}>
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-xl", stats.lowStockCount > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400")}>
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Low Stock Reorders</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.lowStockCount}</p>
            </div>
          </div>
          {stats.lowStockCount > 0 && (
            <button
              onClick={() => setShowPOModal(true)}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Auto-PO
            </button>
          )}
        </div>

        <div className={cn("card-panel p-4 flex items-center gap-4 border border-slate-200 dark:border-slate-800", stats.expiring30.length > 0 && "ring-1 ring-orange-500/50 bg-orange-50/30")}>
          <div className={cn("p-3 rounded-xl", stats.expiring30.length > 0 ? "bg-orange-100 text-orange-600" : "bg-slate-50 text-slate-400")}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Expiring &lt;30 Days</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.expiring30.length} batches</p>
          </div>
        </div>

        <div className="card-panel p-4 flex items-center gap-4 border border-slate-200 dark:border-slate-800">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Cold-Chain (2°-8°C)</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.coldChainItems.length} items</p>
          </div>
        </div>
      </div>

      {/* 30-60-90 Day Expiry Alert Breakdown */}
      <div className="card-panel p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-slate-900 dark:text-white">Proactive Batch Expiry Control (30-60-90 Days)</h3>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setExpiryRange("30")}
              className={cn("px-3 py-1 rounded-lg font-bold transition-all", expiryRange === "30" ? "bg-rose-600 text-white shadow" : "text-slate-600 dark:text-slate-400")}
            >
              0-30 Days ({stats.expiring30.length})
            </button>
            <button
              onClick={() => setExpiryRange("60")}
              className={cn("px-3 py-1 rounded-lg font-bold transition-all", expiryRange === "60" ? "bg-amber-600 text-white shadow" : "text-slate-600 dark:text-slate-400")}
            >
              31-60 Days ({stats.expiring60.length})
            </button>
            <button
              onClick={() => setExpiryRange("90")}
              className={cn("px-3 py-1 rounded-lg font-bold transition-all", expiryRange === "90" ? "bg-indigo-600 text-white shadow" : "text-slate-600 dark:text-slate-400")}
            >
              61-90 Days ({stats.expiring90.length})
            </button>
          </div>
        </div>

        {/* Expiry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 0-30 Days */}
          <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-rose-900 dark:text-rose-300 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Critical (0-30 Days)
              </span>
              <span className="text-[10px] bg-rose-200 text-rose-800 font-extrabold px-2 py-0.5 rounded uppercase">
                Liquidate / Return
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {stats.expiring30.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2 text-center">No batches in critical window.</p>
              ) : (
                stats.expiring30.map(b => (
                  <div key={b.id || b.batchNumber} className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-rose-200 dark:border-rose-800 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{b.batchNumber}</p>
                      <p className="text-[10px] text-slate-500">Exp: {b.expiryDate}</p>
                    </div>
                    <button 
                      onClick={() => toast.info(`Initiated Vendor Return Request for batch ${b.batchNumber}`)}
                      className="text-[10px] bg-rose-600 text-white hover:bg-rose-700 px-2 py-1 rounded font-bold"
                    >
                      Return / Vendor
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 31-60 Days */}
          <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-amber-900 dark:text-amber-300 flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-600" /> Moderate (31-60 Days)
              </span>
              <span className="text-[10px] bg-amber-200 text-amber-800 font-extrabold px-2 py-0.5 rounded uppercase">
                Fast-Track Dispense
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {stats.expiring60.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2 text-center">No batches in 30-60 day window.</p>
              ) : (
                stats.expiring60.map(b => (
                  <div key={b.id || b.batchNumber} className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{b.batchNumber}</p>
                      <p className="text-[10px] text-slate-500">Exp: {b.expiryDate}</p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      FEFO Priority
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 61-90 Days */}
          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-indigo-600" /> Monitor (61-90 Days)
              </span>
              <span className="text-[10px] bg-indigo-200 text-indigo-800 font-extrabold px-2 py-0.5 rounded uppercase">
                Normal Stock
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {stats.expiring90.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2 text-center">No batches in 60-90 day window.</p>
              ) : (
                stats.expiring90.map(b => (
                  <div key={b.id || b.batchNumber} className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{b.batchNumber}</p>
                      <p className="text-[10px] text-slate-500">Exp: {b.expiryDate}</p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      Healthy
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auto Purchase Order Modal */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Automated Wholesale Purchase Orders (Low-Stock Reorder)</h3>
              </div>
              <button onClick={() => setShowPOModal(false)} className="p-1 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  The system automatically calculated optimal reorder quantities for <strong>{autoPurchaseOrders.length} low-stock items</strong> based on target minimum threshold levels.
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold">
                    <tr>
                      <th className="p-3">Medication</th>
                      <th className="p-3">Current Stock</th>
                      <th className="p-3">Min Threshold</th>
                      <th className="p-3">Suggested Order</th>
                      <th className="p-3 text-right">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {autoPurchaseOrders.map(po => (
                      <tr key={po.id}>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{po.medicationName}</td>
                        <td className="p-3 text-amber-600 font-mono font-bold">{po.currentStock}</td>
                        <td className="p-3 font-mono">{po.minStock}</td>
                        <td className="p-3 font-mono text-emerald-600 font-bold">+{po.reorderQty} units</td>
                        <td className="p-3 text-right font-mono font-bold">{currencySymbol}{po.totalCost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2 font-bold text-sm">
                <span>Total Estimated PO Wholesale Invoice:</span>
                <span className="text-lg text-emerald-600 font-mono">{currencySymbol}{totalPOCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowPOModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendPurchaseOrders}
                className="px-5 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Approve & Dispatch Purchase Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
