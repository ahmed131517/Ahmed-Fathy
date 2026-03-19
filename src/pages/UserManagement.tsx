import { useState, useEffect } from "react";
import { db, User } from "../lib/db";
import { toast } from "sonner";
import { Plus, Trash2, Shield } from "lucide-react";
import { useUser } from "../lib/UserContext";

export function UserManagement() {
  const { hasRole } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "doctor" as "doctor" | "pharmacist" | "admin" });

  useEffect(() => {
    db.users.toArray().then(setUsers);
  }, []);

  if (!hasRole('admin')) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-slate-500">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const addUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error("Please fill in all fields");
      return;
    }
    const user: User = {
      id: crypto.randomUUID(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      lastModified: Date.now(),
      isDeleted: 0,
      isSynced: 0
    };
    await db.users.add(user);
    setUsers([...users, user]);
    setNewUser({ name: "", email: "", role: "doctor" });
    toast.success("User added");
  };

  const deleteUser = async (id: string) => {
    await db.users.where("id").equals(id).delete();
    setUsers(users.filter(u => u.id !== id));
    toast.success("User deleted");
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">User Management</h2>
      <div className="flex gap-4 bg-white p-4 rounded-lg border border-slate-200">
        <input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Name" className="p-2 border rounded" />
        <input value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="Email" className="p-2 border rounded" />
        <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className="p-2 border rounded">
          <option value="doctor">Doctor</option>
          <option value="pharmacist">Pharmacist</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={addUser} className="bg-indigo-600 text-white p-2 rounded"><Plus /></button>
      </div>
      <table className="w-full border-collapse border bg-white">
        <thead>
          <tr className="bg-slate-50">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2 capitalize">{user.role}</td>
              <td className="border p-2">
                <button onClick={() => deleteUser(user.id)} className="text-red-500"><Trash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
