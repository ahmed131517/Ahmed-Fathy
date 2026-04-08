import { useState } from "react";
import { Globe, Database, Server, Link, ExternalLink, Check, AlertCircle, Plus, MoreVertical, Shield, Zap, MessageSquare, CreditCard, Code, RefreshCw, Trash2, Copy, Eye, EyeOff, X, Search, Star } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface Integration {
  id: string;
  name: string;
  status: 'Connected' | 'Disconnected' | 'Pending';
  type: string;
  icon: any;
  description: string;
  lastSynced?: string;
  category?: string;
}

const MARKETPLACE_INTEGRATIONS = [
  { 
    id: "slack", 
    name: "Slack", 
    type: "Communication", 
    icon: MessageSquare,
    description: "Get real-time notifications and alerts directly in your Slack channels.",
    category: "Communication",
    rating: 4.8
  },
  { 
    id: "google-calendar", 
    name: "Google Calendar", 
    type: "Scheduling", 
    icon: Globe,
    description: "Sync your clinic appointments with Google Calendar for better scheduling.",
    category: "Scheduling",
    rating: 4.9
  },
  { 
    id: "dropbox", 
    name: "Dropbox", 
    type: "Storage", 
    icon: Database,
    description: "Securely store and share patient medical records and lab reports.",
    category: "Storage",
    rating: 4.7
  },
  { 
    id: "zoom", 
    name: "Zoom Video", 
    type: "Telemedicine", 
    icon: Server,
    description: "Conduct high-quality video consultations with patients remotely.",
    category: "Telemedicine",
    rating: 4.6
  },
  { 
    id: "mailchimp", 
    name: "Mailchimp", 
    type: "Marketing", 
    icon: MessageSquare,
    description: "Send newsletters and health tips to your patient database.",
    category: "Marketing",
    rating: 4.5
  },
  { 
    id: "quickbooks", 
    name: "QuickBooks", 
    type: "Accounting", 
    icon: CreditCard,
    description: "Automate your clinic's accounting and financial reporting.",
    category: "Finance",
    rating: 4.8
  }
];

