import React from 'react';
import { User, FileText, HeartPulse, Plus } from 'lucide-react';

interface ClinicalToolsSidebarProps {
  findings: string[];
  doctorNotes: string;
  differentials: string[];
  onFindingsCheck: (label: string) => void;
  onNotesChange: (notes: string) => void;
  onDifferentialsChange: (diffs: string[]) => void;
}

export function ClinicalToolsSidebar({
  findings,
  doctorNotes,
  differentials,
  onFindingsCheck,
  onNotesChange,
  onDifferentialsChange
}: ClinicalToolsSidebarProps) {
  const [newDiff, setNewDiff] = React.useState('');

  const addDiff = () => {
    if (newDiff.trim() && !differentials.includes(newDiff.trim())) {
      onDifferentialsChange([...differentials, newDiff.trim()]);
      setNewDiff('');
    }
  };

  const removeDiff = (index: number) => {
    onDifferentialsChange(differentials.filter((_, i) => i !== index));
  };
  return (
    <div className="w-64 flex flex-col gap-4 shrink-0">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm flex-1 flex flex-col">
        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <User className="w-4 h-4"/> Physical Exam
        </h4>
        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          {[
            { id: 'general', label: 'General Inspection' },
            { id: 'cardiovascular', label: 'Listen to Heart' },
            { id: 'respiratory', label: 'Listen to Lungs' },
            { id: 'abdominal', label: 'Examine Abdomen' },
            { id: 'neurological', label: 'Neurological Exam' },
            { id: 'extremities', label: 'Check Extremities' }
          ].map(exam => (
            <button
              key={exam.id}
              onClick={() => onFindingsCheck(exam.label)}
              disabled={findings.some(f => f.includes(exam.id.substring(0,3)) || f.includes(exam.label.substring(0,3)))}
              className="text-left text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded hover:bg-indigo-50 hover:border-indigo-200 transition-colors disabled:opacity-50"
              title="Click to perform examination"
            >
              {exam.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col">
        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-rose-500"/> Differentials
        </h4>
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            <input 
              type="text" 
              placeholder="Add Diagnosis..." 
              className="flex-1 text-[10px] px-2 py-1.5 border border-slate-200 rounded outline-none focus:border-indigo-400"
              value={newDiff}
              onChange={(e) => setNewDiff(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDiff()}
            />
            <button onClick={addDiff} className="p-1 px-2 border border-slate-200 rounded hover:bg-slate-50">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-y-auto">
            {differentials.map((diff, i) => (
              <span key={i} className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1 group">
                {diff}
                <button onClick={() => removeDiff(i)} className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 shadow-sm h-64 flex flex-col">
        <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4"/> Clinical Notes
        </h4>
        <textarea
          className="flex-1 w-full bg-transparent border-none resize-none outline-none focus:ring-0 text-sm placeholder:text-yellow-600/50 text-yellow-900 leading-relaxed"
          placeholder="Jot down key findings, differentials, or plan here..."
          value={doctorNotes}
          onChange={(e) => onNotesChange(e.target.value)}
        ></textarea>
      </div>
    </div>
  );
}
