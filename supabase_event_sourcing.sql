-- 1. Create audit function
CREATE OR REPLACE FUNCTION public.set_audit_metadata()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified := (extract(epoch from now()) * 1000)::BIGINT;
    
    -- Try to set modified_by from auth.uid() if user is authenticated
    IF auth.uid() IS NOT NULL THEN
        NEW.modified_by := auth.uid();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Helper to add audit columns
CREATE OR REPLACE FUNCTION public.add_audit_columns(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Add column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = table_name AND column_name = 'modified_by') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN modified_by UUID REFERENCES public.profiles(id)', table_name);
    END IF;

    -- Add/Recreate Trigger
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%I ON public.%I', table_name, table_name);
    EXECUTE format('CREATE TRIGGER trg_audit_%I BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_audit_metadata()', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- 3. Base Tables (Core Entities)
-- ------------------------------------------------------------------------------

-- Users table (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    role TEXT CHECK (role IN ('doctor', 'nurse', 'admin', 'user')) DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_modified BIGINT DEFAULT (extract(epoch from now()) * 1000)::BIGINT
);

-- Patients
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dob DATE,
    age INTEGER,
    gender TEXT,
    blood_type TEXT,
    last_visit TEXT,
    status TEXT DEFAULT 'active',
    phone TEXT,
    email TEXT,
    address TEXT,
    national_id TEXT,
    last_modified BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);
SELECT public.add_audit_columns('patients');

-- Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    type TEXT,
    status TEXT DEFAULT 'scheduled',
    doctor TEXT,
    last_modified BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);
SELECT public.add_audit_columns('appointments');

-- Vitals
CREATE TABLE IF NOT EXISTS public.vitals (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_id TEXT REFERENCES public.appointments(id) ON DELETE SET NULL,
    bp_systolic INTEGER,
    bp_diastolic INTEGER,
    hr INTEGER,
    temp NUMERIC,
    rr INTEGER,
    spo2 INTEGER,
    weight NUMERIC,
    height NUMERIC,
    bmi NUMERIC,
    glucose NUMERIC,
    oxygen_type TEXT,
    oxygen_dose TEXT,
    notes TEXT,
    date DATE NOT NULL,
    last_modified BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE
);
SELECT public.add_audit_columns('vitals');

-- Diagnoses
CREATE TABLE IF NOT EXISTS public.diagnoses (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_id TEXT REFERENCES public.appointments(id) ON DELETE SET NULL,
    condition TEXT NOT NULL,
    code TEXT,
    description TEXT,
    notes TEXT,
    date DATE NOT NULL,
    last_modified BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE
);
SELECT public.add_audit_columns('diagnoses');

-- Prescriptions
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id TEXT,
    diagnosis TEXT,
    notes TEXT,
    refills INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    last_modified BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);
SELECT public.add_audit_columns('prescriptions');

-- Prescription Items
CREATE TABLE IF NOT EXISTS public.prescription_items (
    id TEXT PRIMARY KEY,
    prescription_id TEXT REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    drug_id INTEGER,
    medication_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    duration TEXT,
    instructions TEXT,
    form TEXT
);
SELECT public.add_audit_columns('prescription_items');

-- Lab Results
CREATE TABLE IF NOT EXISTS public.lab_results (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_id TEXT REFERENCES public.appointments(id) ON DELETE SET NULL,
    test_name TEXT NOT NULL,
    value TEXT,
    unit TEXT,
    reference_range TEXT,
    status TEXT, -- normal, abnormal, critical
    date DATE NOT NULL,
    last_modified BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE
);
SELECT public.add_audit_columns('lab_results');

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT, -- low, medium, high
    type TEXT, -- follow-up, lab-review, etc.
    due_date DATE,
    status TEXT DEFAULT 'pending',
    last_modified BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE
);
SELECT public.add_audit_columns('tasks');

-- Saved Knowledge
CREATE TABLE IF NOT EXISTS public.saved_knowledge (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- drug, protocol, etc.
    title TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Event Sourcing & Sync Sync
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.sync_events_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID UNIQUE NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    payload JSONB NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    user_id TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast processing of unhandled events
CREATE INDEX IF NOT EXISTS idx_unprocessed_events ON public.sync_events_log(processed) WHERE processed = FALSE;

-- Processor function to apply deltas
CREATE OR REPLACE FUNCTION process_sync_event()
RETURNS TRIGGER AS $$
DECLARE
    target_table TEXT := NEW.entity_type;
BEGIN
    IF NEW.action = 'UPDATE' THEN
        IF target_table IN ('patients', 'appointments', 'prescriptions', 'diagnoses', 'lab_results', 'vitals', 'tasks') THEN
            EXECUTE format(
                'INSERT INTO public.%I (id, last_modified) VALUES (%L, %L) ON CONFLICT (id) DO UPDATE SET ', 
                target_table, NEW.entity_id, NEW.timestamp
            ) || 
            (
                SELECT string_agg(format('%I = $1->>%L', key, key), ', ')
                FROM jsonb_object_keys(NEW.payload) AS key
            ) ||
            format(' WHERE public.%I.id = %L', target_table, NEW.entity_id)
            USING NEW.payload;

            NEW.processed := TRUE;
        END IF;
    ELSIF NEW.action = 'CREATE' THEN
         -- Simple pattern: use the payload to insert. In a real-world scenario, we'd map explicitly.
         -- For this bridge, we expect the payload to contain the full object.
         NEW.processed := TRUE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS trg_process_sync_events ON public.sync_events_log;
CREATE TRIGGER trg_process_sync_events
    BEFORE INSERT ON public.sync_events_log
    FOR EACH ROW
    EXECUTE FUNCTION process_sync_event();

-- 3. Security (RLS)
-- ------------------------------------------------------------------------------

-- Helper to safely get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Apply to tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_events_log ENABLE ROW LEVEL SECURITY;

-- 3.1 Patients & Clinical Data (Doctor access only for updates)
CREATE POLICY "Doctors have full access" ON public.patients FOR ALL TO authenticated USING (public.get_user_role() = 'doctor');
CREATE POLICY "Others can read patients" ON public.patients FOR SELECT TO authenticated USING (true);

-- 3.2 Tasks (Doctor ALL, Nurse UPDATE Allowed)
CREATE POLICY "Doctors have full access on tasks" ON public.tasks FOR ALL TO authenticated USING (public.get_user_role() = 'doctor');
CREATE POLICY "Nurses can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (public.get_user_role() = 'nurse');
CREATE POLICY "All staff can read tasks" ON public.tasks FOR SELECT TO authenticated USING (true);

-- Knowledge
CREATE POLICY "Users view own knowledge" ON public.saved_knowledge FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users manage own knowledge" ON public.saved_knowledge FOR ALL TO authenticated USING (user_id = auth.uid());

-- Profiles
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users edit own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Sync events
CREATE POLICY "Allow authenticated insert events" ON public.sync_events_log FOR INSERT TO authenticated WITH CHECK (true);
