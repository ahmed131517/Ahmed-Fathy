import { User, Headphones, Eye, MessageCircle, Shield, Wind, Heart, Target, Droplets, Layers, TrendingUp, Activity, Zap, Smile, Brain, Moon, Thermometer, BookOpen } from "lucide-react";

const categories = [
  { id: 'head', name: 'Head, Face, Neck', icon: User },
  { id: 'ear', name: 'Ear, Hearing', icon: Headphones },
  { id: 'eye', name: 'Eye, Vision', icon: Eye },
  { id: 'throat', name: 'Nose/Throat, Mouth', icon: MessageCircle },
  { id: 'back', name: 'Trunk, Back, Pelvis', icon: Shield },
  { id: 'lungs', name: 'Lungs, Breathing', icon: Wind },
  { id: 'heart', name: 'Heart, Chest, Circulation', icon: Heart },
  { id: 'digestive', name: 'Intestinal, Digestive', icon: Target },
  { id: 'kidney', name: 'Kidney, Urine', icon: Droplets },
  { id: 'skin', name: 'Skin, Hair, Nails', icon: Layers },
];

export function SymptomAnalysis() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Symptom Analysis</h2>
          <p className="text-slate-500">Identify and analyze patient symptoms</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Show Possible Causes
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Save Symptoms
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Select Symptom Category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto pr-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-colors text-center group">
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mb-3 transition-colors">
                  <cat.icon className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Selected Symptoms</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50">
            <p className="text-slate-500 text-sm">No symptoms selected yet. Click on a category to begin.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
