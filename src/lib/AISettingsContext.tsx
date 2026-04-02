import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AISettings {
  voiceURI: string;
  speechRate: number;
  autoRead: boolean;
  dictationLanguage: string;
  detailLevel: 'concise' | 'comprehensive';
  clinicalTone: 'professional' | 'patient-friendly';
  specialty: string;
  anonymizePHI: boolean;
  sendOnEnter: boolean;
  useElevenLabs: boolean;
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
}

const defaultSettings: AISettings = {
  voiceURI: '',
  speechRate: 1,
  autoRead: false,
  dictationLanguage: 'en-US',
  detailLevel: 'comprehensive',
  clinicalTone: 'professional',
  specialty: 'General Practice',
  anonymizePHI: false,
  sendOnEnter: true,
  useElevenLabs: true,
  elevenLabsApiKey: 'sk_a57245443c2c81e578231fdb1f797491af0b4b52afd39d8d',
  elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
};

interface AISettingsContextType {
  settings: AISettings;
  updateSettings: (newSettings: Partial<AISettings>) => void;
}

const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

export function AISettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AISettings>(() => {
    try {
      const saved = localStorage.getItem('ai_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('ai_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AISettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AISettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AISettingsContext.Provider>
  );
}

export function useAISettings() {
  const context = useContext(AISettingsContext);
  if (context === undefined) {
    throw new Error('useAISettings must be used within an AISettingsProvider');
  }
  return context;
}
