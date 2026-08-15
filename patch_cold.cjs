const fs = require('fs');
const path = 'src/data/diagnosisMappings.ts';
let content = fs.readFileSync(path, 'utf8');

const newDiseases = `,
  {
    id: "common_cold",
    name: "Common Cold",
    system: 'EENT',
    severity: 'Mild',
    category: "Infectious",
    redFlags: [],
    description: "A common viral infection of the nose and throat.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fever", "gen_fatigue", "rhinorrhea", "nasal_congestion", "nasal_sneezing", "sore_throat", "lungs_cough"],
    likelihoodRatios: [
      { symptomId: "rhinorrhea", lrPositive: 3.0, lrNegative: 0.2 },
      { symptomId: "nasal_congestion", lrPositive: 2.5, lrNegative: 0.3 },
      { symptomId: "sore_throat", lrPositive: 2.0, lrNegative: 0.5 },
      { symptomId: "gen_fever", lrPositive: 1.2, lrNegative: 0.8 }
    ],
    redFlagsStructured: [],
    icd10: "J00",
    prevalenceScore: 10,
    triagePriority: 5
  }
`;

// Insert common_cold before the last ];
content = content.replace(/\]\s*;\s*$/, `${newDiseases}\n];`);

// Update influenza
content = content.replace(
  /id:\s*"influenza"[\s\S]*?commonSymptoms:\s*\[([^\]]*)\]/,
  (match, p1) => {
    return match.replace(p1, '"gen_fever", "gen_fatigue", "sore_throat", "lungs_cough", "msk_muscle_pain", "headache", "rhinorrhea", "nasal_congestion"');
  }
);

// Update allergic rhinitis
content = content.replace(
  /id:\s*"allergic_rhinitis"[\s\S]*?commonSymptoms:\s*\[([^\]]*)\]/,
  (match, p1) => {
    return match.replace(p1, '"rhinorrhea", "nasal_congestion", "nasal_sneezing", "eye_redness", "lungs_cough"');
  }
);

// Add likelihood ratios to allergic_rhinitis if missing
content = content.replace(
  /(id:\s*"allergic_rhinitis"[\s\S]*?)(redFlagsStructured:)/,
  (match, p1, p2) => {
    if (!p1.includes('likelihoodRatios')) {
      return p1 + `likelihoodRatios: [\n      { symptomId: "nasal_sneezing", lrPositive: 4.0, lrNegative: 0.2 },\n      { symptomId: "eye_redness", lrPositive: 5.0, lrNegative: 0.6 },\n      { symptomId: "rhinorrhea", lrPositive: 2.5, lrNegative: 0.3 },\n      { symptomId: "gen_fever", lrPositive: 0.1, lrNegative: 1.5 }\n    ],\n    ` + p2;
    }
    return match;
  }
);

// Add likelihood ratios to influenza if missing
content = content.replace(
  /(id:\s*"influenza"[\s\S]*?)(redFlagsStructured:)/,
  (match, p1, p2) => {
    if (!p1.includes('likelihoodRatios')) {
      return p1 + `likelihoodRatios: [\n      { symptomId: "gen_fever", lrPositive: 3.5, lrNegative: 0.1 },\n      { symptomId: "msk_muscle_pain", lrPositive: 4.0, lrNegative: 0.4 },\n      { symptomId: "gen_fatigue", lrPositive: 3.0, lrNegative: 0.2 }\n    ],\n    ` + p2;
    }
    return match;
  }
);

fs.writeFileSync(path, content, 'utf8');
console.log("Patched cold/flu/allergy");
