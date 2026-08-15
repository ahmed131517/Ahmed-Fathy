import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check } from 'lucide-react';
import { commonICD10Codes, ICD10Code } from '../data/icd10';
import { cn } from '../lib/utils';

interface ICD10SearchProps {
  onSelect: (code: ICD10Code) => void;
  initialValue?: string;
  placeholder?: string;
}

export function ICD10Search({ onSelect, initialValue = "", placeholder = "Search ICD-10 codes..." }: ICD10SearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<ICD10Code[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (query.length > 1 && query !== initialValue) {
      const filtered = commonICD10Codes.filter(item => 
        item.code?.toLowerCase().includes(query?.toLowerCase() || '') || 
        item.description?.toLowerCase().includes(query?.toLowerCase() || '')
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (item: ICD10Code) => {
    setQuery(`${item.code} - ${item.description}`);
    setIsOpen(false);
    onSelect(item);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all text-sm"
          placeholder={placeholder}
        />
        {query && (
          <button 
            onClick={() => { setQuery(""); onSelect({ code: "", description: "" }); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-[320px] overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200 divide-y divide-slate-100">
          {results.map((item, index) => (
            <button
              key={item.code}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "w-full text-left px-4 py-3 flex items-start gap-3 transition-colors",
                selectedIndex === index ? "bg-indigo-50" : "hover:bg-slate-50"
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className={cn(
                  "w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold font-mono",
                  selectedIndex === index ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                )}>
                  {item.code.substring(0, 3)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600">{item.code}</span>
                    {item.category && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-600 rounded">
                        {item.category}
                      </span>
                    )}
                  </div>
                  {selectedIndex === index && <Check className="w-3 h-3 text-indigo-600" />}
                </div>
                <p className="text-sm text-slate-700 truncate">{item.description}</p>
              </div>
            </button>
          ))}

          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => handleSelect({ code: "CUSTOM", description: query.trim() })}
              className="w-full text-left px-4 py-3 bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-900 transition-colors flex items-center gap-2.5 font-medium text-xs border-t border-indigo-100"
            >
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">+</span>
              <div className="flex-1 min-w-0">
                <span className="text-slate-500 font-normal">Use custom diagnosis:</span>{" "}
                <span className="font-semibold text-indigo-900 truncate">"{query.trim()}"</span>
              </div>
            </button>
          )}

          {results.length === 0 && query.length > 1 && (
            <div className="p-3 text-center bg-slate-50">
              <p className="text-xs text-slate-500">No exact ICD-10 code match for "{query}".</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
