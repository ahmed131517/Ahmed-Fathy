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
    practiceLogo: globalPracticeLogo,
    patientIdPrefix: globalPatientIdPrefix,
    doctorName: globalDoctorName,
    doctorQualifications: globalDoctorQualifications,
    doctorDesignation: globalDoctorDesignation,
    doctorRegNo: globalDoctorRegNo,
    doctorNameAr: globalDoctorNameAr,
    doctorQualificationsAr: globalDoctorQualificationsAr,
    doctorDesignationAr: globalDoctorDesignationAr,
    prescriptionFooter: globalPrescriptionFooter,
    prescriptionFooterAr: globalPrescriptionFooterAr,
    prescriptionBackground: globalPrescriptionBackground,
    prescriptionHeaderFont: globalPrescriptionHeaderFont,
    prescriptionFooterFont: globalPrescriptionFooterFont,
    prescriptionBodyFont: globalPrescriptionBodyFont,
    doctorSignature: globalDoctorSignature,
    updateSettings 
  } = useSettings();
  
  const [practiceName, setPracticeName] = useState(globalPracticeName);
  const [practiceAddress, setPracticeAddress] = useState(globalPracticeAddress);
  const [practiceCity, setPracticeCity] = useState(globalPracticeCity);
  const [practiceState, setPracticeState] = useState(globalPracticeState);
  const [practiceZip, setPracticeZip] = useState(globalPracticeZip);
  const [practicePhone, setPracticePhone] = useState(globalPracticePhone);
  const [practiceLogo, setPracticeLogo] = useState(globalPracticeLogo);
  const [patientIdPrefix, setPatientIdPrefix] = useState(globalPatientIdPrefix);
  
  const [doctorName, setDoctorName] = useState(globalDoctorName);
  const [doctorQualifications, setDoctorQualifications] = useState(globalDoctorQualifications);
  const [doctorDesignation, setDoctorDesignation] = useState(globalDoctorDesignation);
  const [doctorRegNo, setDoctorRegNo] = useState(globalDoctorRegNo);
  const [doctorNameAr, setDoctorNameAr] = useState(globalDoctorNameAr);
  const [doctorQualificationsAr, setDoctorQualificationsAr] = useState(globalDoctorQualificationsAr);
  const [doctorDesignationAr, setDoctorDesignationAr] = useState(globalDoctorDesignationAr);
  const [prescriptionFooter, setPrescriptionFooter] = useState(globalPrescriptionFooter);
  const [prescriptionFooterAr, setPrescriptionFooterAr] = useState(globalPrescriptionFooterAr);
  const [prescriptionBackground, setPrescriptionBackground] = useState(globalPrescriptionBackground);
  const [prescriptionHeaderFont, setPrescriptionHeaderFont] = useState(globalPrescriptionHeaderFont);
  const [prescriptionFooterFont, setPrescriptionFooterFont] = useState(globalPrescriptionFooterFont);
  const [prescriptionBodyFont, setPrescriptionBodyFont] = useState(globalPrescriptionBodyFont);
  const [doctorSignature, setDoctorSignature] = useState(globalDoctorSignature);

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateSettings({
      practiceName,
      practiceAddress,
      practiceCity,
      practiceState,
      practiceZip,
      practicePhone,
      practiceLogo,
      patientIdPrefix,
      doctorName,
      doctorQualifications,
      doctorDesignation,
      doctorRegNo,
      doctorNameAr,
      doctorQualificationsAr,
      doctorDesignationAr,
      prescriptionFooter,
      prescriptionFooterAr,
      prescriptionBackground,
      prescriptionHeaderFont,
      prescriptionFooterFont,
      prescriptionBodyFont,
      doctorSignature,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPracticeLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionBackground(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoctorSignature(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-panel">
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
          <div className="col-span-1 md:col-span-2 space-y-2 pt-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Practice Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900">
                {practiceLogo ? (
                  <img src={practiceLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-400">No Logo</span>
                )}
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                />
                <p className="text-xs text-slate-500 mt-1">Recommended: Square image, at least 200x200px.</p>
              </div>
              {practiceLogo && (
                <button 
                  onClick={() => setPracticeLogo('')}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card-panel">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Prescription Header & Footer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Doctor Name</label>
            <input type="text" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="e.g. DR. AHMED FATHY ALI" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Qualifications</label>
            <input type="text" value={doctorQualifications} onChange={(e) => setDoctorQualifications(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="e.g. MBBS, CCD, CCC, CMJ" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Designation / Specialty</label>
            <input type="text" value={doctorDesignation} onChange={(e) => setDoctorDesignation(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="e.g. Cardiologist" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Registration Number</label>
            <input type="text" value={doctorRegNo} onChange={(e) => setDoctorRegNo(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
          </div>

          <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Arabic Details (for Prescription Header)</h3>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 text-right block">الاسم (بالعربية)</label>
            <input 
              type="text" 
              value={doctorNameAr} 
              onChange={(e) => setDoctorNameAr(e.target.value)} 
              className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-right" 
              dir="rtl"
              placeholder="د. أحمد فتحي"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 text-right block">المؤهلات (بالعربية)</label>
            <input 
              type="text" 
              value={doctorQualificationsAr} 
              onChange={(e) => setDoctorQualificationsAr(e.target.value)} 
              className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-right" 
              dir="rtl"
              placeholder="بكالوريوس الطب والجراحة"
            />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 text-right block">التخصص / المسمى الوظيفي (بالعربية)</label>
            <input 
              type="text" 
              value={doctorDesignationAr} 
              onChange={(e) => setDoctorDesignationAr(e.target.value)} 
              className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-right" 
              dir="rtl"
              placeholder="أخصائي القلب والأوعية الدموية"
            />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prescription Footer (Clinic Hours/Info)</label>
            <textarea 
              value={prescriptionFooter} 
              onChange={(e) => setPrescriptionFooter(e.target.value)} 
              className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 min-h-[80px]" 
              placeholder="e.g. Days: Mon-Fri | Timings: 05:00 PM - 08:30 PM"
            />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 text-right block">تذييل الروشتة (بالعربية)</label>
            <textarea 
              value={prescriptionFooterAr} 
              onChange={(e) => setPrescriptionFooterAr(e.target.value)} 
              className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 min-h-[80px] text-right" 
              dir="rtl"
              placeholder="مثال: الأيام: السبت إلى الأربعاء | المواعيد: 05:00 مساءً - 08:30 مساءً"
            />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prescription Background Image</label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleBackgroundUpload} 
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                />
                <p className="text-xs text-slate-500 mt-1">Upload a high-resolution image to be used as the prescription background.</p>
              </div>
              {prescriptionBackground && (
                <div className="relative group">
                  <img src={prescriptionBackground} alt="Background Preview" className="w-24 h-32 object-cover border rounded-lg shadow-sm" />
                  <button 
                    onClick={() => setPrescriptionBackground('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2 pt-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Doctor's Signature Image</label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleSignatureUpload} 
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                />
                <p className="text-xs text-slate-500 mt-1">Upload an image of your signature (transparent PNG recommended).</p>
              </div>
              {doctorSignature && (
                <div className="relative group">
                  <img src={doctorSignature} alt="Signature Preview" className="w-32 h-16 object-contain border rounded-lg shadow-sm bg-white" />
                  <button 
                    onClick={() => setDoctorSignature('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Prescription Typography</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Header Font</label>
                <select 
                  value={prescriptionHeaderFont} 
                  onChange={(e) => setPrescriptionHeaderFont(e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="inter">Inter (Sans)</option>
                  <option value="roboto">Roboto</option>
                  <option value="system">System Sans</option>
                  <option value="serif">Serif (Playfair)</option>
                  <option value="mono">Mono (JetBrains)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Body (Drugs) Font</label>
                <select 
                  value={prescriptionBodyFont} 
                  onChange={(e) => setPrescriptionBodyFont(e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="inter">Inter (Sans)</option>
                  <option value="roboto">Roboto</option>
                  <option value="system">System Sans</option>
                  <option value="serif">Serif (Playfair)</option>
                  <option value="mono">Mono (JetBrains)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Footer Font</label>
                <select 
                  value={prescriptionFooterFont} 
                  onChange={(e) => setPrescriptionFooterFont(e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="inter">Inter (Sans)</option>
                  <option value="roboto">Roboto</option>
                  <option value="system">System Sans</option>
                  <option value="serif">Serif (Playfair)</option>
                  <option value="mono">Mono (JetBrains)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-panel">
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
