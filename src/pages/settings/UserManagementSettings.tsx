import { useState } from "react";
import { Users, UserPlus, Shield, Edit2, Trash2, X, AlertTriangle, Mail, Phone, User } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

export function UserManagementSettings() {
  const { compactMode } = useSettings();
  const [users, setUsers] = useState([
    { id: 1, name: "Dr. Sarah Johnson", email: "sarah.j@clinic.com", role: "Admin", status: "Active", avatar: "SJ" },
    { id: 2, name: "Dr. Michael Chen", email: "m.chen@clinic.com", role: "Doctor", status: "Active", avatar: "MC" },
    { id: 3, name: "Nurse Emily Davis", email: "emily.d@clinic.com", role: "Nurse", status: "Active", avatar: "ED" },
    { id: 4, name: "James Wilson", email: "j.wilson@clinic.com", role: "Receptionist", status: "Inactive", avatar: "JW" },
  ]);

  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Doctor", status: "Active" });

  const roles = ["Admin", "Doctor", "Nurse", "Pharmacist", "Receptionist"];
  const statuses = ["Active", "Inactive"];

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const initials = newUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    const newId = Math.max(...users.map(u => u.id), 0) + 1;
    setUsers([...users, { ...newUser, id: newId, avatar: initials }]);
    setIsAddingUser(false);
    setNewUser({ name: "", email: "", role: "Doctor", status: "Active" });
    toast.success("User added successfully");
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    toast.success("User updated successfully");
  };

  const handleDeleteConfirm = () => {
    setUsers(users.filter(u => u.id !== deletingUser.id));
    setDeletingUser(null);
    toast.success("User deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">User Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage staff accounts and permissions</p>
        </div>
        <button 
          onClick={() => setIsAddingUser(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="card-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                <th className={cn("px-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider", compactMode ? "py-2 text-[10px]" : "py-4 text-xs")}>User</th>
                <th className={cn("px-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider", compactMode ? "py-2 text-[10px]" : "py-4 text-xs")}>Role</th>
                <th className={cn("px-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider", compactMode ? "py-2 text-[10px]" : "py-4 text-xs")}>Status</th>
                <th className={cn("px-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right", compactMode ? "py-2 text-[10px]" : "py-4 text-xs")}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className={cn("px-6", compactMode ? "py-2" : "py-4")}>
                    <div className="flex items-center gap-3">
                      <div className={cn("rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold", compactMode ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm")}>
                        {user.avatar}
                      </div>
                      <div>
                        <p className={cn("font-bold text-slate-900 dark:text-white", compactMode ? "text-xs" : "text-sm")}>{user.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={cn("px-6", compactMode ? "py-2" : "py-4")}>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <Shield className="w-3 h-3" /> {user.role}
                    </span>
                  </td>
                  <td className={cn("px-6", compactMode ? "py-2" : "py-4")}>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold",
                      user.status === 'Active' 
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className={cn("px-6 text-right", compactMode ? "py-2" : "py-4")}>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingUser({ ...user })}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeletingUser(user)}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New User</h3>
              <button 
                onClick={() => setIsAddingUser(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUserSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  value={newUser.name} 
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. Dr. Jane Smith"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input 
                  type="email" 
                  value={newUser.email} 
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="jane.smith@clinic.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select 
                  value={newUser.role} 
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select 
                  value={newUser.status} 
                  onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                  className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit User</h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input 
                  type="text" 
                  value={editingUser.name} 
                  disabled
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input 
                  type="email" 
                  value={editingUser.email} 
                  disabled
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select 
                  value={editingUser.role} 
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select 
                  value={editingUser.status} 
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete User</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete <strong>{deletingUser.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

