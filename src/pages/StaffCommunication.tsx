import { useState, useEffect, useMemo } from "react";
import { 
  MessageSquare, 
  Send, 
  User, 
  Users, 
  Clock, 
  Search, 
  Filter, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertCircle,
  UserCircle,
  Stethoscope,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import { db, InternalMessage, User as StaffUser } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useUser } from "@/lib/UserContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export function StaffCommunication() {
  const { profile: currentUser } = useUser();
  const messages = useLiveQuery(() => db.internal_messages.orderBy('createdAt').reverse().toArray()) || [];
  const staff = useLiveQuery(() => db.users.where('isDeleted').equals(0).toArray()) || [];
  const patients = useLiveQuery(() => db.patients.where('isDeleted').equals(0).toArray()) || [];

  const [activeTab, setActiveTab] = useState<'chat' | 'handover'>('chat');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [newMessage, setNewMessage] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("all");

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchesTab = m.type === activeTab;
      const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           m.senderName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === "all" || m.receiverRole === selectedRole || m.senderRole === selectedRole;
      return matchesTab && matchesSearch && matchesRole;
    });
  }, [messages, activeTab, searchQuery, selectedRole]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      const message: InternalMessage = {
        id: crypto.randomUUID(),
        senderId: currentUser.email || 'system',
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        senderRole: currentUser.role,
        receiverRole: targetRole as any,
        content: newMessage,
        type: activeTab,
        patientId: activeTab === 'handover' ? selectedPatientId : undefined,
        patientName: activeTab === 'handover' ? patients.find(p => p.id === selectedPatientId)?.name : undefined,
        isRead: 0,
        createdAt: Date.now()
      };

      await db.internal_messages.add(message);
      setNewMessage("");
      setSelectedPatientId("");
      toast.success(activeTab === 'chat' ? "Message sent" : "Handover created");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'doctor': return <Stethoscope className="w-3.5 h-3.5" />;
      case 'nurse': return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'pharmacist': return <Briefcase className="w-3.5 h-3.5" />;
      case 'receptionist': return <Users className="w-3.5 h-3.5" />;
      case 'admin': return <UserCircle className="w-3.5 h-3.5" />;
      default: return <Users className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Staff Communication</h1>
          <p className="text-sm text-slate-500">Secure internal messaging and task handovers</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('chat')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
              activeTab === 'chat' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <MessageSquare className="w-4 h-4" /> Chat
          </button>
          <button 
            onClick={() => setActiveTab('handover')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
              activeTab === 'handover' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <ArrowRightLeft className="w-4 h-4" /> Task Handover
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Sidebar: Filters & Staff */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
          <div className="card-panel p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter by Role</label>
              <div className="grid grid-cols-1 gap-1">
                {['all', 'doctor', 'nurse', 'pharmacist', 'receptionist', 'admin'].map(role => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedRole === role ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                    )}
                  >
                    {getRoleIcon(role)}
                    <span className="capitalize">{role}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card-panel p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Online Staff</h3>
            <div className="space-y-3">
              {staff.map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{s.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content: Messages */}
        <div className="lg:col-span-3 flex flex-col min-h-0 card-panel p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence initial={false}>
              {filteredMessages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex flex-col max-w-[80%]",
                        m.senderId === currentUser?.email ? "ml-auto items-end" : "items-start"
                      )}
                    >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{m.senderName}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase flex items-center gap-1",
                      m.senderRole === 'doctor' ? "bg-blue-100 text-blue-700" :
                      m.senderRole === 'nurse' ? "bg-emerald-100 text-emerald-700" :
                      m.senderRole === 'pharmacist' ? "bg-amber-100 text-amber-700" :
                      m.senderRole === 'receptionist' ? "bg-purple-100 text-purple-700" :
                      "bg-slate-100 text-slate-700"
                    )}>
                      {getRoleIcon(m.senderRole)}
                      {m.senderRole}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm",
                    m.senderId === currentUser?.email 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700"
                  )}>
                    {m.type === 'handover' && (
                      <div className="mb-2 pb-2 border-b border-white/20 flex items-center gap-2">
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Handover: {m.patientName}</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                  {m.receiverRole && m.receiverRole !== 'all' && (
                    <div className="mt-1 flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase">
                      <Users className="w-2.5 h-2.5" />
                      Target: {m.receiverRole}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                <MessageSquare className="w-12 h-12 mb-4" />
                <p>No messages found</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSendMessage} className="space-y-4">
              {activeTab === 'handover' && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <select 
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      required={activeTab === 'handover'}
                    >
                      <option value="">Select Patient for Handover</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id?.slice(0, 8)})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-48">
                    <select 
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">Target: All</option>
                      <option value="doctor">Target: Doctors</option>
                      <option value="nurse">Target: Nurses</option>
                      <option value="pharmacist">Target: Pharmacists</option>
                      <option value="receptionist">Target: Receptionists</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={activeTab === 'chat' ? "Type a message..." : "Describe the task or handover details..."}
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[44px] max-h-[120px]"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
