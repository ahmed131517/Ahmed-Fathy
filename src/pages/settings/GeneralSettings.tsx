import { useState } from "react";
import { useSettings } from "../../lib/SettingsContext";
import { Check } from "lucide-react";

export function GeneralSettings() {
  const { 
    compactMode, 
    showPatientIds, 
    practiceName: globalPracticeName,
    practiceAddress: globalPracticeAddress,
    practiceCity: globalPracticeCity,
    practiceState: globalPracticeState,
    practiceZip: globalPracticeZip,
    practicePhone: globalPracticePhone,
    patientIdPrefix: globalPatientIdPrefix,
    updateSettings 
  } = useSettings();
  
  const [practiceName, setPracticeName] = useState(globalPracticeName);
  const [practiceAddress, setPracticeAddress] = useState(globalPracticeAddress);
  const [practiceCity, setPracticeCity] = useState(globalPracticeCity);
  const [practiceState, setPracticeState] = useState(globalPracticeState);
  const [practiceZip, setPracticeZip] = useState(globalPracticeZip);
  const [practicePhone, setPracticePhone] = useState(globalPracticePhone);
  const [patientIdPrefix, setPatientIdPrefix] = useState(globalPatientIdPrefix);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateSettings({
      practiceName,
      practiceAddress,
      practiceCity,
      practiceState,
      practiceZip,
      practicePhone,
      patientIdPrefix,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Practice Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Practice Name</label>
            <input type="text" value={practiceName} onChange={(e) => setPracticeName(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
            <input type="text" value={practiceAddress} onChange={(e) => setPracticeAddress(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
            <input type="text" value={practiceCity} onChange={(e) => setPracticeCity(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">State</label>
            <input type="text" value={practiceState} onChange={(e) => setPracticeState(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ZIP</label>
            <input type="text" value={practiceZip} onChange={(e) => setPracticeZip(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
            <input type="text" value={practicePhone} onChange={(e) => setPracticePhone(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Patient ID Prefix</label>
            <input type="text" value={patientIdPrefix} onChange={(e) => setPatientIdPrefix(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="e.g. PAT" />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Compact Mode</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Reduce spacing in tables and lists to show more content.</p>
            </div>
            <button 
              onClick={() => updateSettings({ compactMode: !compactMode })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${compactMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${compactMode ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Show Patient IDs</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Display patient IDs next to their names in lists.</p>
            </div>
            <button 
              onClick={() => updateSettings({ showPatientIds: !showPatientIds })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${showPatientIds ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${showPatientIds ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <button 
          onClick={handleSave}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            isSaved 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isSaved && <Check className="w-4 h-4" />}
          {isSaved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
