import React, { useState } from 'react';
import { usePatient } from '../lib/PatientContext';
import { cn } from '../lib/utils';

export function EncounterNote() {
  const { selectedPatient } = usePatient();
  const [nameType, setNameType] = useState<'generic' | 'trade'>('generic');

  const getMedicationDisplay = (genericName: string) => {
    if (nameType === 'generic') return genericName;
    
    const tradeNames: Record<string, string> = {
      'Amoxicillin': 'Amoxil',
      'Lisinopril': 'Prinivil / Zestril',
      'Metformin': 'Glucophage',
      'Atorvastatin': 'Lipitor',
      'Ibuprofen': 'Advil / Motrin',
      'Azithromycin': 'Zithromax',
      'Sertraline': 'Zoloft',
      'Levothyroxine': 'Synthroid',
      'Amlodipine': 'Norvasc',
      'Omeprazole': 'Prilosec',
      'Losartan': 'Cozaar',
      'Spironolactone': 'Aldactone',
      'Metoprolol': 'Lopressor',
      'Gabapentin': 'Neurontin',
      'Furosemide': 'Lasix',
      'Albuterol': 'Ventolin'
    };

    const trade = tradeNames[genericName];
    return trade ? `${trade} (${genericName})` : genericName;
  };

  return (
    <div className="relative flex flex-col min-h-screen mr-80">
      {/* Persistent Patient Header - Sticky to the top of its container which is below the main header */}
      <div className="sticky top-0 z-10 glass-header bg-white/70 border-b border-outline-variant/10 px-8 py-4 flex items-center justify-between no-print">
        <div className="flex items-center gap-5">
          <img 
            className="h-14 w-14 rounded-full border-2 border-white shadow-sm object-cover" 
            alt="Patient portrait"
            referrerPolicy="no-referrer"
            src={selectedPatient?.photo || "https://lh3.googleusercontent.com/aida-public/AB6AXuA4FEqzDaJhfjOMj4aIaExeEm7dMPhdWL3wxM8Ubcjvrbjw4VbquC0rR03GqSZRLK-FLVZYuUCMdWxRAfa4tSfKbCaW91D1VH3x8iRF17ZsMgktjsTlCh6IujONGAlJODQww3Hm7Yo4zfJf_vXkjStVY1FFAQ8jx7B81j2-M2Bohn-xaXxdsrNiNdibFevgLvNAET1sZXA6NuvSGNFLwYjXa2bqz_kbtAUqvSEjSURzOY9qrdIHOMoT-gjD-s6Ja3O2CZszyYkgUzUR"}
          />
          <div>
            <h1 className="font-headline font-bold text-xl text-on-surface tracking-tight">
              {selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "Elena Rodriguez"}
            </h1>
            <div className="flex gap-4 text-xs text-on-surface-variant font-medium mt-0.5">
              <span>MRN: <b className="text-on-surface">{selectedPatient?.mrn || "482-991-02"}</b></span>
              <span>{selectedPatient?.age || "42"}y {selectedPatient?.gender || "Female"}</span>
              <span>DOB: {selectedPatient?.dob || "05/12/1981"}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Vitals</span>
            <div className="flex gap-3 mt-1">
              <div className="bg-surface-container-low px-2 py-1 rounded text-center min-w-[50px]">
                <p className="text-[10px] text-slate-400">BP</p>
                <p className="text-xs font-bold">118/74</p>
              </div>
              <div className="bg-surface-container-low px-2 py-1 rounded text-center min-w-[40px]">
                <p className="text-[10px] text-slate-400">HR</p>
                <p className="text-xs font-bold">72</p>
              </div>
              <div className="bg-error-container px-2 py-1 rounded text-center min-w-[40px]">
                <p className="text-[10px] text-on-error-container">Temp</p>
                <p className="text-xs font-bold text-on-error-container">101.4°</p>
              </div>
              <div className="bg-surface-container-low px-2 py-1 rounded text-center min-w-[40px]">
                <p className="text-[10px] text-slate-400">O2</p>
                <p className="text-xs font-bold">98%</p>
              </div>
            </div>
          </div>
          <div className="h-10 w-px bg-outline-variant/30"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-error font-bold uppercase tracking-tighter flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">warning</span> Allergies
            </span>
            <p className="text-sm font-bold text-error mt-1">Penicillin — Anaphylaxis</p>
          </div>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="p-8 space-y-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-lg font-bold text-blue-900">Encounter Note: Follow-up Hypertension</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Discard</button>
            <button className="px-4 py-2 text-xs font-bold text-primary bg-primary-container/20 rounded-lg hover:bg-primary-container/30 transition-colors">Save Draft</button>
            <button className="px-6 py-2 text-xs font-bold text-white bg-primary rounded-lg shadow-md hover:bg-primary-container transition-colors">Sign Encounter</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Subjective */}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">chat_bubble</span>
              <h3 className="font-headline font-bold text-blue-800">Subjective</h3>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-slate-500 mb-1 font-medium">Chief Complaint & History of Present Illness</p>
              <textarea 
                className="w-full text-sm border-none bg-surface-container-low focus:ring-2 focus:ring-primary/20 rounded-xl p-4 text-on-surface" 
                placeholder="Patient reports worsening headaches for 3 days, accompanied by lightheadedness. States compliance with Lisinopril 20mg..." 
                rows={4}
              ></textarea>
            </div>
          </section>

          {/* Objective */}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">visibility</span>
              <h3 className="font-headline font-bold text-blue-800">Objective</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">Physical Exam Findings</p>
                <textarea 
                  className="w-full text-sm border-none bg-surface-container-low focus:ring-2 focus:ring-primary/20 rounded-xl p-4 text-on-surface" 
                  placeholder="HEENT: NC/AT. Pupils PERRLA. Cardiovascular: RRR, no murmurs. Lungs: CTA bilat..." 
                  rows={6}
                ></textarea>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-outline-variant/10">
                <p className="text-xs text-slate-500 font-bold uppercase mb-3 tracking-wider">Point of Care Testing</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm p-2 bg-white rounded-lg">
                    <span className="text-slate-600">Blood Glucose (Random)</span>
                    <span className="font-bold text-primary">104 mg/dL</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 bg-white rounded-lg">
                    <span className="text-slate-600">Urinalysis</span>
                    <span className="font-bold text-secondary">Negative</span>
                  </div>
                  <button className="w-full mt-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-400 hover:border-primary/40 hover:text-primary transition-all">
                    + Add Result
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Assessment */}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">assignment_turned_in</span>
              <h3 className="font-headline font-bold text-blue-800">Assessment</h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-sm">
                  <span className="font-bold text-blue-800">I10</span>
                  <span className="text-blue-600">Essential hypertension</span>
                  <button className="material-symbols-outlined text-xs hover:text-blue-900">close</button>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-sm">
                  <span className="font-bold text-slate-700">R51.9</span>
                  <span className="text-slate-600">Headache, unspecified</span>
                  <button className="material-symbols-outlined text-xs">close</button>
                </div>
                <button className="bg-surface-container px-3 py-1.5 rounded-full text-sm text-slate-500 font-medium hover:bg-surface-container-high transition-colors">
                  + Add ICD-10 Code
                </button>
              </div>
              <textarea 
                className="w-full text-sm border-none bg-surface-container-low focus:ring-2 focus:ring-primary/20 rounded-xl p-4 text-on-surface" 
                placeholder="Refractory hypertension possibly secondary to dietary non-compliance or stressors..." 
                rows={3}
              ></textarea>
            </div>
          </section>

          {/* Plan */}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">event_note</span>
                <h3 className="font-headline font-bold text-blue-800">Plan</h3>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                  onClick={() => setNameType('generic')}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold rounded-md transition-all",
                    nameType === 'generic' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Generic
                </button>
                <button 
                  onClick={() => setNameType('trade')}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold rounded-md transition-all",
                    nameType === 'trade' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Trade
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-500 mb-2 font-medium">Treatment & Disposition</p>
                <textarea 
                  className="w-full text-sm border-none bg-surface-container-low focus:ring-2 focus:ring-primary/20 rounded-xl p-4 text-on-surface" 
                  placeholder="Increase Lisinopril to 40mg QD. Order BMP. Follow up in 2 weeks..." 
                  rows={4}
                ></textarea>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-outline-variant/10">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Pending Orders</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-on-surface font-medium">
                      <span className="material-symbols-outlined text-blue-500 text-sm">science</span> BMP (Basic Metabolic Panel)
                    </li>
                    <li className="flex items-center gap-2 text-sm text-on-surface font-medium">
                      <span className="material-symbols-outlined text-blue-500 text-sm">medication</span> {getMedicationDisplay('Lisinopril')} 40mg Tablet
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* NavigationDrawer (Right Sidebar) - Using fixed to position it correctly relative to the viewport */}
      <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-l border-slate-100 flex flex-col shadow-2xl z-40 no-print">
        {/* Top section: Clinical Alerts */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-headline font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-container">campaign</span> Clinical Alerts
            </h4>
            <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold px-2 py-0.5 rounded-full">2 NEW</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-tertiary-fixed/30 rounded-xl border border-tertiary-fixed/50">
              <p className="text-xs font-bold text-tertiary flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-[14px]">warning</span> High Potassium
              </p>
              <p className="text-[11px] text-tertiary/80 leading-snug">Last Lab: 5.4 mEq/L (02/24/2024). Monitor closely with Lisinopril titration.</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-bold text-blue-800 flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-[14px]">info</span> GAP in Care
              </p>
              <p className="text-[11px] text-blue-700/80 leading-snug">Annual Wellness Visit overdue. Mammogram screening pending.</p>
            </div>
          </div>
        </div>

        {/* Bottom section: Order Basket */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 bg-slate-50/50">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-headline font-bold text-sm text-blue-700">Order Basket</h4>
              <span className="text-[10px] text-slate-400 font-bold">2 ITEMS</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">Draft meds & labs</p>
            <div className="flex gap-4 border-b border-slate-200 mb-4">
              <button className="pb-2 text-xs font-bold border-b-2 border-blue-600 text-blue-600">Draft Orders</button>
              <button className="pb-2 text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">Templates</button>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[300px]">
              <div className="group flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-outline-variant/10">
                <div className="flex gap-3 items-center">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-sm">science</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold">BMP</p>
                    <p className="text-[10px] text-slate-400">Stat • Fasting</p>
                  </div>
                </div>
                <button className="material-symbols-outlined text-slate-300 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">delete</button>
              </div>
              <div className="group flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-outline-variant/10">
                <div className="flex gap-3 items-center">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-sm">pill</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold">{getMedicationDisplay('Lisinopril')} 40mg</p>
                    <p className="text-[10px] text-slate-400">Oral • Daily • #30</p>
                  </div>
                </div>
                <button className="material-symbols-outlined text-slate-300 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">delete</button>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-[11px] font-bold text-slate-400 hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-sm">add_shopping_cart</span> QUICK ADD
              </button>
            </div>
          </div>
          <div className="mt-auto p-6 bg-white border-t border-slate-100">
            <button className="w-full py-4 bg-primary text-white font-headline font-bold text-sm rounded-xl shadow-lg active:scale-95 transition-all duration-150">
              Sign Orders
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-3 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[12px]">security</span> HIPAA Compliant • 256-bit AES
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
