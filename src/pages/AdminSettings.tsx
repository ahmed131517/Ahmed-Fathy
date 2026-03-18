import React from 'react';
import { MedicationImport } from '@/components/MedicationImport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminSettings() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Database Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Use this section to manage the medication database. Ensure your CSV files follow the required structure.
          </p>
          <MedicationImport />
        </CardContent>
      </Card>
    </div>
  );
}
