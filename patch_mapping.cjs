const fs = require('fs');
let code = fs.readFileSync('src/pages/Prescriptions.tsx', 'utf8');

const oldMapping = `        // Map DB details to the format expected by the UI
        const mappedMed = {
          id: details.id,
          name: details.generic_name,
          contraindications: details.contraindications,
          sideEffects: details.sideEffects,
          interactions: details.interactions,
          forms: details.brands.map(b => ({ id: \`brand_\${b.id}\`, name: b.brand_name }))
        };`;

const newMapping = `        // Map DB details to the format expected by the UI
        const mappedMed = {
          id: details.id,
          name: details.generic_name,
          contraindications: details.contraindications,
          sideEffects: details.sideEffects,
          interactions: details.interactions,
          mechanism_of_action: details.mechanism_of_action,
          adult_dose: details.adult_dose,
          pediatric_dose: details.pediatric_dose,
          pregnancy_category: details.pregnancy_category,
          patient_counseling: details.patient_counseling,
          forms: details.brands.map(b => ({ id: \`brand_\${b.id}\`, name: b.brand_name }))
        };`;

if (code.includes(oldMapping)) {
  code = code.replace(oldMapping, newMapping);
  fs.writeFileSync('src/pages/Prescriptions.tsx', code);
  console.log("Mapping replaced successfully.");
} else {
  console.log("Old mapping not found!");
}
