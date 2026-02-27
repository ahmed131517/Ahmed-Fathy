import { useState } from "react";
import { FilePlus, Search, Droplet, Box, LifeBuoy, PieChart, Zap, Database, Activity, Filter, Shield, FlaskConical, Image as ImageIcon, Heart, Layers, AlertTriangle, Target, Thermometer, Wind, Cpu, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { id: 'hematology', name: 'Hematology', icon: Droplet },
  { id: 'renal', name: 'Kidney Function', icon: Box },
  { id: 'hepatic', name: 'Liver Function', icon: LifeBuoy },
  { id: 'lipids', name: 'Lipid Profile', icon: PieChart },
  { id: 'electrolytes', name: 'Electrolytes', icon: Zap },
  { id: 'pancreatic', name: 'Pancreatic Function', icon: Database },
  { id: 'metabolic', name: 'General Biochemistry', icon: Activity },
  { id: 'microbiology', name: 'Microbiology', icon: Filter },
  { id: 'serology', name: 'Serology & Immunology', icon: Shield },
  { id: 'urine', name: 'Urinalysis', icon: FlaskConical },
  { id: 'imaging', name: 'Diagnostic Imaging', icon: ImageIcon },
  { id: 'cardiology', name: 'Cardiology', icon: Heart },
];

export function LabRequests() {
  const [activeTab, setActiveTab] = useState('new');

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Lab Requests</h2>
          <p className="text-slate-500">Order and track laboratory tests</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50">
          {[
            { id: 'new', label: 'New Lab Request' },
            { id: 'pending', label: 'Pending Tests' },
            { id: 'completed', label: 'Completed Tests' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-4 text-sm font-medium transition-colors border-b-2",
                activeTab === tab.id 
                  ? "border-indigo-600 text-indigo-600 bg-white" 
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'new' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <FilePlus className="w-5 h-5 text-indigo-500" /> Test Categories
                </h3>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search tests (e.g., CBC, Glucose)..." 
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-all text-center group hover:shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mb-3 transition-colors">
                      <cat.icon className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-700">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'pending' && (
            <div className="h-full flex items-center justify-center animate-in fade-in duration-300">
              <div className="text-center bg-slate-50 p-12 rounded-2xl border-2 border-dashed border-slate-200 max-w-md">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No pending tests</h3>
                <p className="text-slate-500 mt-2 text-sm">Tests that have been ordered but not yet resulted will appear here.</p>
              </div>
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="h-full flex items-center justify-center animate-in fade-in duration-300">
              <div className="text-center bg-slate-50 p-12 rounded-2xl border-2 border-dashed border-slate-200 max-w-md">
                <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No completed tests</h3>
                <p className="text-slate-500 mt-2 text-sm">Resulted tests will appear here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
