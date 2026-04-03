import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Task } from '../lib/db';
import { CheckCircle, Circle, Clock, Plus, Calendar, User, AlertCircle, AlertTriangle, ArrowUp, ArrowDown, Minus, Trash2 } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { toast } from 'sonner';
import { usePatient } from '../lib/PatientContext';

export function Tasks() {
  const { patients } = usePatient();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskType, setNewTaskType] = useState<Task['type']>('other');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTaskPatientId, setNewTaskPatientId] = useState<string>('');

  const [filterPriority, setFilterPriority] = useState<string>('all');

  const tasks = useLiveQuery(
    () => db.tasks.where('isDeleted').equals(0).sortBy('dueDate')
  ) || [];

  const pendingTasks = tasks.filter(t => t.status === 'pending' && (filterPriority === 'all' || t.priority === filterPriority));
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    let patientName;
    if (newTaskPatientId) {
      const patient = patients.find(p => p.id === newTaskPatientId);
      if (patient) {
        patientName = patient.name;
      }
    }

    try {
      await db.tasks.add({
        title: newTaskTitle,
        description: newTaskDescription,
        type: newTaskType,
        priority: newTaskPriority,
        dueDate: newTaskDueDate,
        status: 'pending',
        patientId: newTaskPatientId || undefined,
        patientName,
        createdAt: Date.now(),
        lastModified: Date.now(),
        isDeleted: 0,
        isSynced: 0
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPatientId('');
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      await db.tasks.update(task.localId!, {
        status: task.status === 'pending' ? 'completed' : 'pending',
        lastModified: Date.now(),
        isSynced: 0
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (localId: number) => {
    try {
      await db.tasks.update(localId, {
        isDeleted: 1,
        lastModified: Date.now(),
        isSynced: 0
      });
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'follow-up': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'lab-review': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'outreach': return <User className="w-4 h-4 text-emerald-500" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high': return <ArrowUp className="w-3 h-3 text-red-500" />;
      case 'medium': return <Minus className="w-3 h-3 text-amber-500" />;
      case 'low': return <ArrowDown className="w-3 h-3 text-blue-500" />;
      default: return null;
    }
  };

  const getDueDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return <span className="text-amber-600 font-medium">Today</span>;
    if (isTomorrow(date)) return <span className="text-blue-600 font-medium">Tomorrow</span>;
    if (isPast(date)) return <span className="text-red-600 font-medium">Overdue</span>;
    return <span className="text-slate-600">{format(date, 'MMM d, yyyy')}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Task Management</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Task</h2>
        <form onSubmit={handleAddTask} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
            <select
              value={newTaskType}
              onChange={(e) => setNewTaskType(e.target.value as Task['type'])}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="other">General</option>
              <option value="follow-up">Follow-up</option>
              <option value="lab-review">Lab Review</option>
              <option value="outreach">Patient Outreach</option>
            </select>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Optional description or notes..."
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={newTaskPatientId}
              onChange={(e) => setNewTaskPatientId(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">No Patient Associated</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Pending Tasks</span>
              <span className="bg-amber-100 text-amber-700 text-xs py-1 px-2 rounded-full">{pendingTasks.length}</span>
            </h2>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs border-slate-200 dark:border-slate-700 rounded-md bg-transparent dark:text-white py-1"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
              <option value="low">Low Only</option>
            </select>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No pending tasks</p>
            ) : (
              pendingTasks.map(task => (
                <div key={task.localId} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <button onClick={() => toggleTaskStatus(task)} className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors">
                    <Circle className="w-5 h-5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{task.title}</p>
                      {task.priority && (
                        <span className="flex items-center" title={`${task.priority} priority`}>
                          {getPriorityIcon(task.priority)}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        {getTaskIcon(task.type)}
                        <span className="capitalize">{task.type.replace('-', ' ')}</span>
                      </span>
                      <span>•</span>
                      {getDueDateLabel(task.dueDate)}
                      {task.patientName && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 dark:text-indigo-400 truncate max-w-[120px]">{task.patientName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteTask(task.localId!)} 
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Completed Tasks</span>
            <span className="bg-emerald-100 text-emerald-700 text-xs py-1 px-2 rounded-full">{completedTasks.length}</span>
          </h2>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {completedTasks.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No completed tasks</p>
            ) : (
              completedTasks.map(task => (
                <div key={task.localId} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 opacity-60">
                  <button onClick={() => toggleTaskStatus(task)} className="mt-0.5 text-emerald-500 hover:text-slate-400 transition-colors">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200 line-through">{task.title}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        {getTaskIcon(task.type)}
                        <span className="capitalize">{task.type.replace('-', ' ')}</span>
                      </span>
                      {task.patientName && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{task.patientName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteTask(task.localId!)} 
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