export function IntegrationSettings() {
  const { labIntegration } = useSettings();
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [marketSearch, setMarketSearch] = useState("");
  
  const [integrations, setIntegrations] = useState<Integration[]>([
    { 
      id: "gemini", 
      name: "Google Gemini AI", 
      status: "Connected", 
      type: "AI & NLP", 
      icon: Zap,
      description: "Powers symptom analysis, diagnosis reasoning, and AI chat features.",
      lastSynced: "5m ago"
    },
    { 
      id: "labcentral", 
      name: "LabCentral", 
      status: labIntegration ? "Connected" : "Disconnected", 
      type: "Diagnostics", 
      icon: Database,
      description: "Automated lab result synchronization and electronic requests.",
      lastSynced: "2h ago"
    },
    { 
      id: "twilio", 
      name: "Twilio SMS", 
      status: "Disconnected", 
      type: "Communication", 
      icon: MessageSquare,
      description: "Sends automated appointment reminders and critical alerts via SMS."
    },
    { 
      id: "stripe", 
      name: "Stripe Payments", 
      status: "Disconnected", 
      type: "Billing", 
      icon: CreditCard,
      description: "Secure patient billing and online payment processing."
    },
  ]);

  const [webhooks, setWebhooks] = useState([
    { id: 1, url: "https://api.clinic-manager.com/webhooks/lab-results", events: ["lab.completed", "lab.failed"], status: "Active" },
    { id: 2, url: "https://webhooks.pharmacy-partner.io/v1/orders", events: ["prescription.created"], status: "Active" },
  ]);

  const [showSecretKey, setShowSecretKey] = useState(false);
  const publicKey = "pk_test_51Mz9F2L9W2X3Y4Z5A6B7C8D9E0F1G2H3";
  const secretKey = "sk_test_51Mz9F2L9W2X3Y4Z5A6B7C8D9E0F1G2H3";

  const handleAddIntegration = () => {
    setShowMarketplace(true);
  };

  const handleInstallIntegration = (marketInteg: typeof MARKETPLACE_INTEGRATIONS[0]) => {
    if (integrations.find(i => i.id === marketInteg.id)) {
      toast.error(`${marketInteg.name} is already installed.`);
      return;
    }

    const newInteg: Integration = {
      id: marketInteg.id,
      name: marketInteg.name,
      status: 'Disconnected',
      type: marketInteg.type,
      icon: marketInteg.icon,
      description: marketInteg.description
    };

    setIntegrations(prev => [...prev, newInteg]);
    toast.success(`${marketInteg.name} installed successfully!`);
    setShowMarketplace(false);
  };

  const handleTestConnection = (id: string) => {
    setIsTesting(id);
    setTimeout(() => {
      setIsTesting(null);
      toast.success(`Connection to ${id} is stable and active.`);
    }, 1500);
  };

  const handleToggleStatus = (id: string) => {
    setIntegrations(prev => prev.map(integ => {
      if (integ.id === id) {
        const newStatus = integ.status === 'Connected' ? 'Disconnected' : 'Connected';
        toast.success(`${integ.name} ${newStatus === 'Connected' ? 'connected' : 'disconnected'}`);
        return { ...integ, status: newStatus as any };
      }
      return integ;
    }));
  };

  const handleRemoveIntegration = (id: string) => {
    setIntegrations(prev => prev.filter(i => i.id !== id));
    toast.success("Integration removed");
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const filteredMarket = MARKETPLACE_INTEGRATIONS.filter(i => 
    i.name.toLowerCase().includes(marketSearch.toLowerCase()) ||
    i.type.toLowerCase().includes(marketSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Integration & API</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage external services, API connections, and webhooks</p>
        </div>
        <button 
          onClick={handleAddIntegration}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" /> Browse Integrations
        </button>
      </div>

      {/* Connected Services */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          <Server className="w-4 h-4" />
          <h3>Connected Services</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="card-panel p-6 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl transition-all group-hover:scale-110",
                    integration.status === 'Connected' 
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    <integration.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{integration.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{integration.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    integration.status === 'Connected' 
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  )}>
                    {integration.status}
                  </span>
                  <button 
                    onClick={() => handleRemoveIntegration(integration.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove Integration"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">
                {integration.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleTestConnection(integration.id)}
                    disabled={integration.status !== 'Connected' || isTesting === integration.id}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider flex items-center gap-1 disabled:opacity-30 disabled:no-underline"
                  >
                    {isTesting === integration.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Zap className="w-3 h-3" />
                    )}
                    Test Connection
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(integration.id)}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline uppercase tracking-wider"
                  >
                    {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
                {integration.lastSynced && (
                  <p className="text-[10px] text-slate-400 italic">Last sync: {integration.lastSynced}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys Section */}
      <div className="card-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">API Access Keys</h2>
          </div>
          <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Rotate Keys
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Public API Key</p>
                <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[8px] font-bold uppercase">Production</span>
              </div>
              <button 
                onClick={() => handleCopy(publicKey, "Public Key")}
                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
                title="Copy to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-slate-700 dark:text-slate-300 break-all bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                {publicKey}
              </code>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Secret API Key</p>
                <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[8px] font-bold uppercase">Restricted</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
                  title={showSecretKey ? "Hide key" : "Show key"}
                >
                  {showSecretKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={() => handleCopy(secretKey, "Secret Key")}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-slate-700 dark:text-slate-300 break-all bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                {showSecretKey ? secretKey : "••••••••••••••••••••••••••••••••••••••••••••••••"}
              </code>
            </div>
            <p className="mt-2 text-[10px] text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Never share your secret key in client-side code or public repositories.
            </p>
          </div>
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="card-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Outgoing Webhooks</h2>
          </div>
          <button className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" /> Add Webhook
          </button>
        </div>

        <div className="space-y-3">
          {webhooks.map(webhook => (
            <div key={webhook.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold uppercase">Active</span>
                  <p className="text-xs font-mono text-slate-900 dark:text-white truncate">{webhook.url}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.map(event => (
                    <span key={event} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-medium">
                      {event}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marketplace Modal */}
      <AnimatePresence>
        {showMarketplace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMarketplace(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Integration Marketplace</h2>
                    <p className="text-sm text-slate-500">Discover and install powerful extensions for your clinic</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMarketplace(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search integrations by name, category, or feature..."
                    value={marketSearch}
                    onChange={(e) => setMarketSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Marketplace Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMarket.length > 0 ? (
                    filteredMarket.map((item) => {
                      const isInstalled = integrations.some(i => i.id === item.id);
                      return (
                        <div key={item.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-lg transition-all group bg-white dark:bg-slate-900/50">
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all">
                              <item.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{item.rating}</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{item.name}</h3>
                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">{item.type}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                              {item.description}
                            </p>
                          </div>
                          <button 
                            onClick={() => handleInstallIntegration(item)}
                            disabled={isInstalled}
                            className={cn(
                              "w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                              isInstalled 
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95"
                            )}
                          >
                            {isInstalled ? (
                              <>
                                <Check className="w-4 h-4" /> Installed
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" /> Install Integration
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-12 text-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">No integrations found</h3>
                      <p className="text-sm text-slate-500">Try searching for something else or browse categories.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Can't find what you're looking for? <button className="text-indigo-600 font-bold hover:underline">Request an integration</button>
                </p>
                <button 
                  onClick={() => setShowMarketplace(false)}
                  className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
