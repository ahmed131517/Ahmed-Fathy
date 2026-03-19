import { useState } from "react";
import { Sparkles, Brain, MessageSquare, Zap, Shield, Check, AlertCircle, Cpu, ExternalLink } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

export function AISettings() {
  const { enableAI, modelType, aiConfidence, updateSettings } = useSettings();
  const [autoSummarization, setAutoSummarization] = useState(true);
  const [predictiveScheduling, setPredictiveScheduling] = useState(false);

  const handleReadPrivacyPolicy = () => {
    toast.info("Opening AI Privacy Policy...");
    window.open("https://policies.google.com/privacy", "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="card-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Features</h2>
          </div>
          <button 
            onClick={() => updateSettings({ enableAI: !enableAI })}
            className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${enableAI ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${enableAI ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
          </button>
        </div>
        <div className={cn("space-y-4 transition-opacity duration-300", !enableAI && "opacity-50 pointer-events-none")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Model Selection</h3>
              </div>
              <select 
                value={modelType} 
                onChange={(e) => updateSettings({ modelType: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-sm"
              >
                <option value="lite">Gemini Lite (Fast)</option>
                <option value="pro">Gemini Pro (Advanced)</option>
                <option value="ultra">Gemini Ultra (Experimental)</option>
              </select>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Confidence Threshold</h3>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="50" 
                  max="100" 
                  value={aiConfidence} 
                  onChange={(e) => updateSettings({ aiConfidence: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-sm font-bold text-slate-900 dark:text-white">{aiConfidence}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Assistant Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Auto-Summarization</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Automatically summarize patient visits and medical history.</p>
            </div>
            <button 
              onClick={() => setAutoSummarization(!autoSummarization)}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${autoSummarization ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${autoSummarization ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Predictive Scheduling</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Suggest optimal appointment slots based on patient behavior.</p>
            </div>
            <button 
              onClick={() => setPredictiveScheduling(!predictiveScheduling)}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${predictiveScheduling ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${predictiveScheduling ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
        </div>
      </div>

      <div className="card-panel p-6 bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Ethics & Privacy</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          All AI processing is performed on HIPAA-compliant servers. Patient data is anonymized before processing. We do not use patient data to train our models.
        </p>
        <button 
          onClick={handleReadPrivacyPolicy}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider flex items-center gap-1"
        >
          Read AI Privacy Policy <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
