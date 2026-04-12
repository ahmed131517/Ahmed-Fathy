import React from 'react';
import { useSettings } from '../lib/SettingsContext';
import QRCode from "react-qr-code";

interface Medication {
  name: string;
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
        <div className="text-sm">
          <h1 className="text-2xl font-bold text-slate-900 uppercase">{doctorName}</h1>
          <p>{doctorQualifications}</p>
          <p>{doctorDesignation}</p>
          <p>Reg. No. {doctorRegNo}</p>
        </div>
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-2 border-slate-900 overflow-hidden">
          {practiceLogo ? (
            <img src={practiceLogo} alt="Practice Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-slate-400 uppercase">Logo</span>
          )}
        </div>
        <div className="text-sm text-right" dir="rtl">
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
            <span dir="rtl">بيانات المريض</span>
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
            <span dir="rtl">العلامات الحيوية</span>
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
            <span dir="rtl">التشخيص</span>
          </h2>
          <p className="text-sm">{data.dx}</p>
        </div>

        {/* Right Column: Prescription Area */}
        <div className="w-2/3">
          <div className="text-4xl font-serif text-blue-600 mb-4">℞</div>
          <div className="min-h-[400px] space-y-6" style={bodyStyle}>
            {data.medications.map((med, index) => (
              <div key={index} className="medication-entry">
                <div className="text-lg font-bold text-slate-900">
                  ℞ / {med.name} {med.concentration ? `(${med.concentration})` : ''} {med.dosage} {med.frequency} for {med.duration}
                </div>
                {med.instructions && (
                  <div className="text-sm text-slate-600 mt-1 italic">
                    Instructions: {med.instructions}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-slate-400 pt-2 text-right flex flex-col items-end">
            {doctorSignature ? (
              <img src={doctorSignature} alt="Signature" className="h-12 object-contain mb-1" />
            ) : (
              <p className="font-bold">Signature</p>
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
