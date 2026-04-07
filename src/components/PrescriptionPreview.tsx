import React from 'react';

interface PrescriptionData {
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
  medications: string[];
}

export const PrescriptionPreview: React.FC<{ data: PrescriptionData }> = ({ data }) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 border border-slate-200 shadow-lg font-sans text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
        <div className="text-sm">
          <h1 className="text-2xl font-bold text-slate-900">DR. AHMED FATHY ALI</h1>
          <p>MBBS, CCD, CCC, CMJ</p>
          <p>Cardiologist, City Institute of Cardiology</p>
          <p>Reg. No. 123456</p>
        </div>
        <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center border-2 border-slate-900">
          <span className="text-xs font-bold">LOGO</span>
        </div>
        <div className="text-sm text-right">
          <h1 className="text-2xl font-bold text-slate-900">DR. AHMED FATHY ALI</h1>
          <p>MBBS, CCD, CCC, CMJ</p>
          <p>Cardiologist, City Institute of Cardiology</p>
          <p>Reg. No. 123456</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left Column: Patient Info & Clinical Data */}
        <div className="w-1/3 border-r border-slate-300 pr-4">
          <h2 className="font-bold text-lg mb-2 border-b border-slate-900">Patient Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {data.name}</p>
            <p><strong>Age:</strong> {data.age}</p>
            <p><strong>Gender:</strong> {data.gender}</p>
            <p><strong>Contact:</strong> {data.contact}</p>
            <p><strong>PH:</strong> {data.ph}</p>
            <p><strong>C/O:</strong> {data.co}</p>
          </div>

          <h2 className="font-bold text-lg mt-6 mb-2 border-b border-slate-900">Vital data</h2>
          <div className="space-y-1 text-sm">
            <p><strong>BP:</strong> {data.bp}</p>
            <p><strong>P:</strong> {data.p}</p>
            <p><strong>Temp:</strong> {data.temp}</p>
            <p><strong>RR:</strong> {data.rr}</p>
            <p><strong>SaO2:</strong> {data.sao2}</p>
            <p><strong>RBS:</strong> {data.rbs}</p>
            <p><strong>O/E:</strong> {data.oe}</p>
          </div>

          <h2 className="font-bold text-lg mt-6 mb-2 border-b border-slate-900">DX</h2>
          <p className="text-sm">{data.dx}</p>
        </div>

        {/* Right Column: Prescription Area */}
        <div className="w-2/3">
          <div className="text-4xl font-serif text-blue-600 mb-4">℞</div>
          <div className="min-h-[400px] space-y-2">
            {data.medications.map((med, index) => (
              <p key={index} className="text-lg">{index + 1}. {med}</p>
            ))}
          </div>
          <div className="mt-12 border-t border-slate-400 pt-2 text-right">
            <p className="font-bold">Signature</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t-2 border-slate-900 flex justify-between items-center text-xs">
        <p>123-456-7890, 444-666-8899 | Street address here, City State, Zip Code</p>
        <div className="w-12 h-12 bg-slate-200 border border-slate-900"></div>
        <p>Days: Mon, Tue, Wed, Thu, Fri | Timings: 05:00 PM - 08:30 PM</p>
      </div>
    </div>
  );
};
