import { useState, useEffect } from "react";
import { Globe, MapPin, Calendar, Clock, Check, DollarSign, Languages, Info } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { useTranslation } from "../../lib/i18n";
import { cn } from "../../lib/utils";

export function LanguageSettings() {
  const { 
    language, 
    timezone, 
    dateFormat, 
    timeFormat, 
    currencySymbol,
    updateSettings 
  } = useSettings();

  const { t, isRTL } = useTranslation();
  const [previewDate, setPreviewDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setPreviewDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatPreview = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: dateFormat.includes('MM') ? '2-digit' : 'numeric',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: timeFormat === '12h'
    };
    return new Intl.DateTimeFormat(language, options).format(previewDate);
  };

  const timezones = [
    { value: "UTC-8", label: "Pacific Time (PT) - Los Angeles" },
    { value: "UTC-5", label: "Eastern Time (ET) - New York" },
    { value: "UTC+0", label: "Greenwich Mean Time (GMT) - London" },
    { value: "UTC+1", label: "Central European Time (CET) - Berlin" },
    { value: "UTC+2", label: "Eastern European Time (EET) - Cairo" },
    { value: "UTC+3", label: "Arabia Standard Time (AST) - Riyadh" },
    { value: "UTC+4", label: "Gulf Standard Time (GST) - Dubai" },
    { value: "UTC+8", label: "China Standard Time (CST) - Beijing" },
    { value: "UTC+9", label: "Japan Standard Time (JST) - Tokyo" },
  ];

  const currencies = [
    { symbol: '$', name: 'USD' },
    { symbol: '€', name: 'EUR' },
    { symbol: '£', name: 'GBP' },
    { symbol: '¥', name: 'JPY' },
    { symbol: '₹', name: 'INR' },
    { symbol: 'د.إ', name: 'AED' },
    { symbol: 'ر.س', name: 'SAR' },
    { symbol: 'ج.م', name: 'EGP' },
  ];

  return (
    <div className="space-y-6">
      {/* Language & Region */}
      <div className="card-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
              <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('language')} & {t('timezone')}</h2>
              <p className="text-xs text-slate-500">Configure your preferred language and geographical settings</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Languages className="w-4 h-4 text-slate-400" />
              {t('systemLanguage')}
            </label>
            <select 
              value={language} 
              onChange={(e) => updateSettings({ language: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="en">English (US)</option>
              <option value="ar">العربية (Arabic)</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
              <option value="de">Deutsch (German)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              {t('timezone')}
            </label>
            <select 
              value={timezone} 
              onChange={(e) => updateSettings({ timezone: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Date & Time Formats */}
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('dateFormat')} & {t('timeFormat')}</h2>
            <p className="text-xs text-slate-500">Choose how dates and times are displayed across the system</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('dateFormat')}</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (US)" },
                  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (UK/EU)" },
                  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO)" }
                ].map((format) => (
                  <button
                    key={format.value}
                    onClick={() => updateSettings({ dateFormat: format.value })}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border text-sm transition-all",
                      dateFormat === format.value
                        ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 font-bold"
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    {format.label}
                    {dateFormat === format.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('timeFormat')}</label>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {['12h', '24h'].map((format) => (
                  <button
                    key={format}
                    onClick={() => updateSettings({ timeFormat: format })}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                      timeFormat === format
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    {format === '12h' ? '12-Hour (AM/PM)' : '24-Hour (Military)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-6 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-full shadow-sm mb-4">
              <Clock className="w-6 h-6 text-indigo-500" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Live Preview</p>
            <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
              {formatPreview()}
            </p>
            <p className="text-xs text-slate-500 mt-2">This is how dates and times will appear</p>
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('currency')} Settings</h2>
            <p className="text-xs text-slate-500">Set the default currency symbol for billing and reports</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Currency Symbol</label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {currencies.map((curr) => (
              <button
                key={curr.name}
                onClick={() => updateSettings({ currencySymbol: curr.symbol })}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-1",
                  currencySymbol === curr.symbol
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105 z-10"
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                )}
              >
                <span className="text-lg font-bold">{curr.symbol}</span>
                <span className={cn(
                  "text-[8px] font-bold uppercase tracking-tighter",
                  currencySymbol === curr.symbol ? "text-indigo-100" : "text-slate-400"
                )}>{curr.name}</span>
              </button>
            ))}
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
            <p className="text-[10px] text-blue-700 dark:text-blue-400 leading-relaxed">
              Changing the currency symbol only affects how prices are displayed. It does not perform any currency conversion on existing data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
