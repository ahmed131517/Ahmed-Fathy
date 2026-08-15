import { useState, useMemo } from "react";
import { 
  Bell, 
  Check, 
  Trash2, 
  Calendar, 
  FileText, 
  FlaskConical, 
  Pill, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Zap, 
  ArrowRight, 
  CheckCheck, 
  Clock, 
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { useNotifications } from "../lib/NotificationContext";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll, addNotification } = useNotifications();
  const navigate = useNavigate();

  // Component State
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");

  // Filter Categories
  const categoriesList = [
    { id: "all", label: "All Notifications", count: notifications.length },
    { id: "unread", label: "Unread", count: unreadCount },
    { id: "appointment", label: "Appointments", count: notifications.filter(n => n.category === 'appointment').length },
    { id: "lab", label: "Lab Results", count: notifications.filter(n => n.category === 'lab').length },
    { id: "prescription", label: "Prescriptions", count: notifications.filter(n => n.category === 'prescription' || n.category === 'pharmacy').length },
    { id: "system", label: "System & Alerts", count: notifications.filter(n => n.category === 'system').length }
  ];

  // Helper for Category/Type Icon
  const getIcon = (category: string, type: string) => {
    switch (category) {
      case 'appointment': return <Calendar className="w-4 h-4" />;
      case 'lab': return <FlaskConical className="w-4 h-4" />;
      case 'prescription':
      case 'pharmacy': return <Pill className="w-4 h-4" />;
      case 'patient': return <FileText className="w-4 h-4" />;
      default:
        switch (type) {
          case 'success': return <CheckCircle2 className="w-4 h-4" />;
          case 'error': return <XCircle className="w-4 h-4" />;
          case 'warning': return <AlertCircle className="w-4 h-4" />;
          default: return <Info className="w-4 h-4" />;
        }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800/40";
      case 'error': return "text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-800/40";
      case 'warning': return "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800/40";
      default: return "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-800/40";
    }
  };

  // Filter Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Category Tab Filter
      if (activeTab === 'unread' && n.isRead !== 0) return false;
      if (activeTab === 'appointment' && n.category !== 'appointment') return false;
      if (activeTab === 'lab' && n.category !== 'lab') return false;
      if (activeTab === 'prescription' && (n.category !== 'prescription' && n.category !== 'pharmacy')) return false;
      if (activeTab === 'system' && n.category !== 'system' && n.category !== 'patient') return false;

      // Type dropdown filter
      if (selectedTypeFilter !== 'all' && n.type !== selectedTypeFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesMsg = n.message.toLowerCase().includes(query);
        const matchesCategory = n.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMsg && !matchesCategory) return false;
      }

      return true;
    });
  }, [notifications, activeTab, selectedTypeFilter, searchQuery]);

  // Simulation Trigger for testing notification engine
  const handleSimulateAlert = async (type: 'lab' | 'appointment' | 'prescription' | 'system') => {
    switch (type) {
      case 'lab':
        await addNotification({
          title: "Critical Lab Result: Potassium Alert",
          message: "Patient Marcus Vance (P-8821) lab result shows Serum K+ 5.9 mEq/L (High Critical). Immediate physician review required.",
          type: "warning",
          category: "lab",
          link: "/patients"
        });
        toast.warning("Simulated Critical Lab Alert created.");
        break;
      case 'appointment':
        await addNotification({
          title: "New Telehealth Consultation Scheduled",
          message: "Dr. Sarah Johnson has a new video consultation with Eleanor Vance at 14:30 today.",
          type: "info",
          category: "appointment",
          link: "/appointments"
        });
        toast.info("Simulated Appointment Notification created.");
        break;
      case 'prescription':
        await addNotification({
          title: "Pharmacy Reorder Threshold Met",
          message: "Amoxicillin 500mg Capsules stock has fallen below safety buffer (18 units remaining).",
          type: "error",
          category: "prescription",
          link: "/pharmacy"
        });
        toast.error("Simulated Stock Alert created.");
        break;
      case 'system':
        await addNotification({
          title: "Cloud Database Backup Completed",
          message: "Daily encrypted point-in-time snapshot was generated successfully and verified.",
          type: "success",
          category: "system",
          link: "/settings/system"
        });
        toast.success("Simulated System Notification created.");
        break;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
              <Bell className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinical Alerting Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Notification Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time notifications, critical patient lab flags, pharmacy low stock alerts, and appointment reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" /> Mark All as Read ({unreadCount})
            </button>
          )}

          {notifications.length > 0 && (
            <button 
              onClick={clearAll}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Simulator Test Bar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Test Real-Time Alert Engine:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => handleSimulateAlert('lab')}
            className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 rounded-lg text-[11px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition cursor-pointer"
          >
            + Lab Flag
          </button>
          <button 
            onClick={() => handleSimulateAlert('appointment')}
            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 rounded-lg text-[11px] font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer"
          >
            + Appointment
          </button>
          <button 
            onClick={() => handleSimulateAlert('prescription')}
            className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-lg text-[11px] font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer"
          >
            + Pharmacy Stock
          </button>
          <button 
            onClick={() => handleSimulateAlert('system')}
            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-lg text-[11px] font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
          >
            + System Backup
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        {categoriesList.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <span>{tab.label}</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-extrabold min-w-[18px] text-center",
              activeTab === tab.id
                ? "bg-white/20 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Severity Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search notification title or clinical details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="w-full sm:w-44">
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Alert Severity</option>
            <option value="info">Info / Normal</option>
            <option value="warning">Warning / Critical</option>
            <option value="error">Error / Urgent</option>
            <option value="success">Success</option>
          </select>
        </div>
      </div>

      {/* Main Notifications List Container */}
      <div className="card-panel overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <AnimatePresence initial={false}>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => {
                const isUnread = notification.isRead === 0;

                return (
                  <motion.div
                    key={notification.localId}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "p-5 transition-colors group relative",
                      isUnread ? "bg-indigo-50/40 dark:bg-indigo-950/20" : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Category Icon Badge */}
                      <div className={cn(
                        "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs",
                        getTypeColor(notification.type)
                      )}>
                        {getIcon(notification.category, notification.type)}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={cn(
                              "text-sm leading-snug",
                              isUnread ? "font-extrabold text-slate-900 dark:text-white" : "font-semibold text-slate-700 dark:text-slate-300"
                            )}>
                              {notification.title}
                            </h4>

                            {isUnread && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white uppercase tracking-wider">
                                New
                              </span>
                            )}

                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase">
                              {notification.category}
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {new Date(notification.createdAt).toLocaleString(undefined, {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                          {notification.message}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                          {notification.link && (
                            <button 
                              onClick={() => navigate(notification.link!)}
                              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Associated Record</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {isUnread && (
                            <button 
                              onClick={() => notification.localId && markAsRead(notification.localId)}
                              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Mark as Read
                            </button>
                          )}

                          <button 
                            onClick={() => notification.localId && deleteNotification(notification.localId)}
                            className="text-xs font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 ml-auto flex items-center gap-1 cursor-pointer transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900/60 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No notifications match active filter</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try switching category tabs or reset search filters to view older clinical logs.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
