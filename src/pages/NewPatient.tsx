import { useState, useEffect, useRef } from "react";
import { User, CreditCard, Calendar, Clock, Users, Mail, Phone, MapPin, Shield, FileText, Map, UserCheck, Heart, Activity, Scissors, Plus, X, Camera, Upload, RotateCcw, Check, Eye, QrCode, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import SignatureCanvas from 'react-signature-canvas';
import { QRCodeSVG } from 'qrcode.react';
import { db } from "@/lib/db";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useNotifications } from "@/lib/NotificationContext";

export function NewPatient() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const getInitialData = () => ({
    patientId: `PAT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    firstName: "",
    lastName: "",
    nationalId: "",
    dob: "",
    gender: "",
    bloodType: "",
    email: "",
    phone: "",
    address: "",
    referralSource: "",
    insuranceProvider: "",
    policyNumber: "",
    groupNumber: "",
    insuranceFront: null as string | null,
    insuranceBack: null as string | null,
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    hasAllergies: null,
    allergies: [{ id: 1, name: "", reaction: "" }],
    hasConditions: null,
    conditions: [],
    otherConditions: "",
    hasMedications: null,
    medications: [{ id: 1, name: "", dosage: "", frequency: "" }],
    familyHistory: [{ id: 1, relation: "", condition: "", age: "" }],
    surgeries: "",
    familyHistoryText: "",
    photo: null as string | null,
    signature: null as string | null,
    consentTreatment: false,
    consentPrivacy: false,
    consentFinancial: false,
    communication: {
      email: false,
      sms: false,
      phone: false
    }
  });

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('newPatientDraft');
    const initialData = getInitialData();
    return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
  });

  const [isCapturing, setIsCapturing] = useState<{ active: boolean, target: 'photo' | 'insuranceFront' | 'insuranceBack' | null }>({ active: false, target: null });
  const videoRef = useRef<HTMLVideoElement>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    localStorage.setItem('newPatientDraft', JSON.stringify(formData));
  }, [formData]);

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : "";
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startCamera = async (target: 'photo' | 'insuranceFront' | 'insuranceBack') => {
    setIsCapturing({ active: true, target });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsCapturing({ active: false, target: null });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && isCapturing.target) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const photoData = canvas.toDataURL('image/jpeg');
      updateField(isCapturing.target, photoData);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing({ active: false, target: null });
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.dob) newErrors.dob = "Date of birth is required";
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
      if (!formData.phone) newErrors.phone = "Phone number is required";
    }
    if (currentStep === 2) {
      if (formData.hasAllergies === null) newErrors.hasAllergies = "Please select an option";
      if (formData.hasConditions === null) newErrors.hasConditions = "Please select an option";
      if (formData.hasMedications === null) newErrors.hasMedications = "Please select an option";
    }
    if (currentStep === 3) {
      if (!formData.consentTreatment) newErrors.consentTreatment = "Consent is required";
      if (!formData.consentPrivacy) newErrors.consentPrivacy = "Acknowledgment is required";
      if (!formData.consentFinancial) newErrors.consentFinancial = "Agreement is required";
      if (!formData.signature) newErrors.signature = "Signature is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const clearDraft = () => {
    if (confirm("Are you sure you want to clear this draft?")) {
      localStorage.removeItem('newPatientDraft');
      setFormData(getInitialData());
      setStep(1);
    }
  };

  const handleSignatureEnd = () => {
    if (sigCanvas.current) {
      updateField('signature', sigCanvas.current.toDataURL());
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    updateField('signature', null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">New Patient Registration</h2>
          <p className="text-slate-500">Register a new patient or update an existing one</p>
        </div>
        <button 
          onClick={clearDraft}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Clear Draft
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden card-panel p-0">
        {/* Progress Bar */}
        <div className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 p-6 glass-panel">
          <div className="flex justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>
            {[
              { num: 1, label: "Personal Details" },
              { num: 2, label: "Medical History" },
              { num: 3, label: "Consent & Privacy" },
              { num: 4, label: "Review & Submit" },
            ].map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => setStep(s.num)}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-colors bg-white dark:bg-slate-900",
                  step >= s.num ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 glow-indigo" : "border-slate-300 dark:border-slate-800 text-slate-400",
                  step === s.num && "bg-indigo-600 text-white dark:bg-indigo-500"
                )}>
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className={cn(
                  "mt-2 text-sm font-medium hidden md:block",
                  step >= s.num ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-500",
                  "mono-label"
                )}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Photo Upload Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col items-center justify-center overflow-hidden relative group glow-indigo">
                    {formData.photo ? (
                      <>
                        <img src={formData.photo} alt="Patient" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => updateField('photo', null)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : isCapturing.active && isCapturing.target === 'photo' ? (
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <User className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 dark:text-slate-500 mono-label">No photo captured</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isCapturing.active && isCapturing.target === 'photo' ? (
                      <>
                        <button onClick={capturePhoto} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 glow-indigo">
                          <Check className="w-3.5 h-3.5" /> Capture
                        </button>
                        <button onClick={stopCamera} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startCamera('photo')} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <Camera className="w-3.5 h-3.5" /> Take Photo
                        </button>
                        <label className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5" /> Upload
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => updateField('photo', reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-tight">
                      <User className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Personal Details
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <QrCode className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">{formData.patientId}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mono-label">First Name <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          value={formData.firstName}
                          onChange={(e) => updateField('firstName', e.target.value)}
                          className={cn(
                            "w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100",
                            errors.firstName ? "border-red-300 bg-red-50 dark:bg-red-900/10" : "border-slate-200 dark:border-slate-800"
                          )} 
                        />
                      </div>
                      {errors.firstName && <p className="text-[10px] text-red-500 font-medium">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mono-label">Last Name <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          value={formData.lastName}
                          onChange={(e) => updateField('lastName', e.target.value)}
                          className={cn(
                            "w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100",
                            errors.lastName ? "border-red-300 bg-red-50 dark:bg-red-900/10" : "border-slate-200 dark:border-slate-800"
                          )} 
                        />
                      </div>
                      {errors.lastName && <p className="text-[10px] text-red-500 font-medium">{errors.lastName}</p>}
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">National ID/Passport Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          value={formData.nationalId}
                          onChange={(e) => updateField('nationalId', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Date of Birth <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="date" 
                          value={formData.dob}
                          onChange={(e) => updateField('dob', e.target.value)}
                          className={cn(
                            "w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                            errors.dob ? "border-red-300 bg-red-50" : "border-slate-200"
                          )} 
                        />
                      </div>
                      {errors.dob && <p className="text-[10px] text-red-500 font-medium">{errors.dob}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Age</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          readOnly 
                          value={calculateAge(formData.dob)}
                          placeholder="Calculated automatically" 
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-semibold outline-none" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Gender</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                          value={formData.gender}
                          onChange={(e) => updateField('gender', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Blood Type</label>
                      <div className="relative">
                        <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                          value={formData.bloodType}
                          onChange={(e) => updateField('bloodType', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                          <option value="">Select</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="Unknown">Unknown</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Email Address <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          className={cn(
                            "w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                            errors.email ? "border-red-300 bg-red-50" : "border-slate-200"
                          )} 
                        />
                      </div>
                      {errors.email && <p className="text-[10px] text-red-500 font-medium">{errors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          className={cn(
                            "w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                            errors.phone ? "border-red-300 bg-red-50" : "border-slate-200"
                          )} 
                        />
                      </div>
                      {errors.phone && <p className="text-[10px] text-red-500 font-medium">{errors.phone}</p>}
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Textarea 
                          rows={3} 
                          value={formData.address || ""}
                          onChange={(e) => updateField('address', e.target.value)}
                          placeholder="Start typing address..."
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">How did you hear about us?</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                          value={formData.referralSource}
                          onChange={(e) => updateField('referralSource', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                          <option value="">Select Source</option>
                          <option value="social-media">Social Media</option>
                          <option value="google">Google Search</option>
                          <option value="friend">Friend/Family</option>
                          <option value="physician">Physician Referral</option>
                          <option value="advertisement">Advertisement</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">Insurance Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Insurance Provider</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.insuranceProvider}
                        onChange={(e) => updateField('insuranceProvider', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Policy Number</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.policyNumber}
                        onChange={(e) => updateField('policyNumber', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Group Number</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.groupNumber}
                        onChange={(e) => updateField('groupNumber', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">Insurance Card (Front)</label>
                      <div className="h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative group">
                        {formData.insuranceFront ? (
                          <>
                            <img src={formData.insuranceFront} alt="Front" className="w-full h-full object-cover" />
                            <button onClick={() => updateField('insuranceFront', null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                          </>
                        ) : isCapturing.active && isCapturing.target === 'insuranceFront' ? (
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                            <p className="text-[10px] text-slate-400">Not scanned</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {isCapturing.active && isCapturing.target === 'insuranceFront' ? (
                          <button onClick={capturePhoto} className="flex-1 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-medium">Capture</button>
                        ) : (
                          <button onClick={() => startCamera('insuranceFront')} className="flex-1 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-medium hover:bg-slate-50">Scan Front</button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">Insurance Card (Back)</label>
                      <div className="h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative group">
                        {formData.insuranceBack ? (
                          <>
                            <img src={formData.insuranceBack} alt="Back" className="w-full h-full object-cover" />
                            <button onClick={() => updateField('insuranceBack', null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                          </>
                        ) : isCapturing.active && isCapturing.target === 'insuranceBack' ? (
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                            <p className="text-[10px] text-slate-400">Not scanned</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {isCapturing.active && isCapturing.target === 'insuranceBack' ? (
                          <button onClick={capturePhoto} className="flex-1 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-medium">Capture</button>
                        ) : (
                          <button onClick={() => startCamera('insuranceBack')} className="flex-1 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-medium hover:bg-slate-50">Scan Back</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Emergency Contact Name</label>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.emergencyName}
                        onChange={(e) => updateField('emergencyName', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Emergency Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="tel" 
                        value={formData.emergencyPhone}
                        onChange={(e) => updateField('emergencyPhone', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Relationship to Patient</label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.emergencyRelation}
                        onChange={(e) => updateField('emergencyRelation', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button onClick={handleNext} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                  Continue to Medical History
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText className="w-5 h-5 text-indigo-500" /> Medical History
              </h3>
              
              <div className="space-y-8">
                {/* Allergies */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-slate-700">Do you have any allergies? <span className="text-red-500">*</span></label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="allergies" 
                        value="yes" 
                        checked={formData.hasAllergies === 'yes'}
                        onChange={(e) => updateField('hasAllergies', e.target.value)} 
                        className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                      />
                      <span className="text-sm text-slate-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="allergies" 
                        value="no" 
                        checked={formData.hasAllergies === 'no'}
                        onChange={(e) => updateField('hasAllergies', e.target.value)} 
                        className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                      />
                      <span className="text-sm text-slate-700">No</span>
                    </label>
                  </div>

                  {formData.hasAllergies === 'yes' && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in">
                      <label className="text-sm font-medium text-slate-700">Please list all allergies:</label>
                      {formData.allergies.map((allergy: any, index: number) => (
                        <div key={allergy.id} className="flex gap-3 items-center">
                          <input 
                            type="text" 
                            placeholder="Allergy" 
                            value={allergy.name}
                            onChange={(e) => {
                              const newAllergies = [...formData.allergies];
                              newAllergies[index].name = e.target.value;
                              updateField('allergies', newAllergies);
                            }}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                          />
                          <select 
                            value={allergy.reaction}
                            onChange={(e) => {
                              const newAllergies = [...formData.allergies];
                              newAllergies[index].reaction = e.target.value;
                              updateField('allergies', newAllergies);
                            }}
                            className="w-40 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                          >
                            <option value="">Reaction</option>
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                          </select>
                          <button 
                            onClick={() => {
                              const newAllergies = formData.allergies.filter((a: any) => a.id !== allergy.id);
                              updateField('allergies', newAllergies);
                            }} 
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => updateField('allergies', [...formData.allergies, { id: Date.now(), name: "", reaction: "" }])} 
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2"
                      >
                        <Plus className="w-4 h-4" /> Add Another Allergy
                      </button>
                    </div>
                  )}
                </div>

                {/* Conditions */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-slate-700">Do you have any current medical conditions? <span className="text-red-500">*</span></label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="conditions" 
                        value="yes" 
                        checked={formData.hasConditions === 'yes'}
                        onChange={(e) => updateField('hasConditions', e.target.value)} 
                        className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                      />
                      <span className="text-sm text-slate-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="conditions" 
                        value="no" 
                        checked={formData.hasConditions === 'no'}
                        onChange={(e) => updateField('hasConditions', e.target.value)} 
                        className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                      />
                      <span className="text-sm text-slate-700">No</span>
                    </label>
                  </div>

                  {formData.hasConditions === 'yes' && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in">
                      <label className="text-sm font-medium text-slate-700">Please select all that apply:</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Hypertension', 'Diabetes', 'Asthma', 'Heart Disease', 'Cancer', 'Arthritis', 'Thyroid Disorder', 'Depression/Anxiety'].map(cond => (
                          <label key={cond} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={formData.conditions.includes(cond)}
                              onChange={(e) => {
                                const newConditions = e.target.checked 
                                  ? [...formData.conditions, cond]
                                  : formData.conditions.filter((c: string) => c !== cond);
                                updateField('conditions', newConditions);
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                            />
                            <span className="text-sm text-slate-700">{cond}</span>
                          </label>
                        ))}
                      </div>
                      <div className="space-y-1.5 pt-2">
                        <label className="text-sm font-medium text-slate-700">Other conditions:</label>
                        <div className="relative">
                          <Activity className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <Textarea 
                            rows={2} 
                            value={formData.otherConditions || ""}
                            onChange={(e) => updateField('otherConditions', e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Medications */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-slate-700">Are you currently taking any medications? <span className="text-red-500">*</span></label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="medications" 
                        value="yes" 
                        checked={formData.hasMedications === 'yes'}
                        onChange={(e) => updateField('hasMedications', e.target.value)} 
                        className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                      />
                      <span className="text-sm text-slate-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="medications" 
                        value="no" 
                        checked={formData.hasMedications === 'no'}
                        onChange={(e) => updateField('hasMedications', e.target.value)} 
                        className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                      />
                      <span className="text-sm text-slate-700">No</span>
                    </label>
                  </div>

                  {formData.hasMedications === 'yes' && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in">
                      <label className="text-sm font-medium text-slate-700">Please list all medications:</label>
                      {formData.medications.map((med: any, index: number) => (
                        <div key={med.id} className="flex gap-3 items-center">
                          <input 
                            type="text" 
                            placeholder="Medication name" 
                            value={med.name}
                            onChange={(e) => {
                              const newMeds = [...formData.medications];
                              newMeds[index].name = e.target.value;
                              updateField('medications', newMeds);
                            }}
                            className="flex-[2] px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                          />
                          <input 
                            type="text" 
                            placeholder="Dosage" 
                            value={med.dosage}
                            onChange={(e) => {
                              const newMeds = [...formData.medications];
                              newMeds[index].dosage = e.target.value;
                              updateField('medications', newMeds);
                            }}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                          />
                          <input 
                            type="text" 
                            placeholder="Frequency" 
                            value={med.frequency}
                            onChange={(e) => {
                              const newMeds = [...formData.medications];
                              newMeds[index].frequency = e.target.value;
                              updateField('medications', newMeds);
                            }}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                          />
                          <button 
                            onClick={() => {
                              const newMeds = formData.medications.filter((m: any) => m.id !== med.id);
                              updateField('medications', newMeds);
                            }} 
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => updateField('medications', [...formData.medications, { id: Date.now(), name: "", dosage: "", frequency: "" }])} 
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2"
                      >
                        <Plus className="w-4 h-4" /> Add Another Medication
                      </button>
                    </div>
                  )}
                </div>

                {/* Family Medical History */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-md font-semibold text-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" /> Family Medical History
                  </h4>
                  <p className="text-sm text-slate-500">Please indicate if any immediate family members (parents, siblings, grandparents) have had significant medical conditions.</p>
                  
                  <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    {formData.familyHistory.map((entry: any, index: number) => (
                      <div key={entry.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <div className="w-full sm:flex-1">
                          <input 
                            type="text" 
                            placeholder="Relation (e.g., Mother)" 
                            value={entry.relation}
                            onChange={(e) => {
                              const newHistory = [...formData.familyHistory];
                              newHistory[index].relation = e.target.value;
                              updateField('familyHistory', newHistory);
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                          />
                        </div>
                        <div className="w-full sm:flex-[2]">
                          <input 
                            type="text" 
                            placeholder="Condition (e.g., Diabetes)" 
                            value={entry.condition}
                            onChange={(e) => {
                              const newHistory = [...formData.familyHistory];
                              newHistory[index].condition = e.target.value;
                              updateField('familyHistory', newHistory);
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                          />
                        </div>
                        <div className="w-full sm:w-32">
                          <input 
                            type="text" 
                            placeholder="Age of Dx" 
                            value={entry.age}
                            onChange={(e) => {
                              const newHistory = [...formData.familyHistory];
                              newHistory[index].age = e.target.value;
                              updateField('familyHistory', newHistory);
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const newHistory = formData.familyHistory.filter((f: any) => f.id !== entry.id);
                            updateField('familyHistory', newHistory);
                          }} 
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-end sm:self-auto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => updateField('familyHistory', [...formData.familyHistory, { id: Date.now(), relation: "", condition: "", age: "" }])} 
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2"
                    >
                      <Plus className="w-4 h-4" /> Add Family Member
                    </button>
                  </div>
                </div>

                {/* Surgeries & Family History */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Previous Surgeries (if any):</label>
                  <div className="relative">
                    <Scissors className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Textarea 
                      rows={2} 
                      value={formData.surgeries || ""}
                      onChange={(e) => updateField('surgeries', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Additional Family Medical History Notes:</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Textarea 
                      rows={2} 
                      value={formData.familyHistoryText || ""}
                      onChange={(e) => updateField('familyHistoryText', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button onClick={() => setStep(step - 1)} className="px-6 py-2.5 rounded-lg font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                  Back
                </button>
                <button onClick={handleNext} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                  Continue to Consent
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Shield className="w-5 h-5 text-indigo-500" /> Consent & Privacy
              </h3>
              
              <div className="space-y-6">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-semibold text-slate-800">Treatment Consent</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">I hereby consent to the treatment provided by Physician Hiclinic. I authorize the healthcare providers to conduct examinations and perform procedures as are necessary in my care.</p>
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input 
                      type="checkbox" 
                      checked={formData.consentTreatment}
                      onChange={(e) => updateField('consentTreatment', e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                    />
                    <span className="text-sm font-medium text-slate-800">I agree to treatment consent <span className="text-red-500">*</span></span>
                  </label>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-semibold text-slate-800">Privacy Practices</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">I acknowledge that I have received or been offered a copy of the clinic's Notice of Privacy Practices, which explains how my medical information will be used and disclosed.</p>
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input 
                      type="checkbox" 
                      checked={formData.consentPrivacy}
                      onChange={(e) => updateField('consentPrivacy', e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                    />
                    <span className="text-sm font-medium text-slate-800">I acknowledge receipt of privacy practices <span className="text-red-500">*</span></span>
                  </label>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-semibold text-slate-800">Financial Agreement</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">I understand that I am financially responsible for all charges not covered by insurance. I authorize the release of any medical information necessary to process insurance claims.</p>
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input 
                      type="checkbox" 
                      checked={formData.consentFinancial}
                      onChange={(e) => updateField('consentFinancial', e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                    />
                    <span className="text-sm font-medium text-slate-800">I agree to financial terms <span className="text-red-500">*</span></span>
                  </label>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-semibold text-slate-800">Communication Consent</h4>
                  <p className="text-sm text-slate-600">I consent to receive communications via:</p>
                  <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.communication.email}
                        onChange={(e) => updateField('communication', { ...formData.communication, email: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                      />
                      <span className="text-sm font-medium text-slate-800">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.communication.sms}
                        onChange={(e) => updateField('communication', { ...formData.communication, sms: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                      />
                      <span className="text-sm font-medium text-slate-800">SMS/Text</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.communication.phone}
                        onChange={(e) => updateField('communication', { ...formData.communication, phone: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                      />
                      <span className="text-sm font-medium text-slate-800">Phone Call</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Digital Signature <span className="text-red-500">*</span></label>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white h-48 relative">
                      <SignatureCanvas 
                        ref={sigCanvas}
                        penColor='black'
                        canvasProps={{className: 'w-full h-full cursor-crosshair'}}
                        onEnd={handleSignatureEnd}
                      />
                      <div className="absolute bottom-6 left-6 right-6 h-px bg-slate-200 pointer-events-none"></div>
                      <div className="absolute bottom-2 right-4 text-xs text-slate-400 pointer-events-none">Sign above</div>
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={clearSignature}
                        className="text-sm font-medium text-slate-500 hover:text-slate-700"
                      >
                        Clear Signature
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 w-full md:w-1/3">
                    <label className="text-sm font-medium text-slate-700">Date <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-lg font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                  Back
                </button>
                <button onClick={handleNext} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                  Review Registration
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Eye className="w-5 h-5 text-indigo-500" /> Review & Submit
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-center">
                      <QRCodeSVG value={formData.patientId} size={64} />
                      <p className="text-[8px] font-mono mt-1 text-slate-400">{formData.patientId}</p>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden">
                        {formData.photo ? (
                          <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{formData.firstName} {formData.lastName}</h4>
                        <p className="text-sm text-slate-500">{calculateAge(formData.dob)} years old • {formData.gender}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-slate-500">ID:</span> {formData.nationalId || 'N/A'}</p>
                      <p><span className="text-slate-500">Email:</span> {formData.email}</p>
                      <p><span className="text-slate-500">Phone:</span> {formData.phone}</p>
                      <p><span className="text-slate-500">Address:</span> {formData.address || 'N/A'}</p>
                      <p><span className="text-slate-500">Referral:</span> {formData.referralSource || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-3">Insurance & Billing</h4>
                    <div className="space-y-4 text-sm">
                      <div className="space-y-1">
                        <p><span className="text-slate-500">Provider:</span> {formData.insuranceProvider || 'N/A'}</p>
                        <p><span className="text-slate-500">Policy:</span> {formData.policyNumber || 'N/A'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="aspect-video bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                          {formData.insuranceFront ? <img src={formData.insuranceFront} className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-300">No Front Image</span>}
                        </div>
                        <div className="aspect-video bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                          {formData.insuranceBack ? <img src={formData.insuranceBack} className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-300">No Back Image</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-3">Emergency Contact</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-slate-500">Name:</span> {formData.emergencyName || 'N/A'}</p>
                      <p><span className="text-slate-500">Phone:</span> {formData.emergencyPhone || 'N/A'}</p>
                      <p><span className="text-slate-500">Relation:</span> {formData.emergencyRelation || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-3">Medical Summary</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-500 font-medium">Allergies:</p>
                        <p>{formData.hasAllergies === 'yes' ? formData.allergies.filter(a => a.name).map(a => `${a.name} (${a.reaction})`).join(', ') : 'None'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium">Conditions:</p>
                        <p>{formData.hasConditions === 'yes' ? [...formData.conditions, formData.otherConditions].filter(Boolean).join(', ') : 'None'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium">Medications:</p>
                        <p>{formData.hasMedications === 'yes' ? formData.medications.filter(m => m.name).map(m => `${m.name} ${m.dosage} ${m.frequency}`).join(', ') : 'None'}</p>
                      </div>
                      {formData.surgeries && (
                        <div>
                          <p className="text-slate-500 font-medium">Previous Surgeries:</p>
                          <p>{formData.surgeries}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-slate-500 font-medium">Family History:</p>
                        <p>{formData.familyHistory.filter(f => f.condition).map(f => `${f.relation}: ${f.condition}`).join(', ') || 'None'}</p>
                        {formData.familyHistoryText && <p className="mt-1 text-xs italic">{formData.familyHistoryText}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-3">Signature</h4>
                    <div className="bg-white border border-slate-200 rounded-lg p-2 h-24 flex items-center justify-center">
                      {formData.signature ? (
                        <img src={formData.signature} alt="Signature" className="max-h-full" />
                      ) : (
                        <p className="text-xs text-red-500">Missing Signature</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setStep(3)} className="px-6 py-2.5 rounded-lg font-medium border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Back
                </button>
                <button 
                    onClick={async () => {
                      try {
                        const now = Date.now();
                        
                        // Calculate age from DOB
                        let calculatedAge = 0;
                        if (formData.dob) {
                          const birthDate = new Date(formData.dob);
                          const today = new Date();
                          calculatedAge = today.getFullYear() - birthDate.getFullYear();
                          const m = today.getMonth() - birthDate.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            calculatedAge--;
                          }
                        }

                      await db.patients.add({
                        id: formData.patientId,
                        name: `${formData.firstName} ${formData.lastName}`,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        dob: formData.dob,
                        age: calculatedAge,
                        nationalId: formData.nationalId,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        gender: formData.gender,
                        bloodType: formData.bloodType || 'Unknown',
                        referralSource: formData.referralSource,
                        insuranceProvider: formData.insuranceProvider,
                        policyNumber: formData.policyNumber,
                        groupNumber: formData.groupNumber,
                        insuranceFront: formData.insuranceFront || undefined,
                        insuranceBack: formData.insuranceBack || undefined,
                        emergencyName: formData.emergencyName,
                        emergencyPhone: formData.emergencyPhone,
                        emergencyRelationship: formData.emergencyRelation,
                        hasAllergies: formData.hasAllergies || undefined,
                        allergies: JSON.stringify(formData.allergies),
                        hasConditions: formData.hasConditions || undefined,
                        conditions: JSON.stringify(formData.conditions),
                        otherConditions: formData.otherConditions,
                        hasMedications: formData.hasMedications || undefined,
                        medications: JSON.stringify(formData.medications),
                        hasSurgeries: formData.surgeries ? 'yes' : 'no',
                        surgeries: formData.surgeries,
                        familyHistory: JSON.stringify(formData.familyHistory),
                        familyHistoryNotes: formData.familyHistoryText,
                        photo: formData.photo || undefined,
                        signature: formData.signature || undefined,
                        consentTreatment: formData.consentTreatment,
                        consentPrivacy: formData.consentPrivacy,
                        consentFinancial: formData.consentFinancial,
                        communication: JSON.stringify(formData.communication),
                        lastVisit: new Date().toISOString().split('T')[0],
                        status: 'Stable',
                        lastModified: now,
                        isDeleted: 0,
                        isSynced: 0
                      });
                      
                      await addNotification({
                        title: "New Patient Registered",
                        message: `${formData.firstName} ${formData.lastName} (${formData.patientId}) has been successfully registered.`,
                        type: "success",
                        category: "patient",
                        link: "/"
                      });
                      
                      toast.success("Patient Registered Successfully!");
                      localStorage.removeItem('newPatientDraft');
                      navigate('/');
                    } catch (error) {
                      console.error("Failed to register patient:", error);
                      toast.error("Failed to register patient. Please try again.");
                    }
                  }}
                  className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg flex items-center gap-2 glow-indigo"
                >
                  <Check className="w-5 h-5" /> Complete Registration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
