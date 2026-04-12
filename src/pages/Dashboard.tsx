import { Users, FileText, MessageSquare, Calendar, Activity, TrendingUp, Clock, AlertCircle, ArrowUpRight, Plus, FlaskConical, Pill, X, UserPlus, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSettings } from "@/lib/SettingsContext";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { usePatient } from "@/lib/PatientContext";
import { CDSSAlertsWidget } from "@/components/dashboard/CDSSAlertsWidget";
import { VitalsTrendingWidget } from "@/components/dashboard/VitalsTrendingWidget";

const activities: any[] = [];

const initialAlerts: any[] = [];

export function Dashboard() {
  const navigate = useNavigate();
  const { compactMode } = useSettings();
  const { t, isRTL } = useTranslation();
  const { patients, isLoading } = usePatient();
  const [timeRange, setTimeRange] = useState('week');
  const [alerts, setAlerts] = useState<any[]>(initialAlerts);
  const [chartType, setChartType] = useState<'department' | 'condition'>('department');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = useLiveQuery(
    () => db.appointments.where('date').equals(todayStr).and(a => a.isDeleted === 0).count()
  ) || 0;

  const totalAppointmentsCount = useLiveQuery(
    () => db.appointments.where('isDeleted').equals(0).count()
  ) || 0;

  const allAppointments = useLiveQuery(
    () => db.appointments.where('isDeleted').equals(0).toArray()
  ) || [];

  const activePatientsCount = patients.filter(p => p.status === 'Active' || p.status === 'Stable').length;
  const criticalPatientsCount = patients.filter(p => p.status === 'Critical').length;

  const chartData = useMemo(() => {
    // Generate last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const patientData = days.map(day => {
      const count = allAppointments.filter(a => a.date === day).length;
      const dateObj = new Date(day);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      return { name: dayName, patients: count };
    });

    // Group by appointment type
    const typeCounts: Record<string, number> = {};
    allAppointments.forEach(a => {
      const type = a.type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    const departmentData = Object.entries(typeCounts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));

    // Group patients by status
    const statusCounts: Record<string, number> = {};
    patients.forEach(p => {
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
      departmentData: departmentData.length > 0 ? departmentData : [{ name: 'No Data', value: 1, color: '#cbd5e1' }],
      conditionData: conditionData.length > 0 ? conditionData : [{ name: 'No Data', value: 1, color: '#cbd5e1' }]
    };
  }, [allAppointments, patients]);

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const pieData = chartType === 'department' ? chartData.departmentData : chartData.conditionData;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('dashboard')}</h2>
          <p className="text-slate-500 dark:text-slate-400">{t('dashboardOverview')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              toast.info("Navigating to Schedule...");
              navigate("/schedule");
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4" /> {t('schedule')}
          </button>
        </div>
      </div>

      <CDSSAlertsWidget />

      {/* Bento Grid */}
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4", compactMode ? "gap-4" : "gap-6")}>
        {/* Stats */}
        <div className={cn(
          "card-panel glow-indigo",
          compactMode ? "p-4" : "p-6"
        )}>
          <h3 className="mono-label">{t('totalPatients')}</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
            {isLoading ? "..." : patients.length.toLocaleString()}
          </p>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full mt-2 self-start">+12%</span>
        </div>
        <div className={cn(
          "card-panel glow-emerald",
          compactMode ? "p-4" : "p-6"
        )}>
          <h3 className="mono-label">{t('activePatients')}</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
            {isLoading ? "..." : activePatientsCount}
          </p>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full mt-2 self-start">Stable/Active</span>
        </div>
        <div className={cn(
          "card-panel glow-indigo",
          compactMode ? "p-4" : "p-6"
        )}>
          <h3 className="mono-label">{t('appointments')}</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
            {totalAppointmentsCount}
          </p>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-full mt-2 self-start">
            {todayAppointmentsCount} {t('today')}
          </span>
        </div>
        <div className={cn(
          "card-panel glow-indigo",
          compactMode ? "p-4" : "p-6"
        )}>
          <h3 className="mono-label">{t('criticalPatients')}</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
            {isLoading ? "..." : criticalPatientsCount}
          </p>
          <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-full mt-2 self-start">{t('requiresAttention')}</span>
        </div>

        {/* Main Chart */}
        <div className={cn(
          "md:col-span-2 lg:col-span-3 card-panel gradient-indigo",
          compactMode ? "p-4" : "p-6"
        )}>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4 mono-label">{t('appointments')} ({t('last7Days')})</h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.patientData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  itemStyle={{color: '#1e293b', fontWeight: 600}}
                  cursor={{stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="patients" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown */}
        <div className={cn(
          "card-panel",
          compactMode ? "p-4" : "p-6"
        )}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mono-label">{t('distribution')}</h3>
            <select 
              className="text-xs border-slate-200 dark:border-slate-700 rounded-md bg-transparent dark:text-white outline-none"
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
            >
              <option value="department" className="dark:bg-slate-900">{t('byApptType')}</option>
              <option value="condition" className="dark:bg-slate-900">{t('byPatientStatus')}</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  itemStyle={{color: '#1e293b', fontWeight: 600}}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vitals Trending */}
        <div className="md:col-span-2 lg:col-span-2">
          <VitalsTrendingWidget />
        </div>
      </div>
    </div>
  );
}
