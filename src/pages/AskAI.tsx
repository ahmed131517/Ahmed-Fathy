import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Loader2, AlertCircle, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
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

  useEffect(() => {
    // Build system instruction with patient context and AI settings
    let systemInstruction = "You are an advanced medical AI assistant designed to help doctors and healthcare professionals. Provide accurate, helpful, and concise insights. Always remind users that your advice does not replace professional medical judgment.";
    
    // Apply detail level
    if (settings.detailLevel === 'concise') {
      systemInstruction += "\n\nProvide very concise, bulleted summaries. Get straight to the point. This is for quick lookups during a patient visit.";
    } else {
      systemInstruction += "\n\nProvide comprehensive, deep-dive explanations. Include differential diagnoses, potential mechanisms, and citations or guidelines where applicable.";
    }

    // Apply clinical tone
    if (settings.clinicalTone === 'professional') {
      systemInstruction += "\n\nUse professional medical terminology. Assume you are speaking peer-to-peer with another doctor.";
    } else {
      systemInstruction += "\n\nUse patient-friendly language. Explain complex conditions in simple terms so the doctor can read it directly to the patient.";
    }

    // Apply specialty
    systemInstruction += `\n\nYour primary specialty focus is: ${settings.specialty}. Tailor your advice and insights from this perspective.`;

    if (selectedPatient) {
      const patientName = settings.anonymizePHI ? "Patient A" : selectedPatient.name;
      systemInstruction += `\n\nCURRENT PATIENT CONTEXT:\nName: ${patientName}\nAge: ${selectedPatient.age || 'Unknown'}\nGender: ${selectedPatient.gender || 'Unknown'}\nBlood Type: ${selectedPatient.bloodType || 'Unknown'}\nStatus: ${selectedPatient.status || 'Unknown'}\n`;
      
      if (selectedPatient.allergies) {
        try {
          const parsedAllergies = JSON.parse(selectedPatient.allergies);
          if (Array.isArray(parsedAllergies) && parsedAllergies.length > 0) {
            const allergiesList = parsedAllergies.map((a: any) => `${a.name || a} ${a.reaction ? `(${a.reaction})` : ''}`).join(', ');
            systemInstruction += `Allergies: ${allergiesList}\n`;
          }
        } catch (e) {
          // If it's not JSON, just use the string
          systemInstruction += `Allergies: ${selectedPatient.allergies}\n`;
        }
      }
      
      systemInstruction += "\nPlease use this patient context to provide personalized and relevant medical insights when answering the user's questions.";
    }

    // Initialize chat session
    chatRef.current = ai.chats.create({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction,
      }
    });
  }, [selectedPatient, settings.detailLevel, settings.clinicalTone, settings.specialty, settings.anonymizePHI]);

  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setMessages(chatHistory.map(msg => ({
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
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ask AI</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your intelligent medical assistant</p>
        </div>
      </div>
      
      <div className="shrink-0 mb-6">
        <PatientSelection variant="compact" showDetails={true} />
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-800"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="flex flex-col">
                    <div className="markdown-body text-sm leading-relaxed space-y-4">
                      <Markdown
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="" {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 mt-4" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-4" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-md font-bold mb-2 mt-3" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-indigo-700 dark:text-indigo-300" {...props} />,
                          code: ({node, ...props}) => <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                          pre: ({node, ...props}) => <pre className="bg-slate-900 text-slate-50 p-3 rounded-lg overflow-x-auto text-xs mb-2" {...props} />,
                        }}
                      >
                        {msg.content}
                      </Markdown>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <SpeakButton text={msg.content} className="p-1.5 hover:bg-slate-200" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-4 flex-row">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-500 dark:text-slate-400 text-sm">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => {
                setIsVoiceMode(!isVoiceMode);
                if (!isVoiceMode && !isListening) {
                  toggleListening();
                } else if (isVoiceMode && isListening) {
                  toggleListening();
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isVoiceMode 
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              Voice-to-Voice Mode {isVoiceMode ? "On" : "Off"}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute left-2 p-2 rounded-lg transition-colors ${
                isListening 
                  ? "text-red-500 bg-red-50 dark:bg-red-500/10" 
                  : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isVoiceMode ? "Listening... Speak to ask AI" : "Ask about symptoms, diagnoses, or medical guidelines..."}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-shadow text-slate-900 dark:text-white placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <p>
              AI can make mistakes. Always verify medical information and do not use this as a substitute for professional judgment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
