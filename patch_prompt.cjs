const fs = require('fs');
let code = fs.readFileSync('src/pages/Prescriptions.tsx', 'utf8');

const oldPrompt = "      const prompt = `You are a medical AI. The user is searching for a medication named \"${searchQuery}\".\nProvide details about this medication in JSON format.\nIf it is a valid medication, return:\n{\n  \"isValid\": true,\n  \"generic_name\": \"Generic Name\",\n  \"drug_class\": \"Drug Class (e.g., Antibiotic, Analgesic)\",\n  \"atc_code\": \"ATC Code (if known, else Unknown)\",\n  \"brands\": [\"Brand 1\", \"Brand 2\"],\n  \"side_effects\": [\"Side effect 1\", \"Side effect 2\"]\n}\nIf it is not a valid medication, return:\n{\n  \"isValid\": false\n}`;";

const newPrompt = `      const prompt = \`You are a medical AI. The user is searching for a medication named "\${searchQuery}".
Provide comprehensive details about this medication in JSON format. Use sources like OpenFDA, DailyMed, RxNorm, and an Egyptian drug database for local trade names if applicable.
If it is a valid medication, return:
{
  "isValid": true,
  "generic_name": "Generic Name",
  "drug_class": "Drug Class",
  "atc_code": "ATC Code",
  "brands": ["Brand 1", "Brand 2"],
  "mechanism_of_action": "Mechanism of Action",
  "adult_dose": "Adult Dose",
  "pediatric_dose": "Pediatric Dose",
  "renal_dose": "Renal Dose",
  "hepatic_dose": "Hepatic Dose",
  "pregnancy_category": "Pregnancy Category",
  "lactation": "Lactation information",
  "food_interactions": ["Interaction 1"],
  "monitoring_parameters": ["Parameter 1"],
  "lab_tests": ["Lab test 1"],
  "storage": "Storage info",
  "patient_counseling": ["Counseling point 1"],
  "references": ["Ref 1", "Ref 2"],
  "side_effects": ["Side effect 1"],
  "contraindications": ["Contraindication 1"]
}
If it is not a valid medication, return:
{
  "isValid": false
}\`;`;

if (code.includes(oldPrompt)) {
  code = code.replace(oldPrompt, newPrompt);
  fs.writeFileSync('src/pages/Prescriptions.tsx', code);
  console.log("Prompt replaced successfully.");
} else {
  console.log("Old prompt not found!");
}
