import { useState } from "react";
import { Globe, Database, Server, Link, ExternalLink, Check, AlertCircle, Plus, MoreVertical } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

export function IntegrationSettings() {
  const { labIntegration } = useSettings();
  const [integrations, setIntegrations] = useState([
    { id: 1, name: "HealthSync API", status: "Connected", type: "Data Sync", icon: Globe },
    { id: 2, name: "LabCentral", status: labIntegration ? "Connected" : "Disconnected", type: "Diagnostics", icon: Database },
    { id: 3, name: "PharmaConnect", status: "Disconnected", type: "Pharmacy", icon: Server },
  ]);

  const [showSecretKey, setShowSecretKey] = useState(false);
  const publicKey = "pk_test_51Mz9F2L9W2X3Y4Z5A6B7C8D9E0F1G2H3";
  const secretKey = "sk_test_51Mz9F2L9W2X3Y4Z5A6B7C8D9E0F1G2H3";

  const handleAddIntegration = () => {
    toast.info("Add Integration dialog would open here");
  };

  const handleConfigure = (name: string) => {
    toast.info(`Configuring ${name}...`);
  };

  const handleIntegrationAction = (name: string) => {
    toast.info(`Actions menu for ${name}`);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const toggleSecretKey = () => {
    setShowSecretKey(!showSecretKey);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Integration & API</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage external services and API connections</p>
        </div>
        <button 
          onClick={handleAddIntegration}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="card-panel p-6 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <integration.icon className="w-6 h-6" />
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
                  onClick={() => handleIntegrationAction(integration.name)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{integration.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{integration.type}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <button 
                onClick={() => handleConfigure(integration.name)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider flex items-center gap-1"
              >
                Configure <ExternalLink className="w-3 h-3" />
              </button>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Last synced: 2h ago</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">API Keys</h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Public Key</p>
              <button 
                onClick={() => handleCopy(publicKey, "Public Key")}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider"
              >
                Copy
              </button>
            </div>
            <code className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{publicKey}</code>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Secret Key</p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleCopy(secretKey, "Secret Key")}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider"
                >
                  Copy
                </button>
                <button 
                  onClick={toggleSecretKey}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider"
                >
                  {showSecretKey ? "Hide" : "Reveal"}
                </button>
              </div>
            </div>
            <code className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
              {showSecretKey ? secretKey : "••••••••••••••••••••••••••••••••••••••••••••••••"}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
