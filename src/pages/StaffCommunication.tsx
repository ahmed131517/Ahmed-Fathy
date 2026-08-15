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
  Briefcase,
  Video
} from "lucide-react";
import { db, InternalMessage, User as StaffUser } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useUser } from "@/lib/UserContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export function StaffCommunication() {
  const { profile: currentUser } = useUser();
  const [limit, setLimit] = useState(50);
  const messages = useLiveQuery(() => db.internal_messages.orderBy('createdAt').reverse().limit(limit).toArray()) || [];
  const staff = useLiveQuery(() => db.users.toArray().then(arr => arr.filter(x => !x.isDeleted))) || [];
  const patients = useLiveQuery(() => db.patients.toArray().then(arr => arr.filter(x => !x.isDeleted))) || [];

  const [activeTab, setActiveTab] = useState<'chat' | 'handover'>('chat');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [newMessage, setNewMessage] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("all");
  const [includeZoom, setIncludeZoom] = useState(false);

  const getZoomDetails = (content: string) => {
    const markerStart = "[ZOOM_MEETING_LINK]";
    const markerEnd = "[/ZOOM_MEETING_LINK]";
    if (content && content.includes(markerStart) && content.includes(markerEnd)) {
      const startIndex = content.indexOf(markerStart);
      const endIndex = content.indexOf(markerEnd);
      const zoomUrl = content.substring(startIndex + markerStart.length, endIndex);
      const cleanText = content.substring(0, startIndex) + content.substring(endIndex + markerEnd.length);

      const idMatch = content.match(/Meeting ID:\s*([^\n]+)/i);
      const pwdMatch = content.match(/Passcode:\s*([^\n]+)/i);
      
      const cleanedText = cleanText
        .replace(/Meeting ID:\s*[^\n]+/gi, '')
        .replace(/Passcode:\s*[^\n]+/gi, '')
        .trim();

      return {
        isZoom: true,
        zoomUrl,
        cleanedText,
        meetingId: idMatch ? idMatch[1].trim() : undefined,
        passcode: pwdMatch ? pwdMatch[1].trim() : undefined
      };
    }
    return { isZoom: false, cleanedText: content };
  };

  const loadMore = () => {
    setLimit(prev => prev + 50);
  };

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
      let finalContent = newMessage;
      if (includeZoom) {
        const zoomId = Math.floor(1000000000 + Math.random() * 9000000000);
        const passcode = Math.random().toString(36).slice(-6).toUpperCase();
        finalContent += `\n\n[ZOOM_MEETING_LINK]https://zoom.us/j/${zoomId}?pwd=${passcode}[/ZOOM_MEETING_LINK]\nMeeting ID: ${zoomId}\nPasscode: ${passcode}`;
      }

      const message: InternalMessage = {
        id: crypto.randomUUID(),
        senderId: currentUser.email || 'system',
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        senderRole: currentUser.role,
        receiverRole: targetRole as any,
        content: finalContent,
        type: activeTab,
        patientId: activeTab === 'handover' ? selectedPatientId : undefined,
        patientName: activeTab === 'handover' ? patients.find(p => p.id === selectedPatientId)?.name : undefined,
        isRead: 0,
        createdAt: Date.now()
      };

      await db.internal_messages.add(message);
      setNewMessage("");
      setSelectedPatientId("");
      setIncludeZoom(false);
      toast.success(
        includeZoom 
          ? "Message sent with Zoom meeting!"
          : (activeTab === 'chat' ? "Message sent" : "Handover created")
      );
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
                    {(() => {
                      const zoomDetails = getZoomDetails(m.content);
                      if (zoomDetails.isZoom) {
                        return (
                          <div className="space-y-2">
                            {zoomDetails.cleanedText && (
                              <p className="whitespace-pre-wrap">{zoomDetails.cleanedText}</p>
                            )}
                            <div className={cn(
                              "mt-2 p-3 rounded-xl border flex flex-col gap-2.5 w-full sm:max-w-[280px]",
                              m.senderId === currentUser?.email
                                ? "bg-indigo-700/50 border-indigo-500/30 text-white"
                                : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                            )}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="p-1 px-1.5 rounded bg-sky-500 text-white font-extrabold text-[10px] tracking-wider uppercase">
                                    ZOOM
                                  </div>
                                  <span className="text-xs font-bold uppercase tracking-wider text-sky-500 dark:text-sky-450 flex items-center gap-1">
                                    <Video className="w-3 h-3" /> Link
                                  </span>
                                </div>
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                              </div>
                              
                              <p className="text-[10px] font-medium opacity-85 leading-normal">
                                Click below to launch the video consultation or joint huddle.
                              </p>

                              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono bg-slate-955/40 p-2 rounded-lg bg-black/10 dark:bg-black/30">
                                <div>
                                  <span className="block text-[8px] uppercase tracking-wider opacity-60 mb-0.5">Meeting ID</span>
                                  <span className="font-bold">{zoomDetails.meetingId || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] uppercase tracking-wider opacity-60 mb-0.5">Passcode</span>
                                  <span className="font-bold">{zoomDetails.passcode || "N/A"}</span>
                                </div>
                              </div>

                              <a
                                href={zoomDetails.zoomUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                  "w-full py-1.5 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all duration-150 border",
                                  m.senderId === currentUser?.email
                                    ? "bg-white text-indigo-700 hover:bg-slate-100 border-transparent shadow"
                                    : "bg-sky-600 text-white hover:bg-sky-700 border-sky-700 shadow"
                                )}
                              >
                                <Video className="w-3.5 h-3.5" />
                                Join Meeting Now
                              </a>
                            </div>
                          </div>
                        );
                      }

                      return <p className="whitespace-pre-wrap">{m.content}</p>;
                    })()}
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
            {filteredMessages.length >= limit && (
               <button onClick={loadMore} className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800 py-2">Load older messages</button>
            )}
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
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setIncludeZoom(prev => !prev)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border",
                    includeZoom 
                      ? "bg-sky-50 border-sky-305 text-sky-700 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-450" 
                      : "bg-white hover:bg-slate-100 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 dark:border-slate-700 text-slate-600 dark:text-slate-400 align-middle"
                  )}
                >
                  <Video className={cn("w-3.5 h-3.5", includeZoom ? "text-sky-500 animate-pulse" : "text-slate-400")} />
                  <span>{includeZoom ? "Zoom Meeting Toggle: ON" : "Schedule Zoom Link"}</span>
                </button>
                {includeZoom && (
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Auto-generates fresh meeting secure ID & passcode
                  </span>
                )}
              </div>
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
