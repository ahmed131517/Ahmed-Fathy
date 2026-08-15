import { UserManagementSettings } from "./settings/UserManagementSettings";
import { useUser } from "../lib/UserContext";
import { Shield } from "lucide-react";

export function UserManagement() {
  const { profile, hasRole } = useUser();

  if (!hasRole('admin')) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-sm p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Privileges Required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            You do not have administrative credentials in workspace <strong className="text-indigo-600 dark:text-indigo-400">{profile.clinicName}</strong> to perform staff governance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <UserManagementSettings />
    </div>
  );
}
