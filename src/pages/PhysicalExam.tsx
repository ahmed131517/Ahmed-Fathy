import { useState } from "react";
import { UserCheck, Eye, Wind, Heart, Activity, Move, Cpu, Feather as FeatherIcon, Clipboard, Save, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: 'general', name: 'General', icon: UserCheck },
  { id: 'heent', name: 'HEENT', icon: Eye },
  { id: 'respiratory', name: 'Respiratory', icon: Wind },
  { id: 'cardiovascular', name: 'Cardiovascular', icon: Heart },
  { id: 'gastrointestinal', name: 'Gastrointestinal', icon: Activity },
  { id: 'musculoskeletal', name: 'Musculoskeletal', icon: Move },
  { id: 'neurological', name: 'Neurological', icon: Cpu },
  { id: 'skin', name: 'Skin', icon: FeatherIcon },
];

export function PhysicalExam() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Physical Examination</h2>
          <p className="text-slate-500">Conduct and document comprehensive physical examinations</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" /> Save as Draft
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors">
            <Check className="w-4 h-4" /> Finalize Examination
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 p-2 gap-1 bg-slate-50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab.id 
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">General Appearance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Overall Appearance</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Ill-appearing', 'Distressed', 'Lethargic', 'Well-nourished', 'Well-developed'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                          <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Notes</label>
                  <textarea 
                    className="w-full h-40 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Enter detailed notes about general appearance..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}
          {activeTab !== 'general' && (
            <div className="flex items-center justify-center h-full text-slate-400 animate-in fade-in duration-300">
              <div className="text-center bg-slate-50 p-12 rounded-2xl border-2 border-dashed border-slate-200">
                <Clipboard className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="font-medium text-slate-600">{tabs.find(t => t.id === activeTab)?.name} examination form</p>
                <p className="text-sm mt-1">Select findings and record notes here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
