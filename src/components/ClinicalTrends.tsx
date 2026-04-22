import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis, XAxis } from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Activity, Droplets, Thermometer, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import { TimelineEvent } from './PatientTimeline';

interface ClinicalTrendsProps {
  events: TimelineEvent[];
}

interface TrendData {
  date: string;
  displayDate: string;
  value: number;
}

export function ClinicalTrends({ events }: ClinicalTrendsProps) {
  const trends = useMemo(() => {
    const data: Record<string, TrendData[]> = {
      systolic: [],
      diastolic: [],
      hr: [],
      temp: [],
      glucose: [],
      hba1c: []
    };

    // Process events from oldest to newest for the chart
    const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedEvents.forEach(event => {
      const date = event.date;
      const displayDate = format(parseISO(date), 'MMM d');

      if (event.type === 'Vitals') {
        const v = event.details;
        if (v.bp_systolic) data.systolic.push({ date, displayDate, value: v.bp_systolic });
        if (v.bp_diastolic) data.diastolic.push({ date, displayDate, value: v.bp_diastolic });
        if (v.hr) data.hr.push({ date, displayDate, value: v.hr });
        if (v.temp) data.temp.push({ date, displayDate, value: v.temp });
        if (v.glucose) data.glucose.push({ date, displayDate, value: v.glucose });
      }

      if (event.type === 'Lab Result' && event.details.results) {
        event.details.results.forEach((r: any) => {
          const testName = r.test.toLowerCase();
          const val = parseFloat(r.value);
          if (isNaN(val)) return;

          if (testName.includes('glucose') || testName === 'rbs' || testName === 'fbs') {
            data.glucose.push({ date, displayDate, value: val });
          }
          if (testName.includes('hba1c') || testName.includes('a1c')) {
            data.hba1c.push({ date, displayDate, value: val });
          }
        });
      }
    });

    return data;
  }, [events]);

  const renderTrendCard = (
    title: string, 
    data: TrendData[], 
    unit: string, 
    icon: React.ReactNode,
    color: string,
    idealRange?: { min: number, max: number }
  ) => {
    if (data.length < 2) return null;

    const latest = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    const diff = latest - previous;
    const percentChange = ((diff / previous) * 100).toFixed(1);
    
    let TrendIcon = Minus;
    let trendColor = "text-slate-400";
    
    if (diff > 0) {
      TrendIcon = TrendingUp;
      trendColor = "text-rose-500";
    } else if (diff < 0) {
      TrendIcon = TrendingDown;
      trendColor = "text-emerald-500";
    }

    const isAbnormal = idealRange && (latest < idealRange.min || latest > idealRange.max);

    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg bg-opacity-10", color.replace('text-', 'bg-'))}>
              <div className={cn("w-4 h-4", color)}>{icon}</div>
            </div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</h4>
          </div>
          <div className={cn("flex items-center gap-1 text-[10px] font-bold", trendColor)}>
            <TrendIcon className="w-3 h-3" />
            {Math.abs(Number(percentChange))}%
          </div>
        </div>

        <div className="flex items-baseline gap-1 mb-4">
          <span className={cn("text-2xl font-bold", isAbnormal ? "text-rose-600" : "text-slate-900")}>
            {latest}
          </span>
          <span className="text-xs font-medium text-slate-400">{unit}</span>
        </div>

        <div className="h-16 w-full -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={isAbnormal ? "#e11d48" : "#4f46e5"} 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold shadow-xl border border-slate-800">
                        {payload[0].value} {unit}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {renderTrendCard("Systolic BP", trends.systolic, "mmHg", <Activity />, "text-indigo-600", { min: 90, max: 140 })}
      {renderTrendCard("Diastolic BP", trends.diastolic, "mmHg", <Activity />, "text-indigo-600", { min: 60, max: 90 })}
      {renderTrendCard("Heart Rate", trends.hr, "bpm", <Heart />, "text-rose-600", { min: 60, max: 100 })}
      {renderTrendCard("HbA1c", trends.hba1c, "%", <Droplets />, "text-amber-600", { min: 4, max: 6.5 })}
      {renderTrendCard("Glucose", trends.glucose, "mg/dL", <Droplets />, "text-orange-600", { min: 70, max: 140 })}
      {renderTrendCard("Temperature", trends.temp, "°C", <Thermometer />, "text-blue-600", { min: 36.1, max: 37.2 })}
    </div>
  );
}
