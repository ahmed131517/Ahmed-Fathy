import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, Send, User, Loader2, AlertCircle, Mic, MicOff, Volume2, 
  History, Sparkles, Clipboard, Activity, ShieldAlert, Pill, 
  ChevronRight, Search, Trash2, MessageSquare, BrainCircuit,
  Stethoscope, FileText, Info, CheckCircle, Bookmark
} from "lucide-react";
import { SpeakButton } from "../components/SpeakButton";
import { playSpeech } from "../services/ttsService";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { sendMessageStreamWithRetry } from "../utils/gemini";
import Markdown from "react-markdown";
import { PatientSelection } from "../components/PatientSelection";
import { usePatient } from "../lib/PatientContext";
import { useAISettings } from "../lib/AISettingsContext";
import { db, ChatMessage } from "../lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { getAskAiSystemInstruction } from "@/services/aiConfig";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
}

export function AskAI() {
  const { selectedPatient } = usePatient();
  const { settings } = useAISettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef("");
  
  // Keep inputRef in sync
  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedInsights, setSavedInsights] = useState<Set<string>>(new Set());

  const handleSaveToRecord = async (msg: Message) => {
    if (!selectedPatient?.id) {
      toast.error("Please select a patient first");
      return;
    }

    try {
      await db.patient_notes.add({
        patientId: selectedPatient.id,
        title: `AI Insight: ${msg.content.substring(0, 50)}...`,
        content: msg.content,
        category: 'ai-insight',
        date: new Date().toISOString(),
        lastModified: Date.now(),
        isDeleted: 0,
        isSynced: 0
      });
      
      setSavedInsights(prev => {
        const next = new Set(prev);
        next.add(msg.id);
        return next;
      });
      toast.success("Insight saved to patient's medical record");
    } catch (error) {
      console.error("Error saving insight:", error);
      toast.error("Failed to save insight to record");
    }
  };

  // Quick Actions
  const quickActions = [
    { id: 'summarize', label: 'Summarize Case', icon: FileText, prompt: 'Please provide a concise summary of this patient\'s current clinical status and history.' },
    { id: 'ddx', label: 'Differential Diagnosis', icon: BrainCircuit, prompt: 'Based on the patient\'s symptoms and findings, what are the top 5 differential diagnoses?' },
    { id: 'interactions', label: 'Check Interactions', icon: ShieldAlert, prompt: 'Analyze the patient\'s current medications for any potential drug-drug or drug-disease interactions.' },
    { id: 'guidelines', label: 'Clinical Guidelines', icon: Stethoscope, prompt: 'What are the current evidence-based guidelines for managing this patient\'s primary condition?' },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    // We need to wait for state update or use a ref
    setTimeout(() => {
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(syntheticEvent);
    }, 100);
  };

  const clearHistory = async () => {
    if (window.confirm("Are you sure you want to clear the chat history for this patient?")) {
      const patientId = selectedPatient?.id || 'general';
      await db.chat_messages.where('patientId').equals(patientId).delete();
      toast.success("Chat history cleared");
    }
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Load chat history from Dexie
  const chatHistory = useLiveQuery(
    () => {
      const patientId = selectedPatient?.id || 'general';
      return db.chat_messages
        .where('patientId')
        .equals(patientId)
        .sortBy('timestamp');
    },
    [selectedPatient?.id]
  );

  // Load full patient context from Dexie
  const patientData = useLiveQuery(
    async () => {
      if (!selectedPatient?.id) return null;
      
      const [diagnoses, vitals, labs, prescriptions, physicalExams] = await Promise.all([
        db.diagnoses.where('patientId').equals(selectedPatient.id).sortBy('date'),
        db.vitals.where('patientId').equals(selectedPatient.id).sortBy('date'),
        db.lab_results.where('patientId').equals(selectedPatient.id).sortBy('date'),
        db.prescriptions.where('patientId').equals(selectedPatient.id).toArray(),
        db.physical_exams.where('patientId').equals(selectedPatient.id).sortBy('date')
      ]);

      // Fetch prescription items for each prescription
      const prescriptionsWithItems = await Promise.all((prescriptions || []).map(async (p) => {
        const items = await db.prescription_items.where('prescriptionId').equals(p.id || '').toArray();
        return { ...p, items };
      }));

      return {
        diagnoses,
        vitals,
        labs,
        prescriptions: prescriptionsWithItems,
        physicalExams
      };
    },
    [selectedPatient?.id]
  );

  const patientNotes = useLiveQuery(
    () => {
      if (!selectedPatient?.id) return [];
      return db.patient_notes
        .where('patientId')
        .equals(selectedPatient.id)
        .filter(n => n.category === 'ai-insight')
        .reverse()
        .toArray();
    },
    [selectedPatient?.id]
  );

  useEffect(() => {
    // Build system instruction with patient context and AI settings
    let patientContext = "";
    if (selectedPatient) {
      const patientName = settings.anonymizePHI ? "Patient A" : selectedPatient.name;
      patientContext = `Name: ${patientName}\nAge: ${selectedPatient.age || 'Unknown'}\nGender: ${selectedPatient.gender || 'Unknown'}\nBlood Type: ${selectedPatient.bloodType || 'Unknown'}\nStatus: ${selectedPatient.status || 'Unknown'}\n`;
      
      // Basic Allergies & Conditions from patient record
      if (selectedPatient.allergies && Array.isArray(selectedPatient.allergies) && selectedPatient.allergies.length > 0) {
        const allergiesList = (selectedPatient.allergies || []).map((a: any) => `${a.name} ${a.severity ? `(${a.severity})` : ''}`).join(', ');
        patientContext += `Allergies: ${allergiesList}\n`;
      }
      
      if (selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0) {
        patientContext += `Chronic Conditions: ${selectedPatient.chronicConditions.join(', ')}\n`;
      }

      if (selectedPatient.surgeries && selectedPatient.surgeries.length > 0) {
        patientContext += `Surgical History: ${selectedPatient.surgeries.join(', ')}\n`;
      }

      if (selectedPatient.familyHistory && selectedPatient.familyHistory.length > 0) {
        patientContext += `Family History: ${selectedPatient.familyHistory.join(', ')}\n`;
      }

      if (selectedPatient.familyHistoryNotes) {
        patientContext += `Family History Notes: ${selectedPatient.familyHistoryNotes}\n`;
      }

      if (selectedPatient.otherConditions) {
        patientContext += `Other Conditions: ${selectedPatient.otherConditions}\n`;
      }

      // Add detailed medical records if available
      if (patientData) {
        if (patientData.diagnoses && patientData.diagnoses.length > 0) {
          patientContext += `\nDIAGNOSES HISTORY:\n${(patientData.diagnoses || []).map(d => `- ${d.date}: ${d.condition} (${d.code || 'No code'}). Notes: ${d.notes || 'N/A'}`).join('\n')}\n`;
        }

        if (patientData.vitals && patientData.vitals.length > 0) {
          const latest = patientData.vitals[patientData.vitals.length - 1];
          patientContext += `\nLATEST VITALS (${latest.date}):\nBP: ${latest.bp_systolic}/${latest.bp_diastolic}, HR: ${latest.hr}, Temp: ${latest.temp}°C, RR: ${latest.rr}, SpO2: ${latest.spo2}%, Weight: ${latest.weight}kg\n`;
        }

        if (patientData.labs && patientData.labs.length > 0) {
          patientContext += `\nRECENT LAB RESULTS:\n${(patientData.labs || []).slice(-5).map(l => `- ${l.date}: ${l.testName} = ${l.value} ${l.unit} (${l.status})`).join('\n')}\n`;
        }

        if (patientData.prescriptions && patientData.prescriptions.length > 0) {
          patientContext += `\nMEDICATION HISTORY:\n${(patientData.prescriptions || []).map(p => {
            const items = (p.items || []).map(i => `${i.medicationName} ${i.dosage} ${i.frequency}`).join(', ');
            return `- ${new Date(p.createdAt).toLocaleDateString()}: ${items} (Status: ${p.status})`;
          }).join('\n')}\n`;
        }

        if (patientData.physicalExams.length > 0) {
          const latestExam = patientData.physicalExams[patientData.physicalExams.length - 1];
          patientContext += `\nLATEST PHYSICAL EXAM (${latestExam.date}): Status: ${latestExam.status}\n`;
        }
      }
    }

    const systemInstruction = getAskAiSystemInstruction(settings, patientContext);

    // Initialize chat session
    chatRef.current = ai.chats.create({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction,
      }
    });
  }, [selectedPatient, settings.detailLevel, settings.clinicalTone, settings.specialty, settings.anonymizePHI, patientData]);

  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setMessages((chatHistory || []).map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content
      })));
      
      // If we have history, we need to recreate the chat with history
      // Note: The @google/genai SDK doesn't easily support setting history on an existing chat object
      // For a robust implementation, we'd need to send the history as context or use the interactions API
      // For now, we'll just load the UI messages. The AI will lose exact context of previous turns
      // but will have the patient context.
    } else {
      // Reset messages when patient changes and no history
      const initialMessage = selectedPatient 
        ? `Hello! I am your AI medical assistant. I see you have selected patient **${selectedPatient.name}**. How can I help you analyze their case today?`
        : "Hello! I am your AI medical assistant. Please select a patient above to provide context, or ask me any general medical queries.";
        
      const initialMsgObj: Message = {
        id: Date.now().toString(),
        role: "model",
        content: initialMessage,
      };
      
      setMessages([initialMsgObj]);
      
      // Save initial message to DB
      const patientId = selectedPatient?.id || 'general';
      db.chat_messages.add({
        id: initialMsgObj.id,
        role: initialMsgObj.role,
        content: initialMsgObj.content,
        patientId,
        timestamp: Date.now()
      }).catch(console.error);
    }
  }, [chatHistory, selectedPatient]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (settings.sendOnEnter && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
      } else if (!settings.sendOnEnter && !e.shiftKey) {
        // Do nothing, let it be a new line (though input type="text" doesn't support newlines well, 
        // we keep the logic for completeness or if we switch to textarea later)
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  const isVoiceModeRef = useRef(isVoiceMode);
  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
  }, [isVoiceMode]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = settings.dictationLanguage;

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInput((prev) => {
          const space = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
          return prev + space + transcript;
        });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isVoiceModeRef.current && inputRef.current.trim()) {
          // Auto submit in voice mode
          const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
          if (handleSubmitRef.current) {
            handleSubmitRef.current(syntheticEvent);
          }
        }
      };

      recognitionRef.current = recognition;
    }
  }, [settings.dictationLanguage]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleSpeak = async (id: string, text: string) => {
    // This function is now handled by SpeakButton
  };

  const speakWithBrowser = (text: string, id: string) => {
    // This function is now handled by SpeakButton
  };

  const handleSubmitRef = useRef<((e: React.FormEvent) => void) | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentInput = inputRef.current;
    if (!currentInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: currentInput.trim(),
    };

    const patientId = selectedPatient?.id || 'general';

    // Save user message to DB
    await db.chat_messages.add({
      id: userMessage.id,
      role: userMessage.role,
      content: userMessage.content,
      patientId,
      timestamp: Date.now()
    });

    setInput("");
    setIsLoading(true);

    const modelMessageId = (Date.now() + 1).toString();
    // Optimistically add empty model message
    setMessages((prev) => [
      ...prev,
      { id: modelMessageId, role: "model", content: "" },
    ]);

    let fullResponse = "";

    try {
      if (!chatRef.current) {
        throw new Error("Chat not initialized");
      }

      // If we have history, we should ideally pass it to the model.
      // Since ai.chats.create doesn't take history directly in the simple API,
      // we'll send the current message. The chatRef maintains state for the *current* session.
      // If the user refreshed the page, the chatRef lost history.
      // A workaround is to send the recent history as part of the message if needed,
      // but for now we rely on the chatRef's internal state for active sessions.

      let responseStream;
      try {
        responseStream = await sendMessageStreamWithRetry(chatRef.current, userMessage.content);
      } catch (error: any) {
        console.error("AI response failed after retries:", error);
        throw error;
      }

      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullResponse += c.text;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === modelMessageId
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        }
      }

      // Save final model message to DB
      await db.chat_messages.add({
        id: modelMessageId,
        role: "model",
        content: fullResponse,
        patientId,
        timestamp: Date.now()
      });

      // Auto-read if enabled or in voice mode
      if (settings.autoRead || isVoiceModeRef.current) {
        await playSpeech(fullResponse, settings.elevenLabsVoiceId);
      }

    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorMsg = "I'm sorry, I encountered an error while processing your request. Please try again later.";
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMessageId
            ? { ...msg, content: errorMsg }
            : msg
        )
      );

      await db.chat_messages.add({
        id: modelMessageId,
        role: "model",
        content: errorMsg,
        patientId,
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Ask AI Assistant</h1>
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">System Ready • Gemini 3.1 Pro</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "p-2 rounded-lg transition-all border",
              showHistory 
                ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
            )}
            title="Toggle History"
          >
            <History className="w-5 h-5" />
          </button>
          <PatientSelection variant="compact" showDetails={false} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Context & Actions */}
        <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto hidden xl:flex flex-col p-6 space-y-8">
          {/* Patient Summary Card */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Patient Context
            </h3>
            {selectedPatient ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white truncate w-40">{selectedPatient.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{selectedPatient.age}y • {selectedPatient.gender}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Blood Type</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedPatient.bloodType || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Status</span>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full font-bold">
                      {selectedPatient.status || 'Stable'}
                    </span>
                  </div>
                  
                  {selectedPatient.allergies && Array.isArray(selectedPatient.allergies) && selectedPatient.allergies.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] font-bold text-red-500 uppercase mb-2 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Allergies
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(selectedPatient.allergies || []).map((a: any, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded text-[10px] font-medium border border-red-100 dark:border-red-500/20">
                            {a.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <User className="w-8 h-8 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="text-xs text-slate-500">Select a patient to enable contextual AI analysis</p>
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Quick Analysis
            </h3>
            <div className="grid gap-2">
              {(quickActions || []).map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.prompt)}
                  disabled={!selectedPatient || isLoading}
                  className="flex items-center gap-3 p-3 rounded-xl text-left text-sm font-medium transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                    <action.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  {action.label}
                </button>
              ))}
            </div>
          </section>

          {/* Saved Insights */}
          <section className="flex flex-col min-h-0">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5" /> Saved Insights
            </h3>
            <div className="space-y-2 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
              {patientNotes && patientNotes.length > 0 ? (
                (patientNotes || []).map((note) => (
                  <div
                    key={note.localId || note.id}
                    className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Insight</span>
                      <span className="text-[9px] text-slate-400">{new Date(note.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 px-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 italic">No saved insights for this patient</p>
                </div>
              )}
            </div>
          </section>

          {/* Chat History List */}
          <section className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <History className="w-3.5 h-3.5" /> Recent History
              </h3>
              <button 
                onClick={clearHistory}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {chatHistory && chatHistory.length > 0 ? (
                chatHistory.filter(m => m.role === 'user').slice(-10).reverse().map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => setInput(msg.content)}
                    className="w-full p-2.5 text-left rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {msg.content}
                    </p>
                  </button>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-[10px] text-slate-400 italic">No recent history</p>
                </div>
              )}
            </div>
          </section>
        </aside>

        {/* Main Chat Interface */}
        <main className="flex-1 flex flex-col bg-white dark:bg-slate-900 relative">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 md:gap-6",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                      msg.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700"
                    )}
                  >
                    {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  
                  <div
                    className={cn(
                      "max-w-[85%] md:max-w-[75%] space-y-2",
                      msg.role === "user" ? "text-right" : "text-left"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {msg.role === "user" ? "Physician" : "AI Assistant"}
                      </span>
                    </div>
                    
                    <div
                      className={cn(
                        "rounded-3xl px-5 py-4 shadow-sm",
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-800"
                      )}
                    >
                      {msg.role === "user" ? (
                        <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        <div className="flex flex-col">
                          <div className="markdown-body text-sm md:text-base leading-relaxed space-y-4 prose prose-slate dark:prose-invert max-w-none">
                            <Markdown
                              components={{
                                p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-4 mt-6 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-3 mt-5 text-slate-800 dark:text-slate-100" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 mt-4 text-slate-700 dark:text-slate-200" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-indigo-700 dark:text-indigo-400" {...props} />,
                                code: ({node, ...props}) => <code className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded text-xs font-mono font-bold" {...props} />,
                                pre: ({node, ...props}) => <pre className="bg-slate-900 text-slate-50 p-4 rounded-2xl overflow-x-auto text-xs mb-4 shadow-inner border border-slate-800" {...props} />,
                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-slate-600 dark:text-slate-400 mb-4" {...props} />,
                              }}
                            >
                              {msg.content}
                            </Markdown>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.content);
                                  toast.success("Copied to clipboard");
                                }}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                title="Copy response"
                              >
                                <Clipboard className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleSaveToRecord(msg)}
                                disabled={savedInsights.has(msg.id)}
                                className={cn(
                                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                                  savedInsights.has(msg.id)
                                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
                                    : "text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                                )}
                                title="Save to patient record"
                              >
                                {savedInsights.has(msg.id) ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Saved
                                  </>
                                ) : (
                                  <>
                                    <FileText className="w-3.5 h-3.5" />
                                    Save to Record
                                  </>
                                )}
                              </button>
                            </div>
                            <SpeakButton text={msg.content} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <motion.div 
                key="loading-indicator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 md:gap-6 flex-row"
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center gap-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Analyzing medical data...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-4xl mx-auto relative">
              {/* Floating Voice Toggle */}
              <div className="absolute -top-12 left-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsVoiceMode(!isVoiceMode);
                    if (!isVoiceMode && !isListening) toggleListening();
                    else if (isVoiceMode && isListening) toggleListening();
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm border",
                    isVoiceMode 
                      ? "bg-indigo-600 border-indigo-500 text-white" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                  )}
                >
                  <Volume2 className={cn("w-3 h-3", isVoiceMode && "animate-pulse")} />
                  Voice Mode: {isVoiceMode ? "Active" : "Off"}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      isListening 
                        ? "text-red-500 bg-red-50 dark:bg-red-500/10" 
                        : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
                  </button>
                </div>

                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                  placeholder={isVoiceMode ? "Listening... Speak now" : "Ask about symptoms, diagnoses, or guidelines..."}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl pl-14 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 resize-none shadow-inner"
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 mt-4">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                  AI-generated content. Verify all clinical information.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
