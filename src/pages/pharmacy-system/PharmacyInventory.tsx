import { useState, useEffect, useMemo } from "react";
import React from "react";
import { Search, Plus, Edit2, Trash2, Save, X, AlertTriangle, Package, DollarSign, Tag, Factory, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { db, PharmacyInventoryItem } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  manufacturer: string;
  price: number;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  minStockLevel: number;
}

const initialInventory: InventoryItem[] = [
  { id: 1, name: "Amoxicillin 500mg", category: "Antibiotics", manufacturer: "GSK", price: 15.50, stock: 120, status: "In Stock", minStockLevel: 50 },
  { id: 2, name: "Lisinopril 10mg", category: "Cardiovascular", manufacturer: "Pfizer", price: 22.00, stock: 15, status: "Low Stock", minStockLevel: 20 },
  { id: 3, name: "Paracetamol 500mg", category: "Analgesics", manufacturer: "Bayer", price: 5.25, stock: 450, status: "In Stock", minStockLevel: 100 },
  { id: 4, name: "Metformin 500mg", category: "Diabetic", manufacturer: "Merck", price: 18.75, stock: 0, status: "Out of Stock", minStockLevel: 30 },
  { id: 5, name: "Atorvastatin 20mg", category: "Cardiovascular", manufacturer: "Novartis", price: 35.00, stock: 85, status: "In Stock", minStockLevel: 40 }
];

export function PharmacyInventory() {
  const inventory = useLiveQuery(() => db.pharmacy_inventory.toArray()) || [];
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PharmacyInventoryItem | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<PharmacyInventoryItem>>({
    medicationName: "",
    unit: "Tablet",
    price: 0,
    stock: 0,
    minStock: 10
  });

  const seedInventory = async () => {
    setIsSeeding(true);
    try {
      const initialItems: Omit<PharmacyInventoryItem, 'localId'>[] = [
        { medicationName: "Amoxicillin 500mg", category: "Antibiotics", unit: "Capsule", price: 15.50, stock: 120, minStock: 50, lastModified: Date.now(), isDeleted: 0, isSynced: 0 },
        { medicationName: "Lisinopril 10mg", category: "Cardiovascular", unit: "Tablet", price: 22.00, stock: 15, minStock: 20, lastModified: Date.now(), isDeleted: 0, isSynced: 0 },
        { medicationName: "Paracetamol 500mg", category: "Analgesics", unit: "Tablet", price: 5.25, stock: 450, minStock: 100, lastModified: Date.now(), isDeleted: 0, isSynced: 0 },
        { medicationName: "Metformin 500mg", category: "Diabetic", unit: "Tablet", price: 18.75, stock: 0, minStock: 30, lastModified: Date.now(), isDeleted: 0, isSynced: 0 },
        { medicationName: "Atorvastatin 20mg", category: "Cardiovascular", unit: "Tablet", price: 35.00, stock: 85, minStock: 40, lastModified: Date.now(), isDeleted: 0, isSynced: 0 }
      ];
      
      for (const item of initialItems) {
        await db.pharmacy_inventory.add(item as any);
      }
      toast.success("Inventory seeded successfully");
    } catch (error) {
      console.error("Failed to seed inventory", error);
      toast.error("Failed to seed inventory");
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.medicationName?.toLowerCase().includes(searchQuery?.toLowerCase() || '');
      const matchesCategory = categoryFilter === "all" || item.category?.toLowerCase() === categoryFilter?.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchQuery, categoryFilter]);

  const handleOpenModal = (item?: PharmacyInventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        medicationName: "",
        category: "Antibiotics",
        unit: "Tablet",
        price: 0,
        stock: 0,
        minStock: 10
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (localId: number) => {
    if (confirm("Are you sure you want to delete this medication?")) {
      try {
        await db.pharmacy_inventory.delete(localId);
        toast.success("Medication deleted");
      } catch (error) {
        toast.error("Failed to delete medication");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const timestamp = Date.now();
    const itemData: any = {
      medicationName: formData.medicationName || "",
      category: formData.category || "Antibiotics",
      unit: formData.unit || "Tablet",
      price: Number(formData.price),
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
      lastModified: timestamp,
      isDeleted: 0,
      isSynced: 0
    };

    try {
      if (editingItem?.localId) {
        await db.pharmacy_inventory.update(editingItem.localId, itemData);
        toast.success("Medication updated");
      } else {
        await db.pharmacy_inventory.add(itemData);
        toast.success("Medication added");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save medication", error);
      toast.error("Failed to save medication");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search medications..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="antibiotics">Antibiotics</option>
            <option value="cardiovascular">Cardiovascular</option>
            <option value="analgesics">Analgesics</option>
            <option value="diabetic">Diabetic</option>
          </select>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Medication
        </button>
        {inventory.length === 0 && (
          <button 
            onClick={seedInventory}
            disabled={isSeeding}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 flex items-center gap-2 transition-colors border border-slate-200"
          >
            <RefreshCw className={cn("w-4 h-4", isSeeding && "animate-spin")} /> Seed Data
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Medication Name</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock Level</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => {
                  const status = item.stock === 0 ? "Out of Stock" : item.stock <= item.minStock ? "Low Stock" : "In Stock";
                  return (
                    <tr key={item.localId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.medicationName}</td>
                      <td className="px-4 py-3 text-slate-600">{item.unit}</td>
                      <td className="px-4 py-3 text-slate-900 font-medium">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="flex items-center gap-2">
                          {item.stock}
                          {item.stock <= item.minStock && (
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1",
                          status === "In Stock" ? "bg-emerald-100 text-emerald-700" :
                          status === "Low Stock" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", 
                            status === "In Stock" ? "bg-emerald-500" :
                            status === "Low Stock" ? "bg-amber-500" :
                            "bg-red-500"
                          )} />
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.localId!)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">
                    No medications found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                {editingItem ? <Edit2 className="w-4 h-4 text-indigo-500" /> : <Plus className="w-4 h-4 text-indigo-500" />}
                {editingItem ? "Edit Medication" : "Add New Medication"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Medication Name
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.medicationName}
                    onChange={e => setFormData({...formData, medicationName: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    placeholder="e.g. Amoxicillin 500mg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Category
                  </label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                  >
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Analgesics">Analgesics</option>
                    <option value="Diabetic">Diabetic</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" /> Unit
                  </label>
                  <select 
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Ointment">Ointment</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Price
                  </label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Stock</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Min Level</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={formData.minStock}
                    onChange={e => setFormData({...formData, minStock: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" /> Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
