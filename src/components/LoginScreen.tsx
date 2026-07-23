import React, { useState } from "react";
import { useUser } from "../lib/UserContext";
import { 
  Shield, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Plus, 
  Users, 
  Briefcase, 
  Key, 
  RefreshCw, 
  Building, 
  Building2, 
  Lock, 
  User, 
  Mail 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

// Predefined Clinical Workspaces
const clinicsRoster = [
  { 
    id: "clinic_a", 
    name: "Clinic A (Downtown)", 
    address: "123 Medical Center Blvd", 
    inviteCode: "DEMO-A",
    staff: [
      { name: "Dr. Sarah Ahmed", email: "sarah.ahmed@clinic.com", role: "doctor", desc: "Lead Family Practitioner" },
      { name: "James Miller, RN", email: "james.lpn@clinic.com", role: "nurse", desc: "Surgical Assistant Nurse" },
      { name: "Alex Mercer, PharmD", email: "alex.pharmacist@clinic.com", role: "pharmacist", desc: "Pharmacy Director" },
      { name: "Emma Watson", email: "emma.reception@clinic.com", role: "receptionist", desc: "Front Desk Coordinator" },
      { name: "Chief Admin (Sarah)", email: "admin@clinic.com", role: "admin", desc: "Clinical Systems Director" }
    ]
  },
  { 
    id: "clinic_b", 
    name: "Clinic B (Northside)", 
    address: "456 Healthcare Avenue", 
    inviteCode: "DEMO-B",
    staff: [
      { name: "Dr. David Clark", email: "david.clark@clinic.com", role: "doctor", desc: "Internal Medicine Expert" },
      { name: "Emily Stone, LPN", email: "emily.stone@clinic.com", role: "nurse", desc: "Clinical Triage Nurse" },
      { name: "Marcus Vance, RPh", email: "marcus.vance@clinic.com", role: "pharmacist", desc: "Compounding Pharmacist" },
      { name: "Lisa Ray", email: "lisa.ray@clinic.com", role: "receptionist", desc: "Scheduler & Ingestion Agent" },
      { name: "Root Admin (Sarah)", email: "root.sarah@clinic.com", role: "admin", desc: "Administrative Overseer" }
    ]
  }
];

export function LoginScreen() {
  const { loginWithProfile, loginWithGoogle } = useUser();
  const [activeTab, setActiveTab] = useState<'roster' | 'standard'>('roster');
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedClinic, setSelectedClinic] = useState(clinicsRoster[0]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Custom Clinic State
  const [customClinicName, setCustomClinicName] = useState("");
  const [customClinicAddress, setCustomClinicAddress] = useState("");
  const [isAddingWorkspace, setIsAddingWorkspace] = useState(false);

  // Custom Personnel Profile State
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customRole, setCustomRole] = useState<'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin'>("doctor");
  const [isRegisteringCustom, setIsRegisteringCustom] = useState(false);

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      toast.error("Please enter your registered email");
      return;
    }
    // Match email prefix or domain to a role:
    const emailLower = loginEmail.toLowerCase();
    let role: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin' = "doctor";
    if (emailLower.includes("nurse")) role = "nurse";
    else if (emailLower.includes("pharmacist") || emailLower.includes("pharm")) role = "pharmacist";
    else if (emailLower.includes("reception")) role = "receptionist";
    else if (emailLower.includes("admin")) role = "admin";

    // Extract a display name from email (e.g. "Sarah Ahmed" from "sarah.ahmed@clinic.com")
    let name = "Doctor User";
    if (role === "admin") name = "Administrator";
    else if (role === "nurse") name = "Nurse Practitioner";
    else if (role === "pharmacist") name = "Pharmacist Officer";
    else if (role === "receptionist") name = "Receptionist Coordinator";

    // Try to find if any predefined staff has this email
    let matchedClinic = selectedClinic;
    let foundStaff = null;
    for (const cl of clinicsRoster) {
      const match = cl.staff.find(s => s.email.toLowerCase() === emailLower);
      if (match) {
        foundStaff = match;
        matchedClinic = cl;
        break;
      }
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      loginWithProfile(
        matchedClinic.id,
        matchedClinic.name,
        foundStaff ? foundStaff.name : name,
        loginEmail,
        foundStaff ? (foundStaff.role as any) : role
      );
      setIsAuthenticating(false);
      toast.success("Logged in successfully using secure authentication bypass.");
    }, 400);
  };

  // Switch to Phase 2: User profile authentication
  const handleProceedToPersonnel = () => {
    setStep(2);
    toast.info(`Switched context to ${selectedClinic.name}. Select a medical profile to login.`);
  };

  const handleCustomClinicCreate = () => {
    if (!customClinicName.trim()) {
      toast.error("Please provide a name for the new medical workspace.");
      return;
    }
    const newId = `clinic_${Math.random().toString(36).substring(2, 11)}`;
    const newWorkspace = {
      id: newId,
      name: customClinicName,
      address: customClinicAddress || "General Location Branch",
      inviteCode: `CLIN-${Math.floor(100 + Math.random() * 900)}`,
      staff: [
        { name: "Primary Administrator", email: `admin@${customClinicName.toLowerCase().replace(/\s+/g, '')}.com`, role: "admin" as const, desc: "Default Administrator" },
        { name: "Medical Practitioner", email: `doctor@${customClinicName.toLowerCase().replace(/\s+/g, '')}.com`, role: "doctor" as const, desc: "Primary Care Doctor" }
      ]
    };
    setSelectedClinic(newWorkspace);
    setIsAddingWorkspace(false);
    setCustomClinicName("");
    setCustomClinicAddress("");
    setStep(2);
    toast.success(`Success! Workspace "${newWorkspace.name}" initialized. Select profile to sign in.`);
  };

  const handleProfileSelection = (staffMember: any) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      loginWithProfile(
        selectedClinic.id,
        selectedClinic.name,
        staffMember.name,
        staffMember.email,
        staffMember.role
      );
      setIsAuthenticating(false);
    }, 450);
  };

  const handleCustomProfileSelection = () => {
    if (!customName.trim() || !customEmail.trim()) {
      toast.error("Please fill in both name and email of the clinical user.");
      return;
    }
    setIsAuthenticating(true);
    setTimeout(() => {
      loginWithProfile(
        selectedClinic.id,
        selectedClinic.name,
        customName,
        customEmail,
        customRole
      );
      setIsAuthenticating(false);
    }, 450);
  };

  const handleGoogleSsoLogin = async () => {
    setIsAuthenticating(true);
    try {
      // SSO triggers under the selected clinic context
      await loginWithGoogle();
      toast.success(`Authorized under workspace: ${selectedClinic.name}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 md:p-8 font-sans transition-colors duration-200">
      {/* Ambient backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl rounded-[32px] overflow-hidden relative"
      >
        {/* Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
        
        <div className="p-8 md:p-10 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-505/20 mb-1 animate-pulse">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              SaaS Clinical Gatekeeper
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Multi-Clinic Enterprise Health Suite. Secured via Cryptographic Workspace Isolation & Role Maps.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab('roster');
                setStep(1);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'roster'
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/30 dark:border-slate-700/30"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              Predefined Roster Access
            </button>
            <button
              id="standard-login-tab"
              type="button"
              onClick={() => setActiveTab('standard')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'standard'
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/30 dark:border-slate-700/30"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Lock className="w-4 h-4" />
              Credentials Sign-in (Auto QA Bypass)
            </button>
          </div>

          <AnimatePresence mode="wait">
            
            {activeTab === 'standard' ? (
              <motion.form
                key="standard-form"
                onSubmit={handleStandardLogin}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-slate-105 dark:border-slate-800 pb-3">
                  <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 p-1 px-2 rounded-md">Step 1</span>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Traditional Credentials Login</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Email address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input 
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="e.g. sarah.ahmed@clinic.com or doctor@clinic.com"
                        className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 pl-10 font-bold outline-none rounded-xl focus:ring-1 focus:ring-indigo-500 text-slate-850 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Password</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          setLoginEmail("sarah.ahmed@clinic.com");
                          setLoginPassword("demo123");
                          toast.info("Auto-populated standard doctor training profile.");
                        }}
                        className="text-[10px] font-extrabold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Auto-fill Doctor credentials
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input 
                        type="password"
                        id="password"
                        name="password"
                        required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 pl-10 font-bold outline-none rounded-xl focus:ring-1 focus:ring-indigo-500 text-slate-850 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            ) : step === 1 ? (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 p-1 px-2 rounded-md">Step 1</span>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Select Clinical Workspace Context</h2>
                  </div>
                </div>

                {isAddingWorkspace ? (
                  /* Create Dynamic Workspace Subpanel */
                  <div className="p-5 border border-indigo-100 dark:border-indigo-950/80 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest">Establish Virtual Workspace Tenant</p>
                      <button 
                        onClick={() => setIsAddingWorkspace(false)}
                        className="text-xs hover:underline text-slate-400 hover:text-slate-600 font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Clinic Tenant Name</label>
                        <input 
                          type="text"
                          value={customClinicName}
                          onChange={e => setCustomClinicName(e.target.value)}
                          placeholder="e.g. Hope Pediatrics"
                          className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Corporate/Clinic Address</label>
                        <input 
                          type="text"
                          value={customClinicAddress}
                          onChange={e => setCustomClinicAddress(e.target.value)}
                          placeholder="e.g. Suite 400 Medical Court"
                          className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                        />
                      </div>

                      <button
                        onClick={handleCustomClinicCreate}
                        className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Provision Clinic Tenant Sandbox
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Select Clinic Grid */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {clinicsRoster.map((cl) => {
                        const isS = selectedClinic.id === cl.id;
                        return (
                          <div
                            key={cl.id}
                            onClick={() => setSelectedClinic(cl)}
                            className={`p-4 rounded-2xl border cursor-pointer text-left transition ${
                              isS
                                ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-600 ring-1 ring-indigo-600/20 shadow-md shadow-indigo-500/5 text-slate-950"
                                : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="p-1 px-2 rounded bg-indigo-100 dark:bg-indigo-600/25 text-[9px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">
                                {cl.inviteCode}
                              </div>
                              {isS && <Check className="w-4 h-4 text-indigo-600" />}
                            </div>
                            <p className="font-extrabold text-sm text-slate-900 dark:text-white">{cl.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">{cl.address}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">Selected Clinic: <strong className="text-slate-700 dark:text-slate-300">{selectedClinic.name}</strong></p>
                      <button
                        type="button"
                        onClick={() => setIsAddingWorkspace(true)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create Workspace
                      </button>
                    </div>

                    <button
                      onClick={handleProceedToPersonnel}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-indigo-600/10 cursor-pointer hover:shadow-lg active:scale-95"
                    >
                      <span>Continue to Clinical Personnel Roster</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              
              /* Step 2: User profile authentication */
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                {/* Back tracking Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Clinics
                  </button>

                  <div className="flex items-center gap-1.5 text-right">
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 p-1 px-2 rounded-md">Step 2</span>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[180px]">{selectedClinic.name}</p>
                  </div>
                </div>

                {isRegisteringCustom ? (
                  /* Custom User Map creation form */
                  <div className="p-5 border border-indigo-100 dark:border-indigo-950 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        Configure custom credential persona
                      </p>
                      <button 
                        onClick={() => setIsRegisteringCustom(false)}
                        className="text-xs hover:underline text-slate-400 hover:text-slate-600 font-bold"
                      >
                        Clinician Roster
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Clinician Full Name</label>
                        <input 
                          type="text"
                          value={customName}
                          onChange={e => setCustomName(e.target.value)}
                          placeholder="e.g. Dr. Arthur Conan"
                          className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Clinic Managed Email</label>
                        <input 
                          type="email"
                          value={customEmail}
                          onChange={e => setCustomEmail(e.target.value)}
                          placeholder="e.g. arthur@hope.com"
                          className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Designated Tenant Role</label>
                        <select
                          value={customRole}
                          onChange={e => setCustomRole(e.target.value as any)}
                          className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 cursor-pointer"
                        >
                          <option value="admin">System Admin</option>
                          <option value="doctor">Practitioner (Doctor)</option>
                          <option value="nurse">Clinical Nurse</option>
                          <option value="pharmacist">Pharmacist</option>
                          <option value="receptionist">Receptionist</option>
                        </select>
                      </div>

                      <button
                        onClick={handleCustomProfileSelection}
                        disabled={isAuthenticating}
                        className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        {isAuthenticating ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                        Authenticate Persona Session
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Staff Roster Grid list */
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Roster of registered credentials in <strong className="text-slate-800 dark:text-slate-300">{selectedClinic.name}</strong>. Select matching clinical profile profile:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[295px] overflow-y-auto pr-1">
                      {(selectedClinic.staff || []).map((member: any) => {
                        return (
                          <div
                            key={member.email}
                            onClick={() => handleProfileSelection(member)}
                            className="bg-slate-50 dark:bg-slate-950/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/15 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-3 text-left cursor-pointer transition flex items-center gap-3 relative overflow-hidden"
                          >
                            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                              {member.role.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="space-y-0.5 truncate flex-1 pr-12">
                              <p className="font-extrabold text-xs text-slate-950 dark:text-white leading-tight">{member.name}</p>
                              <p className="text-[10px] text-slate-500 leading-none truncate">{member.desc || member.email}</p>
                            </div>
                            
                            {/* Role Tag Label indicator */}
                            <span className="absolute right-3.5 top-3.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-indigo-500/10 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
                              {member.role}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4.5 gap-4">
                      <button
                        type="button"
                        onClick={() => setIsRegisteringCustom(true)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5"
                      >
                        <User className="w-4 h-4" />
                        Authenticate Custom Staff
                      </button>

                      {/* Federated google auth under context integration */}
                      <button
                        onClick={handleGoogleSsoLogin}
                        disabled={isAuthenticating}
                        className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#EA4335"
                            d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.113 4.114a5.772 5.772 0 0 1-5.771-5.771A5.772 5.772 0 0 1 14 7c1.373 0 2.63.486 3.619 1.305l3.157-3.157C18.814 3.324 16.514 2 14 2A9.771 9.771 0 0 0 4.229 11.771a9.771 9.771 0 0 0 9.771 9.771c5.152 0 9.771-3.667 9.771-9.771a9.497 9.497 0 0 0-.257-1.486H12.24z"
                          />
                        </svg>
                        Google Account Sync
                      </button>
                    </div>

                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

          {/* Secure details metrics */}
          <div className="grid grid-cols-2 gap-4 pt-6 mt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
                Isolated Tenants
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
                Scoped Tokens
              </span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
