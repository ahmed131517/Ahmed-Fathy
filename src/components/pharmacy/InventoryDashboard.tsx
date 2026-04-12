import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { AlertTriangle, Calendar, Package, TrendingDown, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export function InventoryDashboard() {
  const inventory = useLiveQuery(() => db.pharmacy_inventory.where('isDeleted').equals(0).toArray()) || [];
  const batches = useLiveQuery(() => db.pharmacy_batches.where('isDeleted').equals(0).toArray()) || [];

  const stats = useMemo(() => {
    const lowStock = inventory.filter(item => item.stock <= item.minStock);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expiringSoon = batches.filter(batch => {
      const expiry = new Date(batch.expiryDate);
      return expiry <= thirtyDaysFromNow && expiry >= today;
    });

    const expired = batches.filter(batch => new Date(batch.expiryDate) < today);

    return {
      totalItems: inventory.length,
      lowStockCount: lowStock.length,
      expiringSoonCount: expiringSoon.length,
      expiredCount: expired.length,
      lowStockItems: lowStock,
      expiringSoonBatches: expiringSoon.map(b => ({
        ...b,
        medicationName: inventory.find(i => i.id === b.inventoryItemId)?.medicationName || 'Unknown'
      }))
    };
  }, [inventory, batches]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Total Items</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalItems}</p>
          </div>
        </div>

        <div className={cn("card-panel p-4 flex items-center gap-4", stats.lowStockCount > 0 && "ring-1 ring-amber-500/50 bg-amber-50/30")}>
          <div className={cn("p-3 rounded-xl", stats.lowStockCount > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400")}>
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Low Stock</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.lowStockCount}</p>
          </div>
        </div>

        <div className={cn("card-panel p-4 flex items-center gap-4", stats.expiringSoonCount > 0 && "ring-1 ring-orange-500/50 bg-orange-50/30")}>
          <div className={cn("p-3 rounded-xl", stats.expiringSoonCount > 0 ? "bg-orange-100 text-orange-600" : "bg-slate-50 text-slate-400")}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Expiring Soon</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.expiringSoonCount}</p>
          </div>
        </div>

        <div className={cn("card-panel p-4 flex items-center gap-4", stats.expiredCount > 0 && "ring-1 ring-red-500/50 bg-red-50/30")}>
          <div className={cn("p-3 rounded-xl", stats.expiredCount > 0 ? "bg-red-100 text-red-600" : "bg-slate-50 text-slate-400")}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Expired</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.expiredCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="card-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 dark:text-white">Low Stock Alerts</h3>
          </div>
          <div className="space-y-3">
            {stats.lowStockItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs italic">All stock levels are healthy.</p>
              </div>
            ) : (
              stats.lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.medicationName}</h4>
                    <p className="text-[10px] text-slate-500">Min Threshold: {item.minStock} {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-amber-600">{item.stock} {item.unit}</p>
                    <p className="text-[10px] text-amber-500 font-bold uppercase">Critical</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiry Tracking */}
        <div className="card-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-slate-900 dark:text-white">Expiry Tracking (Next 30 Days)</h3>
          </div>
          <div className="space-y-3">
            {stats.expiringSoonBatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs italic">No batches expiring soon.</p>
              </div>
            ) : (
              stats.expiringSoonBatches.map(batch => (
                <div key={batch.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{batch.medicationName}</h4>
                    <p className="text-[10px] text-slate-500">Batch: {batch.batchNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-orange-600">{new Date(batch.expiryDate).toLocaleDateString()}</p>
                    <p className="text-[10px] text-orange-500 font-bold uppercase">Expiring</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
