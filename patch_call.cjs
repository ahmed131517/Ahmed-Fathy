const fs = require('fs');
let code = fs.readFileSync('src/pages/Prescriptions.tsx', 'utf8');

const oldCall = `        await medicationService.discoverAndAddDrug({
          generic_name: data.generic_name,
          drug_class: data.drug_class,
          atc_code: data.atc_code,
          brands: data.brands,
          side_effects: data.side_effects
        });`;

const newCall = `        await medicationService.discoverAndAddDrug({
          generic_name: data.generic_name,
          drug_class: data.drug_class,
          atc_code: data.atc_code,
          brands: data.brands,
          mechanism_of_action: data.mechanism_of_action,
          adult_dose: data.adult_dose,
          pediatric_dose: data.pediatric_dose,
          renal_dose: data.renal_dose,
          hepatic_dose: data.hepatic_dose,
          pregnancy_category: data.pregnancy_category,
          lactation: data.lactation,
          food_interactions: data.food_interactions,
          monitoring_parameters: data.monitoring_parameters,
          lab_tests: data.lab_tests,
          storage: data.storage,
          patient_counseling: data.patient_counseling,
          references: data.references,
          side_effects: data.side_effects,
          contraindications: data.contraindications
        });`;

if (code.includes(oldCall)) {
  code = code.replace(oldCall, newCall);
  fs.writeFileSync('src/pages/Prescriptions.tsx', code);
  console.log("Call replaced successfully.");
} else {
  console.log("Old call not found!");
}
