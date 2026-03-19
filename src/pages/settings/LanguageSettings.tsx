import { useState } from "react";
import { Globe, MapPin, Calendar, Clock, Check, DollarSign } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";

export function LanguageSettings() {
  const { 
    language, 
    timezone, 
    dateFormat, 
    timeFormat, 
    currencySymbol,
    updateSettings 
  } = useSettings();

  return (
    <div className="space-y-6">
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Language & Region</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">System Language</label>
              <select 
                value={language} 
                onChange={(e) => updateSettings({ language: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-sm"
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Timezone</label>
              <div className="relative">
                <select 
                  value={timezone} 
                  onChange={(e) => updateSettings({ timezone: e.target.value })}
                  className="w-full p-2 pl-10 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-sm appearance-none"
                >
                  <option value="UTC-8">Pacific Time (PT)</option>
                  <option value="UTC-7">Mountain Time (MT)</option>
                  <option value="UTC-6">Central Time (CT)</option>
                  <option value="UTC-5">Eastern Time (ET)</option>
                  <option value="UTC+0">Greenwich Mean Time (GMT)</option>
                </select>
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Date & Time Formats</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date Format</label>
              <select 
                value={dateFormat} 
                onChange={(e) => updateSettings({ dateFormat: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-sm"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (UK/EU)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Time Format</label>
              <div className="flex gap-2">
                {['12h', '24h'].map((format) => (
                  <button
                    key={format}
                    onClick={() => updateSettings({ timeFormat: format })}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      timeFormat === format
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              Currency Symbol
            </label>
            <div className="flex gap-2">
              {['$', '€', '£', '¥', '₹'].map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => updateSettings({ currencySymbol: symbol })}
                  className={`w-10 h-10 rounded-lg text-sm font-bold border transition-all ${
                    currencySymbol === symbol
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
