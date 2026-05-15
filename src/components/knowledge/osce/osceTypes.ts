export type ScenarioDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type ScenarioSpecialty = 'Cardiology' | 'Internal Medicine' | 'Pediatrics' | 'Emergency' | 'Surgery' | 'Psychiatry' | 'ENT' | 'Dermatology';

export type PatientCondition = 'Stable' | 'Deteriorating' | 'Critical';

export interface VitalSigns {
  bp: string;
  hr: number;
  rr: number;
  temp: number;
  spo2: number;
}

export interface Scenario {
  id: string;
  title: string;
  specialty: ScenarioSpecialty;
  difficulty: ScenarioDifficulty;
  chiefComplaint: string;
  patientInfo: {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    personality: string;
    startingCondition: PatientCondition;
  };
  initialVitals: VitalSigns;
  diagnosis: string; // The hidden diagnosis
  history: string;
  medications: string;
  allergies: string;
  physicalExamFindings: {
    general: string;
    cardiovascular: string;
    respiratory: string;
    abdominal: string;
    neurological: string;
    extremities?: string;
  };
  investigations: Record<string, string>; // e.g. "ECG": "Sinus Tachycardia, ST elevation in V1-V4"
  progressionLogic: string; // Used by AI to simulate worsening
  redFlags: string[];
}

// Chat roles
export type ChatRole = 'doctor' | 'patient' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
}

// Game State
export interface SimulationState {
  isActive: boolean;
  scenario: Scenario | null;
  mode: 'Normal' | 'OSCE' | 'Emergency' | 'Communication' | 'Diagnostic Challenge' | 'Handover';
  timeRemaining: number;
  turnCount: number;
  messages: ChatMessage[];
  currentVitals: VitalSigns;
  condition: PatientCondition;
  orderedInvestigations: string[];
  findings: string[];
  doctorNotes: string;
  differentials: string[];
  provisionalDiagnosis: string;
  finalDiagnosis: string;
  evaluation: SimulationEvaluation | null;
}

export interface SimulationEvaluation {
  score: number;
  historyTaking: number;
  differentialDiagnosis: number;
  investigations: number;
  communication: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  missedRedFlags: string[];
  suggestedDifferentials: string[];
  educationalNotes: string;
}
