import { useState } from "react";
import { X, User, Info, Sparkles, Repeat, Bell } from "lucide-react";
import { db } from "@/lib/db";
import { toast } from "sonner";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewAppointmentModal({ isOpen, onClose }: NewAppointmentModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("checkup");
  const [doctor, setDoctor] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [sendReminders, setSendReminders] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !date || !time || !type || !doctor) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await db.appointments.add({
        patientName: `${firstName} ${lastName}`,
        date,
        time: formatTime(time),
        type: formatType(type),
        status: "scheduled",
        doctor: doctor === "dr-ahmed" ? "Dr. Ahmed Fathy" : "Dr. Sarah Johnson",
        lastModified: Date.now(),
        isDeleted: 0,
        isSynced: 0
      });
      toast.success("Appointment scheduled successfully");
      onClose();
    } catch (error) {
      console.error("Failed to create appointment:", error);
      toast.error("Failed to schedule appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (t: string) => {
    const [hours, minutes] = t.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const formatType = (t: string) => {
    return t.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
  };

  const suggestedSlots = [
    { label: "Today, 2:00 PM", date: new Date().toISOString().split('T')[0], time: "14:00" },
    { label: "Tomorrow, 10:00 AM", date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: "10:00" },
    { label: "Tomorrow, 3:30 PM", date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: "15:30" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">New Appointment</h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <form id="new-appointment-form" className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" 
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Appointment Reference</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 text-sm font-mono flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Auto-generated on save
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Schedule <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Suggested Slots</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggestedSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setDate(slot.date);
                        setTime(slot.time);
                      }}
                      className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="date" 
                    required 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" 
                  />
                  <input 
                    type="time" 
                    required 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" 
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type <span className="text-red-500">*</span></label>
                <select 
                  required 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                >
                  <option value="checkup" className="dark:bg-slate-900">Check-up</option>
                  <option value="follow-up" className="dark:bg-slate-900">Follow-up</option>
                  <option value="consultation" className="dark:bg-slate-900">Consultation</option>
                  <option value="emergency" className="dark:bg-slate-900">Emergency</option>
                  <option value="surgery" className="dark:bg-slate-900">Surgery</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assigned Doctor <span className="text-red-500">*</span></label>
                <select 
                  required 
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                >
                  <option value="" className="dark:bg-slate-900">Select Doctor</option>
                  <option value="dr-ahmed" className="dark:bg-slate-900">Dr. Ahmed Fathy</option>
                  <option value="dr-sarah" className="dark:bg-slate-900">Dr. Sarah Johnson</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
                <textarea 
                  rows={3} 
                  placeholder="Additional instructions..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors resize-none"
                ></textarea>
              </div>

              <div className="space-y-4 md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Repeat className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white">Recurring Appointment</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Schedule this appointment to repeat</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {isRecurring && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50/50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20 animate-in fade-in">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Frequency</label>
                      <select className="w-full px-3 py-2 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors">
                        <option value="weekly" className="dark:bg-slate-900">Weekly</option>
                        <option value="biweekly" className="dark:bg-slate-900">Bi-weekly</option>
                        <option value="monthly" className="dark:bg-slate-900">Monthly</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Date</label>
                      <input type="date" className="w-full px-3 py-2 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white">Automated Reminders</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Send SMS/Email reminders to patient</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={sendReminders} onChange={(e) => setSendReminders(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-3 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="new-appointment-form"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}
