import { Bell, Check, Trash2, Calendar, FileText, FlaskConical, Pill, AlertCircle, Info, CheckCircle2, XCircle } from "lucide-react";
import { useNotifications } from "../lib/NotificationContext";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

export function Notifications() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (category: string, type: string) => {
    switch (category) {
      case 'appointment': return <Calendar className="w-4 h-4" />;
      case 'lab': return <FlaskConical className="w-4 h-4" />;
      case 'prescription': return <Pill className="w-4 h-4" />;
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
      case 'success': return "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20";
      case 'error': return "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20";
      case 'warning': return "text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20";
      default: return "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Notification Center</h2>
          <p className="text-slate-500 dark:text-slate-400">Stay updated with clinical alerts and system updates</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Mark all as read
          </button>
          <button 
            onClick={clearAll}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Clear all
          </button>
        </div>
      </div>

      <div className="card-panel overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <AnimatePresence initial={false}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <motion.div
                  key={notification.localId}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    "p-6 transition-colors group relative",
                    notification.isRead === 0 ? "bg-indigo-50/30 dark:bg-indigo-500/5" : "bg-transparent"
                  )}
                >
                  <div className="flex gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
                      getTypeColor(notification.type)
                    )}>
                      {getIcon(notification.category, notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h4 className={cn(
                          "text-base",
                          notification.isRead === 0 ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-600 dark:text-slate-400"
                        )}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-4">
                        {notification.link && (
                          <button 
                            onClick={() => navigate(notification.link!)}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider"
                          >
                            View Details
                          </button>
                        )}
                        {notification.isRead === 0 && (
                          <button 
                            onClick={() => notification.localId && markAsRead(notification.localId)}
                            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 uppercase tracking-wider"
                          >
                            Mark as read
                          </button>
                        )}
                        <button 
                          onClick={() => notification.localId && deleteNotification(notification.localId)}
                          className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                  <Bell className="w-8 h-8 text-slate-200 dark:text-slate-800" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">All caught up!</h3>
                <p className="text-slate-500 dark:text-slate-400">You don't have any notifications at the moment.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
