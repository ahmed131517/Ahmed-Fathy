import React, { createContext, useContext, useEffect, useState } from 'react';

interface SettingsState {
  // General
  compactMode: boolean;
  showPatientIds: boolean;
  practiceName: string;
  practiceAddress: string;
  practiceCity: string;
  practiceState: string;
  practiceZip: string;
  practicePhone: string;
  patientIdPrefix: string;
  
  // Appearance
  fontSize: 'small' | 'medium' | 'large';
  accentColor: string;
  
  // System
  autoBackup: boolean;
  syncInterval: string;
  logLevel: string;
  
  // Medical
  autoDiagnosis: boolean;
  labIntegration: boolean;
  drugInteractionCheck: boolean;
  defaultAppointmentDuration: number;
  
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  
  // Security
  twoFactor: boolean;
  sessionTimeout: string;
  
  // Localization
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currencySymbol: string;
  
  // AI
  enableAI: boolean;
  modelType: string;
  aiConfidence: number;
}

interface SettingsContextType extends SettingsState {
  updateSettings: (settings: Partial<SettingsState>) => void;
}

const defaultSettings: SettingsState = {
  compactMode: false,
  showPatientIds: true,
  practiceName: "Roberts Family Practice",
  practiceAddress: "123 Medical Center Dr.",
  practiceCity: "Anytown",
  practiceState: "CA",
  practiceZip: "12345",
  practicePhone: "(555) 123-4567",
  patientIdPrefix: "PAT",
  
  fontSize: 'medium',
  accentColor: 'indigo',
  
  autoBackup: true,
  syncInterval: '15',
  logLevel: 'info',
  
  autoDiagnosis: true,
  labIntegration: true,
  drugInteractionCheck: true,
  defaultAppointmentDuration: 30,
  
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  appointmentReminders: true,
  
  twoFactor: false,
  sessionTimeout: '30',
  
  language: 'en',
  timezone: 'UTC-5',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  currencySymbol: '$',
  
  enableAI: true,
  modelType: 'pro',
  aiConfidence: 85,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
