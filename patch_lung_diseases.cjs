const fs = require('fs');
const path = 'src/data/diagnosisMappings.ts';
let content = fs.readFileSync(path, 'utf8');

const updates = [
  { id: 'asthma_exacerbation', symps: ["lungs_dyspnea", "lungs_noisy_breathing", "lungs_cough", "lungs_chest_tightness_congestion"] },
  { id: 'copd', symps: ["lungs_dyspnea", "lungs_cough", "lungs_sputum", "lungs_infections_recurrent"] },
  { id: 'pneumonia', symps: ["lungs_dyspnea", "lungs_cough", "lungs_sputum", "lungs_pleuritic_pain"] },
  { id: 'pneumonia_bacterial', symps: ["lungs_dyspnea", "lungs_cough", "lungs_sputum", "lungs_pleuritic_pain", "gen_fever"] },
  { id: 'bronchitis', symps: ["lungs_cough", "lungs_sputum", "lungs_chest_tightness_congestion"] },
  { id: 'pulmonary_embolism', symps: ["lungs_dyspnea", "lungs_pleuritic_pain", "lungs_tachypnea_air_hunger"] },
  { id: 'tuberculosis', symps: ["lungs_cough", "lungs_sputum", "gen_night_sweats", "gen_weight_loss"] },
  { id: 'pulmonary_edema', symps: ["lungs_dyspnea", "lungs_positional_breathing", "lungs_sputum", "lungs_noisy_breathing"] },
  { id: 'pulmonary_fibrosis', symps: ["lungs_dyspnea", "lungs_cough", "gen_fatigue"] },
  { id: 'pulmonary_hypertension', symps: ["lungs_dyspnea", "gen_fatigue", "lungs_chest_tightness_congestion"] }
];

let updatedCount = 0;
updates.forEach(update => {
  const regex = new RegExp(`(id:\\s*"${update.id}"[\\s\\S]*?commonSymptoms:\\s*\\[)([^\\]]*)(\\])`);
  if (regex.test(content)) {
    content = content.replace(regex, (match, p1, p2, p3) => {
      let existing = p2.split(',').map(s => s.trim().replace(/"/g, '')).filter(Boolean);
      let newSymps = update.symps.filter(s => !existing.includes(s));
      let combined = [...existing, ...newSymps].map(s => `"${s}"`).join(", ");
      return `${p1}${combined}${p3}`;
    });
    updatedCount++;
  }
});

fs.writeFileSync(path, content, 'utf8');
console.log(`Updated mappings for ${updatedCount} lung diseases.`);
