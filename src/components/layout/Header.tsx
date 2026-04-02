import { Search, Bell, Mic, Menu, User, Calendar, FileText, ChevronDown, Settings, LogOut, Book, Pill, ClipboardList } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../lib/UserContext";
import { useNotifications } from "../../lib/NotificationContext";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { medicationsDatabase } from '@/data/medications';
import { ALL_TESTS } from '@/data/labReferenceData';
import { HEAD_MODELS, EAR_MODELS, EYE_MODELS, THROAT_MODELS, BACK_MODELS } from '@/data/symptomModels';

// Mock patient data
const mockPatients = [
  { id: "P-1001", name: "Sarah Johnson", dob: "1985-04-12", lastVisit: "2023-10-15" },
  { id: "P-1002", name: "Michael Chen", dob: "1972-11-08", lastVisit: "2023-11-02" },
  { id: "P-1003", name: "Emily Davis", dob: "1990-08-24", lastVisit: "2023-09-28" },
  { id: "P-1004", name: "James Wilson", dob: "1965-02-15", lastVisit: "2023-11-10" },
  { id: "P-1005", name: "Maria Garcia", dob: "1988-06-30", lastVisit: "2023-10-05" },
];

const allClinicalData = [
  ...Object.values(medicationsDatabase).flat().map(m => ({ id: m.id, title: m.name, category: 'Medication', icon: Pill })),
  ...ALL_TESTS.map(l => ({ id: l.name, title: l.name, category: 'Lab Reference', icon: FileText })),
  ...[...HEAD_MODELS, ...EAR_MODELS, ...EYE_MODELS, ...THROAT_MODELS, ...BACK_MODELS].map(s => ({ id: s.id, title: s.label, category: 'Encyclopedia', icon: Book })),
];

