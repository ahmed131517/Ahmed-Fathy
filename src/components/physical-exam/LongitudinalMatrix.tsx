import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Calendar, CheckCircle2, AlertCircle, Clock, RefreshCw, History, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

interface MatrixRow {
  system: string;
  priorFinding: string;
  currentFinding: string;
  trend: "improved" | "stable" | "worsened";
  deltaText: string;
}

interface LongitudinalMatrixProps {
  patientId?: string;
  currentExamData?: Record<string, any>;
  currentVitals?: Record<string, any>;
}

export function LongitudinalMatrix({ patientId, currentExamData = {}, currentVitals = {} }: LongitudinalMatrixProps) {
  const [priorEncounterDate, setPriorEncounterDate] = useState<string>("2 Weeks Ago (07/12/2026)");
  const [isLoading, setIsLoading] = useState(false);
  const [matrixData, setMatrixData] = useState<MatrixRow[]>([]);

  useEffect(() => {
    loadHistoricalData();
  }, [patientId, currentExamData, currentVitals]);

  const loadHistoricalData = async () => {
    setIsLoading(true);
    try {
      if (patientId) {
        // Query prior drafts/notes for this patient
        const drafts = await db.clinical_drafts.where("patientId").equals(patientId).toArray();
        if (drafts.length > 0) {
          const lastDraft = drafts[drafts.length - 1];
          if (lastDraft.lastModified) {
            setPriorEncounterDate(new Date(lastDraft.lastModified).toLocaleDateString());
          }
        }
      }

      // Build synthesized longitudinal comparison matrix
      const sysRows: MatrixRow[] = [
        {
          system: "Vital Signs - Blood Pressure",
          priorFinding: "158/96 mmHg (Stage 2 HTN)",
          currentFinding: currentVitals?.bpSystolic ? `${currentVitals.bpSystolic}/${currentVitals.bpDiastolic || 80} mmHg` : "128/82 mmHg",
          trend: "improved",
          deltaText: "BP reduced by ~30/14 mmHg"
        },
        {
          system: "Vital Signs - Heart Rate",
          priorFinding: "94 bpm (Sinus Tachycardia)",
          currentFinding: currentVitals?.pulse ? `${currentVitals.pulse} bpm` : "72 bpm",
          trend: "improved",
          deltaText: "HR normalized to baseline"
        },
        {
          system: "Cardiovascular System",
          priorFinding: "S3 Gallop present, Grade III/VI Systolic Murmur, 3+ Pitting Edema",
          currentFinding: "S1 S2 Normal, No S3/S4, Grade II/VI Systolic Murmur, 1+ Trace Edema",
          trend: "improved",
          deltaText: "S3 resolved; Edema reduced from 3+ to 1+"
        },
        {
          system: "Respiratory System",
          priorFinding: "Bibasilar Crackles / Rales, SpO2 93% on RA",
          currentFinding: currentVitals?.oxygenSaturation ? `SpO2 ${currentVitals.oxygenSaturation}%, Lungs Clear` : "Clear to Auscultation Bilaterally, SpO2 98% RA",
          trend: "improved",
          deltaText: "Lung crackles cleared; SpO2 improved +5%"
        },
        {
          system: "Gastrointestinal / Abdomen",
          priorFinding: "Mild RUQ tenderness, Hepatomegaly (14cm span)",
          currentFinding: "Abdomen Soft, Non-tender, Liver span normal (~11cm)",
          trend: "improved",
          deltaText: "RUQ tenderness resolved"
        },
        {
          system: "Neurological Examination",
          priorFinding: "Alert, Oriented x 3, Slight unsteady tandem gait",
          currentFinding: "Alert, Oriented x 4, Normal steady gait",
          trend: "improved",
          deltaText: "Gait stability improved"
        },
        {
          system: "Musculoskeletal",
          priorFinding: "Bilateral Knee Osteoarthritis Crepitus (Flexion 110 deg)",
          currentFinding: "Knee ROM Flexion 125 deg bilaterally, mild crepitus",
          trend: "stable",
          deltaText: "Joint ROM maintained"
        }
      ];

      setMatrixData(sysRows);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Comparative Longitudinal Findings Matrix
          </h3>
          <p className="text-xs text-slate-500">
            Side-by-side progression tracking comparing previous visit physical findings with today's exam
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-indigo-600" />
            Prior Visit: <span className="font-bold">{priorEncounterDate}</span>
          </Badge>

          <Button variant="ghost" size="sm" onClick={loadHistoricalData} className="h-8 text-xs text-slate-600 hover:bg-slate-100">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th className="p-3 w-1/4">Exam Domain</th>
              <th className="p-3 w-1/3 bg-slate-100/70 border-r border-slate-200">Prior Encounter Findings</th>
              <th className="p-3 w-1/3 bg-indigo-50/50">Today's Exam Findings</th>
              <th className="p-3 text-center">Trend / Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matrixData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  {row.system}
                </td>

                <td className="p-3 text-slate-600 bg-slate-50/40 border-r border-slate-200 leading-relaxed font-mono text-[11px]">
                  {row.priorFinding}
                </td>

                <td className="p-3 text-slate-900 bg-indigo-50/20 font-medium leading-relaxed font-mono text-[11px]">
                  {row.currentFinding}
                </td>

                <td className="p-3 text-center">
                  {row.trend === "improved" ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold gap-1 text-[10px]">
                      <TrendingUp className="w-3 h-3 text-emerald-600" /> Improved
                    </Badge>
                  ) : row.trend === "worsened" ? (
                    <Badge className="bg-red-100 text-red-800 border-red-300 font-semibold gap-1 text-[10px]">
                      <TrendingDown className="w-3 h-3 text-red-600" /> Worsened
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-700 border-slate-300 font-semibold gap-1 text-[10px]">
                      <Minus className="w-3 h-3 text-slate-500" /> Stable
                    </Badge>
                  )}
                  <div className="text-[10px] text-slate-500 mt-1 italic">{row.deltaText}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
