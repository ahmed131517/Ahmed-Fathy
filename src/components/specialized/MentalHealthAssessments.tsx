import { useState } from "react";
import { db } from "@/lib/db";
import { usePatient } from "@/lib/PatientContext";
import { toast } from "sonner";
import { ClipboardCheck, Brain, AlertTriangle, CheckCircle2, History, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead or of hurting yourself in some way"
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
];

const OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 }
];

export function MentalHealthAssessments() {
  const { selectedPatient } = usePatient();
  const [activeTab, setActiveTab] = useState<'PHQ-9' | 'GAD-7'>('PHQ-9');
  const [scores, setScores] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const history = useLiveQuery(
    () => selectedPatient ? db.mental_health_assessments.where('patientId').equals(selectedPatient.id).reverse().toArray() : [],
    [selectedPatient]
  ) || [];

  const questions = activeTab === 'PHQ-9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const getInterpretation = (score: number, type: string) => {
    if (type === 'PHQ-9') {
      if (score <= 4) return "Minimal depression";
      if (score <= 9) return "Mild depression";
      if (score <= 14) return "Moderate depression";
      if (score <= 19) return "Moderately severe depression";
      return "Severe depression";
    } else {
      if (score <= 4) return "Minimal anxiety";
      if (score <= 9) return "Mild anxiety";
      if (score <= 14) return "Moderate anxiety";
      return "Severe anxiety";
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient) return;
    if (Object.keys(scores).length < questions.length) {
      toast.error("Please answer all questions.");
      return;
    }

    setIsSubmitting(true);
    try {
      await db.mental_health_assessments.add({
        id: crypto.randomUUID(),
        patientId: selectedPatient.id,
        type: activeTab,
        scores: scores as any,
        totalScore,
        interpretation: getInterpretation(totalScore, activeTab),
        date: new Date().toISOString(),
        lastModified: Date.now(),
        isDeleted: 0
      });
      toast.success(`${activeTab} assessment saved.`);
      setScores({});
      setShowHistory(true);
    } catch (error) {
      toast.error("Failed to save assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedPatient) return null;

  return (
    <div className="card-panel p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 dark:text-white">Mental Health Assessments</h3>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1"
        >
          {showHistory ? <Plus className="w-3 h-3" /> : <History className="w-3 h-3" />}
          {showHistory ? "New Assessment" : "View History"}
        </button>
      </div>

      {showHistory ? (
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm italic">No assessment history found.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase">{item.type}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">{item.interpretation}</h4>
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all",
                        item.totalScore > 15 ? "bg-red-500" : item.totalScore > 10 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${(item.totalScore / (item.type === 'PHQ-9' ? 27 : 21)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{item.totalScore}</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
            <button 
              onClick={() => { setActiveTab('PHQ-9'); setScores({}); }}
              className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", activeTab === 'PHQ-9' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500")}
            >
              PHQ-9 (Depression)
            </button>
            <button 
              onClick={() => { setActiveTab('GAD-7'); setScores({}); }}
              className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", activeTab === 'GAD-7' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500")}
            >
              GAD-7 (Anxiety)
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="space-y-3">
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{idx + 1}. {q}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setScores({ ...scores, [idx]: opt.value })}
                      className={cn(
                        "px-3 py-2 text-[10px] border rounded-lg transition-all text-center",
                        scores[idx] === opt.value
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-500/20"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Total Score</p>
                <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">{totalScore}</p>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Interpretation</p>
                <p className="text-sm font-bold text-indigo-600">{getInterpretation(totalScore, activeTab)}</p>
              </div>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <ClipboardCheck className="w-4 h-4" />
              Save Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
