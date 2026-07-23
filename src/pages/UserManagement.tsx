import { useState, useEffect } from "react";
import { db, User } from "../lib/db";
import { toast } from "sonner";
import { Plus, Trash2, Shield, Mail, Users, UserPlus, Briefcase, Building, ChevronRight } from "lucide-react";
import { useUser } from "../lib/UserContext";
import { cn } from "../lib/utils";

export function UserManagement() {
  const { profile, hasRole } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ 
    name: "", 
    email: "", 
    role: "doctor" as "doctor" | "nurse" | "pharmacist" | "receptionist" | "admin" 
  });

  useEffect(() => {
    db.users.toArray().then(allUsers => {
      // Filter users by active workspace context to maintain strict isolation
      const currentWorkspaceUsers = allUsers.filter(u => !u.clinicId || u.clinicId === profile.clinicId);
      setUsers(currentWorkspaceUsers);
    });
  }, [profile.clinicId]);

  if (!hasRole('admin')) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-sm p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-bounce">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Workspace Forbidden</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            You do not have administrative credentials in outer workspace <strong className="text-indigo-600">{profile.clinicName}</strong> to perform modifications here.
          </p>
        </div>
      </div>
    );
  }

  const addUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error("Please fill in all fields with valid information");
      return;
    }
    
    const user: User = {
      id: crypto.randomUUID(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      clinicId: profile.clinicId, // Enforcing multi-tenant allocation
      lastModified: Date.now(),
      isDeleted: 0,
      isSynced: 0
    };

    await db.users.add(user);
    setUsers([...users, user]);
    setNewUser({ name: "", email: "", role: "doctor" });
    toast.success(`Authorized: New account configured with workspace role '${user.role.toUpperCase()}'`);
  };

  const deleteUser = async (id: string | undefined) => {
    if (!id) return;
    await db.users.where("id").equals(id).delete();
    setUsers(users.filter(u => u.id !== id));
    toast.success("User access deleted from active workspace");
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400';
      case 'doctor':
        return 'bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400';
      case 'nurse':
        return 'bg-teal-50 border border-teal-200 text-teal-700 dark:bg-teal-950/20 dark:border-teal-900/30 dark:text-teal-400';
      case 'pharmacist':
        return 'bg-purple-50 border border-purple-200 text-purple-700 dark:bg-purple-950/20 dark:border-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-950/20 dark:border-slate-900/30 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6 md:p-8 animate-fade-in">
      
      {/* Header section with active tenant context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-900/30 dark:text-indigo-400">
              <Building className="w-4 h-4" />
            </span>
            <span className="text-xs font-black tracking-widest uppercase text-slate-400 leading-none">
              Tenant Administrator Pane
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            User Workspace Governance
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Provision, manage, and configure personnel access policies strictly isolated inside <strong className="text-indigo-600 dark:text-indigo-400">{profile.clinicName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2.5 px-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 self-start md:self-center">
          <Users className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Active Accounts: <strong className="text-indigo-600">{users.length}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Create and map new User */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-2">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Configure User Permissions</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">User Full Name</label>
              <input 
                type="text"
                value={newUser.name} 
                onChange={e => setNewUser({...newUser, name: e.target.value})} 
                placeholder="e.g. Dr. Adam Vance" 
                className="w-full text-sm bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 rounded-xl p-2.5 px-3 text-slate-700 dark:text-slate-300 font-bold outline-none focus:ring-1 focus:ring-indigo-500" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">User Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email"
                  value={newUser.email} 
                  onChange={e => setNewUser({...newUser, email: e.target.value})} 
                  placeholder="vance@privateclinic.saas" 
                  className="w-full text-sm bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 rounded-xl p-2.5 pl-10 text-slate-700 dark:text-slate-300 font-bold outline-none focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">Tenant Scoped Role</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </span>
                <select 
                  value={newUser.role} 
                  onChange={e => setNewUser({...newUser, role: e.target.value as any})} 
                  className="w-full text-sm bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 rounded-xl p-2.5 pl-10 text-slate-700 dark:text-slate-300 font-bold outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="admin">System Admin</option>
                  <option value="doctor">Practitioner (Doctor)</option>
                  <option value="nurse">Clinical Nurse</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>
            </div>

            <button 
              onClick={addUser} 
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm p-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Provision Account
            </button>
          </div>
        </div>

        {/* Right column: Workspace Personnel accounts list */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-indigo-50/10 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Isolated Workspace Members
            </h3>
            
            <span className="text-[10px] bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded p-1 text-slate-400 uppercase tracking-widest font-black">
              SECURED (X-Tenant-Id)
            </span>
          </div>

          {users.length === 0 ? (
            <div className="p-12 text-center">
              <span className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5 text-slate-400" />
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">No clinical users provisioned</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Use the provisioning panel to add staff to this specific workspace.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80">
                    <th className="p-4 text-[10px] text-slate-400 uppercase tracking-widest font-black">Member Profile</th>
                    <th className="p-4 text-[10px] text-slate-400 uppercase tracking-widest font-black">Role Mapping</th>
                    <th className="p-4 text-[10px] text-slate-400 uppercase tracking-widest font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/65">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-black text-xs rounded-xl flex items-center justify-center border border-slate-200/50 dark:border-slate-800">
                            {user.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-extrabold text-slate-950 dark:text-white leading-tight">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-xl text-[10px] font-black tracking-widest uppercase",
                          getRoleBadgeClass(user.role)
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => deleteUser(user.id)} 
                          className="p-1 px-2.5 hover:bg-rose-50 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer"
                          title="Revoke active tenant session mapping"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

