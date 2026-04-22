import { useState, useEffect } from "react";
import { Lock, Shield, Key, Smartphone, Eye, EyeOff, AlertTriangle, Check, FileDown, Copy } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { toast } from "sonner";
import { getOrGenerateMasterKey } from "../../lib/crypto";
import { useNavigate } from "react-router-dom";

export function SecuritySettings() {
  const { twoFactor, sessionTimeout, updateSettings } = useSettings();
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [masterKey, setMasterKey] = useState("");
  const [showMasterKey, setShowMasterKey] = useState(false);

  useEffect(() => {
    getOrGenerateMasterKey().then(setMasterKey);
  }, []);

  const copyMasterKey = async () => {
    try {
      await navigator.clipboard.writeText(masterKey);
      toast.success("Recovery Key copied. Store it in a secure password manager.");
    } catch {
      toast.error("Failed to copy recovery key");
    }
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 500);
  };

  const navigate = useNavigate();

  const handleViewAccessLogs = () => {
    navigate("/settings/audit");
  };

  return (
    <div className="space-y-6">
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Authentication</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Two-Factor Authentication (2FA)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
              </div>
            </div>
            <button 
              onClick={() => updateSettings({ twoFactor: !twoFactor })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${twoFactor ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${twoFactor ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Session Timeout (minutes)</label>
            <select 
              value={sessionTimeout} 
              onChange={(e) => updateSettings({ sessionTimeout: e.target.value })}
              className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-sm"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <Key className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 pr-10 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-sm"
                placeholder="••••••••"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-sm" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-sm" 
              />
            </div>
          </div>
          <button 
            onClick={handleUpdatePassword}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Update Password
          </button>
        </div>
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">End-to-End Encryption</h2>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Physical database backups downloaded to your hard drive are strictly encrypted using military-grade AES-GCM (256-bit). To decrypt and restore backups on a new machine, you <strong>must</strong> have the Master Recovery Key below.
          </p>
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-400">
              <span className="font-bold">Warning:</span> If you lose this key, your physical backups will be permanently unrecoverable. We do not store a copy of this key on the cloud.
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Master Recovery Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type={showMasterKey ? "text" : "password"} 
                  readOnly
                  value={masterKey}
                  className="w-full p-2.5 pr-10 bg-slate-50 border rounded-lg dark:bg-slate-900/50 dark:border-slate-700 font-mono text-sm text-slate-800 dark:text-slate-200 select-all"
                />
                <button 
                  onClick={() => setShowMasterKey(!showMasterKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showMasterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button 
                onClick={copyMasterKey}
                className="px-4 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card-panel p-6 border-red-100 dark:border-red-900/30">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Privacy & Data Access</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Review which staff members have access to sensitive patient data. Access logs are audited every 30 days.
        </p>
        <button 
          onClick={handleViewAccessLogs}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider"
        >
          View Access Logs
        </button>
      </div>
    </div>
  );
}
