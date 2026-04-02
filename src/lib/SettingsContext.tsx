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
  fontFamily: string;
  fontColor: string;
  accentColor: string;
  density: 'compact' | 'comfortable' | 'cozy';
  borderRadius: 'none' | 'rounded' | 'extra';
  reducedMotion: boolean;
  
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
  aiProcessingMode: 'cloud' | 'local';
  modelType: string;
  aiTemperature: number;
  aiMaxTokens: number;
  
  // Schedule
  workingHours: {
    day: string;
    start: string;
    end: string;
    active: boolean;
  }[];
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
  fontFamily: 'inter',
  fontColor: 'slate',
  accentColor: 'indigo',
  density: 'comfortable',
  borderRadius: 'rounded',
  reducedMotion: false,
  
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
  
  aiProcessingMode: 'cloud',
  modelType: 'gemini-2.5-flash',
  aiTemperature: 0.7,
  aiMaxTokens: 2048,
  
  workingHours: [
    { day: "Monday", start: "09:00", end: "17:00", active: true },
    { day: "Tuesday", start: "09:00", end: "17:00", active: true },
    { day: "Wednesday", start: "09:00", end: "17:00", active: true },
    { day: "Thursday", start: "09:00", end: "17:00", active: true },
    { day: "Friday", start: "09:00", end: "13:00", active: true },
    { day: "Saturday", start: "00:00", end: "00:00", active: false },
    { day: "Sunday", start: "00:00", end: "00:00", active: false },
  ],
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
    
    const root = document.documentElement;
    
    // Font size
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.fontSize = sizeMap[settings.fontSize as keyof typeof sizeMap];
    root.style.setProperty('--font-size', sizeMap[settings.fontSize as keyof typeof sizeMap]);

    // Font Family
    const fontMap: Record<string, string> = {
      inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
      roboto: '"Roboto", ui-sans-serif, system-ui, sans-serif',
      system: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: '"Playfair Display", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    };
    root.style.setProperty('--font-sans', fontMap[settings.fontFamily] || fontMap.inter);

    // Font Color (Neutral Palette Override)
    const neutralPalettes: Record<string, Record<string, string>> = {
      slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
      gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' },
      zinc: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' },
      neutral: { 50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a' },
      stone: { 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e', 500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09' },
    };
    const selectedNeutral = neutralPalettes[settings.fontColor] || neutralPalettes.slate;
    Object.entries(selectedNeutral).forEach(([shade, color]) => {
      root.style.setProperty(`--color-slate-${shade}`, color);
    });

    // Density
    const densityMap = {
      compact: '0.5rem',
      comfortable: '0.75rem',
      cozy: '1rem',
    };
    root.style.setProperty('--spacing-scale', densityMap[settings.density]);

    // Border Radius
    const radiusMap = {
      none: '0px',
      rounded: '0.5rem',
      extra: '1rem',
    };
    root.style.setProperty('--radius', radiusMap[settings.borderRadius]);

    // Reduced Motion
    if (settings.reducedMotion) {
      root.style.setProperty('--transition-duration', '0ms');
    } else {
      root.style.setProperty('--transition-duration', '200ms');
    }

    // Accent color palettes
    const palettes: Record<string, Record<string, string>> = {
      indigo: {
        50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b'
      },
      blue: {
        50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554'
      },
      emerald: {
        50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22'
      },
      rose: {
        50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519'
      },
      amber: {
        50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03'
      }
    };

    const selectedPalette = palettes[settings.accentColor] || palettes.indigo;
    
    // Set the main accent color variable (using the 600 shade as default)
    root.style.setProperty('--accent-color', selectedPalette[600]);
    
    // Override all indigo variables so that Tailwind classes using indigo adapt to the theme
    Object.entries(selectedPalette).forEach(([shade, color]) => {
      root.style.setProperty(`--color-indigo-${shade}`, color);
    });
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
