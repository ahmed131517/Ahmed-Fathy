import React, { useState } from "react";
import { Baby, Scale, Activity, Brain, CheckCircle2, AlertTriangle, ShieldCheck, Heart, Info, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface PatientDemo {
  age?: number;
  dob?: string;
  gender?: string;
  name?: string;
}

interface DemographicExamAdaptiveProps {
  patient?: PatientDemo;
  onDataChange?: (category: "pediatric" | "geriatric", data: Record<string, any>) => void;
}

export function DemographicExamAdaptive({ patient, onDataChange }: DemographicExamAdaptiveProps) {
  // Determine age group automatically from patient prop or default toggle
  const calculateAgeGroup = (): "pediatric" | "adult" | "geriatric" => {
    if (patient?.age !== undefined) {
      if (patient.age < 18) return "pediatric";
      if (patient.age >= 65) return "geriatric";
      return "adult";
    }
    return "geriatric"; // Default showcase for specialized exams
  };

  const [activeGroup, setActiveGroup] = useState<"pediatric" | "adult" | "geriatric">(calculateAgeGroup());

  // Pediatric state
  const [pedsData, setPedsData] = useState({
    fontanelle: "Soft & Flat (Normal)",
    fontanelleState: "normal",
    moroReflex: "Intact & Symmetric",
    rootingReflex: "Present",
    palmarGrasp: "Intact Bilaterally",
    heightPercentile: "50th %ile",
    weightPercentile: "55th %ile",
    headCircumference: "35.5 cm (50th %ile)",
    tmMobility: "Normal on Pneumatic Otoscopy",
    pediatricNotes: ""
  });

  // Geriatric state
  const [geriatricData, setGeriatricData] = useState({
    tugTime: "8.5", // seconds
    tugRisk: "Normal (< 10s)",
    miniCogRecall: "3/3 words recalled",
    clockDrawing: "Normal 12-hour clock face",
    cognitiveScore: "28/30 (Unimpaired)",
    orthostaticBP: "No orthostatic drop (Systolic drop < 10 mmHg)",
    fallRiskLevel: "Low Risk",
    frailtyIndex: "Robust / Non-frail",
    geriatricNotes: ""
  });

  const updatePeds = (field: string, val: any) => {
    const updated = { ...pedsData, [field]: val };
    setPedsData(updated);
    if (onDataChange) onDataChange("pediatric", updated);
  };

  const updateGeriatric = (field: string, val: any) => {
    const updated = { ...geriatricData, [field]: val };
    setGeriatricData(updated);
    if (onDataChange) onDataChange("geriatric", updated);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      {/* Top Banner & Demographic Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 font-bold">
            {activeGroup === "pediatric" ? <Baby className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              Age & Demographic Adaptive Examination
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold">
                Auto-Adjusted Normals
              </Badge>
            </h3>
            <p className="text-xs text-slate-500">
              Dynamically presents specialized examination fields based on patient age demographics
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveGroup("pediatric")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeGroup === "pediatric" ? "bg-white text-purple-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Baby className="w-3.5 h-3.5" /> Pediatric (&lt;18y)
          </button>
          <button
            type="button"
            onClick={() => setActiveGroup("geriatric")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeGroup === "geriatric" ? "bg-white text-purple-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Scale className="w-3.5 h-3.5" /> Geriatric (&ge;65y)
          </button>
        </div>
      </div>

      {/* PEDIATRIC SPECIALIZED EXAM PANEL */}
      {activeGroup === "pediatric" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-lg flex items-center justify-between text-xs text-purple-900">
            <span className="font-semibold flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-purple-600" /> Pediatric Development & Primitive Reflexes Panel
            </span>
            <span className="text-[11px] text-purple-700">Patient: {patient?.name || "Pediatric Patient"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Fontanelle Check */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <Label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-600" /> Anterior Fontanelle
              </Label>
              <Select value={pedsData.fontanelle} onValueChange={(v) => updatePeds("fontanelle", v)}>
                <SelectTrigger className="h-8 bg-white text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soft & Flat (Normal)">Soft & Flat (Normal)</SelectItem>
                  <SelectItem value="Bulging (Increased ICP)">Bulging (Elevated ICP / Meningitis)</SelectItem>
                  <SelectItem value="Sunken (Dehydration)">Sunken (Dehydration)</SelectItem>
                  <SelectItem value="Closed">Closed (Normal &gt; 18 months)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Growth Percentiles */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <Label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-600" /> Growth & Head Circumference
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500">Weight %ile</span>
                  <Input value={pedsData.weightPercentile} onChange={(e) => updatePeds("weightPercentile", e.target.value)} className="h-8 bg-white text-xs" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Height %ile</span>
                  <Input value={pedsData.heightPercentile} onChange={(e) => updatePeds("heightPercentile", e.target.value)} className="h-8 bg-white text-xs" />
                </div>
              </div>
            </div>

            {/* Infant Reflexes */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <Label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Primitive Infant Reflexes
              </Label>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-600">Moro Reflex:</span>
                  <Select value={pedsData.moroReflex} onValueChange={(v) => updatePeds("moroReflex", v)}>
                    <SelectTrigger className="h-7 w-32 bg-white text-[11px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Intact & Symmetric">Intact & Symmetric</SelectItem>
                      <SelectItem value="Asymmetric (Clavicle/Plexus)">Asymmetric</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GERIATRIC SPECIALIZED EXAM PANEL */}
      {activeGroup === "geriatric" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg flex items-center justify-between text-xs text-indigo-900">
            <span className="font-semibold flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-indigo-600" /> Geriatric Functional, Cognitive & Mobility Assessment Panel
            </span>
            <span className="text-[11px] text-indigo-700">Patient: {patient?.name || "Geriatric Patient"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Timed Up and Go (TUG) Test */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> Timed Up & Go (TUG) Test
                </Label>
                <Badge className={Number(geriatricData.tugTime) > 12 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}>
                  {Number(geriatricData.tugTime) > 12 ? "Fall Risk (> 12s)" : "Normal Mobility"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={geriatricData.tugTime}
                  onChange={(e) => updateGeriatric("tugTime", e.target.value)}
                  className="h-8 bg-white text-xs w-24"
                />
                <span className="text-slate-500 text-xs font-semibold">seconds</span>
              </div>
              <p className="text-[10px] text-slate-400">Patient stands from chair, walks 3 meters, turns, returns, and sits down.</p>
            </div>

            {/* Cognitive Screening (Mini-Cog) */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <Label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-600" /> Cognitive Screen (Mini-Cog)
              </Label>
              <Select value={geriatricData.miniCogRecall} onValueChange={(v) => updateGeriatric("miniCogRecall", v)}>
                <SelectTrigger className="h-8 bg-white text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3/3 words recalled">3/3 Unprompted Words Recalled (Normal)</SelectItem>
                  <SelectItem value="1-2 words recalled">1-2 Words Recalled (Possible Deficit)</SelectItem>
                  <SelectItem value="0/3 words recalled">0/3 Words Recalled (Cognitive Impairment)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Orthostatic Blood Pressure */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <Label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-indigo-600" /> Orthostatic Vital Check
              </Label>
              <Select value={geriatricData.orthostaticBP} onValueChange={(v) => updateGeriatric("orthostaticBP", v)}>
                <SelectTrigger className="h-8 bg-white text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="No orthostatic drop (Systolic drop < 10 mmHg)">No Orthostatic Drop (Normal)</SelectItem>
                  <SelectItem value="Positive Orthostasis (Systolic drop >= 20 mmHg)">Positive Orthostasis (&ge;20 mmHg drop)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
