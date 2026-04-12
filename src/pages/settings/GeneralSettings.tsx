import { useState } from "react";
import { useSettings } from "../../lib/SettingsContext";
import { Check, Plus, Trash2, Edit2, ChevronDown, ChevronUp, Layout, Pill } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    customPrescriptionTemplates: globalCustomTemplates,
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
  const [customTemplates, setCustomTemplates] = useState(globalCustomTemplates);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [editingVariation, setEditingVariation] = useState<{template: string, variation: string} | null>(null);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);

  const handleAddTemplate = () => {
    if (newTemplateName && !customTemplates[newTemplateName]) {
      const newTemplates = { ...customTemplates };
      newTemplates[newTemplateName] = {
        "Variation 1": [],
        "Variation 2": [],
        "Variation 3": [],
        "Variation 4": [],
        "Variation 5": []
      };
      setCustomTemplates(newTemplates);
      setExpandedTemplate(newTemplateName);
      setNewTemplateName("");
      setIsAddingTemplate(false);
      toast.success("Template category created.");
    } else if (newTemplateName) {
      toast.error("Template name already exists.");
    }
  };

  const removeTemplate = (name: string) => {
    const newTemplates = { ...customTemplates };
    delete newTemplates[name];
    setCustomTemplates(newTemplates);
    if (expandedTemplate === name) setExpandedTemplate(null);
    setTemplateToDelete(null);
    toast.success("Template deleted.");
  };

  const addMedicationToVariation = (templateName: string, variationName: string) => {
    const newTemplates = { ...customTemplates };
    newTemplates[templateName][variationName] = [
      ...newTemplates[templateName][variationName],
      {
        medication: "",
        form: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: ""
      }
    ];
    setCustomTemplates(newTemplates);
  };

  const updateMedicationInVariation = (templateName: string, variationName: string, index: number, field: string, value: string) => {
    const newTemplates = { ...customTemplates };
    const updatedVariation = [...newTemplates[templateName][variationName]];
    updatedVariation[index] = {
      ...updatedVariation[index],
      [field]: value
    };
    newTemplates[templateName][variationName] = updatedVariation;
    setCustomTemplates(newTemplates);
  };

  const removeMedicationFromVariation = (templateName: string, variationName: string, index: number) => {
    const newTemplates = { ...customTemplates };
    const updatedVariation = [...newTemplates[templateName][variationName]];
    updatedVariation.splice(index, 1);
    newTemplates[templateName][variationName] = updatedVariation;
    setCustomTemplates(newTemplates);
  };

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
      customPrescriptionTemplates: customTemplates,
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
                  <option value="calligraphy">Lucida Calligraphy</option>
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
                  <option value="calligraphy">Lucida Calligraphy</option>
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
                  <option value="calligraphy">Lucida Calligraphy</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-panel">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Prescription Templates</h2>
          {!isAddingTemplate && (
            <button 
              onClick={() => setIsAddingTemplate(true)}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Template
            </button>
          )}
        </div>

        {isAddingTemplate && (
          <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl flex items-center gap-3">
            <input 
              type="text" 
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="e.g. Hypertension"
              className="flex-1 p-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddTemplate()}
            />
            <button 
              onClick={handleAddTemplate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
            >
              Create
            </button>
            <button 
              onClick={() => {
                setIsAddingTemplate(false);
                setNewTemplateName("");
              }}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        )}

        {Object.keys(customTemplates).length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <Layout className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No custom templates created yet.</p>
            <button onClick={() => setIsAddingTemplate(true)} className="text-xs text-indigo-600 font-bold mt-2 hover:underline">Create your first template</button>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(customTemplates).map(([templateName, variations]) => (
              <div key={templateName} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div 
                  className="p-4 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedTemplate(expandedTemplate === templateName ? null : templateName)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <Layout className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{templateName}</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">5 Variations Available</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setTemplateToDelete(templateName);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedTemplate === templateName ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {expandedTemplate === templateName && (
                  <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {Object.keys(variations).map((varName) => (
                        <button
                          key={varName}
                          onClick={() => setEditingVariation({ template: templateName, variation: varName })}
                          className={cn(
                            "px-3 py-2 rounded-lg text-xs font-bold transition-all border",
                            editingVariation?.template === templateName && editingVariation?.variation === varName
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                          )}
                        >
                          {varName}
                          <span className="block text-[9px] opacity-70 font-normal">{variations[varName].length} Meds</span>
                        </button>
                      ))}
                    </div>

                    {editingVariation?.template === templateName && (
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            <Edit2 className="w-3 h-3 text-indigo-600" />
                            Editing {editingVariation.variation}
                          </h4>
                          <button 
                            onClick={() => addMedicationToVariation(templateName, editingVariation.variation)}
                            className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Medication
                          </button>
                        </div>

                        {variations[editingVariation.variation].length === 0 ? (
                          <div className="text-center py-6">
                            <Pill className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                            <p className="text-[10px] text-slate-500">No medications in this variation.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {variations[editingVariation.variation].map((med, idx) => (
                              <div key={idx} className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 relative group">
                                <button 
                                  onClick={() => removeMedicationFromVariation(templateName, editingVariation.variation, idx)}
                                  className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Medication Name</label>
                                    <input 
                                      type="text" 
                                      value={med.medication} 
                                      onChange={(e) => updateMedicationInVariation(templateName, editingVariation.variation, idx, 'medication', e.target.value)}
                                      className="w-full p-1.5 text-xs border rounded-md dark:bg-slate-900 dark:border-slate-700" 
                                      placeholder="e.g. Paracetamol"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Form / Strength</label>
                                    <input 
                                      type="text" 
                                      value={med.form} 
                                      onChange={(e) => updateMedicationInVariation(templateName, editingVariation.variation, idx, 'form', e.target.value)}
                                      className="w-full p-1.5 text-xs border rounded-md dark:bg-slate-900 dark:border-slate-700" 
                                      placeholder="e.g. 500mg Tablet"
                                    />
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 md:col-span-2">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase">Dosage</label>
                                      <input 
                                        type="text" 
                                        value={med.dosage} 
                                        onChange={(e) => updateMedicationInVariation(templateName, editingVariation.variation, idx, 'dosage', e.target.value)}
                                        className="w-full p-1.5 text-xs border rounded-md dark:bg-slate-900 dark:border-slate-700" 
                                        placeholder="e.g. 1 tab"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase">Frequency</label>
                                      <input 
                                        type="text" 
                                        value={med.frequency} 
                                        onChange={(e) => updateMedicationInVariation(templateName, editingVariation.variation, idx, 'frequency', e.target.value)}
                                        className="w-full p-1.5 text-xs border rounded-md dark:bg-slate-900 dark:border-slate-700" 
                                        placeholder="e.g. TDS"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase">Duration</label>
                                      <input 
                                        type="text" 
                                        value={med.duration} 
                                        onChange={(e) => updateMedicationInVariation(templateName, editingVariation.variation, idx, 'duration', e.target.value)}
                                        className="w-full p-1.5 text-xs border rounded-md dark:bg-slate-900 dark:border-slate-700" 
                                        placeholder="e.g. 5 days"
                                      />
                                    </div>
                                  </div>
                                  <div className="md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Instructions</label>
                                    <input 
                                      type="text" 
                                      value={med.instructions} 
                                      onChange={(e) => updateMedicationInVariation(templateName, editingVariation.variation, idx, 'instructions', e.target.value)}
                                      className="w-full p-1.5 text-xs border rounded-md dark:bg-slate-900 dark:border-slate-700" 
                                      placeholder="e.g. Take after food"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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

      {templateToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Template?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete the template "{templateToDelete}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => removeTemplate(templateToDelete)}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button 
                onClick={() => setTemplateToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
