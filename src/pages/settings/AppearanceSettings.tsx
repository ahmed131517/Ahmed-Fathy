import { useState } from "react";
import { Monitor, Moon, Sun, Layout, Type, Palette, Maximize2, Zap, Accessibility } from "lucide-react";
import { useTheme } from "../../lib/ThemeContext";
import { useSettings } from "../../lib/SettingsContext";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../lib/i18n";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { fontSize, accentColor, fontFamily, fontColor, density, borderRadius, reducedMotion, updateSettings } = useSettings();
  const { t, isRTL } = useTranslation();

  const themes = [
    { id: 'light', name: t('light'), icon: Sun },
    { id: 'dark', name: t('dark'), icon: Moon },
    { id: 'system', name: t('system'), icon: Monitor },
  ] as const;

  const fontSizes = [
    { id: 'small', name: t('small') },
    { id: 'medium', name: t('medium') },
    { id: 'large', name: t('large') },
  ] as const;

  const fontFamilies = [
    { id: 'inter', name: 'Inter' },
    { id: 'roboto', name: 'Roboto' },
    { id: 'system', name: t('system') },
  ] as const;

  const fontColors = [
    { id: 'slate', name: 'Slate' },
    { id: 'gray', name: 'Gray' },
    { id: 'zinc', name: 'Zinc' },
  ] as const;

  const densities = [
    { id: 'compact', name: t('compact') },
    { id: 'comfortable', name: t('comfortable') },
    { id: 'cozy', name: t('cozy') },
  ] as const;

  const radii = [
    { id: 'none', name: t('sharp') },
    { id: 'rounded', name: t('rounded') },
    { id: 'extra', name: t('extra') },
  ] as const;

  const accentColors = [
    { id: 'indigo', color: 'bg-indigo-600' },
    { id: 'blue', color: 'bg-blue-600' },
    { id: 'emerald', color: 'bg-emerald-600' },
  ];

  function PreviewCard() {
    const styles = {
      fontSize: fontSize === 'small' ? '14px' : fontSize === 'medium' ? '16px' : '18px',
      fontFamily: fontFamily === 'serif' ? 'Playfair Display' : fontFamily === 'mono' ? 'JetBrains Mono' : 'Inter',
      borderRadius: borderRadius === 'none' ? '0px' : borderRadius === 'rounded' ? '0.5rem' : '1rem',
      padding: density === 'compact' ? '0.5rem' : density === 'comfortable' ? '0.75rem' : '1rem',
    };

    return (
      <div className="card-panel p-6 mb-6" style={{ borderRadius: styles.borderRadius }}>
        <h3 className="text-lg font-bold mb-2" style={{ fontFamily: styles.fontFamily, fontSize: styles.fontSize }}>{t('preview')}</h3>
        <p className="mb-4" style={{ fontFamily: styles.fontFamily, fontSize: styles.fontSize, padding: styles.padding }}>
          {t('previewDesc')}
        </p>
        <button className="px-4 py-2 text-white" style={{ backgroundColor: 'var(--accent-color)', borderRadius: styles.borderRadius }}>
          {t('actionButton')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PreviewCard />
      
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-[var(--accent-color)]" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('theme')}</h2>
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
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('typography')}</h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">{t('fontSize')}</label>
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
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">{t('fontFamily')}</label>
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
        </div>
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="w-5 h-5 text-[var(--accent-color)]" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('layoutAndAccessibility')}</h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">{t('density')}</label>
            <div className="flex gap-2">
              {densities.map((d) => (
                <button
                  key={d.id}
                  onClick={() => updateSettings({ density: d.id })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                    density === d.id
                      ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">{t('cornerRoundness')}</label>
            <div className="flex gap-2">
              {radii.map((r) => (
                <button
                  key={r.id}
                  onClick={() => updateSettings({ borderRadius: r.id })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                    borderRadius === r.id
                      ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('reducedMotion')}</label>
            <button
              onClick={() => updateSettings({ reducedMotion: !reducedMotion })}
              className={cn(
                "w-12 h-6 rounded-full transition-all flex items-center px-1",
                reducedMotion ? "bg-[var(--accent-color)] justify-end" : "bg-slate-200 dark:bg-slate-700 justify-start"
              )}
            >
              <div className="w-4 h-4 rounded-full bg-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
