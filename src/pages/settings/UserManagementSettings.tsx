import { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle, 
  Mail, 
  Phone, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Building, 
  ChevronDown, 
  ChevronUp, 
  Briefcase, 
  ShieldCheck, 
  Stethoscope, 
  Activity, 
  RefreshCw 
} from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, User } from "../../lib/db";
import { useUser } from "../../lib/UserContext";
import { useSettings } from "../../lib/SettingsContext";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function UserManagementSettings() {
  const { profile } = useUser();
  const { compactMode } = useSettings();
  const navigate = useNavigate();

  // Reactive IndexedDB Users
  const rawUsers = useLiveQuery(() => db.users.where('isDeleted').equals(0).toArray()) || [];

  // Filter users by current tenant clinic
  const users = useMemo(() => {
    if (!rawUsers || rawUsers.length === 0) return [];
    return rawUsers.filter(u => !u.clinicId || u.clinicId === profile.clinicId);
  }, [rawUsers, profile.clinicId]);

  // Seed default staff members if database is empty for this workspace
  useEffect(() => {
    async function seedInitialStaff() {
      const count = await db.users.where('isDeleted').equals(0).count();
      if (count === 0) {
        const defaultStaff: User[] = [
          {
            id: crypto.randomUUID(),
            name: "Dr. Sarah Johnson",
            email: "sarah.j@clinic.com",
            role: "admin",
            phone: "+1 (555) 234-5678",
            department: "Executive & Cardiology",
            status: "Active",
            clinicId: profile.clinicId || "clinic_a",
            lastModified: Date.now(),
            isDeleted: 0,
            isSynced: 0
          },
          {
            id: crypto.randomUUID(),
            name: "Dr. Michael Chen",
            email: "m.chen@clinic.com",
            role: "doctor",
            phone: "+1 (555) 876-5432",
            department: "General Practice",
            status: "Active",
            clinicId: profile.clinicId || "clinic_a",
            lastModified: Date.now(),
            isDeleted: 0,
            isSynced: 0
          },
          {
            id: crypto.randomUUID(),
            name: "Nurse Emily Davis",
            email: "emily.d@clinic.com",
            role: "nurse",
            phone: "+1 (555) 345-6789",
            department: "Outpatient & Triage",
            status: "Active",
            clinicId: profile.clinicId || "clinic_a",
            lastModified: Date.now(),
            isDeleted: 0,
            isSynced: 0
          },
          {
            id: crypto.randomUUID(),
            name: "David Ross, PharmD",
            email: "d.ross@clinic.com",
            role: "pharmacist",
            phone: "+1 (555) 456-7890",
            department: "Clinical Pharmacy",
            status: "Active",
            clinicId: profile.clinicId || "clinic_a",
            lastModified: Date.now(),
            isDeleted: 0,
            isSynced: 0
          },
          {
            id: crypto.randomUUID(),
            name: "James Wilson",
            email: "j.wilson@clinic.com",
            role: "receptionist",
            phone: "+1 (555) 987-6543",
            department: "Front Desk & Scheduling",
            status: "Inactive",
            clinicId: profile.clinicId || "clinic_a",
            lastModified: Date.now(),
            isDeleted: 0,
            isSynced: 0
          }
        ];
        await db.users.bulkAdd(defaultStaff);
      }
    }
    seedInitialStaff();
  }, [profile.clinicId]);

  // Local Component State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [showRoleMatrix, setShowRoleMatrix] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "doctor" as User['role'],
    phone: "",
    department: "",
    status: "Active"
  });

  const rolesList = [
    { id: "admin", label: "System Admin", badge: "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800" },
    { id: "doctor", label: "Doctor (Practitioner)", badge: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800" },
    { id: "nurse", label: "Clinical Nurse", badge: "bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-800" },
    { id: "pharmacist", label: "Pharmacist", badge: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800" },
    { id: "receptionist", label: "Receptionist", badge: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800" },
  ];

  // Search & Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query) ||
        (user.department && user.department.toLowerCase().includes(query)) ||
        (user.phone && user.phone.includes(query));

      const matchesRole = selectedRoleFilter === "all" || user.role === selectedRoleFilter;
      const userStatus = user.status || "Active";
      const matchesStatus = selectedStatusFilter === "all" || userStatus === selectedStatusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRoleFilter, selectedStatusFilter]);

  // Quick Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => (u.status || "Active") === "Active").length;
    const doctors = users.filter(u => u.role === "doctor" && (u.status || "Active") === "Active").length;
    const nurses = users.filter(u => u.role === "nurse" && (u.status || "Active") === "Active").length;
    const support = users.filter(u => ["pharmacist", "receptionist", "admin"].includes(u.role) && (u.status || "Active") === "Active").length;
    return { total, active, doctors, nurses, support };
  }, [users]);

  // Handlers
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast.error("Name and Email are required fields.");
      return;
    }

    try {
      const userToCreate: User = {
        id: crypto.randomUUID(),
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        role: newUser.role,
        phone: newUser.phone.trim() || "+1 (555) 000-0000",
        department: newUser.department.trim() || "General Medical",
        status: newUser.status,
        clinicId: profile.clinicId,
        lastModified: Date.now(),
        isDeleted: 0,
        isSynced: 0
      };

      await db.users.add(userToCreate);
      setIsAddingUser(false);
      setNewUser({ name: "", email: "", role: "doctor", phone: "", department: "", status: "Active" });
      toast.success(`Staff member "${userToCreate.name}" added successfully.`);
    } catch (err) {
      toast.error("Failed to add user. Please check inputs.");
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.id) return;

    try {
      await db.users.where("id").equals(editingUser.id).modify({
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        phone: editingUser.phone,
        department: editingUser.department,
        status: editingUser.status || "Active",
        lastModified: Date.now(),
        isSynced: 0
      });

      setEditingUser(null);
      toast.success(`Staff record for ${editingUser.name} updated.`);
    } catch (err) {
      toast.error("Failed to update staff record.");
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (!user.id) return;
    const currentStatus = user.status || "Active";
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    
    await db.users.where("id").equals(user.id).modify({
      status: newStatus,
      lastModified: Date.now(),
      isSynced: 0
    });

    toast.info(`Status for ${user.name} changed to ${newStatus}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser || !deletingUser.id) return;

    try {
      await db.users.where("id").equals(deletingUser.id).modify({
        isDeleted: 1,
        lastModified: Date.now(),
        isSynced: 0
      });
      setDeletingUser(null);
      toast.success(`Access for ${deletingUser.name} revoked.`);
    } catch (err) {
      toast.error("Failed to revoke staff access.");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-900/40';
      case 'doctor':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/40';
      case 'nurse':
        return 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 border-teal-200 dark:border-teal-900/40';
      case 'pharmacist':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-900/40';
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/40';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Provisioning Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/40 dark:text-indigo-400">
              <Building className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Workspace Personnel
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Staff & User Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure personnel accounts, roles, departments, and workspace access inside <strong className="text-indigo-600 dark:text-indigo-400">{profile.clinicName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRoleMatrix(!showRoleMatrix)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>Role Permissions Matrix</span>
            {showRoleMatrix ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button 
            onClick={() => setIsAddingUser(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Add Staff Member
          </button>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Staff</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Doctors</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{stats.doctors}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clinical Nurses</p>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">{stats.nurses}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Support & Admin</p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{stats.support}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Role Permissions Matrix Collapsible Panel */}
      {showRoleMatrix && (
        <div className="p-5 bg-gradient-to-r from-indigo-900/10 via-slate-900/10 to-indigo-900/10 dark:from-indigo-950/40 dark:to-slate-900/60 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-800/40 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clinical Role Access Boundaries</h3>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-500 font-bold">Role Matrix</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-rose-600 dark:text-rose-400 block">System Admin</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Full workspace control, staff provisioning, security settings, database backup & audit logs.</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-blue-600 dark:text-blue-400 block">Doctor (Practitioner)</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Patient EMR access, active encounters, SOAP notes, lab orders, prescriptions & AI clinical assistant.</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-teal-600 dark:text-teal-400 block">Clinical Nurse</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Patient intake, vital signs logging, triage assessments, appointment management & shift handover.</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-purple-600 dark:text-purple-400 block">Pharmacist</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Pharmacy inventory, prescription verification, drug dispensing, drug interaction checks.</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-amber-600 dark:text-amber-400 block">Receptionist</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Front desk scheduling, patient registration, check-in queue management & contact phone verification.</p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, email, department, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-44">
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Roles ({users.length})</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="receptionist">Receptionist</option>
            </select>
          </div>

          <div className="relative flex-1 sm:w-36">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Staff Roster Table */}
      <div className="card-panel overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                <th className={cn("px-6 font-extrabold text-slate-400 uppercase tracking-wider", compactMode ? "py-2 text-[10px]" : "py-3 text-xs")}>Staff Member</th>
                <th className={cn("px-6 font-extrabold text-slate-400 uppercase tracking-wider", compactMode ? "py-2 text-[10px]" : "py-3 text-xs")}>Role</th>
                <th className={cn("px-6 font-extrabold text-slate-400 uppercase tracking-wider", compactMode ? "py-2 text-[10px]" : "py-3 text-xs")}>Department & Contact</th>
                <th className={cn("px-6 font-extrabold text-slate-400 uppercase tracking-wider", compactMode ? "py-2 text-[10px]" : "py-3 text-xs")}>Status</th>
                <th className={cn("px-6 font-extrabold text-slate-400 uppercase tracking-wider text-right", compactMode ? "py-2 text-[10px]" : "py-3 text-xs")}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No staff members found matching search criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the role/status filter or add a new personnel account.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const initials = user.name
                    ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                    : "ST";
                  const isUserActive = (user.status || "Active") === "Active";

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className={cn("px-6", compactMode ? "py-2.5" : "py-3.5")}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "rounded-xl font-black flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-800 shadow-xs",
                            isUserActive 
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400" 
                              : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
                            compactMode ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
                          )}>
                            {initials}
                          </div>
                          <div>
                            <p className={cn("font-bold text-slate-900 dark:text-white leading-snug", compactMode ? "text-xs" : "text-sm")}>
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className={cn("px-6", compactMode ? "py-2.5" : "py-3.5")}>
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider",
                          getRoleBadge(user.role)
                        )}>
                          <Shield className="w-3 h-3" /> {user.role}
                        </span>
                      </td>

                      <td className={cn("px-6", compactMode ? "py-2.5" : "py-3.5")}>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {user.department || "General Practice"}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {user.phone || "No phone listed"}
                          </p>
                        </div>
                      </td>

                      <td className={cn("px-6", compactMode ? "py-2.5" : "py-3.5")}>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-transform hover:scale-105",
                            isUserActive
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                          )}
                          title="Click to toggle Active/Inactive state"
                        >
                          {isUserActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      <td className={cn("px-6 text-right", compactMode ? "py-2.5" : "py-3.5")}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate('/staff-communication')}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Send Internal Staff Message"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={() => setEditingUser({ ...user })}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Edit Staff Member"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={() => setDeletingUser(user)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Staff Member</h3>
              </div>
              <button 
                onClick={() => setIsAddingUser(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  value={newUser.name} 
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. Dr. Jane Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="email" 
                    value={newUser.email} 
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-2.5 pl-9 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="jane.smith@clinic.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Role</label>
                  <select 
                    value={newUser.role} 
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
                    className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    {rolesList.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Status</label>
                  <select 
                    value={newUser.status} 
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                    className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Department</label>
                <input 
                  type="text" 
                  value={newUser.department} 
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. Cardiology & ICU"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text" 
                    value={newUser.phone} 
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full p-2.5 pl-9 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm cursor-pointer"
                >
                  Save & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Staff Record</h3>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editingUser.name} 
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={editingUser.email} 
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Role</label>
                  <select 
                    value={editingUser.role} 
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as User['role'] })}
                    className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    {rolesList.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Status</label>
                  <select 
                    value={editingUser.status || "Active"} 
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Department</label>
                <input 
                  type="text" 
                  value={editingUser.department || ""} 
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Contact Phone</label>
                <input 
                  type="text" 
                  value={editingUser.phone || ""} 
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Revoke Staff Access</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Are you sure you want to revoke workspace access for <strong>{deletingUser.name}</strong>? They will no longer be able to access clinic records.
              </p>
              <div className="flex justify-center gap-2">
                <button 
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition shadow-sm cursor-pointer"
                >
                  Revoke Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