const mockNotifications = [
  { id: 1, title: "Lab Results Available", message: "New lab results for Sarah Johnson are ready for review.", time: "10m ago", type: "urgent", read: false },
  { id: 2, title: "Appointment Reminder", message: "Michael Chen is scheduled for a follow-up in 30 minutes.", time: "25m ago", type: "info", read: false },
  { id: 3, title: "Schedule Update", message: "Your shift for next Tuesday has been confirmed.", time: "2h ago", type: "success", read: true },
];

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const { profile } = useUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Voice Search Implementation
  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Voice search is not supported in your browser.");
      return;
    }

    // If already listening, stop it
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsSearchOpen(true);
      setIsListening(false);
      toast.success(`Searching for: ${transcript}`);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      if (event.error !== 'aborted') {
        toast.error("Could not recognize speech. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  // Filter patients and clinical data based on search query
  const patientResults = mockPatients.filter(patient => 
    patient.name?.toLowerCase().includes(searchQuery?.toLowerCase() || '') || 
    patient.id?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
  );

  const clinicalResults = allClinicalData.filter(item => 
    item.title?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
  );

  // Handle keyboard navigation for profile dropdown
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isProfileOpen) return;
      
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isProfileOpen]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={cn(
      "h-16 flex items-center justify-between px-4 md:px-6 z-20 sticky top-0 transition-all duration-200",
      "glass-panel"
    )}>
      <div className="flex items-center flex-1">
        <button 
          onClick={() => toast.info("Mobile menu coming soon!")}
          className="md:hidden p-2 -ml-2 mr-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-full max-w-md hidden md:block" ref={searchRef}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-2 border border-slate-200 dark:border-slate-800 rounded-lg leading-5 bg-slate-50 dark:bg-slate-950/50 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            placeholder="Search patients or clinical knowledge..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
          <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center">
            <button 
              onClick={startVoiceSearch}
              className={cn(
                "p-1.5 rounded-md transition-all duration-200",
                isListening 
                  ? "text-red-600 bg-red-50 dark:bg-red-500/10 animate-pulse scale-110" 
                  : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              )}
              title="Voice Search"
            >
              <Mic className={cn("h-4 w-4", isListening && "fill-current")} />
            </button>
          </div>
          
          {/* Search Results Dropdown */}
          {isSearchOpen && searchQuery.length > 0 && (
            <div className="absolute mt-1 w-full bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
              {(patientResults.length > 0 || clinicalResults.length > 0) ? (
                <ul className="max-h-80 overflow-y-auto py-1">
                  {patientResults.map((patient) => (
                    <li key={patient.id}>
                      <button 
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-3 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                        onClick={() => {
                          setSearchQuery(patient.name);
                          setIsSearchOpen(false);
                          // In a real app, this would navigate to the patient's record
                        }}
                      >
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{patient.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {patient.id}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> DOB: {patient.dob}</span>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                  {clinicalResults.map((item) => (
                    <li key={item.id}>
                      <button 
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-3 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                        onClick={() => {
                          setSearchQuery(item.title);
                          setIsSearchOpen(false);
                          // In a real app, this would navigate to the clinical entry
                        }}
                      >
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <item.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{item.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.category}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  No results found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <select className="text-sm border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 rounded-md py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 hidden sm:block">
          <option value="en" className="dark:bg-slate-900">English</option>
          <option value="ar" className="dark:bg-slate-900">العربية</option>
        </select>
        
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all duration-200 group"
          >
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 group-hover:scale-110 transition-transform">
                {unreadCount}
              </span>
            )}
            <Bell className="h-5 w-5" />
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 origin-top-right"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button 
                        key={notification.localId}
                        onClick={() => {
                          if (notification.localId) markAsRead(notification.localId);
                          if (notification.link) navigate(notification.link);
                          setIsNotificationsOpen(false);
                        }}
                        className={cn(
                          "w-full text-left p-4 border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3",
                          notification.isRead === 0 && "bg-indigo-50/30 dark:bg-indigo-500/5"
                        )}
                      >
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 shrink-0",
                          notification.type === 'error' ? "bg-red-500" : 
                          notification.type === 'success' ? "bg-emerald-500" : 
                          notification.type === 'warning' ? "bg-amber-500" : "bg-indigo-500",
                          notification.isRead === 1 && "opacity-30"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn("text-sm truncate", notification.isRead === 1 ? "text-slate-500 dark:text-slate-400 font-medium" : "text-slate-900 dark:text-white font-bold")}>
                              {notification.title}
                            </p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                              {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button 
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigate('/notifications');
                    }}
                    className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center space-x-3 border-l border-slate-200 dark:border-slate-800 pl-4">
          <div className="relative" ref={profileRef}>
            <button 
              className="flex items-center space-x-3 cursor-pointer focus:outline-none hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 rounded-lg transition-colors"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm border border-indigo-200 dark:border-indigo-500/30 bg-cover bg-center"
                     style={profile.avatarImage ? { backgroundImage: `url(${profile.avatarImage})` } : {}}>
                  {!profile.avatarImage && profile.avatarInitials}
                </div>
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-[15px] font-semibold text-[#1e293b] dark:text-slate-200">Dr. {profile.firstName} {profile.lastName}</span>
                <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">{profile.specialty}</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-500 dark:text-slate-400 hidden sm:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden z-50 py-1 origin-top-right"
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[15px] font-semibold text-[#2c3e50] dark:text-slate-200">My Account</p>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{profile.email}</p>
                  </div>
                  <ul className="py-1">
                    <li>
                      <button 
                        role="menuitem" 
                        onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                        className="w-full text-left px-4 py-2.5 text-[15px] text-[#2c3e50] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 focus:bg-slate-50 dark:focus:bg-slate-800 focus:outline-none"
                      >
                        <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        Profile
                      </button>
                    </li>
                    <li>
                      <button 
                        role="menuitem" 
                        onClick={() => { setIsProfileOpen(false); navigate('/schedule'); }}
                        className="w-full text-left px-4 py-2.5 text-[15px] text-[#2c3e50] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 focus:bg-slate-50 dark:focus:bg-slate-800 focus:outline-none"
                      >
                        <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        Schedule
                      </button>
                    </li>
                    <li>
                      <button 
                        role="menuitem" 
                        onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
                        className="w-full text-left px-4 py-2.5 text-[15px] text-[#2c3e50] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 focus:bg-slate-50 dark:focus:bg-slate-800 focus:outline-none"
                      >
                        <Settings className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        Settings
                      </button>
                    </li>
                  </ul>
                  <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        toast.success("Signed out successfully");
                      }}
                      role="menuitem" 
                      className="w-full text-left px-4 py-2.5 text-[15px] text-[#e74c3c] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-3 focus:bg-red-50 dark:focus:bg-red-500/10 focus:outline-none"
                    >
                      <LogOut className="h-4 w-4 text-[#e74c3c] dark:text-red-400" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
