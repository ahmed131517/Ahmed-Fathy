import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { medicationsDatabase } from '@/data/medications';
import { ALL_TESTS } from '@/data/labReferenceData';
import { HEAD_MODELS, EAR_MODELS, EYE_MODELS, THROAT_MODELS, BACK_MODELS } from '@/data/symptomModels';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const allData = useMemo(() => [
    ...Object.values(medicationsDatabase).flat().map(m => ({ ...m, title: m.name, category: 'Medication' })),
    ...ALL_TESTS.map(l => ({ ...l, title: l.name, category: 'Lab Reference' })),
    ...[...HEAD_MODELS, ...EAR_MODELS, ...EYE_MODELS, ...THROAT_MODELS, ...BACK_MODELS].map(s => ({ ...s, title: s.label, category: 'Encyclopedia' })),
  ], []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (!q) {
      setResults([]);
      return;
    }
    const filtered = allData.filter(item => 
      (item.name || item.title || '').toLowerCase().includes(q.toLowerCase())
    );
    setResults(filtered.slice(0, 5));
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search all clinical knowledge..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>
      {results.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-2 z-50">
          {results.map((res, i) => (
            <div key={i} className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-0">
              <p className="font-bold text-sm">{res.name || res.title}</p>
              <p className="text-xs text-slate-500">{res.category}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
