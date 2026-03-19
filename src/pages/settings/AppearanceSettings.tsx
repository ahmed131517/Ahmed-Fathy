import { useState } from "react";
import { Monitor, Moon, Sun, Layout, Type, Palette } from "lucide-react";
import { useTheme } from "../../lib/ThemeContext";
import { useSettings } from "../../lib/SettingsContext";
import { cn } from "../../lib/utils";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { fontSize, accentColor, fontFamily, fontColor, updateSettings } = useSettings();

  const themes = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'system', name: 'System', icon: Monitor },
  ] as const;

  const fontSizes = [
    { id: 'small', name: 'Small' },
    { id: 'medium', name: 'Medium' },
    { id: 'large', name: 'Large' },
  ] as const;

  const fontFamilies = [
    { id: 'inter', name: 'Inter' },
    { id: 'roboto', name: 'Roboto' },
    { id: 'system', name: 'System' },
    { id: 'serif', name: 'Serif' },
    { id: 'mono', name: 'Monospace' },
  ] as const;

  const fontColors = [
    { id: 'slate', name: 'Slate' },
    { id: 'gray', name: 'Gray' },
    { id: 'zinc', name: 'Zinc' },
    { id: 'neutral', name: 'Neutral' },
    { id: 'stone', name: 'Stone' },
  ] as const;

  const accentColors = [
    { id: 'indigo', color: 'bg-indigo-600' },
    { id: 'blue', color: 'bg-blue-600' },
    { id: 'emerald', color: 'bg-emerald-600' },
    { id: 'rose', color: 'bg-rose-600' },
    { id: 'amber', color: 'bg-amber-600' },
  ];

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    updateSettings({ fontSize: size });
  };

  const handleAccentColorChange = (color: string) => {
    updateSettings({ accentColor: color });
  };

  return (
    <div className="space-y-6">
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-[var(--accent-color)]" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Theme</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                theme === t.id
                  ? "border-[var(--accent-color)] bg-[color-mix(in_srgb,var(--accent-color),transparent_90%)] text-[var(--accent-color)]"
                  : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
              )}
            >
              <t.icon className="w-6 h-6" />
              <span className="text-sm font-medium">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-5 h-5 text-[var(--accent-color)]" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Typography</h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Font Size</label>
            <div className="flex gap-2">
              {fontSizes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => updateSettings({ fontSize: s.id })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                    fontSize === s.id
                      ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Font Family</label>
            <div className="flex flex-wrap gap-2">
              {fontFamilies.map((f) => (
                <button
                  key={f.id}
                  onClick={() => updateSettings({ fontFamily: f.id })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                    fontFamily === f.id
                      ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Font Color (Neutral Palette)</label>
            <div className="flex flex-wrap gap-2">
              {fontColors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateSettings({ fontColor: c.id })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                    fontColor === c.id
                      ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="w-5 h-5 text-[var(--accent-color)]" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Accent Color</h2>
        </div>
        <div className="flex gap-4">
          {accentColors.map((c) => (
            <button
              key={c.id}
              onClick={() => handleAccentColorChange(c.id)}
              className={cn(
                "w-8 h-8 rounded-full transition-all ring-offset-2 dark:ring-offset-slate-950",
                c.color,
                accentColor === c.id ? "ring-2 ring-slate-900 dark:ring-white scale-110" : "hover:scale-110"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
