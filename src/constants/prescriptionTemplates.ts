export const prescriptionTemplates: Record<string, any> = {
  "hypertension": {
    "1": [
      { medication: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning", form: "Tablet" },
      { medication: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "30 days", instructions: "Take at same time each day", form: "Tablet" }
    ],
    "2": [
      { medication: "Losartan", dosage: "50mg", frequency: "Once daily", duration: "30 days", instructions: "Monitor BP regularly", form: "Tablet" },
      { medication: "Hydrochlorothiazide", dosage: "12.5mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning", form: "Tablet" }
    ]
  },
  "diabetes-type-2": {
    "1": [
      { medication: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "30 days", instructions: "Take with meals", form: "Tablet" }
    ],
    "2": [
      { medication: "Metformin", dosage: "1000mg", frequency: "Twice daily", duration: "30 days", instructions: "Take with meals", form: "Tablet" },
      { medication: "Sitagliptin", dosage: "100mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning", form: "Tablet" }
    ]
  },
  "upper-respiratory-infection": {
    "1": [
      { medication: "Amoxicillin", dosage: "500mg", frequency: "Three times daily", duration: "7 days", instructions: "Complete the full course", form: "Capsule" },
      { medication: "Paracetamol", dosage: "500mg", frequency: "As needed for fever", duration: "5 days", instructions: "Max 4g per day", form: "Tablet" }
    ],
    "2": [
      { medication: "Azithromycin", dosage: "500mg", frequency: "Once daily", duration: "3 days", instructions: "Take 1 hour before or 2 hours after food", form: "Tablet" },
      { medication: "Loratadine", dosage: "10mg", frequency: "Once daily", duration: "7 days", instructions: "Take in the evening", form: "Tablet" }
    ]
  },
  "gastritis": {
    "1": [
      { medication: "Omeprazole", dosage: "20mg", frequency: "Once daily", duration: "14 days", instructions: "Take 30 mins before breakfast", form: "Capsule" },
      { medication: "Antacid", dosage: "10ml", frequency: "Three times daily", duration: "7 days", instructions: "Take after meals", form: "Suspension" }
    ]
  }
};
