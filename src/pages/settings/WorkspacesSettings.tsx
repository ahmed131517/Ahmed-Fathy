import { useState } from "react";
import { Copy, Plus, ArrowRight, Share2, Key, Users, Check, Building, Trash2, Shield, Calendar, Server, Code, Terminal, Play, Cpu, RefreshCw, Database } from "lucide-react";
import { useUser } from "../../lib/UserContext";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

export function WorkspacesSettings() {
  const { profile, switchClinic, createClinic, joinClinic, updateClinicRole } = useUser();
  const [newClinicName, setNewClinicName] = useState("");
  const [newClinicAddress, setNewClinicAddress] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // RBAC Simulator State
  const [activeTab, setActiveTab] = useState<'jwt' | 'db' | 'backend-code'>('jwt');
  const [codeTab, setCodeTab] = useState<'prisma' | 'express' | 'firebase'>('prisma');
  const [simulatingApi, setSimulatingApi] = useState<string | null>(null);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [simulationResponse, setSimulationResponse] = useState<{
    status: number;
    error?: string;
    payload?: any;
  } | null>(null);

  const activeClinicId = profile.clinicId;
  const clinics = profile.joinedClinics || [];
  const currentClinic = clinics.find(c => c.id === activeClinicId);

  const simulateApiCall = async (apiName: string, requiredRoles: string[]) => {
    setSimulatingApi(apiName);
    setSimulationResponse(null);
    setSimulationLog(["Initializing request headers...", `Setting X-Tenant-Id: "${activeClinicId}"`]);
    
    await new Promise(resolve => setTimeout(resolve, 300));

    const activeRole = profile.role || 'doctor';
    const isAllowed = requiredRoles.includes(activeRole) || activeRole === 'admin';

    setSimulationLog(prev => [
      ...prev,
      `Fetching auth token: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      `Validating Tenant Sandbox context against Active Workspace ID: ${activeClinicId}`,
      `Evaluating user roles mapping for '${activeRole.toUpperCase()}' against allowed RBAC [${requiredRoles.map(r => r.toUpperCase()).join(", ")}]`
    ]);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (isAllowed) {
      setSimulationLog(prev => [
        ...prev,
        `✔️ Authorization check passed! Permission granted to resource.`,
        `HTTP/1.1 200 OK - Access Authorized`
      ]);
      setSimulationResponse({
        status: 200,
        payload: {
          success: true,
          authorizedAs: activeRole.toUpperCase(),
          scope: `clinic_tenant:${activeClinicId}`,
          timestamp: new Date().toISOString(),
          requestedResource: apiName,
          data: apiName === '/api/v1/patients' ? [
            { id: "p1", name: "Alice Jenkins", condition: "Post-op Follow-up", nextAppointment: "2026-05-24" },
            { id: "p2", name: "Robert Morris", condition: "Hypertension Check", nextAppointment: "2026-05-25" }
          ] : apiName === '/api/v1/prescriptions' ? {
            id: "rx-9842",
            status: "active",
            medication: "Metoprolol Succinate 50mg",
            instructions: "Take 1 tablet daily with food"
          } : apiName === '/api/v1/pharmacy/inventory' ? {
            category: "Controlled Cardiovascular",
            itemsCount: 148,
            safetyStockAlert: false,
            lastAudited: "2026-05-19"
          } : {
            auditMode: "active",
            tenantStatus: "verified_healthy",
            adminActionLog: ["role_change_audited", "multi_tenant_isolation_verified"]
          }
        }
      });
      toast.success("Simulation Success: 200 OK Context Allowed");
    } else {
      setSimulationLog(prev => [
        ...prev,
        `❌ Access Denied: Role '${activeRole.toUpperCase()}' lacks sufficient privileges for resource.`,
        `HTTP/1.1 403 Forbidden`
      ]);
      setSimulationResponse({
        status: 403,
        error: `Forbidden: Multi-tenant tenant-role-permission gateway blocked access. Role '${activeRole.toUpperCase()}' does not have permissions to execute on this specific endpoint.`
      });
      toast.error("Simulation Blocked: 403 Forbidden");
    }
    setSimulatingApi(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("Invitation code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinicName.trim()) {
      toast.error("Please enter a valid clinic name.");
      return;
    }
    setIsCreating(true);
    try {
      await createClinic(newClinicName, newClinicAddress);
      setNewClinicName("");
      setNewClinicAddress("");
    } catch (err) {
      // toast is already displayed in createClinic
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) {
      toast.error("Please enter an invitation code.");
      return;
    }
    setIsJoining(true);
    const success = await joinClinic(inviteCodeInput);
    if (success) {
      setInviteCodeInput("");
    }
    setIsJoining(false);
  };

  return (
    <div className="space-y-6">
      {/* Active Workspace Banner */}
      <div className="relative overflow-hidden bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10">
          <Building className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Active SaaS Organization
            </span>
            <h2 className="text-2xl font-black tracking-tight">{profile.clinicName}</h2>
            <p className="text-sm text-slate-400 max-w-xl">
              You are currently connected to this workspace. Patient histories, prescriptions, lab results, and schedules are synced with full tenant isolation.
            </p>
          </div>
          {currentClinic && (
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 flex items-center gap-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">Workspace Invite Code</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-lg font-black tracking-widest text-indigo-400">
                    {currentClinic.inviteCode}
                  </span>
                  <button
                    onClick={() => handleCopyCode(currentClinic.inviteCode)}
                    className="p-1 px-2 rounded bg-indigo-600 hover:bg-indigo-700 text-xs text-white font-bold transition flex items-center gap-1"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clinician's Joined Workspaces */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Clinical Workspaces</h3>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-lg">
                {clinics.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Switching workspaces instantly shifts the local Dexie.js offline context to maintain complete patient data confidentiality.
            </p>

            <div className="space-y-3">
              {clinics.map((clinic) => {
                const isActive = clinic.id === activeClinicId;
                return (
                  <div
                    key={clinic.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all flex items-center justify-between",
                      isActive
                        ? "bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-200 dark:border-indigo-900/60 ring-1 ring-indigo-200 dark:ring-indigo-900/40"
                        : "bg-white dark:bg-slate-950/20 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                      )}>
                        {clinic.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{clinic.name}</p>
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold text-[9px] uppercase tracking-wider animated duration-300 animate-pulse">
                              Active Context
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-2">
                          {clinic.address || "Main Branch / Primary Location"}
                        </p>
                        
                        {/* Dynamic Multi-Tenant Role-Based Access Control Selection */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Workspace Role:</span>
                          <select
                            value={clinic.role || 'doctor'}
                            onChange={(e) => updateClinicRole(clinic.id, e.target.value as any)}
                            className="text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-lg p-1 px-2 text-slate-700 dark:text-slate-300 font-bold outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer min-w-[125px]"
                          >
                            <option value="admin">System Admin</option>
                            <option value="doctor">Practitioner (Doctor)</option>
                            <option value="nurse">Clinical Nurse</option>
                            <option value="pharmacist">Pharmacist</option>
                            <option value="receptionist">Receptionist</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Invite Code</p>
                        <p className="font-mono text-xs font-bold text-slate-700 dark:text-indigo-400/90">{clinic.inviteCode}</p>
                      </div>
                      {!isActive ? (
                        <button
                          onClick={() => switchClinic(clinic.id, clinic.name)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition"
                        >
                          Switch
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                          <Check className="w-3.5 h-3.5" />
                          Connected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invitation and Team onboarding instructions */}
          <div className="bg-amber-500/5 dark:bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10 flex gap-4">
            <Share2 className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-800 dark:text-amber-500 text-sm">How to collaborate with practice staff</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                To link other doctors, nurses, pharmacists, or administrators to your dynamic clinical workspace, copy your workspace's **Invite Code** and send it to them. When they log in and choose "Join Workspace" with your code, they will have instant, fully authorized, secure real-time sync with your practice!
              </p>
            </div>
          </div>
        </div>

        {/* Create and Join Panels */}
        <div className="space-y-6">
          {/* Create Clinic Workspace */}
          <div className="card-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-md">Create Clinic Branch</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Register a completely separate, new practice branch or clinic profile.
            </p>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Clinic Name
                </label>
                <input
                  type="text"
                  required
                  value={newClinicName}
                  onChange={(e) => setNewClinicName(e.target.value)}
                  placeholder="e.g. Sunrise Cardiology Clinic"
                  className="w-full text-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/20 text-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Address / Location (Optional)
                </label>
                <input
                  type="text"
                  value={newClinicAddress}
                  onChange={(e) => setNewClinicAddress(e.target.value)}
                  placeholder="e.g. Suite 500, Medical Plaza"
                  className="w-full text-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/20 text-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                {isCreating ? "Deploying..." : "Create Workspace"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Join Colleague Workspace */}
          <div className="card-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-md">Join Practice</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter an active clinic invitation code to link your clinical portal instantly.
            </p>

            <form onSubmit={handleJoinWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Invitation Code
                </label>
                <input
                  type="text"
                  required
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  placeholder="e.g. CLIN-3G4852"
                  className="w-full text-sm font-semibold tracking-wider uppercase border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/20 text-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-center"
                />
              </div>

              <button
                type="submit"
                disabled={isJoining}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-lg text-sm transition shadow-sm"
              >
                {isJoining ? "Synching..." : "Join Workspace"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Multi-Tenant RBAC Security Console & Simulator */}
      <div className="card-panel p-6 border-indigo-500/10 dark:border-indigo-500/10 bg-gradient-to-tr from-slate-50 to-indigo-50/20 dark:from-slate-950/20 dark:to-indigo-950/5 mt-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Shield className="w-48 h-48 text-indigo-500" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                <Shield className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Multi-Tenant RBAC Security Console</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualize, inspect, and test JSON Web Token structures and permissions under full tenant isolation.
            </p>
          </div>

          {/* Quick Active Status badge */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 px-3 rounded-xl">
            <Cpu className="w-4 h-4 text-indigo-500 animate-pulse" />
            <div className="text-left">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Active Context</p>
              <p className="text-xs font-black text-slate-700 dark:text-indigo-400 leading-normal">
                {profile.role.toUpperCase()} @ {activeClinicId.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Console Nav Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('jwt')}
            className={cn(
              "p-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 border",
              activeTab === 'jwt'
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            )}
          >
            <Key className="w-3.5 h-3.5" />
            JWT Session Token
          </button>
          
          <button
            onClick={() => setActiveTab('db')}
            className={cn(
              "p-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 border",
              activeTab === 'db'
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            )}
          >
            <Database className="w-3.5 h-3.5" />
            Relational Join Table
          </button>

          <button
            onClick={() => setActiveTab('backend-code')}
            className={cn(
              "p-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 border",
              activeTab === 'backend-code'
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            )}
          >
            <Code className="w-3.5 h-3.5" />
            Backend Source Blueprints
          </button>
        </div>

        {/* Tab Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Interactive Tab Visualizer */}
          <div className="lg:col-span-7 space-y-4">
            {activeTab === 'jwt' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 dark:bg-slate-950/80 rounded-xl border border-slate-800 text-slate-100 font-mono text-xs overflow-x-auto relative shadow-inner">
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                    Live Decoded JWT JSON
                  </span>
                  
                  {/* Header */}
                  <div>
                    <span className="text-pink-400">// JWT HEADER (Algorithm & Token Type)</span>
                    <pre className="text-pink-500 mt-1">
{`{
  "alg": "HS256",
  "typ": "JWT"
}`}
                    </pre>
                  </div>

                  {/* Payload */}
                  <div className="mt-4 border-t border-slate-800/80 pt-4">
                    <span className="text-cyan-400">// JWT PAYLOAD (Claims Scoped dynamically to Clinic)</span>
                    <pre className="text-cyan-500 mt-1">
{`{
  "sub": "${profile.email.replace(/[@.]/g, '_')}",
  "name": "${profile.firstName} ${profile.lastName}",
  "email": "${profile.email}",
  "tenant": {
    "activeClinicId": "${activeClinicId}",
    "activeClinicName": "${profile.clinicName}",
    "role": "${profile.role}"
  },
  "iat": ${Math.floor(Date.now() / 1000)},
  "exp": ${Math.floor(Date.now() / 1000) + 3600}
}`}
                    </pre>
                  </div>

                  {/* Signature */}
                  <div className="mt-4 border-t border-slate-800/80 pt-4">
                    <span className="text-emerald-400">// JWT SIGNATURE (Signing Token key is hidden on backend)</span>
                    <pre className="text-emerald-500 mt-1">
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  <span className="text-amber-500 font-bold">process.env.JWT_SECRET_KEY</span>
)
                    </pre>
                  </div>
                </div>

                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  <p className="font-bold text-indigo-900 dark:text-indigo-400">💡 Why is this structure secure?</p>
                  <p className="leading-relaxed">
                    By baking the client's current workspace <strong className="text-slate-900 dark:text-white">activeClinicId</strong> and <strong className="text-slate-900 dark:text-white">role</strong> into the cryptographically sealed JWT, your backend can immediately enforce tenant isolation without redundant database checks. A malicious client cannot manipulate their role, because changing the raw text would invalidate the signature check.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'db' && (
              <div className="space-y-4">
                <div className="p-5 bg-white dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-6">
                  <div className="text-center pb-2">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full font-bold text-[10px] tracking-wider uppercase">
                      Composite Relation Model Graph
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Visualizing the database join tables connecting users globally to scoped roles inside multiple clinics.
                    </p>
                  </div>

                  {/* Relational Table Graph Nodes */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 relative">
                    
                    {/* User Table */}
                    <div className="flex-1 w-full bg-slate-900 text-slate-200 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2 max-w-[200px] shadow">
                      <div className="font-bold flex items-center justify-between text-indigo-400 border-b border-slate-800 pb-1.5">
                        <span>Table: Users</span>
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div className="font-mono text-[10px] space-y-1">
                        <p><span className="text-slate-400">id:</span> "usr_94a3"</p>
                        <p className="text-indigo-300 font-bold"><span className="text-slate-400">email:</span> {profile.email}</p>
                        <p><span className="text-slate-400">pass_hash:</span> "argon2$..."</p>
                      </div>
                    </div>

                    {/* Join table indicator ribbon */}
                    <div className="hidden md:block flex-shrink-0 text-slate-300 dark:text-slate-700 font-black">
                      ────►
                    </div>

                    {/* Join Table (UserClinicRoles) */}
                    <div className="flex-1 w-full bg-slate-900 text-slate-200 p-3.5 rounded-xl border-2 border-indigo-500 text-xs space-y-2 max-w-[240px] shadow-lg relative">
                      <div className="font-bold flex items-center justify-between text-indigo-400 border-b border-slate-800 pb-1.5">
                        <span>Table: TenantRoles</span>
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <div className="font-mono text-[10px] space-y-1">
                        <p className="bg-indigo-950/40 p-1 rounded border border-indigo-950 text-indigo-400 font-bold text-center">
                          PrimaryKey(userId, clinicId)
                        </p>
                        <p className="pt-1"><span className="text-slate-400">userId:</span> "usr_94a3"</p>
                        <p className="text-cyan-400 font-bold"><span className="text-slate-400">clinicId:</span> "{activeClinicId}"</p>
                        <p className="text-emerald-400 font-bold"><span className="text-slate-400">role:</span> "{profile.role.toUpperCase()}"</p>
                      </div>
                    </div>

                    <div className="hidden md:block flex-shrink-0 text-slate-300 dark:text-slate-700 font-black">
                      ◄────
                    </div>

                    {/* Clinic Table */}
                    <div className="flex-1 w-full bg-slate-900 text-slate-200 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2 max-w-[200px] shadow">
                      <div className="font-bold flex items-center justify-between text-indigo-400 border-b border-slate-800 pb-1.5">
                        <span>Table: Clinics</span>
                        <Building className="w-3.5 h-3.5" />
                      </div>
                      <div className="font-mono text-[10px] space-y-1">
                        <p className="text-cyan-400 font-bold"><span className="text-slate-400">id:</span> "{activeClinicId}"</p>
                        <p><span className="text-slate-400">name:</span> "{profile.clinicName}"</p>
                        <p><span className="text-slate-400">domain:</span> "local.saas"</p>
                      </div>
                    </div>

                  </div>

                </div>

                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  <p className="font-bold text-indigo-900 dark:text-indigo-400">🔗 How do multiple users map to clinics?</p>
                  <p className="leading-relaxed">
                    The schema implements a clean <strong className="text-slate-900 dark:text-white">Many-to-Many Relational Join table</strong>. This ensures a single clinician user can belong to 10 separate clinics, mapping securely to a unique customized role (e.g. Practitioner in Clinic A, and Clinical Nurse in Clinic B) without ever breaking database integrity or duplicating general accounts.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'backend-code' && (
              <div className="space-y-4">
                {/* Code subtabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <button
                    onClick={() => setCodeTab('prisma')}
                    className={cn(
                      "text-[10px] font-extrabold uppercase p-1.5 px-3 rounded-lg border transition",
                      codeTab === 'prisma'
                        ? "bg-slate-900 dark:bg-slate-800 text-white border-slate-800"
                        : "bg-transparent text-slate-500 border-transparent hover:text-slate-700"
                    )}
                  >
                    Prisma Schema
                  </button>
                  <button
                    onClick={() => setCodeTab('express')}
                    className={cn(
                      "text-[10px] font-extrabold uppercase p-1.5 px-3 rounded-lg border transition",
                      codeTab === 'express'
                        ? "bg-slate-900 dark:bg-slate-800 text-white border-slate-800"
                        : "bg-transparent text-slate-500 border-transparent hover:text-slate-700"
                    )}
                  >
                    Express Middleware
                  </button>
                  <button
                    onClick={() => setCodeTab('firebase')}
                    className={cn(
                      "text-[10px] font-extrabold uppercase p-1.5 px-3 rounded-lg border transition",
                      codeTab === 'firebase'
                        ? "bg-slate-900 dark:bg-slate-800 text-white border-slate-800"
                        : "bg-transparent text-slate-500 border-transparent hover:text-slate-700"
                    )}
                  >
                    Firestore Rules
                  </button>
                </div>

                <div className="p-4 bg-slate-900 dark:bg-slate-950/80 rounded-xl border border-slate-800 text-slate-100 font-mono text-xs overflow-x-auto max-h-[340px] shadow-inner relative">
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-800 text-[9px] text-slate-400 border border-slate-700">
                    Production Blueprint
                  </span>
                  
                  {codeTab === 'prisma' ? (
                    <pre className="text-indigo-400">
{`model User {
  id           String             @id @default(uuid())
  email        String             @unique
  passwordHash String
  memberships  UserClinicRole[]
}

model Clinic {
  id         String             @id @default(uuid())
  name       String
  inviteCode String             @unique
  memberships UserClinicRole[]
}

model UserClinicRole {
  userId   String
  clinicId String
  role     Role
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  clinic   Clinic @relation(fields: [clinicId], references: [id], onDelete: Cascade)

  @@id([userId, clinicId]) // Composite key secures single role per clinic
}

enum Role {
  ADMIN
  DOCTOR
  NURSE
  PHARMACIST
  RECEPTIONIST
}`}
                    </pre>
                  ) : codeTab === 'express' ? (
                    <pre className="text-cyan-400">
{`import jwt from 'jsonwebtoken';

export const requireClinicAccess = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Extract Bearer Token
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Missing token" });
      }
      const token = authHeader.split(' ')[1];

      // 2. Decode Token Context
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      req.user = decoded; // { userId: "..." }

      // 3. Extract tenant parameters from headers
      const tenantId = req.headers['x-tenant-id'];
      if (!tenantId) {
        return res.status(400).json({ error: "No X-Tenant-Id provided" });
      }

      // 4. Query the DB Join Table
      const userRoleRelation = await db.userClinicRole.findUnique({
        where: {
          userId_clinicId: { 
            userId: decoded.userId, 
            clinicId: String(tenantId) 
          }
        }
      });

      if (!userRoleRelation || !allowedRoles.includes(userRoleRelation.role)) {
        return res.status(403).json({ 
          error: "Forbidden: Access denied to tenant clinic" 
        });
      }

      // 5. Inject Context for routing controllers
      req.clinicId = String(tenantId);
      req.userRole = userRoleRelation.role;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid session token" });
    }
  };
};`}
                    </pre>
                  ) : (
                    <pre className="text-emerald-400">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }

    // Tenant Check: Fetch dynamic role mapping set inside profile document
    function getRoleInClinic(clinicId) {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.joinedClinics;
    }

    match /clinics/{clinicId} {
      allow read, write: if isAuthenticated() && 
        (getRoleInClinic(clinicId).any(m => m.id == clinicId));
      
      // Patient documents are isolated inside subcollections
      match /patients/{patientId} {
        allow read, write: if isAuthenticated() &&
          getRoleInClinic(clinicId).any(m => m.id == clinicId && 
            (m.role in ['admin', 'doctor', 'nurse', 'receptionist']));
      }

      // Prescription limits restricted only to licensed Doctors
      match /prescriptions/{prescriptionId} {
        allow read: if isAuthenticated() && 
          getRoleInClinic(clinicId).any(m => m.id == clinicId);
        allow write: if isAuthenticated() && 
          getRoleInClinic(clinicId).any(m => m.id == clinicId && 
            (m.role in ['admin', 'doctor']));
      }
    }
  }
}`}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Permissions Sandbox/Gatekeeper */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-white dark:bg-slate-950/20 rounded-2xl border border-slate-200 dark:border-slate-800/80">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Live Authorization Sandbox
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Test your <span className="underline font-bold">active workspace role ({profile.role.toUpperCase()})</span> against production-like backend endpoint route protections.
              </p>

              {/* Endpoint buttons */}
              <div className="space-y-2.5">
                
                {/* Endpoint 1: View patient files */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">GET /api/v1/patients</p>
                    <p className="text-[10px] text-indigo-500 font-bold">Allowed: Admin, Doctor, Nurse, Receptionist</p>
                  </div>
                  <button
                    onClick={() => simulateApiCall('/api/v1/patients', ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'])}
                    disabled={simulatingApi !== null}
                    className="p-1.5 px-3 rounded bg-indigo-600 hover:bg-indigo-700 text-[10px] text-white font-extrabold flex items-center gap-1.5 transition select-none disabled:opacity-40"
                  >
                    <Play className="w-3 h-3" />
                    TEST
                  </button>
                </div>

                {/* Endpoint 2: Add Medical Prescription */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">POST /api/v1/prescriptions</p>
                    <p className="text-[10px] text-rose-500 font-bold">Requires minimum role: Doctor, Admin</p>
                  </div>
                  <button
                    onClick={() => simulateApiCall('/api/v1/prescriptions', ['admin', 'doctor'])}
                    disabled={simulatingApi !== null}
                    className="p-1.5 px-3 rounded bg-indigo-600 hover:bg-indigo-700 text-[10px] text-white font-extrabold flex items-center gap-1.5 transition select-none disabled:opacity-40"
                  >
                    <Play className="w-3 h-3" />
                    TEST
                  </button>
                </div>

                {/* Endpoint 3: Pharmacy Stock */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">POST /api/v1/pharmacy/inventory</p>
                    <p className="text-[10px] text-rose-500 font-bold">Requires minimum role: Pharmacist, Admin</p>
                  </div>
                  <button
                    onClick={() => simulateApiCall('/api/v1/pharmacy/inventory', ['admin', 'pharmacist'])}
                    disabled={simulatingApi !== null}
                    className="p-1.5 px-3 rounded bg-indigo-600 hover:bg-indigo-700 text-[10px] text-white font-extrabold flex items-center gap-1.5 transition select-none disabled:opacity-40"
                  >
                    <Play className="w-3 h-3" />
                    TEST
                  </button>
                </div>

                {/* Endpoint 4: Staff Permission Modify */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">PATCH /api/v1/staff/permissions</p>
                    <p className="text-[10px] text-rose-500 font-bold">Requires strictly: System Admin</p>
                  </div>
                  <button
                    onClick={() => simulateApiCall('/api/v1/staff/permissions', ['admin'])}
                    disabled={simulatingApi !== null}
                    className="p-1.5 px-3 rounded bg-indigo-600 hover:bg-indigo-700 text-[10px] text-white font-extrabold flex items-center gap-1.5 transition select-none disabled:opacity-40"
                  >
                    <Play className="w-3 h-3" />
                    TEST
                  </button>
                </div>

              </div>
            </div>

            {/* Simulated Live Output Trace Console */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900 shadow-inner overflow-hidden font-mono text-[10px] leading-relaxed text-slate-300 min-h-[160px] relative">
              <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/40 p-1 rounded">
                <Terminal className="w-3 h-3 text-indigo-400" />
                Response Trace Log
              </span>
              
              <div className="space-y-1.5">
                {simulationLog.length === 0 ? (
                  <p className="text-slate-500 mt-2 text-center">// Select any route above to trace live authorization logic</p>
                ) : (
                  <>
                    {simulationLog.map((logLine, index) => (
                      <p key={index} className={cn(
                        logLine.startsWith("✔️") && "text-emerald-400 font-bold",
                        logLine.startsWith("❌") && "text-rose-400 font-bold"
                      )}>
                        {logLine}
                      </p>
                    ))}

                    {simulationResponse && (
                      <div className="mt-4 border-t border-slate-900/60 pt-3">
                        <span className="text-slate-400 font-bold h-3 block mb-1">JSON RESPONSE CODE: {simulationResponse.status}</span>
                        <pre className={cn(
                          "p-2.5 rounded text-[10px] overflow-auto max-h-[150px]",
                          simulationResponse.status === 200 
                            ? "bg-emerald-950/20 text-emerald-400 border border-emerald-900/20" 
                            : "bg-rose-950/20 text-rose-400 border border-rose-900/20"
                        )}>
                          {JSON.stringify(simulationResponse.payload || { error: simulationResponse.error }, null, 2)}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
