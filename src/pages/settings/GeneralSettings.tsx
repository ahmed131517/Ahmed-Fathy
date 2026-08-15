import { useState } from "react";
import { useSettings, ClinicBranch } from "../../lib/SettingsContext";
import { Check, Plus, Trash2, Edit2, ChevronDown, ChevronUp, Layout, Pill, Building2, MapPin, Phone, CheckCircle2, Star, ShieldCheck, Stamp, QrCode, FileCheck2, Award, Printer, Sliders, FileText, Download, Upload, FolderHeart, Activity, Ruler, Thermometer, Clock, Settings, Mail, Globe, Laptop } from "lucide-react";
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
    practiceNameAr: globalPracticeNameAr = "",
    practiceAddressAr: globalPracticeAddressAr = "",
    practiceMotto: globalPracticeMotto = "",
    practiceMottoAr: globalPracticeMottoAr = "",
    headerLayoutPreset: globalHeaderLayoutPreset = "en-left-ar-right",
    facilityStamp: globalFacilityStamp = "",
    facilityLicenseNo: globalFacilityLicenseNo = "",
    healthAuthorityId: globalHealthAuthorityId = "",
    taxRegistrationId: globalTaxRegistrationId = "",
    enableVerificationQRCode: globalEnableVerificationQRCode = true,
    verificationPortalUrl: globalVerificationPortalUrl = "",
    practiceLogo: globalPracticeLogo,
    practiceLogoShape: globalPracticeLogoShape,
    practiceLogoSize: globalPracticeLogoSize,
    practiceLogoPosition: globalPracticeLogoPosition,
    patientIdPrefix: globalPatientIdPrefix,
    branches: globalBranches = [],
    activeBranchId: globalActiveBranchId = "",
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
    paperSize: globalPaperSize = 'a4',
    topMargin: globalTopMargin = 15,
    bottomMargin: globalBottomMargin = 15,
    watermarkOpacity: globalWatermarkOpacity = 30,
    tempUnit: globalTempUnit = 'C',
    weightUnit: globalWeightUnit = 'kg',
    heightUnit: globalHeightUnit = 'cm',
    bgUnit: globalBgUnit = 'mg/dL',
    defaultApptDuration: globalDefaultApptDuration = 15,
    customPrescriptionTemplates: globalCustomTemplates,
    updateSettings 
  } = useSettings();
  
  const [practiceName, setPracticeName] = useState(globalPracticeName);
  const [practiceAddress, setPracticeAddress] = useState(globalPracticeAddress);
  const [practiceCity, setPracticeCity] = useState(globalPracticeCity);
  const [practiceState, setPracticeState] = useState(globalPracticeState);
  const [practiceZip, setPracticeZip] = useState(globalPracticeZip);
  const [practicePhone, setPracticePhone] = useState(globalPracticePhone);
  const [practiceNameAr, setPracticeNameAr] = useState(globalPracticeNameAr);
  const [practiceAddressAr, setPracticeAddressAr] = useState(globalPracticeAddressAr);
  const [practiceMotto, setPracticeMotto] = useState(globalPracticeMotto);
  const [practiceMottoAr, setPracticeMottoAr] = useState(globalPracticeMottoAr);
  const [headerLayoutPreset, setHeaderLayoutPreset] = useState<'en-left-ar-right' | 'ar-left-en-right' | 'stacked-en-top' | 'stacked-ar-top' | 'center-logo-split'>(globalHeaderLayoutPreset || 'en-left-ar-right');
  const [facilityStamp, setFacilityStamp] = useState(globalFacilityStamp);
  const [facilityLicenseNo, setFacilityLicenseNo] = useState(globalFacilityLicenseNo);
  const [healthAuthorityId, setHealthAuthorityId] = useState(globalHealthAuthorityId);
  const [taxRegistrationId, setTaxRegistrationId] = useState(globalTaxRegistrationId);
  const [enableVerificationQRCode, setEnableVerificationQRCode] = useState(globalEnableVerificationQRCode);
  const [verificationPortalUrl, setVerificationPortalUrl] = useState(globalVerificationPortalUrl);
  const [practiceLogo, setPracticeLogo] = useState(globalPracticeLogo);
  const [practiceLogoShape, setPracticeLogoShape] = useState(globalPracticeLogoShape);
  const [practiceLogoSize, setPracticeLogoSize] = useState(globalPracticeLogoSize || 96);
  const [practiceLogoPosition, setPracticeLogoPosition] = useState<'left' | 'center' | 'right'>(globalPracticeLogoPosition || 'center');
  const [patientIdPrefix, setPatientIdPrefix] = useState(globalPatientIdPrefix);
  
  // Multi-Branch State
  const [branches, setBranches] = useState<ClinicBranch[]>(globalBranches);
  const [activeBranchId, setActiveBranchId] = useState<string>(globalActiveBranchId || (globalBranches[0]?.id || ""));
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchForm, setBranchForm] = useState<Omit<ClinicBranch, 'id'>>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    website: "",
    type: "Physical Clinic",
    isDefault: false
  });

  const handleSelectActiveBranch = (branch: ClinicBranch) => {
    setActiveBranchId(branch.id);
    setPracticeName(branch.name);
    setPracticeAddress(branch.address);
    setPracticeCity(branch.city);
    setPracticeState(branch.state);
    setPracticeZip(branch.zip);
    setPracticePhone(branch.phone);
    toast.success(`Active clinic branch switched to "${branch.name}". Prescription headers updated!`);
  };

  const handleSaveBranch = () => {
    if (!branchForm.name.trim()) {
      toast.error("Branch name is required.");
      return;
    }

    if (editingBranchId) {
      const updated = branches.map(b => b.id === editingBranchId ? { ...branchForm, id: editingBranchId } : b);
      setBranches(updated);
      setEditingBranchId(null);
      toast.success("Branch location updated.");
    } else {
      const newBranch: ClinicBranch = {
        ...branchForm,
        id: `branch-${Date.now()}`
      };
      const updated = [...branches, newBranch];
      setBranches(updated);
      setIsAddingBranch(false);
      toast.success("New clinic branch added.");
    }

    setBranchForm({
      name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
      email: "",
      website: "",
      type: "Physical Clinic",
      isDefault: false
    });
  };

  const handleDeleteBranch = (id: string) => {
    if (branches.length <= 1) {
      toast.error("You must maintain at least one active clinic location.");
      return;
    }
    const updated = branches.filter(b => b.id !== id);
    setBranches(updated);
    if (activeBranchId === id) {
      const nextBranch = updated[0];
      if (nextBranch) {
        handleSelectActiveBranch(nextBranch);
      }
    }
    toast.success("Clinic branch removed.");
  };
  
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
  const [paperSize, setPaperSize] = useState<'a4' | 'a5' | 'letter' | 'thermal80mm'>(globalPaperSize || 'a4');
  const [topMargin, setTopMargin] = useState<number>(globalTopMargin ?? 15);
  const [bottomMargin, setBottomMargin] = useState<number>(globalBottomMargin ?? 15);
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(globalWatermarkOpacity ?? 30);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>(globalTempUnit || 'C');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(globalWeightUnit || 'kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>(globalHeightUnit || 'cm');
  const [bgUnit, setBgUnit] = useState<'mg/dL' | 'mmol/L'>(globalBgUnit || 'mg/dL');
  const [defaultApptDuration, setDefaultApptDuration] = useState<number>(globalDefaultApptDuration ?? 15);
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

  const handleExportTemplates = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customTemplates, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "rx_templates_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("Templates exported to JSON");
  };

  const handleImportTemplates = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (typeof imported === 'object' && imported !== null) {
            setCustomTemplates(prev => ({ ...prev, ...imported }));
            toast.success("Templates imported successfully");
            setIsSaved(false);
          } else {
            throw new Error("Invalid format");
          }
        } catch (err) {
          toast.error("Failed to parse templates JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const installPresetLibrary = (libraryName: string) => {
    let presets: Record<string, Record<string, any[]>> = {};
    if (libraryName === 'Pediatrics') {
      presets = {
        "Fever (Pediatric)": {
          "Standard": [
            { medication: "Paracetamol Suspension", form: "120mg/5ml", dosage: "5 ml", frequency: "Every 6 hours" }
          ]
        },
        "Otitis Media": {
          "Standard": [
            { medication: "Amoxicillin", form: "250mg/5ml", dosage: "5 ml", frequency: "TDS for 7 days" }
          ]
        }
      };
    } else if (libraryName === 'Cardiology') {
      presets = {
        "Hypertension (Initial)": {
          "Standard": [
            { medication: "Amlodipine", form: "5mg Tablet", dosage: "1 tab", frequency: "OD" }
          ]
        },
        "Heart Failure (Mild)": {
          "Standard": [
            { medication: "Bisoprolol", form: "2.5mg Tablet", dosage: "1 tab", frequency: "OD" },
            { medication: "Furosemide", form: "40mg Tablet", dosage: "1 tab", frequency: "OD (Morning)" }
          ]
        }
      };
    } else if (libraryName === 'Dermatology') {
      presets = {
        "Acne Vulgaris": {
          "Standard": [
            { medication: "Adapalene", form: "0.1% Gel", dosage: "Apply thin layer", frequency: "At night" }
          ]
        }
      };
    } else if (libraryName === 'General Practice') {
      presets = {
        "Upper Respiratory Tract Infection": {
          "Standard": [
            { medication: "Paracetamol", form: "500mg Tablet", dosage: "1 tab", frequency: "TDS PRN" },
            { medication: "Loratadine", form: "10mg Tablet", dosage: "1 tab", frequency: "OD" }
          ]
        },
        "Uncomplicated UTI": {
          "Standard": [
            { medication: "Nitrofurantoin", form: "100mg Capsule", dosage: "1 cap", frequency: "BD for 5 days" }
          ]
        }
      };
    }

    setCustomTemplates(prev => ({ ...prev, ...presets }));
    toast.success(`${libraryName} templates installed`);
    setIsSaved(false);
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
      practiceNameAr,
      practiceAddressAr,
      practiceMotto,
      practiceMottoAr,
      headerLayoutPreset,
      practiceLogo,
      practiceLogoShape,
      practiceLogoSize,
      practiceLogoPosition,
      patientIdPrefix,
      branches,
      activeBranchId,
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
      facilityStamp,
      facilityLicenseNo,
      healthAuthorityId,
      taxRegistrationId,
      enableVerificationQRCode,
      verificationPortalUrl,
      paperSize,
      topMargin,
      bottomMargin,
      watermarkOpacity,
      tempUnit,
      weightUnit,
      heightUnit,
      bgUnit,
      defaultApptDuration,
      customPrescriptionTemplates: customTemplates,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleFacilityStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFacilityStamp(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      {/* Enterprise Multi-Branch & Location Management */}
      <div className="card-panel border-l-4 border-l-indigo-600 dark:border-l-indigo-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Workspaces & Clinics</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Enterprise Suite
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure multiple clinic branches and workspaces. Selecting an active workspace automatically updates prescription header details and contact info.
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => {
              setEditingBranchId(null);
              setBranchForm({ name: "", address: "", city: "", state: "", zip: "", phone: "", email: "", website: "", type: "Physical Clinic", isDefault: false });
              setIsAddingBranch(!isAddingBranch);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {isAddingBranch ? "Cancel" : "Add Branch"}
          </button>
        </div>

        {/* Add/Edit Branch Form */}
        {(isAddingBranch || editingBranchId) && (
          <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {editingBranchId ? "Edit Clinic Branch" : "Register New Branch Location"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Branch / Clinic Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Downtown Clinic or Telehealth Branch"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                <input
                  type="text"
                  placeholder="(555) 000-0000"
                  value={branchForm.phone}
                  onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Street Address</label>
                <input
                  type="text"
                  placeholder="Street address or Suite #"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">City</label>
                <input
                  type="text"
                  value={branchForm.city}
                  onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">State</label>
                  <input
                    type="text"
                    value={branchForm.state}
                    onChange={(e) => setBranchForm({ ...branchForm, state: e.target.value })}
                    className="w-full p-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Zip Code</label>
                  <input
                    type="text"
                    value={branchForm.zip}
                    onChange={(e) => setBranchForm({ ...branchForm, zip: e.target.value })}
                    className="w-full p-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  placeholder="contact@clinic.com"
                  value={branchForm.email}
                  onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Website</label>
                <input
                  type="text"
                  placeholder="www.clinic.com"
                  value={branchForm.website}
                  onChange={(e) => setBranchForm({ ...branchForm, website: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Workspace Type</label>
                <select
                  value={branchForm.type}
                  onChange={(e) => setBranchForm({ ...branchForm, type: e.target.value as any })}
                  className="w-full p-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 mt-1 bg-white dark:bg-slate-800"
                >
                  <option value="Physical Clinic">Physical Clinic</option>
                  <option value="Telehealth">Telehealth / Virtual</option>
                  <option value="Administration">Administration</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingBranch(false);
                  setEditingBranchId(null);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBranch}
                className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                {editingBranchId ? "Update Location" : "Save Location"}
              </button>
            </div>
          </div>
        )}

        {/* Branch Locations List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {branches.map((b) => {
            const isActive = activeBranchId === b.id;
            return (
              <div
                key={b.id}
                className={cn(
                  "p-3.5 rounded-xl border transition-all flex flex-col justify-between relative",
                  isActive
                    ? "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-500 shadow-sm ring-1 ring-indigo-500/50"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      {b.type === 'Telehealth' ? (
                        <Laptop className={cn("w-4 h-4", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
                      ) : (
                        <Building2 className={cn("w-4 h-4", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
                      )}
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {b.name}
                      </h3>
                      {b.type && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold uppercase tracking-wider ml-1">
                          {b.type}
                        </span>
                      )}
                    </div>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Active Prescribing
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectActiveBranch(b)}
                        className="text-[10px] font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline cursor-pointer shrink-0"
                      >
                        Set Active
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                      <span className="line-clamp-2">
                        {b.address || "No address provided"}, {b.city} {b.state} {b.zip}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{b.phone || "No phone provided"}</span>
                    </div>
                    {b.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{b.email}</span>
                      </div>
                    )}
                    {b.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{b.website}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-medium text-slate-400">
                    {b.isDefault ? "Primary Facility" : "Secondary Branch"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBranchId(b.id);
                        setBranchForm({
                          name: b.name,
                          address: b.address,
                          city: b.city,
                          state: b.state,
                          zip: b.zip,
                          phone: b.phone,
                          email: b.email || "",
                          website: b.website || "",
                          type: b.type || "Physical Clinic",
                          isDefault: b.isDefault
                        });
                        setIsAddingBranch(false);
                      }}
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded transition-colors"
                      title="Edit Branch"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {branches.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteBranch(b.id)}
                        className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded transition-colors"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-panel">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Branch Practice Profile & Bilingual Info</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure dual-language details for printed prescription headers and official practice documents.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Practice Name (English)</label>
            <input type="text" value={practiceName} onChange={(e) => setPracticeName(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">اسم المركز / العيادة (بالعربية)</label>
            <input type="text" dir="rtl" value={practiceNameAr} onChange={(e) => setPracticeNameAr(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="مثال: عيادة المجمع الطبي التخصصي" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address (English)</label>
            <input type="text" value={practiceAddress} onChange={(e) => setPracticeAddress(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">عنوان المركز (بالعربية)</label>
            <input type="text" dir="rtl" value={practiceAddressAr} onChange={(e) => setPracticeAddressAr(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="مثال: ١٢٣ شارع المركز الطبي، المجمع الرئيسي" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Clinic Motto / Slogan (English)</label>
            <input type="text" value={practiceMotto} onChange={(e) => setPracticeMotto(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="e.g. Excellence in Compassionate Care" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">شعار العيادة / المقولة (بالعربية)</label>
            <input type="text" dir="rtl" value={practiceMottoAr} onChange={(e) => setPracticeMottoAr(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="مثال: التميز والريادة في الرعاية الصحية" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
            <input type="text" value={practiceCity} onChange={(e) => setPracticeCity(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">State / Province</label>
            <input type="text" value={practiceState} onChange={(e) => setPracticeState(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ZIP / Postal Code</label>
            <input type="text" value={practiceZip} onChange={(e) => setPracticeZip(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
            <input type="text" value={practicePhone} onChange={(e) => setPracticePhone(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Patient ID Prefix</label>
            <input type="text" value={patientIdPrefix} onChange={(e) => setPatientIdPrefix(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="e.g. PAT" />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-4 pt-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Practice Logo</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 bg-slate-50/50 dark:bg-slate-900/30 p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
              <div 
                className={cn(
                  "flex items-center justify-center overflow-hidden transition-all duration-200 select-none shrink-0",
                  practiceLogoShape === 'circle' && "rounded-full border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900",
                  practiceLogoShape === 'rounded' && "rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900",
                  practiceLogoShape === 'square' && "rounded-none border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900",
                  practiceLogoShape === 'none' && (practiceLogo ? "border-0 bg-transparent" : "rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900")
                )}
                style={{
                  width: `${practiceLogoSize}px`,
                  height: `${practiceLogoSize}px`,
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              >
                {practiceLogo ? (
                  <img src={practiceLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-400 font-medium font-sans">No Logo</span>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                    className="text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/20 dark:file:text-indigo-300 transition-colors cursor-pointer" 
                  />
                  {practiceLogo && (
                    <button 
                      type="button"
                      onClick={() => setPracticeLogo('')}
                      className="text-xs text-red-650 hover:text-red-700 dark:text-red-450 dark:hover:text-red-400 font-bold hover:underline transition-colors"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500">Recommended: Square image, at least 200x200px.</p>
                
                {/* Shape Selector Option */}
                <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Logo Container Shape</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: 'circle', label: 'Circle' },
                      { value: 'rounded', label: 'Rounded Square' },
                      { value: 'square', label: 'Sharp Square' },
                      { value: 'none', label: 'No Shape / Borderless' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPracticeLogoShape(option.value as any)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-semibold transition-all border cursor-pointer",
                          practiceLogoShape === option.value
                            ? "bg-indigo-650 border-indigo-650 text-white shadow-sm dark:bg-indigo-600 dark:border-indigo-600"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Position / Alignment Control */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Logo Alignment</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: 'left', label: 'Left Aligned' },
                      { value: 'center', label: 'Center (Standard)' },
                      { value: 'right', label: 'Right Aligned' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPracticeLogoPosition(option.value as any)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-semibold transition-all border cursor-pointer",
                          practiceLogoPosition === option.value
                            ? "bg-indigo-650 border-indigo-650 text-white shadow-sm dark:bg-indigo-600 dark:border-indigo-600"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Size Control */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Logo Size</span>
                    <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 font-mono">{practiceLogoSize}px</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="40"
                      max="200"
                      step="4"
                      value={practiceLogoSize}
                      onChange={(e) => setPracticeLogoSize(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
                    />
                    <div className="flex gap-1 shrink-0">
                      {[
                        { label: 'S (64)', value: 64 },
                        { label: 'M (96)', value: 96 },
                        { label: 'L (128)', value: 128 },
                        { label: 'XL (160)', value: 160 }
                      ].map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setPracticeLogoSize(preset.value)}
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-bold transition-all border cursor-pointer",
                            practiceLogoSize === preset.value
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50"
                          )}
                        >
                          {preset.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RTL / LTR Header Layout Presets */}
      <div className="card-panel">
        <div className="flex items-center gap-2 mb-2">
          <Layout className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Prescription Header Layout Presets (RTL / LTR)</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Choose how English and Arabic physician and clinic credentials align on printed prescriptions and generated PDFs.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              id: 'en-left-ar-right',
              title: 'Standard Bilingual (LTR / RTL)',
              desc: 'English doctor info on left, Logo in center, Arabic doctor info on right.',
              badge: 'Default Balanced'
            },
            {
              id: 'ar-left-en-right',
              title: 'Inverted Alignment',
              desc: 'Arabic doctor info on left, Logo in center, English doctor info on right.',
              badge: 'Arabic Primary'
            },
            {
              id: 'stacked-en-top',
              title: 'Stacked Header (English First)',
              desc: 'Full English credential header at top with logo, Arabic header immediately below.',
              badge: 'Vertical Stack'
            },
            {
              id: 'stacked-ar-top',
              title: 'Stacked Header (Arabic First)',
              desc: 'Full Arabic credential header at top with logo, English header immediately below.',
              badge: 'Vertical Stack'
            },
            {
              id: 'center-logo-split',
              title: 'Center Logo & Split Columns',
              desc: 'Prominent center logo on top, with side-by-side English and Arabic columns below.',
              badge: 'Symmetrical'
            }
          ].map((preset) => {
            const isSelected = headerLayoutPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setHeaderLayoutPreset(preset.id as any)}
                className={cn(
                  "p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer",
                  isSelected
                    ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 shadow-sm ring-2 ring-indigo-600/30"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {preset.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    {preset.desc}
                  </p>
                </div>
                {isSelected && (
                  <div className="mt-3 pt-2 border-t border-indigo-200 dark:border-indigo-900/60 flex items-center justify-end text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Selected Preset
                  </div>
                )}
              </button>
            );
          })}
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
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/20 dark:file:text-indigo-300" 
                />
                <p className="text-xs text-slate-500 mt-1">Upload an image of your signature (transparent PNG recommended).</p>
              </div>
              {doctorSignature && (
                <div className="relative group shrink-0">
                  <img src={doctorSignature} alt="Signature Preview" className="w-32 h-16 object-contain border rounded-lg shadow-sm bg-white p-1" />
                  <button 
                    type="button"
                    onClick={() => setDoctorSignature('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Stamp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <label className="text-sm font-bold text-slate-900 dark:text-white">Facility / Clinic Official Digital Stamp</label>
            </div>
            <div className="flex items-start gap-4 bg-slate-50/60 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/png,image/*" 
                  onChange={handleFacilityStampUpload} 
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/20 dark:file:text-indigo-300" 
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload official clinic seal / circular stamp. Rendered alongside physician signature on prescriptions (PNG with transparent background recommended).
                </p>
              </div>
              {facilityStamp && (
                <div className="relative group shrink-0">
                  <div className="p-1 border border-dashed border-indigo-400 rounded-lg bg-white">
                    <img src={facilityStamp} alt="Facility Stamp Preview" className="w-16 h-16 object-contain" />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFacilityStamp('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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

      {/* Official Licenses & Security Compliance Panel */}
      <div className="card-panel">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">License, Regulatory & Security Compliance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure health authority license IDs and e-prescription verification settings.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-400" /> Facility License Number
            </label>
            <input 
              type="text" 
              value={facilityLicenseNo} 
              onChange={(e) => setFacilityLicenseNo(e.target.value)} 
              className="w-full p-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 font-mono" 
              placeholder="e.g. FAC-984210-CA" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-slate-400" /> National Health Authority ID
            </label>
            <input 
              type="text" 
              value={healthAuthorityId} 
              onChange={(e) => setHealthAuthorityId(e.target.value)} 
              className="w-full p-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 font-mono" 
              placeholder="e.g. NHA-883201-MED" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Tax Registration ID
            </label>
            <input 
              type="text" 
              value={taxRegistrationId} 
              onChange={(e) => setTaxRegistrationId(e.target.value)} 
              className="w-full p-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 font-mono" 
              placeholder="e.g. TAX-300192847" 
            />
          </div>
        </div>

        {/* Verification QR Code Settings */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Digital Verification QR Code</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Embed a scannable QR verification code in prescription headers and footers for instant authentication.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={enableVerificationQRCode} 
                onChange={(e) => setEnableVerificationQRCode(e.target.checked)} 
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:peer-checked:after:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {enableVerificationQRCode && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Custom Verification Portal Endpoint / URL</label>
              <input 
                type="text" 
                value={verificationPortalUrl} 
                onChange={(e) => setVerificationPortalUrl(e.target.value)} 
                className="w-full p-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 font-mono" 
                placeholder="https://rx-verify.healthportal.org/verify" 
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                When specified, QR codes link directly to <code className="text-indigo-600 dark:text-indigo-400 font-mono">{verificationPortalUrl}?rxId=...</code>. Leave blank to generate full encrypted text summaries inside the QR code.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Paper Size, Margins & Watermark Opacity Panel */}
      <div className="card-panel">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Print Paper Formatting & Watermark Opacity</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure prescription paper dimensions, top/bottom print margins, and background watermark transparency.</p>
          </div>
        </div>

        {/* Paper Size Presets */}
        <div className="mb-6">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2.5 block">Paper Size Presets</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { id: 'a4', title: 'A4 Standard', size: '210 × 297 mm', badge: 'ISO Standard' },
              { id: 'a5', title: 'A5 Rx Pad', size: '148 × 210 mm', badge: 'Standard Rx Pad' },
              { id: 'letter', title: 'US Letter', size: '8.5 × 11 inches', badge: 'North America' },
              { id: 'thermal80mm', title: '80mm Thermal Roll', size: '80mm Continuous', badge: 'Point-of-Care' }
            ].map((preset) => {
              const isSelected = paperSize === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setPaperSize(preset.id as any)}
                  className={cn(
                    "p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer",
                    isSelected
                      ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 shadow-sm ring-2 ring-indigo-600/30"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{preset.title}</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{preset.badge}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{preset.size}</p>
                  </div>
                  {isSelected && (
                    <div className="mt-2.5 pt-1.5 border-t border-indigo-200 dark:border-indigo-900/60 flex items-center text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active Size
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Page Margins & Watermark Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Top Margin (mm)
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded">{topMargin} mm</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="80" 
              value={topMargin} 
              onChange={(e) => setTopMargin(parseInt(e.target.value) || 0)}
              className="w-full accent-indigo-600 cursor-pointer" 
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Increase to avoid printing over pre-printed letterhead headers.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Bottom Margin (mm)
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded">{bottomMargin} mm</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="80" 
              value={bottomMargin} 
              onChange={(e) => setBottomMargin(parseInt(e.target.value) || 0)}
              className="w-full accent-indigo-600 cursor-pointer" 
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Increase to avoid printing over pre-printed stationary footers.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Watermark / BG Opacity
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded">{watermarkOpacity}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              step="5"
              value={watermarkOpacity} 
              onChange={(e) => setWatermarkOpacity(parseInt(e.target.value) || 10)}
              className="w-full accent-indigo-600 cursor-pointer" 
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Controls background image transparency (10% faint to 100% full).</p>
          </div>
        </div>
      </div>
      
      {/* Clinical Defaults & Unit Preferences */}
      <div className="card-panel">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Clinical Defaults & Unit Preferences</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure default measurement units and scheduling durations across the clinic.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Thermometer className="w-3.5 h-3.5 text-slate-400" /> Temperature Unit
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setTempUnit('C')}
                className={cn("flex-1 text-xs py-1.5 rounded-md font-semibold transition-colors", tempUnit === 'C' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500")}
              >
                °C (Celsius)
              </button>
              <button
                type="button"
                onClick={() => setTempUnit('F')}
                className={cn("flex-1 text-xs py-1.5 rounded-md font-semibold transition-colors", tempUnit === 'F' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500")}
              >
                °F (Fahrenheit)
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" /> Weight Unit
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setWeightUnit('kg')}
                className={cn("flex-1 text-xs py-1.5 rounded-md font-semibold transition-colors", weightUnit === 'kg' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500")}
              >
                kg (Kilograms)
              </button>
              <button
                type="button"
                onClick={() => setWeightUnit('lbs')}
                className={cn("flex-1 text-xs py-1.5 rounded-md font-semibold transition-colors", weightUnit === 'lbs' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500")}
              >
                lbs (Pounds)
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Ruler className="w-3.5 h-3.5 text-slate-400" /> Height Unit
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setHeightUnit('cm')}
                className={cn("flex-1 text-xs py-1.5 rounded-md font-semibold transition-colors", heightUnit === 'cm' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500")}
              >
                cm
              </button>
              <button
                type="button"
                onClick={() => setHeightUnit('in')}
                className={cn("flex-1 text-xs py-1.5 rounded-md font-semibold transition-colors", heightUnit === 'in' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500")}
              >
                inches
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" /> Blood Glucose
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setBgUnit('mg/dL')}
                className={cn("flex-1 text-xs py-1.5 rounded-md font-semibold transition-colors", bgUnit === 'mg/dL' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500")}
              >
                mg/dL
              </button>
              <button
                type="button"
                onClick={() => setBgUnit('mmol/L')}
                className={cn("flex-1 text-xs py-1.5 rounded-md font-semibold transition-colors", bgUnit === 'mmol/L' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500")}
              >
                mmol/L
              </button>
            </div>
          </div>
        </div>

        {/* Scheduling Defaults */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Default Appointment Duration</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {[10, 15, 20, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDefaultApptDuration(mins)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold border transition-colors",
                  defaultApptDuration === mins
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-400 dark:text-indigo-300"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
                )}
              >
                {mins} Minutes
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Used as the default time block length for newly scheduled consultations and auto-scheduling slots.
          </p>
        </div>
      </div>
      
      <div className="card-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Prescription Templates</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage your custom medication presets and import/export libraries.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" /> Import
              <input type="file" accept=".json" className="hidden" onChange={handleImportTemplates} />
            </label>
            <button 
              onClick={handleExportTemplates}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            {!isAddingTemplate && (
              <button 
                onClick={() => setIsAddingTemplate(true)}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Template
              </button>
            )}
          </div>
        </div>

        {/* Preset Libraries */}
        <div className="mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <FolderHeart className="w-4 h-4 text-pink-500" /> Install Specialty Template Libraries
          </h3>
          <div className="flex flex-wrap gap-2">
            {['General Practice', 'Pediatrics', 'Cardiology', 'Dermatology'].map((lib) => (
              <button
                key={lib}
                onClick={() => installPresetLibrary(lib)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-1.5"
              >
                <Download className="w-3 h-3 opacity-60" /> {lib}
              </button>
            ))}
          </div>
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
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Preferences</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure global application behaviors and display modes.</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Compact Mode</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Reduce spacing in tables and lists to show more content.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={compactMode} 
                onChange={(e) => updateSettings({ compactMode: e.target.checked })} 
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:peer-checked:after:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Show Patient IDs</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Display patient IDs next to their names in lists.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={showPatientIds} 
                onChange={(e) => updateSettings({ showPatientIds: e.target.checked })} 
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:peer-checked:after:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
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
