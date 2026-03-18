import { useState, useEffect } from "react";
import React from "react";
import { Search, Plus, Edit2, Trash2, Save, X, AlertTriangle, Package, DollarSign, Tag, Factory } from "lucide-react";
import { cn } from "@/lib/utils";

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
  // Initialize state from localStorage or default data
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('pharmacy_inventory');
    return saved ? JSON.parse(saved) : initialInventory;
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "Antibiotics",
    manufacturer: "",
    price: 0,
    stock: 0,
    minStockLevel: 10
  });

  // Persist to localStorage whenever inventory changes
  useEffect(() => {
    localStorage.setItem('pharmacy_inventory', JSON.stringify(inventory));
  }, [inventory]);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        category: "Antibiotics",
        manufacturer: "",
        price: 0,
        stock: 0,
        minStockLevel: 10
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this medication?")) {
      setInventory(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const stock = Number(formData.stock);
    const minStock = Number(formData.minStockLevel);
    const status = stock === 0 ? "Out of Stock" : stock <= minStock ? "Low Stock" : "In Stock";

    const newItem: InventoryItem = {
      id: editingItem ? editingItem.id : Date.now(),
      name: formData.name || "",
      category: formData.category || "",
      manufacturer: formData.manufacturer || "",
      price: Number(formData.price),
      stock: stock,
      minStockLevel: minStock,
      status: status
    };

    if (editingItem) {
      setInventory(prev => prev.map(item => item.id === editingItem.id ? newItem : item));
    } else {
      setInventory(prev => [...prev, newItem]);
    }
    
    setIsModalOpen(false);
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
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Medication Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Manufacturer</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock Level</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.category}</td>
                    <td className="px-4 py-3 text-slate-600">{item.manufacturer}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">${item.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center gap-2">
                        {item.stock}
                        {item.stock <= item.minStockLevel && (
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1",
                        item.status === "In Stock" ? "bg-emerald-100 text-emerald-700" :
                        item.status === "Low Stock" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", 
                          item.status === "In Stock" ? "bg-emerald-500" :
                          item.status === "Low Stock" ? "bg-amber-500" :
                          "bg-red-500"
                        )} />
                        {item.status}
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
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Medication Name
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="e.g. Amoxicillin 500mg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" /> Category
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
                    <option value="Supplements">Supplements</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Factory className="w-3.5 h-3.5" /> Manufacturer
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.manufacturer}
                    onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    placeholder="e.g. Pfizer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                    value={formData.minStockLevel}
                    onChange={e => setFormData({...formData, minStockLevel: Number(e.target.value)})}
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
