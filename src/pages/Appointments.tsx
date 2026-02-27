import { useState } from "react";
import { Plus, Search, Filter, PieChart, List, Calendar as CalendarIcon, Clock, User, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewAppointmentModal } from "@/components/modals/NewAppointmentModal";

const mockAppointments = [
  { id: 1, patient: "John Doe", time: "09:00 AM", dayIndex: 0, type: "Check-up", status: "scheduled", doctor: "Dr. Ahmed Fathy" },
  { id: 2, patient: "Jane Smith", time: "10:00 AM", dayIndex: 1, type: "Follow-up", status: "completed", doctor: "Dr. Ahmed Fathy" },
  { id: 3, patient: "Robert Johnson", time: "11:00 AM", dayIndex: 2, type: "Consultation", status: "scheduled", doctor: "Dr. Ahmed Fathy" },
  { id: 4, patient: "Emily Davis", time: "02:00 PM", dayIndex: 2, type: "Emergency", status: "canceled", doctor: "Dr. Ahmed Fathy" },
];

export function Appointments() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const filteredAppointments = mockAppointments.filter(
    (app) => statusFilter === "all" || app.status === statusFilter
  );

  return (
    <>
      <div className="flex flex-col md:flex-row h-full gap-6">
        {/* Left Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0 space-y-6">
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>New Appointment</span>
          </button>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-800 font-semibold pb-2 border-b border-slate-100">
              <Filter className="w-4 h-4 text-indigo-500" />
              <h3>Filters</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Search Patient</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Name or ID..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Doctor</label>
                <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white">
                  <option value="all">All Doctors</option>
                  <option value="dr-ahmed">Dr. Ahmed Fathy</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 hidden md:block">
            <div className="flex items-center space-x-2 text-slate-800 font-semibold pb-2 border-b border-slate-100">
              <PieChart className="w-4 h-4 text-indigo-500" />
              <h3>Quick Stats</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Total</p>
                <p className="text-xl font-bold text-slate-800 mt-1">24</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                <p className="text-xs text-indigo-600 font-medium">Today</p>
                <p className="text-xl font-bold text-indigo-900 mt-1">8</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-xl border border-indigo-100 shadow-sm space-y-4 hidden md:block">
            <div className="flex items-center space-x-2 text-indigo-900 font-semibold pb-2 border-b border-indigo-100/50">
              <CalendarIcon className="w-4 h-4 text-indigo-500" />
              <h3>Suggested Follow-ups</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">Sarah Connor</p>
                <p className="text-xs text-slate-500 mt-0.5">Post-op checkup due (2 weeks)</p>
                <button 
                  onClick={() => setIsNewModalOpen(true)}
                  className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Schedule Now
                </button>
              </div>
              <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">Mike Ross</p>
                <p className="text-xs text-slate-500 mt-0.5">Annual physical overdue</p>
                <button 
                  onClick={() => setIsNewModalOpen(true)}
                  className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Schedule Now
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center p-2 border-b border-slate-200 bg-slate-50/50 justify-between gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setView("list")}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                  view === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <List className="w-4 h-4" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setView("calendar")}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                  view === "calendar" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Calendar</span>
              </button>
            </div>

            {view === "list" && (
              <div className="flex items-center gap-2 px-2">
                {['all', 'scheduled', 'completed', 'canceled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors",
                      statusFilter === status
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {view === "list" ? (
              <div className="space-y-3">
                {filteredAppointments.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all bg-white group cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{app.patient}</h4>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-slate-500">
                          <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {app.time}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{app.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1.5",
                        app.status === "scheduled" && "bg-blue-50 text-blue-700 border border-blue-200",
                        app.status === "completed" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        app.status === "canceled" && "bg-red-50 text-red-700 border border-red-200"
                      )}>
                        {app.status === "scheduled" && <Clock className="w-3 h-3" />}
                        {app.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                        {app.status === "canceled" && <XCircle className="w-3 h-3" />}
                        <span className="capitalize">{app.status}</span>
                      </span>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        {app.status === 'scheduled' && (
                          <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Mark Completed">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {app.status === 'scheduled' && (
                          <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Cancel">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredAppointments.length === 0 && (
                  <div className="text-center py-16 px-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                      <CalendarIcon className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">No appointments found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">We couldn't find any appointments matching your current filters. Try adjusting your search or create a new appointment.</p>
                    <button 
                      onClick={() => {
                        setStatusFilter('all');
                      }}
                      className="text-indigo-600 font-medium hover:text-indigo-700 text-sm"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
                  <div className="p-3 border-r border-slate-200 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Time</div>
                  {['Mon 23', 'Tue 24', 'Wed 25', 'Thu 26', 'Fri 27', 'Sat 28', 'Sun 1'].map(day => (
                    <div key={day} className="p-3 border-r border-slate-200 last:border-r-0 text-center text-sm font-medium text-slate-700">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto">
                  {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map(time => (
                    <div key={time} className="grid grid-cols-8 border-b border-slate-100 last:border-b-0 min-h-[80px]">
                      <div className="p-3 border-r border-slate-100 text-center text-xs font-medium text-slate-500 bg-slate-50/50 flex items-center justify-center">
                        {time}
                      </div>
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                        const apptsInSlot = filteredAppointments.filter(app => app.dayIndex === dayIndex && app.time === time);
                        
                        return (
                          <div key={dayIndex} className="p-1.5 border-r border-slate-100 last:border-r-0 relative hover:bg-slate-50/50 transition-colors group">
                            {apptsInSlot.map(appt => (
                              <div key={appt.id} className={cn(
                                "p-2 rounded-lg text-xs border mb-1 last:mb-0 cursor-pointer hover:shadow-sm transition-shadow",
                                appt.status === "scheduled" && "bg-blue-50 text-blue-700 border-blue-200",
                                appt.status === "completed" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                appt.status === "canceled" && "bg-red-50 text-red-700 border-red-200"
                              )}>
                                <div className="font-semibold truncate">{appt.patient}</div>
                                <div className="truncate opacity-80 mt-0.5">{appt.type}</div>
                              </div>
                            ))}
                            {apptsInSlot.length === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => setIsNewModalOpen(true)}
                                  className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <NewAppointmentModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
      />
    </>
  );
}
