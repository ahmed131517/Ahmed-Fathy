import { useState } from "react";
import { 
  Globe, Database, Server, Link, ExternalLink, Check, AlertCircle, Plus, 
  MoreVertical, Shield, Zap, MessageSquare, CreditCard, Code, RefreshCw, 
  Trash2, Copy, Eye, EyeOff, X, Search, Star, Truck, Building2, PackageCheck, 
  Send, Activity, ShieldCheck, Radio, Terminal, Settings2, CheckCircle2, AlertTriangle, Layers
} from "lucide-react";
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

interface Supplier {
  id: string;
  name: string;
  category: string;
  accountNumber: string;
  ediProtocol: 'SFTP' | 'AS2' | 'REST API';
  autoReorder: boolean;
  status: 'Active' | 'Inactive' | 'Pending Verification';
  lastPoSync?: string;
  contactEmail: string;
  leadTimeDays: number;
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
  const [activeTab, setActiveTab] = useState<'suppliers' | 'interop' | 'services' | 'developer'>('suppliers');
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [marketSearch, setMarketSearch] = useState("");

  // Suppliers & EDI State
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierCat, setNewSupplierCat] = useState("Wholesale Drugs & Biologics");
  const [newSupplierAccount, setNewSupplierAccount] = useState("");
  const [newSupplierProtocol, setNewSupplierProtocol] = useState<'SFTP' | 'AS2' | 'REST API'>("REST API");
  const [newSupplierEmail, setNewSupplierEmail] = useState("");
  const [newSupplierLeadTime, setNewSupplierLeadTime] = useState(2);

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "sup-1",
      name: "McKesson Pharmaceuticals",
      category: "Wholesale Drugs & Biologics",
      accountNumber: "MCK-992014",
      ediProtocol: "AS2",
      autoReorder: true,
      status: "Active",
      lastPoSync: "10 mins ago",
      contactEmail: "orders@mckesson.com",
      leadTimeDays: 1
    },
    {
      id: "sup-2",
      name: "Cencora (AmerisourceBergen)",
      category: "Specialty Pharmacy & Vaccines",
      accountNumber: "ABC-884102",
      ediProtocol: "REST API",
      autoReorder: true,
      status: "Active",
      lastPoSync: "1 hour ago",
      contactEmail: "edi-support@cencora.com",
      leadTimeDays: 2
    },
    {
      id: "sup-3",
      name: "Cardinal Health Supply",
      category: "Surgical & Medical Consumables",
      accountNumber: "CH-551093",
      ediProtocol: "SFTP",
      autoReorder: false,
      status: "Active",
      lastPoSync: "Yesterday",
      contactEmail: "fulfillment@cardinalhealth.com",
      leadTimeDays: 3
    },
    {
      id: "sup-4",
      name: "Medline Industries",
      category: "PPE & Diagnostic Kits",
      accountNumber: "MED-102934",
      ediProtocol: "REST API",
      autoReorder: false,
      status: "Pending Verification",
      contactEmail: "support@medline.com",
      leadTimeDays: 2
    }
  ]);

  // Interoperability State
  const [fhirEnabled, setFhirEnabled] = useState(true);
  const [hl7FeedActive, setHl7FeedActive] = useState(true);
  const [dicomPacsConnected, setDicomPacsConnected] = useState(true);
  const [simulatingHl7, setSimulatingHl7] = useState(false);

  // Webhook Tester State
  const [showWebhookTester, setShowWebhookTester] = useState(false);
  const [testEvent, setTestEvent] = useState("prescription.created");
  const [testLog, setTestLog] = useState<{ status: number; payload: string; response: string } | null>(null);
  const [isSendingTestWebhook, setIsSendingTestWebhook] = useState(false);
  
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

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) {
      toast.error("Please enter supplier name");
      return;
    }

    const created: Supplier = {
      id: `sup-${Date.now()}`,
      name: newSupplierName.trim(),
      category: newSupplierCat,
      accountNumber: newSupplierAccount || `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
      ediProtocol: newSupplierProtocol,
      autoReorder: true,
      status: 'Active',
      lastPoSync: 'Just now',
      contactEmail: newSupplierEmail || 'edi@supplier.com',
      leadTimeDays: newSupplierLeadTime
    };

    setSuppliers(prev => [created, ...prev]);
    toast.success(`Supplier "${created.name}" connected successfully!`);
    setShowAddSupplierModal(false);
    setNewSupplierName("");
    setNewSupplierAccount("");
    setNewSupplierEmail("");
  };

  const handleToggleAutoReorder = (id: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === id) {
        const next = !s.autoReorder;
        toast.info(`${s.name} Auto-Reorder threshold ${next ? 'enabled' : 'disabled'}`);
        return { ...s, autoReorder: next };
      }
      return s;
    }));
  };

  const handleSyncSupplierEdi = (id: string) => {
    setIsTesting(id);
    setTimeout(() => {
      setIsTesting(null);
      setSuppliers(prev => prev.map(s => s.id === id ? { ...s, lastPoSync: 'Just now' } : s));
      toast.success("EDI 850 Purchase Order catalog synced successfully!");
    }, 1200);
  };

  const handleSimulateHl7Packet = () => {
    setSimulatingHl7(true);
    setTimeout(() => {
      setSimulatingHl7(false);
      toast.success("HL7 v2.5 ADT_A08 (Patient Update) packet transmitted and parsed.");
    }, 1500);
  };

  const handleSendTestWebhook = () => {
    setIsSendingTestWebhook(true);
    setTimeout(() => {
      setIsSendingTestWebhook(false);
      setTestLog({
        status: 200,
        payload: JSON.stringify({
          event: testEvent,
          timestamp: Date.now(),
          clinicId: "clinic-prod-01",
          data: { id: "res-99823", status: "VERIFIED" }
        }, null, 2),
        response: JSON.stringify({ received: true, httpCode: 200, latencyMs: 42 }, null, 2)
      });
      toast.success("Webhook payload delivered successfully!");
    }, 1000);
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
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Supplier & System Integrations</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage pharmaceutical wholesalers, EDI purchase orders, HL7/FHIR interoperability, and webhooks</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAddSupplierModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-2 transition-all shadow-sm hover:shadow active:scale-95"
          >
            <Truck className="w-4 h-4" /> Connect New Supplier
          </button>
          <button 
            onClick={handleAddIntegration}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-2 transition-all shadow-sm hover:shadow active:scale-95"
          >
            <Plus className="w-4 h-4" /> App Marketplace
          </button>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="flex items-center p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl max-w-fit gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
            activeTab === 'suppliers' 
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          )}
        >
          <Truck className="w-3.5 h-3.5" />
          Pharma Suppliers & EDI
        </button>

        <button
          onClick={() => setActiveTab('interop')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
            activeTab === 'interop' 
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          )}
        >
          <Activity className="w-3.5 h-3.5" />
          HL7 / FHIR Interoperability
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
            activeTab === 'services' 
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          )}
        >
          <Server className="w-3.5 h-3.5" />
          Connected Services
        </button>

        <button
          onClick={() => setActiveTab('developer')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
            activeTab === 'developer' 
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          )}
        >
          <Code className="w-3.5 h-3.5" />
          API Keys & Webhooks
        </button>
      </div>

      {/* TAB 1: PHARMACEUTICAL SUPPLIERS & EDI */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 text-emerald-600 mb-2">
                <Truck className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Connected Wholesalers</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {suppliers.filter(s => s.status === 'Active').length} Active
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Direct EDI 850/855/856 integration enabled</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 text-indigo-600 mb-2">
                <RefreshCw className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Auto-Reorder Threshold</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {suppliers.filter(s => s.autoReorder).length} Vendors Enabled
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Automatic purchase orders dispatched when stock is low</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 text-amber-600 mb-2">
                <PackageCheck className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Fulfillment Lead Time</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                1.5 Days
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Next-day emergency drug delivery supported</p>
            </div>
          </div>

          {/* Supplier Directory List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Wholesale Pharmaceutical & Supply Vendor Catalog
                </h3>
                <p className="text-xs text-slate-500">Electronic Data Interchange (EDI) protocol settings & automated catalog sync</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {suppliers.map(s => (
                <div key={s.id} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-all bg-slate-50/50 dark:bg-slate-950/40 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</h4>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          s.status === 'Active' 
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200" 
                            : "bg-amber-50 text-amber-600 border-amber-200"
                        )}>
                          {s.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{s.category}</p>
                    </div>

                    <button
                      onClick={() => handleSyncSupplierEdi(s.id)}
                      disabled={isTesting === s.id}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", isTesting === s.id && "animate-spin")} />
                      Sync Catalog
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Account No.</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{s.accountNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">EDI Protocol</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{s.ediProtocol}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Lead Time</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{s.leadTimeDays} Day(s)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Last Sync</span>
                      <span className="font-medium text-slate-500">{s.lastPoSync || 'Never'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Auto-Reorder Dispatch:</span>
                      <button
                        onClick={() => handleToggleAutoReorder(s.id)}
                        className={cn(
                          "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
                          s.autoReorder ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform",
                          s.autoReorder ? 'right-0.5' : 'left-0.5'
                        )} />
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400">{s.contactEmail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HEALTHCARE INTEROPERABILITY (HL7 / FHIR) */}
      {activeTab === 'interop' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  EHR / EMR Interoperability & Clinical Feeds
                </h3>
                <p className="text-xs text-slate-500">Configure FHIR R4 REST endpoints, HL7 v2 message listeners, and DICOM PACS imaging servers</p>
              </div>

              <button
                onClick={handleSimulateHl7Packet}
                disabled={simulatingHl7}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Radio className={cn("w-4 h-4", simulatingHl7 && "animate-pulse")} />
                {simulatingHl7 ? "Transmitting Packet..." : "Simulate HL7 ADT Event"}
              </button>
            </div>

            <div className="space-y-4">
              {/* FHIR R4 API */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold rounded">FHIR R4</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">HL7 FHIR RESTful Clinical Server</h4>
                  </div>
                  <p className="text-xs text-slate-500">Standardized API for Patient, Observation, MedicationRequest, and DiagnosticReport resources</p>
                  <code className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 block bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-800 w-fit">
                    https://fhir.clinic-core.org/v4
                  </code>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200">
                    Active
                  </span>
                  <button 
                    onClick={() => setFhirEnabled(!fhirEnabled)}
                    className={cn(
                      "w-11 h-6 rounded-full relative cursor-pointer transition-colors",
                      fhirEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform",
                      fhirEnabled ? 'right-0.5' : 'left-0.5'
                    )} />
                  </button>
                </div>
              </div>

              {/* HL7 v2.5 Feed */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold rounded">HL7 v2.5</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">MLLP / TCP Socket Listener</h4>
                  </div>
                  <p className="text-xs text-slate-500">Parses ADT (Admit/Discharge), ORM (Pharmacy Order), and ORU (Lab Results) packets in real time</p>
                  <code className="text-[11px] font-mono text-slate-700 dark:text-slate-300 block bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-800 w-fit">
                    mllp://hl7.clinic-core.org:2575
                  </code>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200">
                    Listening
                  </span>
                  <button 
                    onClick={() => setHl7FeedActive(!hl7FeedActive)}
                    className={cn(
                      "w-11 h-6 rounded-full relative cursor-pointer transition-colors",
                      hl7FeedActive ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform",
                      hl7FeedActive ? 'right-0.5' : 'left-0.5'
                    )} />
                  </button>
                </div>
              </div>

              {/* DICOM PACS */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold rounded">DICOM</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">PACS Medical Imaging Gateway</h4>
                  </div>
                  <p className="text-xs text-slate-500">Connects X-Ray, MRI, and CT scan imagery directly to patient medical records</p>
                  <code className="text-[11px] font-mono text-slate-700 dark:text-slate-300 block bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-800 w-fit">
                    pacs.hospital-net.internal:104 (AET: CLINIC_PACS)
                  </code>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200">
                    Online
                  </span>
                  <button 
                    onClick={() => setDicomPacsConnected(!dicomPacsConnected)}
                    className={cn(
                      "w-11 h-6 rounded-full relative cursor-pointer transition-colors",
                      dicomPacsConnected ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform",
                      dicomPacsConnected ? 'right-0.5' : 'left-0.5'
                    )} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONNECTED SERVICES */}
      {activeTab === 'services' && (
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
      )}

      {/* TAB 4: API KEYS & WEBHOOKS */}
      {activeTab === 'developer' && (
        <div className="space-y-6">
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
          <div className="card-panel p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Outgoing Webhook Subscriptions</h2>
              </div>
              <button 
                onClick={() => setShowWebhookTester(true)}
                className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all flex items-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5" /> Webhook Sandbox
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
        </div>
      )}

      {/* Add Supplier Modal */}
      <AnimatePresence>
        {showAddSupplierModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddSupplierModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 space-y-5 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Connect Pharmaceutical Supplier</h3>
                </div>
                <button onClick={() => setShowAddSupplierModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Supplier / Wholesaler Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Cardinal Health, McKesson, Local Vendor"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Supplier Category</label>
                    <select
                      value={newSupplierCat}
                      onChange={(e) => setNewSupplierCat(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none"
                    >
                      <option value="Wholesale Drugs & Biologics">Wholesale Drugs & Biologics</option>
                      <option value="Specialty Pharmacy & Vaccines">Specialty Pharmacy & Vaccines</option>
                      <option value="Surgical & Medical Consumables">Surgical & Medical Consumables</option>
                      <option value="PPE & Diagnostic Kits">PPE & Diagnostic Kits</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">EDI Integration Protocol</label>
                    <select
                      value={newSupplierProtocol}
                      onChange={(e) => setNewSupplierProtocol(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none"
                    >
                      <option value="REST API">REST API Endpoint</option>
                      <option value="AS2">AS2 Direct Connection</option>
                      <option value="SFTP">Secure SFTP File Exchange</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
                    <input 
                      type="text"
                      placeholder="e.g. ACC-889100"
                      value={newSupplierAccount}
                      onChange={(e) => setNewSupplierAccount(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lead Time (Days)</label>
                    <input 
                      type="number"
                      min="1"
                      max="14"
                      value={newSupplierLeadTime}
                      onChange={(e) => setNewSupplierLeadTime(parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dispatch Contact Email</label>
                  <input 
                    type="email"
                    placeholder="edi-orders@supplier.com"
                    value={newSupplierEmail}
                    onChange={(e) => setNewSupplierEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddSupplierModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                  >
                    Connect Supplier
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Webhook Sandbox Modal */}
      <AnimatePresence>
        {showWebhookTester && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWebhookTester(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Interactive Webhook Delivery Sandbox</h3>
                </div>
                <button onClick={() => setShowWebhookTester(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Event Trigger</label>
                  <select
                    value={testEvent}
                    onChange={(e) => setTestEvent(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                  >
                    <option value="prescription.created">prescription.created</option>
                    <option value="lab.completed">lab.completed</option>
                    <option value="inventory.low_stock">inventory.low_stock</option>
                    <option value="patient.admitted">patient.admitted</option>
                  </select>
                </div>

                <button
                  onClick={handleSendTestWebhook}
                  disabled={isSendingTestWebhook}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className={cn("w-3.5 h-3.5", isSendingTestWebhook && "animate-pulse")} />
                  {isSendingTestWebhook ? "Transmitting..." : "Send Test Webhook Event"}
                </button>

                {testLog && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">HTTP Status:</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-mono text-[10px] font-bold rounded">
                        {testLog.status} OK
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block font-bold text-slate-500 mb-1">Outgoing Payload</span>
                        <pre className="p-3 bg-slate-950 text-indigo-400 rounded-xl text-[10px] font-mono overflow-x-auto max-h-40">
                          {testLog.payload}
                        </pre>
                      </div>

                      <div>
                        <span className="block font-bold text-slate-500 mb-1">Server Response</span>
                        <pre className="p-3 bg-slate-950 text-emerald-400 rounded-xl text-[10px] font-mono overflow-x-auto max-h-40">
                          {testLog.response}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

