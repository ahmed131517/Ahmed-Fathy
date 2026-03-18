-- Create Clinical Tables for Diagnoses and Lab Results
CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  condition TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_modified BIGINT DEFAULT (extract(epoch from now()) * 1000),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  test_name TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  reference_range TEXT,
  status TEXT CHECK (status IN ('normal', 'abnormal')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_modified BIGINT DEFAULT (extract(epoch from now()) * 1000),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Add is_deleted to prescriptions and prescription_items if not already there
-- (They were missing in the previous migration's CREATE TABLE)
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS last_modified BIGINT DEFAULT (extract(epoch from now()) * 1000);

-- Vitals Table
CREATE TABLE IF NOT EXISTS vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  bp_systolic INTEGER,
  bp_diastolic INTEGER,
  hr INTEGER,
  temp DECIMAL(4,1),
  rr INTEGER,
  spo2 INTEGER,
  oxygen_type TEXT,
  oxygen_dose TEXT,
  oxygen_invasive TEXT,
  oxygen_device_type TEXT,
  fio2 TEXT,
  peep TEXT,
  pressure_support TEXT,
  flow_rate TEXT,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_modified BIGINT DEFAULT (extract(epoch from now()) * 1000),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient ON diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_patient ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_modified ON diagnoses(last_modified);
CREATE INDEX IF NOT EXISTS idx_lab_results_modified ON lab_results(last_modified);
CREATE INDEX IF NOT EXISTS idx_vitals_modified ON vitals(last_modified);
