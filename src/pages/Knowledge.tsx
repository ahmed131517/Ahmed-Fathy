import React, { useState } from 'react';
import { BookOpen, ClipboardList, FileText, Database, AlertTriangle, Bookmark, Calculator, Wind, Stethoscope, Maximize, Minimize } from 'lucide-react';
import { cn } from "@/lib/utils";

import { Encyclopedia } from "@/components/knowledge/Encyclopedia";
import { DrugInteractions } from "@/components/knowledge/DrugInteractions";
import { DrugDatabase } from "@/components/knowledge/DrugDatabase";
import { LabReference } from "@/components/knowledge/LabReference";
import { TreatmentProtocols } from "@/components/knowledge/TreatmentProtocols";
import { MyLibrary } from "@/components/knowledge/MyLibrary";
import { MedCalc } from "@/components/knowledge/MedicalCalculator";
import { MechanicalVentilationSimulator } from "@/components/knowledge/MechanicalVentilationSimulator";
import { OSCESimulator } from "@/components/knowledge/osce/OSCESimulator";

export function Knowledge() {
  const [activeSection, setActiveSection] = useState('osce-simulator');
  const [isMaximized, setIsMaximized] = useState(false);

  const menuItems = [
    { id: 'my-library', name: 'My Library', icon: Bookmark },
    { id: 'encyclopedia', name: 'Encyclopedia', icon: BookOpen },
    { id: 'treatment-protocols', name: 'Treatment Protocols', icon: ClipboardList },
    { id: 'lab-reference', name: 'Lab Reference', icon: FileText },
    { id: 'drug-database', name: 'Drug Database', icon: Database },
    { id: 'drug-interactions', name: 'Drug Interactions', icon: AlertTriangle },
    { id: 'medical-calculator', name: 'Medical Calc.', icon: Calculator },
    { id: 'vent-simulator', name: 'Vent Simulator', icon: Wind },
    { id: 'osce-simulator', name: 'AI Trainee', icon: Stethoscope },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Knowledge Base</h2>
          <p className="text-slate-500">Access medical resources, guidelines, and educational materials</p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border-2 border-indigo-100 shadow-md flex flex-wrap gap-2 sticky top-0 z-10">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all",
              activeSection === item.id 
                ? "bg-indigo-600 text-white shadow-lg scale-105" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-100"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </button>
        ))}
      </div>

      <div className={cn(
        "flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-y-auto relative transition-all duration-300 flex flex-col",
        isMaximized ? "fixed inset-0 z-50 !rounded-none" : ""
      )}>
        <button 
          onClick={() => setIsMaximized(!isMaximized)}
          className={cn(
            "absolute z-50 p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors",
            isMaximized ? "top-6 right-6" : "top-4 right-4"
          )}
          title={isMaximized ? "Minimize" : "Maximize"}
        >
          {isMaximized ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-h-0 flex flex-col">
          {activeSection === 'encyclopedia' && <Encyclopedia />}
          {activeSection === 'treatment-protocols' && <TreatmentProtocols />}
          {activeSection === 'lab-reference' && <LabReference />}
          {activeSection === 'drug-database' && <DrugDatabase />}
          {activeSection === 'drug-interactions' && <DrugInteractions />}
          {activeSection === 'medical-calculator' && <MedCalc />}
          {activeSection === 'vent-simulator' && <MechanicalVentilationSimulator />}
          {activeSection === 'osce-simulator' && <OSCESimulator />}
          {activeSection === 'my-library' && <MyLibrary />}
        </div>
      </div>
    </div>
  );
}

