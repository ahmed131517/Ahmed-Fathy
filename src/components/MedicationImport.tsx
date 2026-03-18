import React, { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function MedicationImport() {
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, tableName: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        console.log(`Importing ${data.length} rows into ${tableName}...`);

        const BATCH_SIZE = 500;
        for (let i = 0; i < data.length; i += BATCH_SIZE) {
          const batch = data.slice(i, i + BATCH_SIZE);
          const { error } = await supabase.from(tableName).insert(batch);
          if (error) {
            console.error(`Error importing into ${tableName}:`, error);
            toast.error(`Error importing into ${tableName}: ${error.message}`);
            setIsImporting(false);
            return;
          }
        }
        toast.success(`Successfully imported ${data.length} rows into ${tableName}`);
        setIsImporting(false);
      },
      error: (error) => {
        console.error('CSV Parsing error:', error);
        toast.error('CSV Parsing error');
        setIsImporting(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Medication Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-500">Select CSV files to import into your database.</p>
        <div className="grid grid-cols-1 gap-4">
          {[
            { name: 'Drugs', table: 'drugs' },
            { name: 'Brands', table: 'drug_brands' },
            { name: 'Dosage Forms', table: 'dosage_forms' },
            { name: 'Strengths', table: 'drug_strengths' },
            { name: 'Dosage Guidelines', table: 'drug_dosage_guidelines' },
            { name: 'Interactions', table: 'drug_interactions' },
            { name: 'Contraindications', table: 'drug_contraindications' },
            { name: 'Side Effects', table: 'drug_side_effects' },
            { name: 'Indications', table: 'drug_indications' },
          ].map((item) => (
            <div key={item.table} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm font-medium">{item.name}</span>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, item.table)}
                disabled={isImporting}
                className="text-sm"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
