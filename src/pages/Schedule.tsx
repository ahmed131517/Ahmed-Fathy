import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Plus, 
  Briefcase, 
  Coffee, 
  AlertCircle,
  RefreshCw,
  ArrowLeftRight,
  ExternalLink,
  ShieldAlert,
  Eye,
  X,
  Save,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export function Schedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2)); // March 2026
  const [isSyncing, setIsSyncing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [showEditHoursModal, setShowEditHoursModal] = useState(false);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const scheduledShifts = [
    { date: "March 2", time: "09:00 - 17:00", type: "Shift", status: "Confirmed" },
    { date: "March 3", time: "09:00 - 17:00", type: "Shift", status: "Confirmed" },
    { date: "March 4", time: "09:00 - 17:00", type: "Shift", status: "Confirmed" },
    { date: "March 5", time: "On Call", type: "On Call", status: "High Priority" },
    { date: "March 9", time: "09:00 - 17:00", type: "Shift", status: "Confirmed" },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Schedule synced successfully with external calendars");
    }, 2000);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Capacity Alert Banner */}
      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">Capacity Warning: High Workload Detected</h3>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            You are currently scheduled for 164.5 hours this month. This is 92% of your recommended maximum. 
            Consider reviewing your on-call shifts for the week of March 23rd.
          </p>
        </div>
        <button 
          onClick={() => setShowReviewModal(true)}
          className="ml-auto text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
        >
          Review Shifts
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Physician Schedule</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your clinical shifts and availability</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowReviewModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" /> REVIEW
          </button>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 active:scale-95"
            title="Sync with External Calendar"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
            SYNC
          </button>
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm ml-1">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors border-r border-slate-100 dark:border-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-900 dark:text-white px-4 min-w-[130px] text-center bg-slate-50/30 dark:bg-slate-950/30 uppercase tracking-widest">
              {monthName}
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors border-l border-slate-100 dark:border-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => setShowEditHoursModal(true)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            title="Schedule Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowAddShiftModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95 ml-1"
          >
            <Plus className="w-4 h-4" /> ADD SHIFT
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:grid xl:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="xl:col-span-3 card-panel p-0 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            {days.map((day) => (
              <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-r border-slate-100 dark:border-slate-800 last:border-0">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 auto-rows-fr">
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = (i % 31) + 1;
              const isToday = i === 15;
              const hasShift = [2, 3, 4, 9, 10, 11, 15, 16, 17, 23, 24, 30].includes(i);
              const isOnCall = [5, 12, 19, 26].includes(i);
              
              return (
                <div key={i} className={cn(
                  "min-h-[100px] border-r border-b border-slate-100 dark:border-slate-800 p-2 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20 group",
                  isToday && "bg-indigo-50/30 dark:bg-indigo-500/5"
                )}>
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                      isToday ? "bg-indigo-600 text-white" : "text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400"
                    )}>
                      {dayNum}
                    </span>
                    {isOnCall && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="On Call" />
                    )}
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {hasShift && (
                      <div className="group/shift relative text-[9px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded px-1.5 py-1 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-2.5 h-2.5" />
                          09:00 - 17:00
                        </div>
                        <button 
                          onClick={() => setShowSwapModal(true)}
                          className="opacity-0 group-hover/shift:opacity-100 transition-opacity hover:text-emerald-900 dark:hover:text-emerald-200"
                          title="Request Swap"
                        >
                          <ArrowLeftRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                    {isOnCall && (
                      <div className="text-[9px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 rounded px-1.5 py-1 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" />
                        ON CALL
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="card-panel p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 mono-label">Shift Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Hours</span>
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">164.5h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 dark:text-slate-400">Night Shifts</span>
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 dark:text-slate-400">On-Call Days</span>
                <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">4</span>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-2">
                  <div className="bg-indigo-600 h-1.5 rounded-full w-[75%]"></div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">75% of monthly target reached</p>
              </div>
            </div>
          </div>

          <div className="card-panel p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 mono-label">Working Hours</h2>
            <div className="space-y-3">
              {["Mon - Thu", "Friday"].map((period, idx) => (
                <div key={period} className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{period}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{idx === 0 ? "09:00 - 17:00" : "09:00 - 13:00"}</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-[10px] font-mono">Active</span>
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-1 pt-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sat - Sun</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 italic">Off Duty</span>
                  <Coffee className="w-3 h-3 text-slate-300" />
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowEditHoursModal(true)}
              className="w-full mt-6 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Edit Default Hours
            </button>
          </div>
          <div className="card-panel p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 mono-label">External Sync</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-[10px] font-bold">G</div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Google Calendar</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold">Connected</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-bold">O</div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Outlook</span>
                </div>
                <button className="text-[10px] text-indigo-600 font-bold hover:underline">Connect</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review All Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Shift Review</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Detailed overview of all scheduled activities for {monthName}.</p>
              </div>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {scheduledShifts.map((shift, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold",
                        shift.type === "On Call" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600" : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600"
                      )}>
                        <span className="text-[10px] uppercase tracking-tighter">{shift.date.split(' ')[0]}</span>
                        <span className="text-lg leading-none">{shift.date.split(' ')[1]}</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{shift.type}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {shift.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        shift.status === "Confirmed" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600"
                      )}>{shift.status}</span>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 flex justify-between items-center">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing {scheduledShifts.length} scheduled events
              </div>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Swap Modal (Simplified) */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Request Shift Swap</h3>
              <button onClick={() => setShowSwapModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Select a colleague to propose a swap for March 16th.</p>
              {[
                { name: "Dr. Sarah Chen", dept: "Cardiology", status: "Available" },
                { name: "Dr. James Wilson", dept: "Emergency", status: "On Shift" },
                { name: "Dr. Elena Rodriguez", dept: "Pediatrics", status: "Available" }
              ].map((doc) => (
                <button key={doc.name} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                      {doc.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{doc.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">{doc.dept}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      doc.status === "Available" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}>{doc.status}</span>
                    <ArrowLeftRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowSwapModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  toast.success("Shift swap request sent to Dr. Sarah Chen");
                  setShowSwapModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Shift Modal */}
      {showAddShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Clinical Shift</h3>
              <button onClick={() => setShowAddShiftModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Shift Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                    <Briefcase className="w-4 h-4" /> Standard
                  </button>
                  <button className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-transparent bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-sm hover:border-slate-200 dark:hover:border-slate-700">
                    <AlertCircle className="w-4 h-4" /> On Call
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</label>
                  <input type="date" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue="2026-03-16" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</label>
                  <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option>Cardiology</option>
                    <option>Emergency</option>
                    <option>Pediatrics</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Time</label>
                  <input type="time" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue="09:00" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">End Time</label>
                  <input type="time" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue="17:00" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddShiftModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  toast.success("New shift added to your schedule");
                  setShowAddShiftModal(false);
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Save Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Default Hours Modal */}
      {showEditHoursModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Default Working Hours</h3>
              <button onClick={() => setShowEditHoursModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {[
                { day: "Monday", start: "09:00", end: "17:00", active: true },
                { day: "Tuesday", start: "09:00", end: "17:00", active: true },
                { day: "Wednesday", start: "09:00", end: "17:00", active: true },
                { day: "Thursday", start: "09:00", end: "17:00", active: true },
                { day: "Friday", start: "09:00", end: "13:00", active: true },
                { day: "Saturday", start: "00:00", end: "00:00", active: false },
                { day: "Sunday", start: "00:00", end: "00:00", active: false },
              ].map((item) => (
                <div key={item.day} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="flex items-center gap-3 min-w-[100px]">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      item.active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    )} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.day}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="time" disabled={!item.active} className="p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs disabled:opacity-50" defaultValue={item.start} />
                    <span className="text-slate-400">-</span>
                    <input type="time" disabled={!item.active} className="p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs disabled:opacity-50" defaultValue={item.end} />
                    <button className={cn(
                      "ml-2 p-1.5 rounded-lg transition-colors",
                      item.active ? "text-red-500 hover:bg-red-50" : "text-emerald-500 hover:bg-emerald-50"
                    )}>
                      {item.active ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowEditHoursModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  toast.success("Default working hours updated");
                  setShowEditHoursModal(false);
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
