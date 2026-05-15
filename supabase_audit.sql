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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name AND column_name = 'modified_by') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN modified_by UUID REFERENCES public.profiles(id)', table_name);
    END IF;

    -- Add/Recreate Trigger
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%I ON public.%I', table_name, table_name);
    EXECUTE format('CREATE TRIGGER trg_audit_%I BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_audit_metadata()', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- 3. Apply to core tables
SELECT public.add_audit_columns('patients');
SELECT public.add_audit_columns('appointments');
SELECT public.add_audit_columns('vitals');
SELECT public.add_audit_columns('diagnoses');
SELECT public.add_audit_columns('prescriptions');
SELECT public.add_audit_columns('lab_results');
SELECT public.add_audit_columns('tasks');
