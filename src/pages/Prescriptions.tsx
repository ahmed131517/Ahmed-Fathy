import { FileText, Plus, Layout, Cpu, History, Eye, CheckCircle, Search, ShoppingCart } from "lucide-react";

export function Prescriptions() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Create Prescription</h2>
          <p className="text-slate-500">Manage patient medications</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 justify-between items-center">
        <div className="flex flex-wrap items-center gap-2">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New
          </button>
          <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1"></div>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <Layout className="w-4 h-4" /> Templates
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <Cpu className="w-4 h-4" /> AI Suggest
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <History className="w-4 h-4" /> History
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 transition-colors">
            <CheckCircle className="w-4 h-4" /> Save & Finish
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        {/* Catalog */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-indigo-500" /> Medications
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white transition-colors" placeholder="Search drug name..." />
            </div>
          </div>
          <div className="flex overflow-x-auto p-3 gap-2 border-b border-slate-100 bg-white">
            {['All', 'Antibiotics', 'Analgesics', 'Cardio', 'Resp'].map((cat, i) => (
              <button key={cat} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex-1 p-6 flex items-center justify-center bg-slate-50/30">
            <div className="text-center max-w-[200px]">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Search or select a category to view medications.</p>
            </div>
          </div>
        </div>

        {/* Prescription Pad */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 text-indigo-600">
              <FileText className="w-8 h-8" />
              <span className="text-xl font-bold tracking-widest">PRESCRIPTION</span>
            </div>
            <div className="flex gap-6 text-sm bg-white px-4 py-2 rounded-lg border border-slate-200">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
                <span className="font-medium text-slate-800">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rx ID</span>
                <span className="font-medium text-indigo-600">#NEW</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 p-8 text-center bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                <ShoppingCart className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-600 text-lg">No medications added yet</p>
              <p className="text-sm mt-1">Select a medication from the catalog to begin building the prescription.</p>
            </div>

            <div className="mt-6 pt-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Clinical Notes / Instructions</label>
              <textarea className="w-full h-24 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm bg-slate-50 focus:bg-white transition-colors" placeholder="Enter specific instructions for the patient or pharmacist..."></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
