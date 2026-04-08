import { useState, useMemo, useEffect } from "react";
import * as React from "react";
import { Plus, Search, Filter, PieChart, List, Calendar as CalendarIcon, Clock, User, CheckCircle2, XCircle, ChevronLeft, ChevronRight, AlertTriangle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewAppointmentModal } from "@/components/modals/NewAppointmentModal";
import { AppointmentDetailsModal } from "@/components/modals/AppointmentDetailsModal";
import { useSettings } from "@/lib/SettingsContext";
import { useTranslation } from "@/lib/i18n";
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

const initialAppointments = [
  { patientName: "John Doe", time: "09:00 AM", date: new Date().toISOString().split('T')[0], type: "Check-up", status: "scheduled", doctor: "Dr. Ahmed Fathy" },
  { patientName: "Jane Smith", time: "10:00 AM", date: new Date(Date.now() + 86400000).toISOString().split('T')[0], type: "Follow-up", status: "completed", doctor: "Dr. Ahmed Fathy" },
  { patientName: "Robert Johnson", time: "11:00 AM", date: new Date(Date.now() + 172800000).toISOString().split('T')[0], type: "Consultation", status: "scheduled", doctor: "Dr. Ahmed Fathy" },
  { patientName: "Emily Davis", time: "02:00 PM", date: new Date(Date.now() + 172800000).toISOString().split('T')[0], type: "Emergency", status: "canceled", doctor: "Dr. Ahmed Fathy" },
];

interface DraggableAppointmentProps {
  appointment: any;
  onClick: () => void;
}

const DraggableAppointment: React.FC<DraggableAppointmentProps> = ({ appointment, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `appointment-${appointment.localId}`,
    data: appointment,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg text-xs border mb-1 last:mb-0 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow touch-none",
        appointment.status === "scheduled" && "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
        appointment.status === "completed" && "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
        appointment.status === "canceled" && "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20",
        appointment.status === "no-show" && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
      )}
    >
      <div className="font-semibold truncate">{appointment.patient}</div>
      <div className="truncate opacity-80 mt-0.5">{appointment.type}</div>
    </div>
  );
};

interface DroppableCellProps {
  time: string;
  dayIndex: number;
  children?: React.ReactNode;
  onAddClick: () => void;
}

