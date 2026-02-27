import { useState } from "react";
import { X, User, Info, Sparkles } from "lucide-react";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewAppointmentModal({ isOpen, onClose }: NewAppointmentModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  if (!isOpen) return null;

  const suggestedSlots = [
    { label: "Today, 2:00 PM", date: new Date().toISOString().split('T')[0], time: "14:00" },
    { label: "Tomorrow, 10:00 AM", date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: "10:00" },
    { label: "Tomorrow, 3:30 PM", date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: "15:30" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">New Appointment</h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <form id="new-appointment-form" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">First Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Last Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Appointment Reference</label>
                <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm font-mono flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Auto-generated on save
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Schedule <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
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
                      className="px-3 py-1.5 text-xs font-medium bg-white border border-indigo-200 text-indigo-700 rounded-full hover:bg-indigo-50 transition-colors"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" 
                  />
                  <input 
                    type="time" 
                    required 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" 
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Type <span className="text-red-500">*</span></label>
                <select required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors bg-white">
                  <option value="checkup">Check-up</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="consultation">Consultation</option>
                  <option value="emergency">Emergency</option>
                  <option value="surgery">Surgery</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Assigned Doctor <span className="text-red-500">*</span></label>
                <select required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors bg-white">
                  <option value="">Select Doctor</option>
                  <option value="dr-ahmed">Dr. Ahmed Fathy</option>
                  <option value="dr-sarah">Dr. Sarah Johnson</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Notes</label>
                <textarea rows={3} placeholder="Additional instructions..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors resize-none"></textarea>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="new-appointment-form"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            onClick={(e) => {
              e.preventDefault();
              // Handle form submission logic here
              onClose();
            }}
          >
            Create Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
