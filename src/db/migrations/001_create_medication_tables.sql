-- Create Tables for Medical Database
CREATE TABLE drugs (
  id SERIAL PRIMARY KEY,
  generic_name TEXT NOT NULL,
  drug_class TEXT,
  atc_code TEXT
);

CREATE TABLE drug_brands (
  id SERIAL PRIMARY KEY,
  drug_id INTEGER REFERENCES drugs(id),
  brand_name TEXT NOT NULL,
  manufacturer TEXT
);

CREATE TABLE dosage_forms (
  id SERIAL PRIMARY KEY,
  form_name TEXT NOT NULL
);

CREATE TABLE drug_strengths (
  id SERIAL PRIMARY KEY,
  drug_id INTEGER REFERENCES drugs(id),
  strength TEXT NOT NULL,
  unit TEXT NOT NULL
);

CREATE TABLE drug_dosage_guidelines (
  id SERIAL PRIMARY KEY,
  drug_id INTEGER REFERENCES drugs(id),
  indication TEXT,
  adult_dose TEXT,
  pediatric_dose TEXT,
  max_dose TEXT,
  frequency TEXT
);

CREATE TABLE drug_interactions (
  id SERIAL PRIMARY KEY,
  drug1_id INTEGER REFERENCES drugs(id),
  drug2_id INTEGER REFERENCES drugs(id),
  severity TEXT CHECK (severity IN ('Minor', 'Moderate', 'Major')),
  description TEXT
);

CREATE TABLE drug_contraindications (
  id SERIAL PRIMARY KEY,
  drug_id INTEGER REFERENCES drugs(id),
  condition TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('Moderate', 'Major'))
);

CREATE TABLE drug_side_effects (
  id SERIAL PRIMARY KEY,
  drug_id INTEGER REFERENCES drugs(id),
  side_effect TEXT NOT NULL,
  frequency TEXT
);

CREATE TABLE drug_indications (
  id SERIAL PRIMARY KEY,
  drug_id INTEGER REFERENCES drugs(id),
  disease TEXT NOT NULL
);

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  doctor_id UUID,
  diagnosis TEXT,
  notes TEXT,
  refills INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_modified BIGINT DEFAULT (extract(epoch from now()) * 1000)
);

CREATE TABLE prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
  drug_id INTEGER REFERENCES drugs(id),
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  instructions TEXT,
  form TEXT
);
