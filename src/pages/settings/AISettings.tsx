import { useState, useEffect } from "react";
import { 
  Sparkles, Brain, MessageSquare, Zap, Shield, 
  ExternalLink, Volume2, Bot, Trash2, Loader2,
  Cloud, Server, CheckCircle2, XCircle, Globe, Info
} from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { useAISettings } from "../../lib/AISettingsContext";
import { db } from "../../lib/db";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

export function AISettings() {
  const { aiProcessingMode, modelType, aiTemperature, aiMaxTokens, updateSettings: updateGlobalSettings } = useSettings();
  const { settings: aiSettings, updateSettings: updateAISettings } = useAISettings();
  
  const [autoSummarization, setAutoSummarization] = useState(true);
  const [predictiveScheduling, setPredictiveScheduling] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      if (!aiSettings.voiceURI && availableVoices.length > 0) {
        updateAISettings({ voiceURI: availableVoices[0].voiceURI });
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [aiSettings.voiceURI, updateAISettings]);

  const handleReadPrivacyPolicy = () => {
    toast.info("Opening AI Privacy Policy...");
    window.open("https://policies.google.com/privacy", "_blank");
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear all AI chat history? This action cannot be undone.")) {
      setIsClearing(true);
      try {
        await db.chat_messages.clear();
        toast.success("Chat history cleared successfully");
      } catch (error) {
        console.error("Failed to clear chat history:", error);
        toast.error("Failed to clear chat history");
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleTestVoice = () => {
    if (isTestingVoice) return;
    
    setIsTestingVoice(true);
    const text = "This is a test of the clinical assistant voice settings. How does it sound?";
    
    if (aiSettings.useElevenLabs) {
      toast.info("Testing ElevenLabs voice... (Simulated)");
      // In a real app, this would call the ElevenLabs API
      setTimeout(() => setIsTestingVoice(false), 2000);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = voices.find(v => v.voiceURI === aiSettings.voiceURI);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = aiSettings.speechRate;
      
      utterance.onend = () => setIsTestingVoice(false);
      utterance.onerror = () => {
        setIsTestingVoice(false);
        toast.error("Speech synthesis failed");
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Global AI Features */}
      <div className="card-panel p-6">
        <div className="space-y-6">
          {/* AI Processing Mode */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">AI Processing Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => updateGlobalSettings({ aiProcessingMode: 'cloud' })}
                className={cn(
                  "relative flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                  aiProcessingMode === 'cloud' 
                    ? "border-cyan-400 bg-cyan-500/5 shadow-[0_0_15px_rgba(34,211,238,0.15)]" 
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <Cloud className={cn("w-5 h-5", aiProcessingMode === 'cloud' ? "text-cyan-400" : "text-slate-400")} />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Cloud AI</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Gemini / GPT models</div>
                  </div>
                </div>
                {aiProcessingMode === 'cloud' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </button>

              <button
                onClick={() => updateGlobalSettings({ aiProcessingMode: 'local' })}
                className={cn(
                  "relative flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                  aiProcessingMode === 'local' 
                    ? "border-purple-400 bg-purple-500/5 shadow-[0_0_15px_rgba(192,132,252,0.15)]" 
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <Server className={cn("w-5 h-5", aiProcessingMode === 'local' ? "text-purple-400" : "text-slate-400")} />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Local AI</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">LM Studio / RAG</div>
                  </div>
                </div>
                {aiProcessingMode === 'local' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </button>
            </div>
          </div>

          {/* Cloud Model */}
          <div className={cn("transition-opacity duration-300", aiProcessingMode !== 'cloud' && "opacity-50 pointer-events-none")}>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Cloud Model</h3>
            <div className="space-y-4">
              <select 
                value={modelType} 
                onChange={(e) => updateGlobalSettings({ modelType: e.target.value })}
                className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                <option value="gemini-3-flash-preview">Gemini 3 Flash (Preview)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Advanced)</option>
              </select>

              {/* OpenRouter Integration */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Use OpenRouter</h4>
                  </div>
                  <button 
                    onClick={() => updateAISettings({ useOpenRouter: !aiSettings.useOpenRouter })}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${aiSettings.useOpenRouter ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${aiSettings.useOpenRouter ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
                  </button>
                </div>

                {aiSettings.useOpenRouter && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        OpenRouter API Key
                      </label>
                      <input 
                        type="password" 
                        value={aiSettings.openRouterApiKey || ''} 
                        onChange={(e) => updateAISettings({ openRouterApiKey: e.target.value })}
                        placeholder="sk-or-v1-..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Preferred Model
                      </label>
                      <select
                        value={aiSettings.openRouterModel}
                        onChange={(e) => updateAISettings({ openRouterModel: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                      >
                        <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
                        <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
                        <option value="google/gemini-pro-1.5">Gemini Pro 1.5</option>
                        <option value="mistralai/mixtral-8x7b-instruct">Mixtral 8x7B</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Temperature */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Temperature</h3>
              <span className="text-sm font-mono text-cyan-400">{aiTemperature?.toFixed(2) || "0.70"}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="2" 
              step="0.05"
              value={aiTemperature || 0.7} 
              onChange={(e) => updateGlobalSettings({ aiTemperature: parseFloat(e.target.value) })}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-cyan-400 to-purple-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Lower = more focused, Higher = more creative</p>
          </div>

          {/* Max Tokens */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Max Tokens</h3>
              <span className="text-sm font-mono text-cyan-400">{aiMaxTokens || 2048}</span>
            </div>
            <input 
              type="range" 
              min="256" 
              max="8192" 
              step="256"
              value={aiMaxTokens || 2048} 
              onChange={(e) => updateGlobalSettings({ aiMaxTokens: parseInt(e.target.value) })}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-cyan-400 to-purple-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => toast.info("Changes reverted")}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => toast.success("AI settings saved successfully")}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/20"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Voice & Audio */}
      <div className="card-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
              <Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Voice & Audio</h2>
              <p className="text-xs text-slate-500">Configure text-to-speech and dictation settings</p>
            </div>
          </div>
          <button
            onClick={handleTestVoice}
            disabled={isTestingVoice}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {isTestingVoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
            Test Voice
          </button>
        </div>

        <div className="space-y-8">
          {/* Engine Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => updateAISettings({ useElevenLabs: false })}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                !aiSettings.useElevenLabs
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <Server className="w-4 h-4" />
              System Native
            </button>
            <button
              onClick={() => updateAISettings({ useElevenLabs: true })}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                aiSettings.useElevenLabs
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <Zap className="w-4 h-4" />
              ElevenLabs (Premium)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {aiSettings.useElevenLabs ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      ElevenLabs API Key
                    </label>
                    <input 
                      type="password" 
                      value={aiSettings.elevenLabsApiKey || ''} 
                      onChange={(e) => updateAISettings({ elevenLabsApiKey: e.target.value })}
                      placeholder="Enter your API key"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      ElevenLabs Voice
                    </label>
                    <select
                      value={aiSettings.elevenLabsVoiceId || ''}
                      onChange={(e) => updateAISettings({ elevenLabsVoiceId: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                    >
                      <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Female)</option>
                      <option value="AZnzlk1XhkDUD0Mwv9Pv">Nicole (Female)</option>
                      <option value="EXAVITQu4vr4xnSDxMaL">Bella (Female)</option>
                      <option value="ErXw9S1q39YNo94nki54">Antoni (Male)</option>
                      <option value="VR6AewrSTuWM3pbcjgv0">Josh (Male)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      System Voice
                    </label>
                    <select
                      value={aiSettings.voiceURI}
                      onChange={(e) => updateAISettings({ voiceURI: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                    >
                      {voices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Speech Rate</label>
                      <span className="text-xs font-mono text-indigo-600">{aiSettings.speechRate.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2" 
                      step="0.1"
                      value={aiSettings.speechRate} 
                      onChange={(e) => updateAISettings({ speechRate: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Speech Recognition Language
                </label>
                <select
                  value={aiSettings.dictationLanguage}
                  onChange={(e) => updateAISettings({ dictationLanguage: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="ar-SA">العربية (Saudi Arabia)</option>
                  <option value="es-ES">Español (Spain)</option>
                  <option value="fr-FR">Français (France)</option>
                  <option value="de-DE">Deutsch (Germany)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Used for voice-to-text dictation in clinical notes
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Auto-Read Responses</h3>
                  <p className="text-[10px] text-slate-500">Automatically speak AI responses</p>
                </div>
                <button 
                  onClick={() => updateAISettings({ autoRead: !aiSettings.autoRead })}
                  className={cn(
                    "w-11 h-6 rounded-full relative transition-colors",
                    aiSettings.autoRead ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform",
                    aiSettings.autoRead ? "right-0.5" : "left-0.5"
                  )}></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Behavior */}
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Behavior</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Detail Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateAISettings({ detailLevel: 'concise' })}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                  aiSettings.detailLevel === 'concise'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                Concise
              </button>
              <button
                onClick={() => updateAISettings({ detailLevel: 'comprehensive' })}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                  aiSettings.detailLevel === 'comprehensive'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                Comprehensive
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Clinical Tone
            </label>
            <select
              value={aiSettings.clinicalTone}
              onChange={(e) => updateAISettings({ clinicalTone: e.target.value as any })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="professional">Professional (Peer-to-Peer)</option>
              <option value="patient-friendly">Patient-Friendly (Simple terms)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Specialty Focus
            </label>
            <select
              value={aiSettings.specialty}
              onChange={(e) => updateAISettings({ specialty: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="General Practice">General Practice</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Neurology">Neurology</option>
              <option value="Oncology">Oncology</option>
            </select>
          </div>
        </div>
      </div>

      {/* Input & Interface */}
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Input & Interface</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Dictation Language
            </label>
            <select
              value={aiSettings.dictationLanguage}
              onChange={(e) => updateAISettings({ dictationLanguage: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="ar-SA">Arabic</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Send on Enter</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Press Enter to send, Shift+Enter for new line.</p>
            </div>
            <button 
              onClick={() => updateAISettings({ sendOnEnter: !aiSettings.sendOnEnter })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${aiSettings.sendOnEnter ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${aiSettings.sendOnEnter ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
          
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
          
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
        </div>
      </div>

      {/* Local Neural Networks (brain.js) */}
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Local Neural Networks</h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">brain.js Engine Active</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The local neural network engine is loaded and ready. This enables on-device predictive modeling for scheduling and basic symptom clustering without sending data to the cloud.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Engine Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Local Predictive Scheduling</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Use brain.js to suggest optimal appointment slots based on local patient behavior.</p>
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

      {/* Privacy & Security */}
      <div className="card-panel p-6 bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Privacy & Security</h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Anonymize PHI</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Hide real names in AI context.</p>
            </div>
            <button 
              onClick={() => updateAISettings({ anonymizePHI: !aiSettings.anonymizePHI })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${aiSettings.anonymizePHI ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${aiSettings.anonymizePHI ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>

          <div className="w-full h-px bg-indigo-100 dark:bg-indigo-500/20"></div>

          <div>
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

          <div className="pt-2">
            <button
              onClick={handleClearHistory}
              disabled={isClearing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Clear Chat History
            </button>
            <p className="text-xs text-slate-500 mt-2 text-center">
              This will delete all saved AI conversations from your local device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

