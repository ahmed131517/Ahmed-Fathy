import React from 'react';
import { useSettings } from '../lib/SettingsContext';
import QRCode from "react-qr-code";
import { cn } from '../lib/utils';
import { DosageFormBadge } from './prescriptions/DosageFormBadge';

interface Medication {
  name: string;
  form?: string;
  concentration?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionData {
  id?: string;
  name: string;
  age: string;
  gender: string;
  contact: string;
  ph: string;
  co: string;
  bp: string;
  p: string;
  temp: string;
  rr: string;
  sao2: string;
  rbs: string;
  oe: string;
  dx: string;
  medications: Medication[];
  requiredLabMonitoring?: string[];
  followUpSchedule?: string[];
}

interface ClinicalSafetyData {
  labs: string[];
  followUp: string[];
}

function getClinicalSafetyData(medications: Medication[], dx: string): ClinicalSafetyData {
  const labs: string[] = [];
  const followUp: string[] = [];
  
  const medNames = (medications || []).map(m => m.name?.toLowerCase() || "");
  const diagnosisClean = (dx || "").toLowerCase();

  let matchedMed = false;

  const checkMed = (keywords: string[], medLabs: string[], medFollowUp: string[]) => {
    const hasKeyword = keywords.some(kw => medNames.some(name => name.includes(kw.toLowerCase())));
    if (hasKeyword) {
      labs.push(...medLabs);
      followUp.push(...medFollowUp);
      matchedMed = true;
    }
  };

  // ACEi / ARBs / Beta-Blockers / Cardiovascular
  checkMed(
    ['lisinopril', 'enalapril', 'ramipril', 'captopril', 'losartan', 'valsartan', 'candesartan', 'sacubitril', 'co-diovan', 'zestril', 'concor', 'bisoprolol', 'carvedilol', 'metoprolol', 'atenolol', 'nebivolol'],
    ['Renal function (Serum Creatinine & eGFR) & Serum Potassium (Electrolytes) in 1-2 weeks.'],
    ['Clinical follow-up in 1-2 weeks to recheck blood pressure, heart rate, and renal stability.']
  );

  // Statins / Lipid-lowering
  checkMed(
    ['atorvastatin', 'rosuvastatin', 'simvastatin', 'pravastatin', 'lovastatin', 'lipitor', 'crestor', 'ezetimibe', 'fenofibrate', 'lipanthyl'],
    ['Lipid Panel (Fasting LDL/HDL & Triglycerides) in 6-12 weeks.', 'Baseline Liver Function Tests (ALT/AST); recheck if muscle pain occurs.'],
    ['Therapy compliance and lipid target verification in 6-12 weeks.']
  );

  // Oral Anti-diabetic / Hypoglycemics
  checkMed(
    ['metformin', 'glucophage', 'glimepiride', 'gliclazide', 'amaryl', 'diamicron', 'sitagliptin', 'januvia', 'empagliflozin', 'jardiance', 'dapagliflozin', 'forxiga', 'insulin', 'lantus', 'novorapid', 'semaglutide', 'ozempic', 'rybelsus'],
    ['Glycated Hemoglobin (HbA1c) every 3-6 months.', 'Renal function (eGFR/Creatinine) re-evaluation at least annually.'],
    ['Dose optimization and home glucose log assessment in 2-4 weeks.']
  );

  // Diuretics / Antihypertensives
  checkMed(
    ['furosemide', 'lasix', 'hydrochlorothiazide', 'hctz', 'spironolactone', 'aldactone', 'indapamide', 'natrilix'],
    ['Serum Electrolytes (Sodium, Potassium, Magnesium) and Kidney Function in 1-2 weeks.'],
    ['Volume status check-up (clinical edema, daily weights, blood pressure) in 1-2 weeks.']
  );

  // Anticoagulants
  checkMed(
    ['warfarin', 'coumadin', 'marivan'],
    ['Prothrombin Time (PT) and International Normalized Ratio (INR) monitoring (Target 2.0 - 3.0) frequently.'],
    ['Anticoagulation adjustment visit in 3-5 days.']
  );

  checkMed(
    ['rivaroxaban', 'xarelto', 'apixaban', 'eliquis', 'dabigatran', 'pradaxa'],
    ['Annual comprehensive metabolic panel (CMP), Renal function (CrCl), and Complete Blood Count (CBC).'],
    ['Clinical safety check for bleeding indicators in 3 months.']
  );

  // Antiplatelets
  checkMed(
    ['aspirin', 'clopidogrel', 'plavix', 'prasugrel', 'ticagrelor', 'brilinta'],
    ['Complete Blood Count (CBC) to screen for occult GI bleeding if symptoms occur.'],
    ['Clinical follow-up for bleeding/bruising assessment in 1-3 months.']
  );

  // Thyroid
  checkMed(
    ['levothyroxine', 'euthyrox', 'synthroid', 'eltroxin'],
    ['Serum Thyroid Stimulating Hormone (TSH) level check in 6-8 weeks.'],
    ['Hormonal replacement titration response evaluation in 6-8 weeks.']
  );

  // NSAIDs
  checkMed(
    ['ibuprofen', 'brufen', 'naproxen', 'diclofenac', 'voltaren', 'cataflam', 'celecoxib', 'celebrex', 'meloxicam'],
    ['Renal function (BUN/Serum Creatinine) and Blood Pressure re-evaluation if on chronic administration.'],
    ['GI tolerance and pain management efficacy control in 2-4 weeks.']
  );

  // Corticosteroids
  checkMed(
    ['prednisone', 'prednisolone', 'methylprednisolone', 'solu-medrol', 'dexamethasone'],
    ['Fasting blood sugar or HbA1c tracking.', 'Serum electrolytes (monitoring for hypokalemia on high doses).'],
    ['Tapering evaluation and systemic corticosteroid safety review in 2 weeks.']
  );

  // Fallback to Diagnosis Check if no specific medication rule was triggered
  if (!matchedMed && diagnosisClean) {
    if (diagnosisClean.includes('hypertension') || diagnosisClean.includes('htn') || diagnosisClean.includes('blood pressure')) {
      labs.push("Blood pressure home logs check", "Basic Metabolic Panel (Electrolytes) in 2-4 weeks");
      followUp.push("Evaluate blood pressure target response in 2-4 weeks");
    } else if (diagnosisClean.includes('diabetes') || diagnosisClean.includes('dm') || diagnosisClean.includes('diabetic') || diagnosisClean.includes('sugar')) {
      labs.push("HbA1c monitoring every 3 months", "Self-monitoring blood glucose (SMBG) logs");
      followUp.push("Endocrine and diabetic control review in 2-4 weeks");
    } else if (diagnosisClean.includes('cardiac') || diagnosisClean.includes('heart failure') || diagnosisClean.includes('chf') || diagnosisClean.includes('cad')) {
      labs.push("Renal function assessment and serum electrolytes in 1-2 weeks");
      followUp.push("Congestive status and medication titration assessment in 1 week");
    } else if (diagnosisClean.includes('thyroid') || diagnosisClean.includes('hypothyroid')) {
      labs.push("Serum TSH levels in 6-8 weeks");
      followUp.push("Symptom and hormone replacement level check in 6-8 weeks");
    } else if (diagnosisClean.includes('infection') || diagnosisClean.includes('uti') || diagnosisClean.includes('tonsillitis') || diagnosisClean.includes('bronchitis') || diagnosisClean.includes('pneumonia')) {
      labs.push("Monitor for resolution of fever and systemic infection symptoms");
      followUp.push("Follow up in 3-5 days if symptoms fail to resolve");
    } else if (diagnosisClean.includes('asthma') || diagnosisClean.includes('copd')) {
      labs.push("Peak Expiratory Flow Rate (PEFR) and home SpO2 monitoring");
      followUp.push("Inhaler technique review and asthma control evaluation in 2-4 weeks");
    }
  }

  // Final fallback if absolutely nothing was triggered
  if (labs.length === 0) {
    labs.push("General safety check / Complete blood count (CBC) as clinically directed.");
  }
  if (followUp.length === 0) {
    followUp.push("Follow-up evaluation in 1-2 weeks to monitor clinical response and tolerance.");
  }

  return {
    labs: Array.from(new Set(labs)),
    followUp: Array.from(new Set(followUp))
  };
}

export const PrescriptionPreview: React.FC<{ data: PrescriptionData }> = ({ data }) => {
  const { 
    doctorName, 
    doctorQualifications, 
    doctorDesignation, 
    doctorRegNo,
    doctorNameAr,
    doctorQualificationsAr,
    doctorDesignationAr,
    practiceName,
    practiceAddress,
    practiceCity,
    practiceState,
    practiceZip,
    practicePhone,
    practiceLogo,
    practiceLogoShape,
    practiceLogoSize,
    practiceLogoPosition,
    prescriptionFooter,
    prescriptionFooterAr,
    prescriptionBackground,
    prescriptionHeaderFont,
    prescriptionFooterFont,
    prescriptionBodyFont,
    doctorSignature
  } = useSettings();

  const fontMap: Record<string, string> = {
    inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
    roboto: '"Roboto", ui-sans-serif, system-ui, sans-serif',
    system: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: '"Playfair Display", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    calligraphy: '"Lucida Calligraphy", "Apple Chancery", "URW Chancery L", cursive'
  };

  const headerStyle = { fontFamily: fontMap[prescriptionHeaderFont] || fontMap.inter };
  const bodyStyle = { fontFamily: fontMap[prescriptionBodyFont] || fontMap.inter };
  const footerStyle = { fontFamily: fontMap[prescriptionFooterFont] || fontMap.inter };

  return (
    <div 
      className="w-full max-w-4xl mx-auto bg-white p-8 border border-slate-200 shadow-lg font-sans text-slate-900 print:shadow-none print:border-none print:w-full print:max-w-none print:m-0 relative overflow-hidden print:overflow-visible print:bg-white"
      style={{
        ...(prescriptionBackground ? {
          backgroundImage: `url(${prescriptionBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}),
        ...bodyStyle
      }}
    >
      {/* Background Overlay for readability if background exists */}
      {prescriptionBackground && (
        <div className="absolute inset-0 bg-white/80 pointer-events-none print:bg-white"></div>
      )}
      
      <div className="relative z-10">
        {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6" style={headerStyle}>
        <div className={cn(
          "text-sm",
          practiceLogoPosition === 'left' && "order-2",
          (practiceLogoPosition === 'center' || !practiceLogoPosition) && "order-1",
          practiceLogoPosition === 'right' && "order-1"
        )}>
          <h1 className="text-2xl font-bold text-slate-900 uppercase">{doctorName}</h1>
          <p>{doctorQualifications}</p>
          <p>{doctorDesignation}</p>
          <p>Reg. No. {doctorRegNo}</p>
        </div>
        <div 
          className={cn(
            "flex items-center justify-center overflow-hidden shrink-0 transition-all duration-200",
            practiceLogoPosition === 'left' && "order-1",
            (practiceLogoPosition === 'center' || !practiceLogoPosition) && "order-2",
            practiceLogoPosition === 'right' && "order-3",
            practiceLogoShape === 'circle' && "rounded-full border-2 border-slate-900 bg-slate-50",
            practiceLogoShape === 'rounded' && "rounded-xl border-2 border-slate-900 bg-slate-50",
            practiceLogoShape === 'square' && "rounded-none border-2 border-slate-900 bg-slate-50",
            practiceLogoShape === 'none' && (practiceLogo ? "border-0 bg-transparent" : "rounded-md border-2 border-dashed border-slate-900 bg-slate-50")
          )}
          style={{
            width: `${practiceLogoSize || 96}px`,
            height: `${practiceLogoSize || 96}px`
          }}
        >
          {practiceLogo ? (
            <img src={practiceLogo} alt="Practice Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-slate-400 uppercase">Logo</span>
          )}
        </div>
        <div className={cn(
          "text-sm text-right",
          practiceLogoPosition === 'left' && "order-3",
          (practiceLogoPosition === 'center' || !practiceLogoPosition) && "order-3",
          practiceLogoPosition === 'right' && "order-2"
        )} dir="rtl">
          <h1 className="text-2xl font-bold text-slate-900">{doctorNameAr}</h1>
          <p>{doctorQualificationsAr}</p>
          <p>{doctorDesignationAr}</p>
          <p>رقم القيد: {doctorRegNo}</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left Column: Patient Info & Clinical Data */}
        <div className="w-1/3 border-r border-slate-300 pr-4">
          <h2 className="font-bold text-lg mb-2 border-b border-slate-900 flex justify-between">
            <span>Patient Info</span>
          </h2>
          <div className="space-y-2 text-sm">
            <p className="flex gap-2">
              <strong className="min-w-[70px]">Name:</strong> <span>{data.name}</span>
            </p>
            <p className="flex gap-2">
              <strong className="min-w-[70px]">Age:</strong> <span>{data.age}</span>
            </p>
            <p className="flex gap-2">
              <strong className="min-w-[70px]">Gender:</strong> 
              <span className="flex items-center gap-1">
                {data.gender}
                {data.gender?.toLowerCase() === 'male' && <span className="text-blue-600 font-bold">♂</span>}
                {data.gender?.toLowerCase() === 'female' && <span className="text-rose-600 font-bold">♀</span>}
              </span>
            </p>
            <p className="flex gap-2">
              <strong className="min-w-[70px]">Contact:</strong> <span>{data.contact}</span>
            </p>
          </div>

          <h2 className="font-bold text-lg mt-6 mb-2 border-b border-slate-900 flex justify-between">
            <span>Vital data</span>
          </h2>
          <div className="space-y-1 text-sm">
            <p className="flex gap-2"><strong className="min-w-[50px]">BP:</strong> <span>{data.bp}</span></p>
            <p className="flex gap-2"><strong className="min-w-[50px]">P:</strong> <span>{data.p}</span></p>
            <p className="flex gap-2"><strong className="min-w-[50px]">Temp:</strong> <span>{data.temp}</span></p>
            <p className="flex gap-2"><strong className="min-w-[50px]">RR:</strong> <span>{data.rr}</span></p>
            <p className="flex gap-2"><strong className="min-w-[50px]">SaO2:</strong> <span>{data.sao2}</span></p>
            <p className="flex gap-2"><strong className="min-w-[50px]">RBS:</strong> <span>{data.rbs}</span></p>
            <p className="flex gap-2"><strong className="min-w-[50px]">O/E:</strong> <span>{data.oe}</span></p>
          </div>

          <h2 className="font-bold text-lg mt-6 mb-2 border-b border-slate-900 flex justify-between">
            <span>DX</span>
          </h2>
          <p className="text-sm">{data.dx}</p>
        </div>

        {/* Right Column: Prescription Area */}
        <div className="w-2/3">
          <div className="text-4xl font-serif text-blue-600 mb-4">℞</div>
          <div className="min-h-[400px] space-y-6" style={bodyStyle}>
            {data.medications.map((med, index) => (
              <div key={index} className="medication-entry">
                <div className="text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2">
                  <span>℞ / {med.name}</span>
                  {med.form && <DosageFormBadge form={med.form} size="xs" />}
                  <span>{med.concentration ? `(${med.concentration})` : ''} {med.dosage} {med.frequency} for {med.duration}</span>
                </div>
                {med.instructions && (
                  <div className="text-sm text-slate-600 mt-1 italic">
                    Instructions: {med.instructions}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-slate-400 pt-4 flex flex-col gap-6">
            <div className="space-y-6">
              {/* Required Lab Monitoring Area */}
              <div>
                <h3 className="font-bold text-xs text-slate-500 uppercase tracking-widest text-left mb-2">Required Lab Monitoring</h3>
                <div className="space-y-1">
                  {(data.requiredLabMonitoring || getClinicalSafetyData(data.medications, data.dx).labs).map((lab, index) => (
                    <div key={`lab-line-${index}`} className="border-b border-dashed border-slate-350 py-1.5 flex items-end min-h-[32px]">
                      <span className="text-slate-800 text-xs italic font-medium leading-normal pl-1">
                        • {lab}
                      </span>
                    </div>
                  ))}
                  {/* Empty lined spaces for customized handmade annotations */}
                  {Array.from({ length: Math.max(0, 3 - ((data.requiredLabMonitoring || getClinicalSafetyData(data.medications, data.dx).labs).length)) }).map((_, index) => (
                    <div key={`lab-empty-${index}`} className="border-b border-dashed border-slate-300 py-1.5 flex items-end min-h-[32px]">
                      <span className="text-[10px] text-slate-300 pl-1 select-none italic">
                        {index === 0 ? "✍️ Dr. Additions / Lab Notes..." : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up Schedule Area */}
              <div>
                <h3 className="font-bold text-xs text-slate-500 uppercase tracking-widest text-left mb-2">Follow-up Schedule</h3>
                <div className="space-y-1">
                  {(data.followUpSchedule || getClinicalSafetyData(data.medications, data.dx).followUp).map((sched, index) => (
                    <div key={`sched-line-${index}`} className="border-b border-dashed border-slate-350 py-1.5 flex items-end min-h-[32px]">
                      <span className="text-slate-800 text-xs italic font-medium leading-normal pl-1">
                        • {sched}
                      </span>
                    </div>
                  ))}
                  {/* Empty lined spaces for customized handmade annotations */}
                  {Array.from({ length: Math.max(0, 3 - ((data.followUpSchedule || getClinicalSafetyData(data.medications, data.dx).followUp).length)) }).map((_, index) => (
                    <div key={`sched-empty-${index}`} className="border-b border-dashed border-slate-300 py-1.5 flex items-end min-h-[32px]">
                      <span className="text-[10px] text-slate-300 pl-1 select-none italic">
                        {index === 0 ? "✍️ Dr. Additions / Follow-up Details..." : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {doctorSignature ? (
              <div className="mt-2 flex flex-col items-end align-end self-end">
                <img src={doctorSignature} alt="Required Lab Monitoring" className="h-12 object-contain mb-1" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Authorized Signature</span>
              </div>
            ) : (
              <div className="mt-6 border-b border-slate-350 w-48 self-end min-h-[1px]"></div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t-2 border-slate-900 flex justify-between items-center text-xs" style={footerStyle}>
        <div className="flex-1">
          <p>{practicePhone} | {practiceAddress}, {practiceCity} {practiceState}, {practiceZip}</p>
          <p>{prescriptionFooter}</p>
        </div>
        <div className="mx-4 flex flex-col items-center gap-1">
          <div className="p-1 bg-white border border-slate-900">
            <QRCode 
              value={`Patient: ${data.name} | ID: ${data.id || 'N/A'} | Date: ${new Date().toLocaleDateString()}`}
              size={64}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          </div>
          <span className="text-[8px] font-bold text-slate-500 uppercase">Prescription ID: {data.id?.slice(0, 8) || 'PREVIEW'}</span>
        </div>
        <div className="flex-1 text-right" dir="rtl">
          <p>{prescriptionFooterAr}</p>
        </div>
      </div>
      </div>
    </div>
  );
};
