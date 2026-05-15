import React, { useState } from 'react';
import { Calculator, Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES, CALCULATORS, CalculatorType } from '@/data/calculators';

export function MedCalc() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedId, setSelectedId] = useState<string | null>(CALCULATORS[0].id);

  const filteredCalculators = CALCULATORS.filter(calc => 
    (activeCategory === 'All' || calc.category === activeCategory) &&
    calc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCalculator = CALCULATORS.find(c => c.id === selectedId);

  return (
    <div className="h-full flex gap-6 p-2">
      {/* Sidebar: Categories */}
      <div className="w-56 flex-shrink-0 flex flex-col h-full">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex-shrink-0">Medical Calculators</h2>
        <div className="space-y-1 overflow-y-auto flex-1 pr-2 pb-6 custom-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "w-full text-left px-4 py-2 rounded-lg text-sm font-medium",
                activeCategory === cat ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Center: Search & Cards */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Clinical tools</h3>
          <p className="text-slate-500 mb-4">Clinical tools for quick decision-making</p>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search calculators (e.g., BMI, GFR, Wells Score…)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto">
          {filteredCalculators.map(calc => (
            <button
              key={calc.id}
              onClick={() => setSelectedId(calc.id)}
              className={cn(
                "p-4 rounded-xl border text-left flex items-center justify-between",
                selectedId === calc.id ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200 hover:border-slate-300"
              )}
            >
              <div>
                <h4 className="font-bold text-slate-900">{calc.name}</h4>
                <p className="text-sm text-slate-500">{calc.description}</p>
              </div>
              <ChevronRight className={cn("w-5 h-5", selectedId === calc.id ? "text-indigo-600" : "text-slate-400")} />
            </button>
          ))}
        </div>
      </div>

      {/* Right Sidebar: Calculator Form */}
      <div className="w-80 flex-shrink-0 p-6 bg-white border-l border-slate-200 rounded-xl overflow-y-auto custom-scrollbar">
        {selectedCalculator ? (
          <div>
            <h3 className="font-bold text-lg mb-2">{selectedCalculator.name}</h3>
            <p className="text-sm text-slate-500 mb-6">{selectedCalculator.description}</p>
            
            {selectedCalculator.inputs ? (
              <CalculatorForm calculator={selectedCalculator} />
            ) : (
              <div className="bg-slate-100 p-4 rounded-xl text-center text-slate-500 text-sm">
                This calculator is not yet implemented.
              </div>
            )}
          </div>
        ) : (
           <div className="text-slate-400">Select a calculator to start</div>
        )}
      </div>
    </div>
  );
}

function CalculatorForm({ calculator }: { calculator: CalculatorType }) {
  const [values, setValues] = useState<Record<string, string>>({});
  
  // Reset values when calculator changes
  React.useEffect(() => {
    setValues({});
  }, [calculator.id]);

  const handleChange = (id: string, val: string) => {
    setValues(prev => ({ ...prev, [id]: val }));
  };

  const results = calculator.compute ? calculator.compute(values) : null;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {calculator.inputs?.map(input => (
          <div key={input.id}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {input.label}
            </label>
            {input.type === 'number' || input.type === 'text' || input.type === 'date' ? (
              <div className="relative">
                <input
                  type={input.type}
                  placeholder={input.placeholder}
                  value={values[input.id] || ''}
                  onChange={(e) => handleChange(input.id, e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow pr-12"
                />
                {input.unit && (
                  <div className="absolute right-3 top-2.5 text-slate-400 text-sm pointer-events-none">
                    {input.unit}
                  </div>
                )}
              </div>
            ) : input.type === 'select' ? (
              <select
                value={values[input.id] || ''}
                onChange={(e) => handleChange(input.id, e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              >
                <option value="">Select...</option>
                {input.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : input.type === 'radio' ? (
              <div className="flex gap-4">
                {input.options?.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={input.id}
                      value={opt.value}
                      checked={values[input.id] === String(opt.value)}
                      onChange={(e) => handleChange(input.id, e.target.value)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {results && results.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Results</h4>
          <div className="space-y-3">
            {results.map((res, i) => (
              <div key={i} className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                <div className="text-sm text-indigo-900/70 mb-1">{res.label}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-indigo-700">{res.value}</span>
                  {res.unit && <span className="text-indigo-600 text-sm font-medium">{res.unit}</span>}
                </div>
                {res.interpretation && (
                  <div className="mt-2 text-sm font-medium text-indigo-900">
                    {res.interpretation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
