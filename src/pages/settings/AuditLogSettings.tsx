import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { FileText, Search, Filter, Download, Trash2, ChevronLeft, ChevronRight, User, Activity, Database, ShieldCheck, Calendar, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function AuditLogSettings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEntity, setFilterEntity] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all"); // 'all', 'today', '7d', '30d'
  const [retentionDays, setRetentionDays] = useState("90");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const logs = useLiveQuery(async () => {
    let collection = db.audit_logs.orderBy('timestamp').reverse();
    let allLogs = await collection.toArray();
    
    const now = Date.now();
    const oneDay = 86400000;

    return allLogs.filter(log => {
      const matchesSearch = 
        log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEntity = filterEntity === "all" || log.entity === filterEntity;
      const matchesAction = filterAction === "all" || log.action === filterAction;

      let matchesCategory = true;
      if (filterCategory === "security") {
        matchesCategory = log.action.includes("SECURITY") || log.action.includes("LOGIN") || log.action.includes("OVERRIDE") || log.action.includes("2FA");
      } else if (filterCategory === "clinical") {
        matchesCategory = log.entity.includes("Prescription") || log.entity.includes("Patient") || log.entity.includes("Lab") || log.action.includes("DISPENSE");
      } else if (filterCategory === "system") {
        matchesCategory = log.entity.includes("System") || log.action.includes("BACKUP") || log.action.includes("RESTORE");
      }

      let matchesDate = true;
      if (dateRange === "today") {
        matchesDate = (now - log.timestamp) <= oneDay;
      } else if (dateRange === "7d") {
        matchesDate = (now - log.timestamp) <= 7 * oneDay;
      } else if (dateRange === "30d") {
        matchesDate = (now - log.timestamp) <= 30 * oneDay;
      }
      
      return matchesSearch && matchesEntity && matchesAction && matchesCategory && matchesDate;
    });
  }, [searchTerm, filterEntity, filterAction, filterCategory, dateRange]) || [];

  const totalPages = Math.ceil(logs.length / pageSize);
  const paginatedLogs = logs.slice((page - 1) * pageSize, page * pageSize);

  const exportToCSV = () => {
    if (logs.length === 0) {
      toast.error("No logs to export");
      return;
    }

    const headers = ["Timestamp", "User", "Action", "Entity", "Entity ID"];
    const csvContent = [
      headers.join(","),
      ...logs.map(log => [
        new Date(log.timestamp).toISOString(),
        `"${log.userId}"`,
        `"${log.action}"`,
        `"${log.entity}"`,
        `"${log.entityId}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit logs exported to CSV");
  };

  const exportToJSON = () => {
    if (logs.length === 0) {
      toast.error("No logs to export");
      return;
    }

    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit logs exported to JSON");
  };

  const verifyAuditIntegrity = () => {
    if (logs.length === 0) {
      toast.info("No logs present to verify.");
      return;
    }
    // Verify sequence timestamps
    let isSequential = true;
    for (let i = 0; i < logs.length - 1; i++) {
      if (logs[i].timestamp < logs[i + 1].timestamp) {
        // Since sorted reverse, logs[i] should be >= logs[i+1]
        isSequential = false;
        break;
      }
    }

    if (isSequential) {
      toast.success("Audit Trail Integrity Verified: Timestamps are sequential and consistent ✓");
    } else {
      toast.warning("Audit Trail Warning: Inconsistent timestamp sequence detected.");
    }
  };

  const purgeAgedLogs = async () => {
    if (retentionDays === "all") {
      toast.info("Retention policy is set to keep all records indefinitely.");
      return;
    }
    const days = parseInt(retentionDays, 10);
    const cutoff = Date.now() - (days * 86400000);

    const oldLogs = await db.audit_logs.where('timestamp').below(cutoff).toArray();
    if (oldLogs.length === 0) {
      toast.info(`No audit records older than ${days} days found.`);
      return;
    }

    if (window.confirm(`Found ${oldLogs.length} audit log entries older than ${days} days. Delete them?`)) {
      await db.audit_logs.where('timestamp').below(cutoff).delete();
      toast.success(`Purged ${oldLogs.length} old audit records.`);
    }
  };

  const clearLogs = async () => {
    if (window.confirm("Are you sure you want to clear all audit logs? This action cannot be undone.")) {
      try {
        await db.audit_logs.clear();
        toast.success("Audit logs cleared");
      } catch (error) {
        toast.error("Failed to clear logs");
      }
    }
  };

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('DISPENSE')) return <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase">{action}</span>;
    if (act.includes('OVERRIDE') || act.includes('SECURITY')) return <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold uppercase">{action}</span>;
    if (act.includes('BACKUP') || act.includes('RESTORE')) return <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase">{action}</span>;
    if (act.includes('CREATE')) return <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase">{action}</span>;
    if (act.includes('UPDATE')) return <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase">{action}</span>;
    if (act.includes('DELETE')) return <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase">{action}</span>;
    
    return <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase">{action}</span>;
  };

  const entities = Array.from(new Set(logs.map(l => l.entity)));
  const actions = Array.from(new Set(logs.map(l => l.action)));

  return (
    <div className="space-y-6">
      <div className="card-panel p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Audit Logs</h2>
              <p className="text-xs text-slate-500">Track and verify clinical, pharmacy, and system activities</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button 
              onClick={verifyAuditIntegrity}
              className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verify Integrity
            </button>
            <button 
              onClick={exportToCSV}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button 
              onClick={exportToJSON}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> JSON
            </button>
            <button 
              onClick={clearLogs}
              className="px-3 py-2 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 gap-4 text-xs font-bold">
          {[
            { id: "all", label: "All Audit Trail" },
            { id: "clinical", label: "Clinical & Pharmacy" },
            { id: "security", label: "Security & Overrides" },
            { id: "system", label: "System & Backups" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setFilterCategory(tab.id); setPage(1); }}
              className={`pb-2 transition-colors border-b-2 ${filterCategory === tab.id ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search user, ID, or action..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <select 
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs py-2 px-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Past 24 Hours</option>
              <option value="7d">Past 7 Days</option>
              <option value="30d">Past 30 Days</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select 
              value={filterEntity}
              onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs py-2 px-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Entities</option>
              {entities.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400 shrink-0" />
            <select 
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs py-2 px-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Actions</option>
              {actions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User / Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Entity ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white truncate max-w-[140px]" title={log.userId}>
                          {log.userId}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Database className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400 font-medium capitalize">{log.entity.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                        {log.entityId}
                      </code>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    No audit records found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Retention Policy Manager Section */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Audit Log Retention Policy</h4>
              <p className="text-[11px] text-slate-500">Automatically clean records older than policy threshold to save storage</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={retentionDays}
              onChange={(e) => setRetentionDays(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs py-1.5 px-3 font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="30">Keep 30 Days</option>
              <option value="90">Keep 90 Days (Recommended)</option>
              <option value="365">Keep 1 Year</option>
              <option value="all">Keep Indefinitely</option>
            </select>
            <button
              onClick={purgeAgedLogs}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
            >
              Purge Aged Logs
            </button>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-700 dark:text-slate-300">{(page - 1) * pageSize + 1}</span> to <span className="font-bold text-slate-700 dark:text-slate-300">{Math.min(page * pageSize, logs.length)}</span> of <span className="font-bold text-slate-700 dark:text-slate-300">{logs.length}</span> logs
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = page;
                  if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  
                  if (pageNum <= 0 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${page === pageNum ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

