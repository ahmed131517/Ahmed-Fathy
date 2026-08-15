import { useState } from "react";
import { Monitor, Moon, Sun, Layout, Type, Palette, Wand2, RefreshCw, Check, Sliders, Layers } from "lucide-react";
import { useTheme } from "../../lib/ThemeContext";
import { useSettings } from "../../lib/SettingsContext";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../lib/i18n";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { designAesthetic, fontSize, accentColor, fontFamily, fontColor, density, borderRadius, reducedMotion, updateSettings } = useSettings();
  const { t } = useTranslation();
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  const handleUpdate = (updates: Parameters<typeof updateSettings>[0]) => {
    updateSettings(updates);
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 2000);
  };

  const handleReset = () => {
    setTheme('system');
    handleUpdate({
      designAesthetic: 'default',
      fontSize: 'medium',
      fontFamily: 'inter',
      fontColor: 'slate',
      accentColor: 'indigo',
      density: 'comfortable',
      borderRadius: 'rounded',
      reducedMotion: false,
    });
  };

  const themes = [
    { id: 'light', name: t('light'), icon: Sun },
    { id: 'dark', name: t('dark'), icon: Moon },
    { id: 'system', name: t('system'), icon: Monitor },
  ] as const;

  const aesthetics = [
    { id: 'default', name: 'Standard Flow', desc: 'Balanced, modern interface with soft subtle shadows.' },
    { id: 'sophisticated-dark', name: 'Sophisticated Dark', desc: 'High-contrast professional dark mode with pure dark tones.' },
    { id: 'clean-minimalist', name: 'Clean Minimalist', desc: 'Clinical aesthetic, generous negative space, monochromatic precision.' },
    { id: 'modern-saas', name: 'Modern SaaS', desc: 'Soft off-white canvas, crisp border cards, vibrant primary accents.' },
    { id: 'neo-brutalist', name: 'Neo-Brutalist', desc: 'High-contrast dark outlines, bold structure, zero soft gradients.' },
  ] as const;

  const fontSizes = [
    { id: 'small', name: t('small'), scale: '14px' },
    { id: 'medium', name: t('medium'), scale: '16px' },
    { id: 'large', name: t('large'), scale: '18px' },
  ] as const;

  const fontFamilies = [
    { id: 'inter', name: 'Inter (Sans)' },
    { id: 'roboto', name: 'Roboto' },
    { id: 'serif', name: 'Playfair (Serif)' },
    { id: 'mono', name: 'JetBrains (Mono)' },
    { id: 'system', name: t('system') },
    { id: 'calligraphy', name: 'Lucida Calligraphy' },
  ] as const;

  const neutralTones = [
    { id: 'slate', name: 'Slate (Cool)', swatch: 'bg-slate-500' },
    { id: 'gray', name: 'Gray (Classic)', swatch: 'bg-gray-500' },
    { id: 'zinc', name: 'Zinc (Industrial)', swatch: 'bg-zinc-500' },
    { id: 'neutral', name: 'Neutral (Pure)', swatch: 'bg-neutral-500' },
    { id: 'stone', name: 'Stone (Warm)', swatch: 'bg-stone-500' },
  ] as const;

  const densities = [
    { id: 'compact', name: t('compact'), desc: 'Dense data display' },
    { id: 'comfortable', name: t('comfortable'), desc: 'Standard balanced spacing' },
    { id: 'cozy', name: t('cozy'), desc: 'Spacious padding' },
  ] as const;

  const radii = [
    { id: 'none', name: t('sharp'), label: '0px' },
    { id: 'rounded', name: t('rounded'), label: '8px' },
    { id: 'extra', name: t('extra'), label: '16px' },
  ] as const;

  const accentColors = [
    { id: 'indigo', name: 'Indigo', color: 'bg-indigo-600', ring: 'ring-indigo-600' },
    { id: 'blue', name: 'Blue', color: 'bg-blue-600', ring: 'ring-blue-600' },
    { id: 'emerald', name: 'Emerald', color: 'bg-emerald-600', ring: 'ring-emerald-600' },
    { id: 'rose', name: 'Rose', color: 'bg-rose-600', ring: 'ring-rose-600' },
    { id: 'amber', name: 'Amber', color: 'bg-amber-500', ring: 'ring-amber-500' },
    { id: 'violet', name: 'Violet', color: 'bg-violet-600', ring: 'ring-violet-600' },
    { id: 'cyan', name: 'Cyan', color: 'bg-cyan-500', ring: 'ring-cyan-500' },
    { id: 'teal', name: 'Teal', color: 'bg-teal-600', ring: 'ring-teal-600' },
    { id: 'fuchsia', name: 'Fuchsia', color: 'bg-fuchsia-600', ring: 'ring-fuchsia-600' },
    { id: 'slate', name: 'Slate', color: 'bg-slate-600', ring: 'ring-slate-600' },
  ];

  function PreviewCard() {
    const styles = {
      fontSize: fontSize === 'small' ? '13px' : fontSize === 'medium' ? '15px' : '17px',
      fontFamily: fontFamily === 'serif' ? 'Playfair Display' : fontFamily === 'mono' ? 'JetBrains Mono' : fontFamily === 'calligraphy' ? 'Lucida Calligraphy' : 'Inter',
      borderRadius: borderRadius === 'none' ? '0px' : borderRadius === 'rounded' ? '0.5rem' : '1rem',
      padding: density === 'compact' ? '0.75rem' : density === 'comfortable' ? '1.25rem' : '1.75rem',
    };

    return (
      <div className="card-panel overflow-hidden border border-[var(--accent-color)]/20 shadow-md transition-all p-0 mb-6" style={{ borderRadius: styles.borderRadius }}>
        <div className="bg-[var(--accent-color)]/5 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Layout className="w-4 h-4 text-[var(--accent-color)]" />
             <h3 className="font-bold text-slate-900 dark:text-white" style={{ fontFamily: styles.fontFamily, fontSize: styles.fontSize }}>Live UI Preview</h3>
           </div>
           <div className="flex items-center gap-2">
             <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent-color)] px-2.5 py-1 rounded-full bg-[var(--accent-color)]/10">Interactive</span>
           </div>
        </div>
        <div style={{ padding: styles.padding }} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--accent-color)]/10 text-[var(--accent-color)] shrink-0 flex items-center justify-center font-bold text-base" style={{ borderRadius: styles.borderRadius === '0px' ? '0px' : '9999px' }}>
                Dr
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white leading-tight" style={{ fontFamily: styles.fontFamily, fontSize: styles.fontSize }}>Dr. Sarah Jenkins</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cardiology Specialist • General Practice</p>
              </div>
            </div>
            <button className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[var(--accent-color)] hover:opacity-90 transition-opacity shadow-xs" style={{ borderRadius: styles.borderRadius }}>
              {t('actionButton')}
            </button>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between" style={{ borderRadius: styles.borderRadius }}>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              <span>Current Scale: <strong>{fontSize}</strong> • Corner Radius: <strong>{borderRadius}</strong> • Density: <strong>{density}</strong></span>
            </div>
            <span className="text-xs font-mono text-slate-400">{styles.fontSize}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
             <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-center" style={{ borderRadius: styles.borderRadius }}>
               <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Scheduled Patients</span>
               <span className="text-lg font-bold text-slate-900 dark:text-white mt-1">24 Today</span>
             </div>
             <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-center" style={{ borderRadius: styles.borderRadius }}>
               <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Prescriptions</span>
               <span className="text-lg font-bold text-[var(--accent-color)] mt-1">18 Issued</span>
             </div>
             <div className="p-3 bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 flex flex-col justify-center" style={{ borderRadius: styles.borderRadius }}>
               <span className="text-[11px] font-medium text-[var(--accent-color)]">System Status</span>
               <span className="text-lg font-bold text-[var(--accent-color)] mt-1">All Operational</span>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Save Notification Toast */}
      {showSavedNotification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4" />
          <span>Appearance preferences updated!</span>
        </div>
      )}

      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Appearance & Themes</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Customize the visual workspace, colors, typography, and density.</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <PreviewCard />
      
      {/* Theme Mode & Accent Colors */}
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-[var(--accent-color)]" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Theme & Accent Palette</h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">{t('theme')} Mode</label>
            <div className="grid grid-cols-3 gap-4">
              {themes.map((tItem) => (
                <button
                  key={tItem.id}
                  onClick={() => setTheme(tItem.id)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                    theme === tItem.id
                      ? "border-[var(--accent-color)] bg-[color-mix(in_srgb,var(--accent-color),transparent_90%)] text-[var(--accent-color)] font-semibold"
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <tItem.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{tItem.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">Primary Accent Color</label>
            <div className="flex flex-wrap gap-3.5">
              {accentColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleUpdate({ accentColor: color.id })}
                  className={cn(
                    "w-11 h-11 rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-offset-2 dark:focus:ring-offset-slate-900 relative cursor-pointer",
                    color.color,
                    color.ring,
                    accentColor === color.id ? "ring-4 ring-offset-2 dark:ring-offset-slate-900 shadow-md scale-110" : "hover:scale-105 shadow-xs opacity-90"
                  )}
                  title={color.name}
                  aria-label={`Select ${color.name} accent`}
                >
                  {accentColor === color.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-white rounded-full shadow-xs" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Neutral Tone Selector */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">Neutral Tone & Surface Palette</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {neutralTones.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => handleUpdate({ fontColor: tone.id })}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all cursor-pointer",
                    fontColor === tone.id
                      ? "border-[var(--accent-color)] bg-[color-mix(in_srgb,var(--accent-color),transparent_90%)] text-[var(--accent-color)] font-semibold"
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <span className={cn("w-4 h-4 rounded-full shrink-0 border border-slate-300 dark:border-slate-700", tone.swatch)} />
                  <span className="text-xs font-medium truncate">{tone.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Design Aesthetic Presets */}
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-5 h-5 text-[var(--accent-color)]" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Design Aesthetic Presets</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aesthetics.map((aesthetic) => (
            <button
              key={aesthetic.id}
              onClick={() => handleUpdate({ designAesthetic: aesthetic.id })}
              className={cn(
                "flex flex-col items-start text-left gap-1 p-4 rounded-xl border-2 transition-all cursor-pointer",
                designAesthetic === aesthetic.id
                  ? "border-[var(--accent-color)] bg-[color-mix(in_srgb,var(--accent-color),transparent_90%)]"
                  : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
              )}
            >
              <span className={cn("text-base font-bold", designAesthetic === aesthetic.id ? "text-[var(--accent-color)]" : "text-slate-900 dark:text-white")}>{aesthetic.name}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{aesthetic.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Typography Settings */}
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
                  onClick={() => handleUpdate({ fontSize: s.id })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer flex items-center gap-2",
                    fontSize === s.id
                      ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <span>{s.name}</span>
                  <span className="text-[10px] opacity-75">({s.scale})</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">{t('fontFamily')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {fontFamilies.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleUpdate({ fontFamily: f.id })}
                  className={cn(
                    "px-3.5 py-2.5 rounded-lg text-sm font-medium border transition-all text-left truncate cursor-pointer",
                    fontFamily === f.id
                      ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Layout, Density & Roundness */}
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-[var(--accent-color)]" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('layoutAndAccessibility')}</h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">{t('density')}</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {densities.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleUpdate({ density: d.id })}
                  className={cn(
                    "p-3 rounded-lg text-left border transition-all cursor-pointer flex flex-col gap-0.5",
                    density === d.id
                      ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <span className="text-sm font-semibold">{d.name}</span>
                  <span className={cn("text-[11px]", density === d.id ? "text-white/80" : "text-slate-400")}>{d.desc}</span>
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
                  onClick={() => handleUpdate({ borderRadius: r.id })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer flex items-center gap-2",
                    borderRadius === r.id
                      ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <span>{r.name}</span>
                  <span className="text-[10px] opacity-75">({r.label})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">{t('reducedMotion')}</label>
              <p className="text-xs text-slate-400">Minimizes smooth page transitions and animations for motion sensitivity.</p>
            </div>
            <button
              onClick={() => handleUpdate({ reducedMotion: !reducedMotion })}
              className={cn(
                "w-12 h-6 rounded-full transition-all flex items-center px-1 cursor-pointer shrink-0",
                reducedMotion ? "bg-[var(--accent-color)] justify-end" : "bg-slate-200 dark:bg-slate-700 justify-start"
              )}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

