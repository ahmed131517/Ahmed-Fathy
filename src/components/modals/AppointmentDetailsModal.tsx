import { X, Calendar, Clock, User, FileText, Edit, Bell, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onEdit: () => void;
  onDelete: () => void;
}

export function AppointmentDetailsModal({ isOpen, onClose, appointment, onEdit, onDelete }: AppointmentDetailsModalProps) {
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleSendReminder = () => {
    setIsSendingReminder(true);
    // Simulate API call
    setTimeout(() => {
      setIsSendingReminder(false);
      setReminderSent(true);
      setTimeout(() => setReminderSent(false), 3000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Appointment Details</h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white">{appointment.patientName}</h4>
              <span className={cn(
                "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 capitalize",
                appointment.status === "scheduled" && "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
                appointment.status === "completed" && "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
                appointment.status === "canceled" && "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20",
                appointment.status === "no-show" && "bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20"
              )}>
                {appointment.status}
              </span>
            </div>
          </div>

          <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Date</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{appointment.date}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Time</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{appointment.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Type</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{appointment.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Doctor</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{appointment.doctor}</p>
              </div>
            </div>
          </div>

          {appointment.status === 'scheduled' && (
            <div className="flex gap-3">
              <button 
                onClick={handleSendReminder}
                disabled={isSendingReminder || reminderSent}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors border",
                  reminderSent 
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <Bell className="w-4 h-4" />
                {isSendingReminder ? "Sending..." : reminderSent ? "Reminder Sent!" : "Send Reminder"}
              </button>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between rounded-b-xl">
          <button 
            type="button" 
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete Appointment"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button 
              type="button" 
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
