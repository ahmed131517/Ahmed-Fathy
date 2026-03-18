export const prescriptionTemplates: Record<string, Record<string, any[]>> = {
  "common-cold": {
    "1": [
      {
        medication: "Acetaminophen",
        form: "500mg tablet",
        dosage: "1-2 tablets",
        frequency: "every 6 hours as needed",
        duration: "5 days",
        instructions: "For fever and pain",
      },
      {
        medication: "Dextromethorphan",
        form: "20mg/10ml syrup",
        dosage: "10ml",
        frequency: "every 4 hours as needed",
        duration: "5 days",
        instructions: "For cough",
      },
    ],
    "2": [
      {
        medication: "Ibuprofen",
        form: "200mg tablet",
        dosage: "1-2 tablets",
        frequency: "every 4-6 hours",
        duration: "3 days",
        instructions: "Take with food for pain/fever",
      },
      {
        medication: "Phenylephrine",
        form: "10mg tablet",
        dosage: "1 tablet",
        frequency: "every 4 hours",
        duration: "5 days",
        instructions: "For nasal congestion",
      },
    ],
  },
  hypertension: {
    "1": [
      {
        medication: "Lisinopril",
        form: "10mg tablet",
        dosage: "1 tablet",
        frequency: "once daily",
        duration: "30 days",
        instructions: "Take in the morning",
      },
      {
        medication: "Hydrochlorothiazide",
        form: "12.5mg tablet",
        dosage: "1 tablet",
        frequency: "once daily",
        duration: "30 days",
        instructions: "Take in the morning with Lisinopril",
      },
    ],
  },
  allergies: {
    "1": [
      {
        medication: "Cetirizine",
        form: "10mg tablet",
        dosage: "1 tablet",
        frequency: "once daily",
        duration: "30 days",
        instructions: "Take as needed for allergy symptoms",
      },
      {
        medication: "Fluticasone",
        form: "50mcg nasal spray",
        dosage: "1 spray in each nostril",
        frequency: "twice daily",
        duration: "30 days",
        instructions: "Use regularly for best results",
      },
    ],
  },
  "type-2-diabetes": {
    "1": [
      {
        medication: "Metformin",
        form: "500mg tablet",
        dosage: "1 tablet",
        frequency: "twice daily",
        duration: "30 days",
        instructions: "Take with meals",
      },
      {
        medication: "Glipizide",
        form: "5mg tablet",
        dosage: "1 tablet",
        frequency: "once daily",
        duration: "30 days",
        instructions: "Take 30 minutes before breakfast",
      },
    ],
  },
  asthma: {
    "1": [
      {
        medication: "Albuterol HFA",
        form: "90mcg inhaler",
        dosage: "2 puffs",
        frequency: "every 4-6 hours as needed",
        duration: "30 days",
        instructions: "For shortness of breath",
      },
      {
        medication: "Fluticasone",
        form: "110mcg inhaler",
        dosage: "2 puffs",
        frequency: "twice daily",
        duration: "30 days",
        instructions: "Rinse mouth after use",
      },
    ],
  }
};
