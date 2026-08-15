import React from 'react';
import { useSettings } from '../lib/SettingsContext';
import QRCode from "react-qr-code";
import { cn } from '../lib/utils';
import { DosageFormBadge } from './prescriptions/DosageFormBadge';

interface Medication {
  name: string;
  form?: string;
  route?: string;
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
    practiceNameAr,
    practiceAddressAr,
    practiceMotto,
    practiceMottoAr,
    headerLayoutPreset,
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
    doctorSignature,
    facilityStamp,
    facilityLicenseNo,
    healthAuthorityId,
    taxRegistrationId,
    enableVerificationQRCode,
    verificationPortalUrl,
    paperSize = 'a4',
    topMargin = 15,
    bottomMargin = 15,
    watermarkOpacity = 30
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

  const formatFrequency = (freq?: string) => {
    if (!freq) return '';
    const match = freq.match(/^(OD|BID|TID|QID|QD|PRN)\s*\(([^)]+)\)/i);
    let res = '';
    if (match && match[2]) {
      res = match[2];
    } else {
      res = freq.replace(/^(OD|BID|TID|QID|QD|PRN)\b\s*/i, '');
    }
    if (res.startsWith('Every')) {
      res = 'every' + res.slice(5);
    }
    return res;
  };

  const getQRValue = () => {
    const dateStr = new Date().toLocaleDateString();
    const rxId = data.id || 'N/A';
    
    const lines: string[] = [
      `PRESCRIPTION SUMMARY`,
      `====================`,
      `ID: ${rxId}`,
      `Date: ${dateStr}`,
      `Clinic/Practice: ${practiceName || 'N/A'}`,
      `Doctor: ${doctorName || 'N/A'} (${doctorQualifications || 'N/A'})`,
      `Reg No: ${doctorRegNo || 'N/A'}`,
      `--------------------`,
      `Patient Name: ${data.name || 'N/A'}`,
      `Age: ${data.age || 'N/A'} | Gender: ${data.gender || 'N/A'}`,
    ];
    
    if (data.contact) {
      lines.push(`Contact: ${data.contact}`);
    }

    const vitals: string[] = [];
    if (data.bp) vitals.push(`BP: ${data.bp}`);
    if (data.p) vitals.push(`HR: ${data.p} bpm`);
    if (data.temp) vitals.push(`Temp: ${data.temp}°C`);
    if (data.rr) vitals.push(`RR: ${data.rr}/min`);
    if (data.sao2) vitals.push(`SaO2: ${data.sao2}%`);
    if (data.rbs) vitals.push(`RBS: ${data.rbs} mg/dL`);
    
    if (vitals.length > 0) {
      lines.push(`Vitals: ${vitals.join(' | ')}`);
    }
    
    if (data.oe) {
      lines.push(`O/E Examination: ${data.oe}`);
    }
    
    if (data.dx) {
      lines.push(`Diagnosis: ${data.dx}`);
    }
    
    if (data.medications && data.medications.length > 0) {
      lines.push(`--------------------`);
      lines.push(`Rx Medications:`);
      data.medications.forEach((med, idx) => {
        let medStr = `${idx + 1}. ℞ / ${med.name}`;
        if (med.concentration) {
          medStr += ` (${med.concentration})`;
        }
        lines.push(medStr);
        
        const details: string[] = [];
        if (med.dosage) details.push(med.dosage);
        if (med.frequency) details.push(formatFrequency(med.frequency));
        if (med.duration) details.push(`for ${med.duration}`);
        if (details.length > 0) {
          lines.push(`   Take: ${details.join(' ')}`);
        }
        if (med.instructions) {
          lines.push(`   Clinical Instructions: ${med.instructions}`);
        }
      });
    }
    
    const safety = getClinicalSafetyData(data.medications, data.dx);
    const labs = data.requiredLabMonitoring || safety.labs;
    const followUp = data.followUpSchedule || safety.followUp;
    
    if (labs && labs.length > 0) {
      lines.push(`--------------------`);
      lines.push(`Required Lab Monitoring:`);
      labs.forEach(lab => lines.push(`• ${lab}`));
    }
    
    if (followUp && followUp.length > 0) {
      lines.push(`--------------------`);
      lines.push(`Follow-up Schedule:`);
      followUp.forEach(sched => lines.push(`• ${sched}`));
    }
    
    return lines.join('\n');
  };

  const paperSizeClasses = {
    a4: 'max-w-4xl',
    a5: 'max-w-xl',
    letter: 'max-w-4xl',
    thermal80mm: 'max-w-[320px] text-xs'
  }[paperSize] || 'max-w-4xl';

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: ${paperSize === 'thermal80mm' ? '80mm auto' : paperSize === 'a5' ? 'A5' : paperSize === 'letter' ? 'letter' : 'A4'};
            margin: ${topMargin}mm 10mm ${bottomMargin}mm 10mm;
          }
        }
      `}</style>
      <div 
        className={cn(
          "w-full mx-auto bg-white border border-slate-200 shadow-lg font-sans text-slate-900 print:shadow-none print:border-none print:w-full print:max-w-none print:m-0 relative overflow-hidden print:overflow-visible print:bg-white transition-all",
          paperSizeClasses
        )}
        style={{
          paddingTop: `${topMargin}mm`,
          paddingBottom: `${bottomMargin}mm`,
          paddingLeft: paperSize === 'thermal80mm' ? '8px' : '32px',
          paddingRight: paperSize === 'thermal80mm' ? '8px' : '32px',
          ...bodyStyle
        }}
      >
        {/* Background Watermark Image with Opacity */}
        {prescriptionBackground && (
          <div 
            className="absolute inset-0 pointer-events-none bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${prescriptionBackground})`,
              opacity: watermarkOpacity / 100
            }}
          />
        )}
      
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6" style={headerStyle}>
          {(() => {
            const enBlock = (
              <div className="text-sm space-y-0.5">
                {practiceName && <p className="font-bold text-indigo-900 text-xs tracking-wider uppercase">{practiceName}</p>}
                <h1 className="text-xl font-extrabold text-slate-900 uppercase leading-snug">{doctorName}</h1>
                <p className="text-slate-800 font-medium text-xs">{doctorQualifications}</p>
                <p className="text-slate-600 text-xs">{doctorDesignation}</p>
                <p className="text-slate-600 text-xs">Reg. No. {doctorRegNo}</p>
                {practiceAddress && (
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    {practiceAddress}{practiceCity ? `, ${practiceCity}` : ''}{practicePhone ? ` • ${practicePhone}` : ''}
                  </p>
                )}
                {practiceMotto && <p className="text-[11px] italic text-indigo-700 font-medium mt-0.5">{practiceMotto}</p>}
                {(facilityLicenseNo || healthAuthorityId || taxRegistrationId) && (
                  <p className="text-[10px] text-slate-500 font-mono tracking-tight mt-1">
                    {[
                      facilityLicenseNo && `Lic: ${facilityLicenseNo}`,
                      healthAuthorityId && `NHA: ${healthAuthorityId}`,
                      taxRegistrationId && `TAX: ${taxRegistrationId}`
                    ].filter(Boolean).join(" | ")}
                  </p>
                )}
              </div>
            );

            const arBlock = (
              <div className="text-sm text-right space-y-0.5" dir="rtl">
                {practiceNameAr && <p className="font-bold text-indigo-900 text-xs tracking-wider">{practiceNameAr}</p>}
                <h1 className="text-xl font-extrabold text-slate-900 leading-snug">{doctorNameAr}</h1>
                <p className="text-slate-800 font-medium text-xs">{doctorQualificationsAr}</p>
                <p className="text-slate-600 text-xs">{doctorDesignationAr}</p>
                <p className="text-slate-600 text-xs">رقم القيد: {doctorRegNo}</p>
                {practiceAddressAr && <p className="text-[11px] text-slate-500 mt-1 leading-tight">{practiceAddressAr}</p>}
                {practiceMottoAr && <p className="text-[11px] italic text-indigo-700 font-medium mt-0.5">{practiceMottoAr}</p>}
              </div>
            );

            const logoBlock = (
              <div 
                className={cn(
                  "flex items-center justify-center overflow-hidden shrink-0 transition-all duration-200 mx-auto sm:mx-0",
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
            );

            if (headerLayoutPreset === 'ar-left-en-right') {
              return (
                <div className="flex justify-between items-start gap-4">
                  <div className="w-5/12">{arBlock}</div>
                  <div className="w-2/12 flex justify-center">{logoBlock}</div>
                  <div className="w-5/12 text-right">{enBlock}</div>
                </div>
              );
            }

            if (headerLayoutPreset === 'stacked-en-top') {
              return (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <div className="flex-1">{enBlock}</div>
                    {logoBlock}
                  </div>
                  <div>{arBlock}</div>
                </div>
              );
            }

            if (headerLayoutPreset === 'stacked-ar-top') {
              return (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    {logoBlock}
                    <div className="flex-1">{arBlock}</div>
                  </div>
                  <div>{enBlock}</div>
                </div>
              );
            }

            if (headerLayoutPreset === 'center-logo-split') {
              return (
                <div className="space-y-3">
                  <div className="flex justify-center">{logoBlock}</div>
                  <div className="grid grid-cols-2 gap-6 items-start pt-2 border-t border-slate-200">
                    <div className="border-r border-slate-200 pr-4">{enBlock}</div>
                    <div className="pl-2">{arBlock}</div>
                  </div>
                </div>
              );
            }

            // Default: 'en-left-ar-right'
            return (
              <div className="flex justify-between items-start gap-4">
                <div className="w-5/12">{enBlock}</div>
                <div className="w-2/12 flex justify-center">{logoBlock}</div>
                <div className="w-5/12">{arBlock}</div>
              </div>
            );
          })()}
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
            {data.medications.map((med, index) => {
              return (
                <div key={index} className="medication-entry mb-4 space-y-1">
                  <div className="text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2">
                    <span>℞ / {med.name}</span>
                    {med.concentration && <span>{med.concentration.startsWith('(') ? med.concentration : `(${med.concentration})`}</span>}
                  </div>
                  <div className="text-base font-semibold text-slate-800">
                    {med.dosage} {formatFrequency(med.frequency)} {med.duration ? `for ${med.duration}` : ''}
                  </div>
                  {med.instructions && (
                    <div className="text-sm text-slate-600 italic">
                      Instructions: {med.instructions}
                    </div>
                  )}
                </div>
              );
            })}
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
            
            <div className="mt-4 flex items-end justify-end gap-6 self-end">
              {facilityStamp && (
                <div className="flex flex-col items-center">
                  <div className="p-1 border border-dashed border-indigo-400/60 rounded-lg bg-indigo-50/20">
                    <img src={facilityStamp} alt="Official Facility Stamp" className="h-14 w-14 object-contain" />
                  </div>
                  <span className="text-[9px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mt-0.5">Facility Seal</span>
                </div>
              )}

              {doctorSignature ? (
                <div className="flex flex-col items-end">
                  <img src={doctorSignature} alt="Authorized Signature" className="h-12 object-contain mb-1" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Authorized Signature</span>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <div className="border-b border-slate-400 w-48 h-8 mb-1"></div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Authorized Signature</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t-2 border-slate-900 flex justify-between items-center text-xs" style={footerStyle}>
        <div className="flex-1">
          <p>{practicePhone} | {practiceAddress}, {practiceCity} {practiceState}, {practiceZip}</p>
          <p>{prescriptionFooter}</p>
        </div>
        
        {enableVerificationQRCode && (
          <div className="mx-4 flex flex-col items-center gap-1">
            <div className="p-1 bg-white border border-slate-900 shadow-sm">
              <QRCode 
                value={verificationPortalUrl ? `${verificationPortalUrl}?rxId=${data.id || 'PREVIEW'}` : getQRValue()}
                size={60}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
            </div>
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">e-Rx Verified Portal</span>
          </div>
        )}

        <div className="flex-1 text-right" dir="rtl">
          <p>{prescriptionFooterAr}</p>
        </div>
      </div>
      </div>
    </div>
    </>
  );
};
