import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Patient } from '@/data/patients';

interface PatientTrendsProps {
  patient: Patient;
}

export const PatientTrends: React.FC<PatientTrendsProps> = ({ patient }) => {
  if (!patient.vitalsHistory || patient.vitalsHistory.length === 0) {
    return <div className="p-4 text-slate-500">No vitals history available.</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={patient.vitalsHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{fontSize: 10}} />
          <YAxis yAxisId="left" tick={{fontSize: 10}} />
          <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="heartRate" stroke="#8884d8" name="Heart Rate" />
          <Line yAxisId="right" type="monotone" dataKey="weight" stroke="#82ca9d" name="Weight" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
