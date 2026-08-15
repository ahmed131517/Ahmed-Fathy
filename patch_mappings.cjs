const fs = require('fs');

const path = 'src/data/diagnosisMappings.ts';
let content = fs.readFileSync(path, 'utf8');

const updates = [
  { id: 'generalized_anxiety', symps: ["psych_anxiety_general", "psych_sleep_disturbance"] },
  { id: 'panic_attack', symps: ["psych_panic_attacks", "psych_anxiety_general"] },
  { id: 'major_depression', symps: ["psych_depression", "psych_sleep_disturbance", "psych_risk_assessment", "psych_somatic_symptoms"] },
  { id: 'bipolar_disorder', symps: ["psych_mania_elevated", "psych_mood_instability", "psych_depression"] },
  { id: 'schizophrenia', symps: ["psych_psychotic_symptoms", "psych_cognitive_psych", "psych_behavioral_changes"] },
  { id: 'eating_disorder_anorexia', symps: ["psych_behavioral_changes", "psych_somatic_symptoms"] },
  
  { id: 'anemia', symps: ["hema_anemia_symptoms"] },
  { id: 'sickle_cell_anemia', symps: ["hema_anemia_symptoms", "hema_bruising_easy"] },
  { id: 'anemia_iron_def', symps: ["hema_anemia_symptoms"] },
  { id: 'anemia_b12_def', symps: ["hema_anemia_symptoms", "psych_cognitive_psych"] },
  { id: 'hemolytic_anemia', symps: ["hema_anemia_symptoms", "hema_bruising_easy"] },
  
  { id: 'dvt', symps: ["hema_clotting_clues"] },
  { id: 'pulmonary_embolism', symps: ["hema_clotting_clues"] },
  { id: 'leukemia_all', symps: ["hema_bruising_easy", "hema_systemic_malignancy", "hema_lymphadenopathy", "hema_skin_bleeding_signs"] },
  { id: 'leukemia_aml', symps: ["hema_bruising_easy", "hema_systemic_malignancy", "hema_lymphadenopathy", "hema_skin_bleeding_signs", "hema_bleeding_excessive"] },
  
  { id: 'alzheimers', symps: ["psych_cognitive_psych", "psych_behavioral_changes"] },
  { id: 'parkinson_disease', symps: ["psych_cognitive_psych"] }
];

updates.forEach(update => {
  const regex = new RegExp(`(id:\\s*"${update.id}"[\\s\\S]*?commonSymptoms:\\s*\\[)([^\\]]*)(\\])`);
  content = content.replace(regex, (match, p1, p2, p3) => {
    let existing = p2.split(',').map(s => s.trim().replace(/"/g, '')).filter(Boolean);
    let newSymps = update.symps.filter(s => !existing.includes(s));
    let combined = [...existing, ...newSymps].map(s => `"${s}"`).join(", ");
    return `${p1}${combined}${p3}`;
  });
});

fs.writeFileSync(path, content, 'utf8');
console.log("Updated mappings");
