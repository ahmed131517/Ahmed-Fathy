import { useState } from "react";
import { User, CreditCard, Calendar, Clock, Users, Mail, Phone, MapPin, Shield, FileText, Map, UserCheck, Heart, Activity, Scissors, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function NewPatient() {
  const [step, setStep] = useState(1);
  const [hasAllergies, setHasAllergies] = useState<string | null>(null);
  const [hasConditions, setHasConditions] = useState<string | null>(null);
  const [hasMedications, setHasMedications] = useState<string | null>(null);

  const [allergies, setAllergies] = useState([{ id: 1 }]);
  const [medications, setMedications] = useState([{ id: 1 }]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">New Patient Registration</h2>
          <p className="text-slate-500">Register a new patient or update an existing one</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 z-0"></div>
            {[
              { num: 1, label: "Personal Details" },
              { num: 2, label: "Medical History" },
              { num: 3, label: "Consent & Privacy" },
            ].map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => setStep(s.num)}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-colors bg-white",
                  step >= s.num ? "border-indigo-600 text-indigo-600" : "border-slate-300 text-slate-400",
                  step === s.num && "bg-indigo-600 text-white"
                )}>
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className={cn(
                  "mt-2 text-sm font-medium",
                  step >= s.num ? "text-slate-900" : "text-slate-500"
                )}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <User className="w-5 h-5 text-indigo-500" /> Personal Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">First Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Last Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">National ID/Passport Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Date of Birth <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="date" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Age</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" readOnly placeholder="Calculated automatically" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 outline-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Gender</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Email Address <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="tel" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <textarea rows={3} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"></textarea>
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
                      <input type="text" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Policy Number</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Group Number</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
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
                      <input type="text" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Emergency Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="tel" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Relationship to Patient</label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button onClick={() => setStep(2)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
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
                      <input type="radio" name="allergies" value="yes" onChange={(e) => setHasAllergies(e.target.value)} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="text-sm text-slate-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="allergies" value="no" onChange={(e) => setHasAllergies(e.target.value)} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="text-sm text-slate-700">No</span>
                    </label>
                  </div>

                  {hasAllergies === 'yes' && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in">
                      <label className="text-sm font-medium text-slate-700">Please list all allergies:</label>
                      {allergies.map((allergy, index) => (
                        <div key={allergy.id} className="flex gap-3 items-center">
                          <input type="text" placeholder="Allergy" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                          <select className="w-40 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white">
                            <option value="">Reaction</option>
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                          </select>
                          <button onClick={() => setAllergies(allergies.filter(a => a.id !== allergy.id))} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => setAllergies([...allergies, { id: Date.now() }])} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2">
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
                      <input type="radio" name="conditions" value="yes" onChange={(e) => setHasConditions(e.target.value)} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="text-sm text-slate-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="conditions" value="no" onChange={(e) => setHasConditions(e.target.value)} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="text-sm text-slate-700">No</span>
                    </label>
                  </div>

                  {hasConditions === 'yes' && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in">
                      <label className="text-sm font-medium text-slate-700">Please select all that apply:</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Hypertension', 'Diabetes', 'Asthma', 'Heart Disease', 'Cancer', 'Arthritis', 'Thyroid Disorder', 'Depression/Anxiety'].map(cond => (
                          <label key={cond} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors">
                            <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                            <span className="text-sm text-slate-700">{cond}</span>
                          </label>
                        ))}
                      </div>
                      <div className="space-y-1.5 pt-2">
                        <label className="text-sm font-medium text-slate-700">Other conditions:</label>
                        <div className="relative">
                          <Activity className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <textarea rows={2} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"></textarea>
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
                      <input type="radio" name="medications" value="yes" onChange={(e) => setHasMedications(e.target.value)} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="text-sm text-slate-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="medications" value="no" onChange={(e) => setHasMedications(e.target.value)} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="text-sm text-slate-700">No</span>
                    </label>
                  </div>

                  {hasMedications === 'yes' && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in">
                      <label className="text-sm font-medium text-slate-700">Please list all medications:</label>
                      {medications.map((med, index) => (
                        <div key={med.id} className="flex gap-3 items-center">
                          <input type="text" placeholder="Medication name" className="flex-[2] px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                          <input type="text" placeholder="Dosage" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                          <input type="text" placeholder="Frequency" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                          <button onClick={() => setMedications(medications.filter(m => m.id !== med.id))} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => setMedications([...medications, { id: Date.now() }])} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2">
                        <Plus className="w-4 h-4" /> Add Another Medication
                      </button>
                    </div>
                  )}
                </div>

                {/* Surgeries & Family History */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Previous Surgeries (if any):</label>
                  <div className="relative">
                    <Scissors className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea rows={2} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"></textarea>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Family Medical History:</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea rows={2} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-lg font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
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
                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <span className="text-sm font-medium text-slate-800">I agree to treatment consent <span className="text-red-500">*</span></span>
                  </label>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-semibold text-slate-800">Privacy Practices</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">I acknowledge that I have received or been offered a copy of the clinic's Notice of Privacy Practices, which explains how my medical information will be used and disclosed.</p>
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <span className="text-sm font-medium text-slate-800">I acknowledge receipt of privacy practices <span className="text-red-500">*</span></span>
                  </label>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-semibold text-slate-800">Financial Agreement</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">I understand that I am financially responsible for all charges not covered by insurance. I authorize the release of any medical information necessary to process insurance claims.</p>
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <span className="text-sm font-medium text-slate-800">I agree to financial terms <span className="text-red-500">*</span></span>
                  </label>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-semibold text-slate-800">Communication Consent</h4>
                  <p className="text-sm text-slate-600">I consent to receive communications via:</p>
                  <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="text-sm font-medium text-slate-800">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="text-sm font-medium text-slate-800">SMS/Text</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="text-sm font-medium text-slate-800">Phone Call</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Digital Signature <span className="text-red-500">*</span></label>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white h-40 relative">
                      <div className="absolute bottom-6 left-6 right-6 h-px bg-slate-200"></div>
                      <div className="absolute bottom-2 right-4 text-xs text-slate-400">Sign above</div>
                    </div>
                    <div className="flex justify-end">
                      <button className="text-sm font-medium text-slate-500 hover:text-slate-700">Clear Signature</button>
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
                <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                  Complete Registration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
