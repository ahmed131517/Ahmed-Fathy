import React, { createContext, useContext, useEffect, useState } from 'react';

interface SettingsState {
  compactMode: boolean;
  showPatientIds: boolean;
  practiceName: string;
  practiceAddress: string;
  practiceCity: string;
  practiceState: string;
  practiceZip: string;
  practicePhone: string;
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
