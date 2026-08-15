import fs from 'fs';

let content = fs.readFileSync('src/pages/Prescriptions.tsx', 'utf8');

const regex = /const getMedicationDisplay = \([\s\S]*?};\n/m;
const replacement = `  const getMedicationDisplay = (genericName: any) => {
    if (!genericName) return "";
    
    let medObj = typeof genericName === 'object' ? genericName : null;
    let nameStr = "";
    
    if (medObj) {
      if (nameType === 'trade' && medObj.tradeName) return medObj.tradeName;
      if (nameType === 'generic' && medObj.genericName) return medObj.genericName;
      
      const extracted = medObj.name || medObj.generic_name || medObj.medication;
      nameStr = typeof extracted === 'string' ? extracted : "Unknown Medication";
    } else {
      nameStr = genericName;
    }

    if (nameType === 'generic') return nameStr;

    // Lookup in medicationsDatabase
    for (const group of Object.values(medicationsDatabase)) {
      const found = group.find(m => m.name === nameStr || m.genericName === nameStr);
      if (found && found.tradeName) {
        return found.tradeName;
      }
    }

    // Fallback dictionary for items not in medicationsDatabase (e.g., from DB seed)
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

    const trade = tradeNames[nameStr];
    return trade ? \`\${trade} (\${nameStr})\` : nameStr;
  };
`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/Prescriptions.tsx', content);

// Do the same for EncounterNote.tsx
let content2 = fs.readFileSync('src/pages/EncounterNote.tsx', 'utf8');
content2 = content2.replace(regex, replacement);
fs.writeFileSync('src/pages/EncounterNote.tsx', content2);