const DroppableCell: React.FC<DroppableCellProps> = ({ time, dayIndex, children, onAddClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${dayIndex}-${time}`,
    data: { time, dayIndex },
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "p-1.5 border-r border-slate-100 dark:border-slate-800 last:border-r-0 relative transition-colors group min-h-[80px]",
        isOver ? "bg-indigo-50/50 dark:bg-indigo-500/10 ring-2 ring-inset ring-indigo-200 dark:ring-indigo-500/30" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
      )}
    >
      {children}
      {!children && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <button 
            onClick={onAddClick}
            className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center pointer-events-auto hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export function Appointments() {
  const { compactMode, showPatientIds } = useSettings();
  const { t, isRTL } = useTranslation();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<any>(null);

  const appointments = useLiveQuery(
    () => db.appointments.where('isDeleted').equals(0).toArray(),
    []
  ) || [];

  useEffect(() => {
    const seedData = async () => {
      try {
        const count = await db.appointments.count();
        if (count === 0) {
          for (const app of initialAppointments) {
            await db.appointments.add({
              ...app,
              lastModified: Date.now(),
              isDeleted: 0,
              isSynced: 0
            });
          }
        }
      } catch (error) {
        console.error("Failed to seed appointments:", error);
      }
    };
    seedData();
  }, []);

  const filteredAppointments = appointments.filter(
    (app) => (statusFilter === "all" || app.status === statusFilter) &&
             (doctorFilter === "all" || app.doctor === doctorFilter) &&
             (typeFilter === "all" || app.type === typeFilter)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      try {
        const activeId = active.data.current?.localId;
        const { time, dayIndex } = over.data.current as { time: string, dayIndex: number };

        // Calculate the new date based on dayIndex and currentWeekOffset
        const today = new Date();
        const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek + (currentWeekOffset * 7));
        const newDate = new Date(startOfWeek);
        newDate.setDate(startOfWeek.getDate() + dayIndex);
        const dateString = newDate.toISOString().split('T')[0];

        if (activeId) {
          await db.appointments.update(activeId, { 
            time, 
            date: dateString,
            lastModified: Date.now(),
            isSynced: 0
          });
        }
      } catch (error) {
        console.error("Failed to update appointment after drag:", error);
      }
    }
    setActiveDragItem(null);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await db.appointments.update(id, { 
        status: newStatus,
        lastModified: Date.now(),
        isSynced: 0
      });
    } catch (error) {
      console.error("Failed to update appointment status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return "bg-blue-50 text-blue-700 border-blue-200";
      case 'completed': return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case 'canceled': return "bg-red-50 text-red-700 border-red-200";
      case 'no-show': return "bg-slate-100 text-slate-600 border-slate-300";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency': return "border-l-4 border-l-red-500";
      case 'Check-up': return "border-l-4 border-l-blue-500";
      case 'Consultation': return "border-l-4 border-l-purple-500";
      case 'Follow-up': return "border-l-4 border-l-emerald-500";
      default: return "border-l-4 border-l-slate-300";
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await db.appointments.update(id, { 
        isDeleted: 1,
        lastModified: Date.now(),
        isSynced: 0
      });
      setAppointmentToDelete(null);
      if (selectedAppointment?.localId === id) {
        setSelectedAppointment(null);
      }
    } catch (error) {
      console.error("Failed to delete appointment:", error);
    }
  };

  const getDaysOfWeek = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    // Adjust to Monday as start of week
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (currentWeekOffset * 7));
    
    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return `${day} ${date.getDate()}`;
    });
  };

  const weekDays = getDaysOfWeek();
  
  const getMonthName = () => {
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (currentWeekOffset * 7));
    return startOfWeek.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [remindersSent, setRemindersSent] = useState(false);

  const handleSendAllReminders = () => {
    setIsSendingReminders(true);
    setTimeout(() => {
      setIsSendingReminders(false);
      setRemindersSent(true);
      setTimeout(() => setRemindersSent(false), 3000);
    }, 1500);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row h-full gap-6">
        {/* Left Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0 space-y-6">
          <div className="space-y-3">
            <button 
              onClick={() => setIsNewModalOpen(true)}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus className={cn("w-5 h-5", isRTL ? "ml-2" : "mr-2")} />
              <span>{t('newAppointment')}</span>
            </button>
            <button 
              onClick={handleSendAllReminders}
              disabled={isSendingReminders || remindersSent}
              className={cn(
                "w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-colors shadow-sm border",
                remindersSent
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <Bell className={cn("w-5 h-5", isRTL ? "ml-2" : "mr-2")} />
              <span>
                {isSendingReminders ? t('sending') : remindersSent ? t('remindersSent') : t('sendDailyReminders')}
              </span>
            </button>
          </div>

          <div className={cn(
            "card-panel p-5"
          )}>
            <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
              <Filter className={cn("w-4 h-4 text-indigo-500 dark:text-indigo-400", isRTL ? "ml-2" : "mr-2")} />
              <h3 className="mono-label">{t('filters')}</h3>
            </div>
            
            <div className="space-y-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('searchPatient')}</label>
                <div className="relative">
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400", isRTL ? "right-3" : "left-3")} />
                  <input
                    type="text"
                    placeholder={t('nameOrId')}
                    className={cn(
                      "w-full py-2 text-sm bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all",
                      isRTL ? "pr-9 pl-3" : "pl-9 pr-3"
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('status')}</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="all" className="dark:bg-slate-900">{t('allStatuses')}</option>
                  <option value="scheduled" className="dark:bg-slate-900">{t('scheduled')}</option>
                  <option value="completed" className="dark:bg-slate-900">{t('completed')}</option>
                  <option value="canceled" className="dark:bg-slate-900">{t('canceled')}</option>
                  <option value="no-show" className="dark:bg-slate-900">{t('noShow')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('doctor')}</label>
                <select 
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="all" className="dark:bg-slate-900">{t('allDoctors')}</option>
                  <option value="Dr. Ahmed Fathy" className="dark:bg-slate-900">Dr. Ahmed Fathy</option>
                  <option value="Dr. Sarah Connor" className="dark:bg-slate-900">Dr. Sarah Connor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('type')}</label>
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="all" className="dark:bg-slate-900">{t('allTypes')}</option>
                  <option value="Check-up" className="dark:bg-slate-900">{t('checkUp')}</option>
                  <option value="Follow-up" className="dark:bg-slate-900">{t('followUp')}</option>
                  <option value="Consultation" className="dark:bg-slate-900">{t('consultation')}</option>
                  <option value="Emergency" className="dark:bg-slate-900">{t('emergency')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className={cn(
            "card-panel p-5 hidden md:block"
          )}>
            <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
              <PieChart className={cn("w-4 h-4 text-indigo-500 dark:text-indigo-400", isRTL ? "ml-2" : "mr-2")} />
              <h3 className="mono-label">{t('quickStats')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('total')}</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">24</p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{t('today')}</p>
                <p className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mt-1">8</p>
              </div>
            </div>
          </div>

          <div className={cn(
            "card-panel gradient-indigo p-5 hidden md:block"
          )}>
            <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-300 font-semibold pb-2 border-b border-indigo-100/50 dark:border-indigo-900/50">
              <CalendarIcon className={cn("w-4 h-4 text-indigo-500 dark:text-indigo-400", isRTL ? "ml-2" : "mr-2")} />
              <h3 className="mono-label">{t('suggestedFollowUps')}</h3>
            </div>
            <div className="space-y-3 mt-3">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-indigo-50 dark:border-indigo-900/30 shadow-sm">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Sarah Connor</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Post-op checkup due (2 weeks)</p>
                <button 
                  onClick={() => setIsNewModalOpen(true)}
                  className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> {t('scheduleNow')}
                </button>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-indigo-50 dark:border-indigo-900/30 shadow-sm">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Mike Ross</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Annual physical overdue</p>
                <button 
                  onClick={() => setIsNewModalOpen(true)}
                  className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> {t('scheduleNow')}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 justify-between gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setView("list")}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-wider",
                  view === "list" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <List className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                <span>{t('listView')}</span>
              </button>
              <button
                onClick={() => setView("calendar")}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-wider",
                  view === "calendar" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <CalendarIcon className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                <span>{t('calendar')}</span>
              </button>
            </div>

            {view === "list" && (
              <div className="flex items-center gap-2 px-2">
                {['all', 'scheduled', 'completed', 'canceled', 'no-show'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-colors",
                      statusFilter === status
                        ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    {status === 'all' ? t('all') : t(status as any)}
                  </button>
                ))}
              </div>
            )}

            {view === "calendar" && (
              <div className="flex items-center gap-2 px-2">
                <div className={cn("flex items-center gap-1.5 border-slate-200 dark:border-slate-800", isRTL ? "ml-2 border-l pl-3" : "mr-2 border-r pr-3")}>
                  {['all', 'scheduled', 'completed', 'canceled', 'no-show'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-colors hidden lg:block",
                        statusFilter === status
                          ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      {status === 'all' ? t('all') : t(status as any)}
                    </button>
                  ))}
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="lg:hidden px-2 py-1.5 text-[10px] font-bold bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
                  >
                    <option value="all" className="dark:bg-slate-900">{t('all')}</option>
                    <option value="scheduled" className="dark:bg-slate-900">{t('scheduled')}</option>
                    <option value="completed" className="dark:bg-slate-900">{t('completed')}</option>
                    <option value="canceled" className="dark:bg-slate-900">{t('canceled')}</option>
                    <option value="no-show" className="dark:bg-slate-900">{t('noShow')}</option>
                  </select>
                </div>
                <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    <ChevronLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
                  </button>
                  <span className="px-3 py-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border-x border-slate-100 dark:border-slate-800 min-w-[110px] text-center uppercase tracking-widest">
                    {getMonthName()}
                  </span>
                  <button 
                    onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
                  </button>
                </div>
                <button 
                  onClick={() => setCurrentWeekOffset(0)}
                  className="px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-wider shadow-sm"
                >
                  {t('today')}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {view === "list" ? (
              <div className="space-y-3">
                {filteredAppointments.map((app) => (
                  <div 
                    key={app.localId} 
                    onClick={() => setSelectedAppointment(app)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border hover:shadow-sm transition-all bg-white dark:bg-slate-900 group cursor-pointer",
                      getTypeColor(app.type),
                      compactMode ? "p-3" : "p-4",
                      "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20",
                        compactMode ? "w-10 h-10" : "w-12 h-12"
                      )}>
                        <User className={cn(compactMode ? "w-5 h-5" : "w-6 h-6")} />
                      </div>
                      <div>
                        <h4 className={cn("font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors", compactMode ? "text-sm" : "text-base")}>
                          {app.patientName} {showPatientIds && <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">#PT-{app.localId?.toString().padStart(4, '0')}</span>}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {app.time}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span>{app.type}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span className="text-xs text-slate-400 dark:text-slate-500">{app.doctor}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1.5",
                        getStatusColor(app.status)
                      )}>
                        {app.status === "scheduled" && <Clock className="w-3 h-3" />}
                        {app.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                        {app.status === "canceled" && <XCircle className="w-3 h-3" />}
                        {app.status === "no-show" && <AlertTriangle className="w-3 h-3" />}
                        <span className="capitalize">{app.status}</span>
                      </span>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppointment(app);
                            // In a real app, this would open edit mode directly
                            setTimeout(() => setIsNewModalOpen(true), 100);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" 
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        {app.status === 'scheduled' && (
                          <>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(app.localId!, 'completed');
                              }}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" 
                              title="Mark Completed"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(app.localId!, 'no-show');
                              }}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" 
                              title="Mark No-Show"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setAppointmentToDelete(app.localId!);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                              title="Cancel"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredAppointments.length === 0 && (
                  <div className="text-center py-16 px-4">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <CalendarIcon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">{t('noAppointmentsFound')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">{t('noAppointmentsDesc')}</p>
                    <button 
                      onClick={() => {
                        setStatusFilter('all');
                      }}
                      className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 text-sm"
                    >
                      {t('clearAllFilters')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex flex-col h-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <div className={cn("p-3 border-slate-200 dark:border-slate-800 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider", isRTL ? "border-l" : "border-r")}>{t('time')}</div>
                    {weekDays.map(day => (
                      <div key={day} className={cn("p-3 border-slate-200 dark:border-slate-800 text-center text-sm font-medium text-slate-700 dark:text-slate-300", isRTL ? "border-l last:border-l-0" : "border-r last:border-r-0")}>
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map(time => (
                      <div key={time} className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800 last:border-b-0 min-h-[80px]">
                        <div className={cn("p-3 border-slate-100 dark:border-slate-800 text-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-center", isRTL ? "border-l" : "border-r")}>
                          {time}
                        </div>
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                          const today = new Date();
                          const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
                          const startOfWeek = new Date(today);
                          startOfWeek.setDate(today.getDate() - dayOfWeek + (currentWeekOffset * 7));
                          const cellDate = new Date(startOfWeek);
                          cellDate.setDate(startOfWeek.getDate() + dayIndex);
                          const cellDateString = cellDate.toISOString().split('T')[0];

                          const apptsInSlot = filteredAppointments.filter(app => app.date === cellDateString && app.time === time);
                          
                          return (
                            <DroppableCell 
                              key={dayIndex} 
                              time={time} 
                              dayIndex={dayIndex}
                              onAddClick={() => setIsNewModalOpen(true)}
                            >
                              {apptsInSlot.map(appt => (
                                <DraggableAppointment 
                                  key={appt.localId} 
                                  appointment={appt} 
                                  onClick={() => setSelectedAppointment(appt)}
                                />
                              ))}
                            </DroppableCell>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <DragOverlay>
                  {activeDragItem ? (
                    <div className={cn(
                      "p-2 rounded-lg text-xs border mb-1 last:mb-0 shadow-lg cursor-grabbing w-[120px] bg-white opacity-90",
                      activeDragItem.status === "scheduled" && "bg-blue-50 text-blue-700 border-blue-200",
                      activeDragItem.status === "completed" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                      activeDragItem.status === "canceled" && "bg-red-50 text-red-700 border-red-200",
                      activeDragItem.status === "no-show" && "bg-slate-100 text-slate-600 border-slate-300"
                    )}>
                      <div className="font-semibold truncate">{activeDragItem.patientName}</div>
                      <div className="truncate opacity-80 mt-0.5">{activeDragItem.type}</div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </div>
      </div>
      
      <NewAppointmentModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
      />

      <AppointmentDetailsModal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointment={selectedAppointment}
        onEdit={() => {
          setSelectedAppointment(null);
          // In a real app, this would populate the form with the appointment data
          setTimeout(() => setIsNewModalOpen(true), 100);
        }}
        onDelete={() => setAppointmentToDelete(selectedAppointment?.localId)}
      />

      {/* Delete Confirmation Dialog */}
      {appointmentToDelete !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('cancelAppointment')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('cancelAppointmentDesc')}
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-b-xl flex gap-3">
              <button 
                onClick={() => setAppointmentToDelete(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {t('keepIt')}
              </button>
              <button 
                onClick={() => handleDelete(appointmentToDelete)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                {t('yesCancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
