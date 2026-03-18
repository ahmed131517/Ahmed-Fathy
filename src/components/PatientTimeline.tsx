import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  FlaskConical, 
  Pill, 
  Stethoscope, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Filter,
  Search,
  MoreHorizontal,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'Encounter' | 'Lab Result' | 'Prescription' | 'Diagnosis' | 'Vitals' | 'Physical Exam';
  title: string;
  description?: string;
  provider?: string;
  status?: 'normal' | 'abnormal' | 'critical' | 'completed' | 'pending';
  details?: any;
}

interface PatientTimelineProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

export function PatientTimeline({ events, onEventClick }: PatientTimelineProps) {
  const [filter, setFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        const matchesType = filter === 'All' || e.type === filter;
        const matchesSearch = searchQuery === "" || 
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.provider?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [events, filter, sortOrder, searchQuery]);

  // Group events by Month Year
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: TimelineEvent[] } = {};
    filteredEvents.forEach(event => {
      const date = new Date(event.date);
      const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(event);
    });
    return groups;
  }, [filteredEvents]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Encounter': return <Stethoscope className="w-5 h-5" />;
      case 'Lab Result': return <FlaskConical className="w-5 h-5" />;
      case 'Prescription': return <Pill className="w-5 h-5" />;
      case 'Diagnosis': return <FileText className="w-5 h-5" />;
      case 'Vitals': return <Clock className="w-5 h-5" />;
      case 'Physical Exam': return <Activity className="w-5 h-5" />;
      default: return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  const getColor = (type: string, status?: string) => {
    if (status === 'critical' || status === 'abnormal') return 'bg-red-100 text-red-600 border-red-200';
    switch (type) {
      case 'Encounter': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Lab Result': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'Prescription': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'Diagnosis': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'Vitals': return 'bg-cyan-100 text-cyan-600 border-cyan-200';
      case 'Physical Exam': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header / Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" /> Patient Journey
          </h3>
          <div className="flex items-center gap-2">
             <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
               {filteredEvents.length} Events
             </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search timeline..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white appearance-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Encounter">Visits</option>
              <option value="Lab Result">Labs</option>
              <option value="Prescription">Prescriptions</option>
              <option value="Diagnosis">Diagnoses</option>
            </select>
          </div>
          
          <button 
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            title={sortOrder === 'desc' ? "Newest First" : "Oldest First"}
          >
            {sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 relative">
        {/* Central Line */}
        <div className="absolute left-6 md:left-1/2 top-6 bottom-6 w-0.5 bg-slate-200 -translate-x-1/2 hidden md:block"></div>
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-200 -translate-x-1/2 md:hidden"></div>

        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([groupName, groupEvents]: [string, TimelineEvent[]]) => (
            <div key={groupName} className="relative">
              {/* Month Header */}
              <div className="flex justify-center mb-8 relative z-10">
                <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  {groupName}
                </span>
              </div>

              <div className="space-y-8">
                {groupEvents.map((event, index) => {
                  // Calculate global index for left/right positioning if needed, 
                  // but here we can just use the index within the group or a simple toggle
                  // Let's use a consistent hash or just alternate for visual interest
                  const isLeft = filteredEvents.indexOf(event) % 2 === 0;
                  
                  return (
                    <div key={event.id} className={cn(
                      "relative flex items-center md:justify-between group",
                      isLeft ? "md:flex-row-reverse" : ""
                    )}>
                      {/* Spacer for desktop alignment */}
                      <div className="hidden md:block w-5/12"></div>

                      {/* Icon / Dot */}
                      <div className={cn(
                        "absolute left-6 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-110",
                        getColor(event.type, event.status)
                      )}>
                        {getIcon(event.type)}
                      </div>

                      {/* Content Card */}
                      <div 
                        className={cn(
                          "ml-16 md:ml-0 w-full md:w-5/12 cursor-pointer transition-all hover:-translate-y-1",
                          "bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 group-hover:ring-1 group-hover:ring-indigo-100"
                        )}
                        onClick={() => onEventClick?.(event)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            getColor(event.type, event.status).replace('border-', 'bg-opacity-10 ')
                          )}>
                            {event.type}
                          </span>
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h4 className="font-bold text-slate-900 mb-1">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">{event.description}</p>
                        )}
                        
                        {event.provider && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-2 mt-2">
                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {event.provider.charAt(0)}
                            </div>
                            {event.provider}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-medium mb-1">No events found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
