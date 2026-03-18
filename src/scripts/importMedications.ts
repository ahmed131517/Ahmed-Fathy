import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function importCSV(filePath: string, tableName: string) {
  const csvData = fs.readFileSync(path.resolve(filePath), 'utf8');
  const BATCH_SIZE = 500;
  
  return new Promise<void>((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      complete: async (results) => {
        const data = results.data as any[];
        console.log(`Importing ${data.length} rows into ${tableName} in batches of ${BATCH_SIZE}...`);
        
        for (let i = 0; i < data.length; i += BATCH_SIZE) {
          const batch = data.slice(i, i + BATCH_SIZE);
          console.log(`Importing batch ${i / BATCH_SIZE + 1} / ${Math.ceil(data.length / BATCH_SIZE)}...`);
          
          const { error } = await supabase.from(tableName).insert(batch);
          if (error) {
            console.error(`Error importing batch into ${tableName}:`, error);
            reject(error);
            return;
          }
        }
        
        console.log(`Successfully imported all rows into ${tableName}`);
        resolve();
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

async function runImport() {
  const csvDir = path.resolve('./data/csv');
  
  await importCSV(path.join(csvDir, 'drugs.csv'), 'drugs');
  await importCSV(path.join(csvDir, 'drug_brands.csv'), 'drug_brands');
  // Add more imports as needed...
}

runImport().catch(console.error);
