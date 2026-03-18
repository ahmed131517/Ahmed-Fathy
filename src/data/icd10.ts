export interface ICD10Code {
  code: string;
  description: string;
}

export const commonICD10Codes: ICD10Code[] = [
  { code: "J15.9", description: "Unspecified bacterial pneumonia" },
  { code: "J20.9", description: "Acute bronchitis, unspecified" },
  { code: "J45.909", description: "Unspecified asthma, uncomplicated" },
  { code: "I10", description: "Essential (primary) hypertension" },
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
  { code: "M54.5", description: "Low back pain" },
  { code: "N39.0", description: "Urinary tract infection, site not specified" },
  { code: "R05", description: "Cough" },
  { code: "R50.9", description: "Fever, unspecified" },
  { code: "J06.9", description: "Acute upper respiratory infection, unspecified" },
  { code: "K21.9", description: "Gastro-esophageal reflux disease without esophagitis" },
  { code: "F41.1", description: "Generalized anxiety disorder" },
  { code: "F32.9", description: "Major depressive disorder, single episode, unspecified" },
  { code: "G43.909", description: "Migraine, unspecified, not intractable, without status migrainosus" },
  { code: "L20.9", description: "Atopic dermatitis, unspecified" },
  { code: "B34.9", description: "Viral infection, unspecified" },
  { code: "A09", description: "Infectious gastroenteritis and colitis, unspecified" },
  { code: "H10.9", description: "Unspecified conjunctivitis" },
  { code: "M17.9", description: "Osteoarthritis of knee, unspecified" },
  { code: "Z00.00", description: "Encounter for general adult medical examination without abnormal findings" }
];
