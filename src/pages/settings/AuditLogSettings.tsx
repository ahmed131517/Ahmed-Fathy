import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { FileText } from "lucide-react";

export function AuditLogSettings() {
  const logs = useLiveQuery(() => db.audit_logs.orderBy('timestamp').reverse().toArray()) || [];

  return (
    <div className="space-y-6">
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Audit Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Entity ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{log.userId}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log.action}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log.entity}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log.entityId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
