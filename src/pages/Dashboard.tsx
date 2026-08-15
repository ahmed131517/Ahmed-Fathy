import { 
  Users, FileText, MessageSquare, Calendar, Activity, TrendingUp, Clock, AlertCircle, 
  ArrowUpRight, Plus, FlaskConical, Pill, X, UserPlus, FilePlus, Shield, Stethoscope, 
  ClipboardList, BrainCircuit, CheckCircle2, ChevronRight, Zap, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChartContainer } from '@/components/ui/ChartContainer';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSettings } from "@/lib/SettingsContext";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { usePatient } from "@/lib/PatientContext";
import { useUser } from "@/lib/UserContext";

import { VitalsTrendingWidget } from "@/components/dashboard/VitalsTrendingWidget";
import { AuditDashboard } from "@/pages/AuditDashboard";

export function Dashboard() {
  const navigate = useNavigate();
  const { compactMode } = useSettings();
  const { t, isRTL } = useTranslation();
  const { patients, isLoading, selectedPatient, setSelectedPatient } = usePatient();
  const { profile } = useUser();
  const [chartType, setChartType] = useState<'department' | 'condition'>('department');

  const role = profile.role || 'doctor';

  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayStr = getLocalDateString(new Date());

  const todayAppointments = useLiveQuery(
    () => db.appointments.where('date').equals(todayStr).and(a => a.isDeleted === 0).toArray()
  ) || [];

  const totalAppointmentsCount = useLiveQuery(
    () => db.appointments.where('isDeleted').equals(0).count()
  ) || 0;

  const allAppointments = useLiveQuery(
    () => db.appointments.where('isDeleted').equals(0).toArray()
  ) || [];

  const activePatientsCount = (patients || []).filter(p => p && (p.status === 'Active' || p.status === 'Stable')).length;
  const criticalPatientsCount = (patients || []).filter(p => p && p.status === 'Critical').length;

  const chartData = useMemo(() => {
    // Generate last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const patientData = days.map(day => {
      const count = (allAppointments || []).filter(a => a && a.date === day).length;
      const dateObj = new Date(day);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      return { name: dayName, patients: count };
    });

    // Group by appointment type
    const typeCounts: Record<string, number> = {};
    allAppointments.forEach(a => {
      if (!a) return;
      const type = a.type || 'General Consultation';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const colors = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const departmentData = Object.entries(typeCounts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));

    // Group patients by status
    const statusCounts: Record<string, number> = {};
    (patients || []).forEach(p => {
      if (!p) return;
      const status = p.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const conditionData = Object.entries(statusCounts).map(([name, value], index) => ({
      name,
      value,
      color: colors[(index + 2) % colors.length]
    }));

    return {
      patientData,
      departmentData: departmentData.length > 0 ? departmentData : [{ name: 'General Consultation', value: 1, color: '#06b6d4' }],
      conditionData: conditionData.length > 0 ? conditionData : [{ name: 'Stable', value: 1, color: '#10b981' }]
    };
  }, [allAppointments, patients]);

  const pieData = chartType === 'department' ? chartData.departmentData : chartData.conditionData;

  const quickActions = [
    { label: "New Encounter Note", icon: FilePlus, path: "/encounter-note", color: "from-cyan-600 to-blue-600 text-cyan-400" },
    { label: "Clinical Intelligence Hub", icon: BrainCircuit, path: "/clinical-hub", color: "from-indigo-600 to-purple-600 text-indigo-400" },
    { label: "Prescribe Medication", icon: Pill, path: "/prescriptions", color: "from-emerald-600 to-teal-600 text-emerald-400" },
    { label: "Order Lab Request", icon: FlaskConical, path: "/lab-requests", color: "from-amber-600 to-orange-600 text-amber-400" },
    { label: "Ask Clinical AI", icon: Zap, path: "/ask-ai", color: "from-pink-600 to-rose-600 text-pink-400" },
    { label: "Register Patient", icon: UserPlus, path: "/new-patient", color: "from-blue-600 to-cyan-600 text-blue-400" }
  ];

  return (
    <div className="space-y-6 h-full flex flex-col pb-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              EHR Command Center
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            {role === 'doctor' && <Stethoscope className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
            {role === 'nurse' && <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            {role === 'admin' && <Shield className="w-6 h-6 text-slate-600 dark:text-slate-400" />}
            Welcome back, {profile.firstName ? `${profile.firstName} ${profile.lastName}` : 'Clinician'} ({role.toUpperCase()})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time patient monitoring, active encounter queues, and AI clinical decision support.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/active-encounter")}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Zap className="w-4 h-4 fill-current" /> Start Active Encounter
          </button>
          <button 
            onClick={() => navigate("/schedule")}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Schedule
          </button>
        </div>
      </div>

      {/* Quick Clinical Actions Shortcuts Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              onClick={() => navigate(act.path)}
              className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-3.5 rounded-xl flex items-center gap-3 transition-all group text-left shadow-sm"
            >
              <div className={cn("p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group-hover:scale-105 transition-transform", act.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-snug">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Role-Specific High Priority Status Bar */}
      {role === 'doctor' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => navigate("/encounter-note")}
            className="bg-indigo-50/60 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">Unsigned SOAP Notes</h4>
                <p className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">3 Pending Sign-Off</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div 
            onClick={() => navigate("/lab-requests")}
            className="bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/40 p-4 rounded-xl border border-amber-100 dark:border-amber-800/60 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-sm text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">Critical Lab Flags</h4>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400 mt-0.5">2 Urgent Alerts</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div 
            onClick={() => navigate("/clinical-hub")}
            className="bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-sm text-emerald-600 dark:text-emerald-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">Clinical Intelligence</h4>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">Safety Engine Active</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      )}

      {/* Primary Metrics Bento Grid */}
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4", compactMode ? "gap-4" : "gap-6")}>
        {/* Metric 1 */}
        <div className="card-panel glow-indigo p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="mono-label">Total Patients</span>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 font-mono tracking-tight">
                {isLoading ? "..." : (patients || []).length.toLocaleString()}
              </p>
            </div>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Active Registry</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">+12% this month</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card-panel glow-emerald p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="mono-label">Active / Stable Patients</span>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 font-mono tracking-tight">
                {isLoading ? "..." : activePatientsCount}
              </p>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">In Treatment Plan</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Optimal Vitals</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card-panel glow-indigo p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="mono-label">Appointments</span>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 font-mono tracking-tight">
                {totalAppointmentsCount}
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Scheduled Today</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">
              {todayAppointments.length} Today
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card-panel glow-red p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="mono-label">Critical Cases</span>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 font-mono tracking-tight">
                {isLoading ? "..." : criticalPatientsCount}
              </p>
            </div>
            <div className="p-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Requires Urgent Care</span>
            <span className="text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">Action Needed</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Queue & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Clinical Encounter Queue */}
        <div className="lg:col-span-1 card-panel p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Today's Patient Queue ({todayAppointments.length})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Active clinic roster for current session</p>
            </div>
            <button
              onClick={() => navigate('/schedule')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
            >
              View Schedule
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[340px] pr-1">
            {todayAppointments.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No appointments scheduled for today.</p>
              </div>
            ) : (
              todayAppointments.map((appt) => {
                const pat = (patients || []).find(p => p.id === appt.patientId);
                const isSelected = selectedPatient?.id === appt.patientId;

                return (
                  <div
                    key={appt.id}
                    className={cn(
                      "p-3 rounded-xl border transition-all flex flex-col space-y-2 text-xs",
                      isSelected 
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-500/50 text-slate-900 dark:text-slate-100" 
                        : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{appt.patientName || pat?.name || 'Patient'}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{appt.type || 'Follow-up'} • {appt.time || '09:00 AM'}</div>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold border",
                        appt.status === 'Completed' ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30" :
                        appt.status === 'In Progress' ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30" :
                        "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"
                      )}>
                        {appt.status || 'Scheduled'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                        Dr. {appt.doctor || 'Attending Physician'}
                      </span>
                      <button
                        onClick={() => {
                          if (pat) setSelectedPatient(pat);
                          navigate("/active-encounter");
                        }}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-[10px] transition-colors shadow-sm"
                      >
                        Launch Encounter
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Analytics Charts Panel */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Appointment Volume Trend Chart */}
          <div className="card-panel gradient-indigo space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Appointment Volume Trend
              </h3>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Last 7 Days</span>
            </div>
            <div className="w-full min-w-0 h-[220px]">
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.patientData}>
                    <defs>
                      <linearGradient id="colorPatientsDash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#1e293b'}}
                      itemStyle={{color: '#6366f1', fontWeight: 600}}
                    />
                    <Area type="monotone" dataKey="patients" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPatientsDash)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          {/* Department / Status Distribution Chart */}
          <div className="card-panel space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Clinical Case Mix
              </h3>
              <select 
                className="text-[10px] font-bold border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none px-2 py-1"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
              >
                <option value="department">By Appt Type</option>
                <option value="condition">By Patient Status</option>
              </select>
            </div>
            <div className="w-full min-w-0 h-[220px]">
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#1e293b'}}
                    />
                    <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Telemetry Section */}
      <div className="w-full">
        <VitalsTrendingWidget />
      </div>

      {/* Audit Dashboard Embedding - Admin Only */}
      {role === 'admin' && (
        <div className="w-full pt-4">
          <AuditDashboard embedded={true} />
        </div>
      )}
    </div>
  );
}

