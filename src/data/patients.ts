export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  lastVisit: string;
  status: string;
  allergies?: string;
  chronicConditions?: string[];
  medications?: string[];
}
