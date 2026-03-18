import { supabase } from '@/lib/supabase';

export interface Drug {
  id: number;
  generic_name: string;
  drug_class: string;
  atc_code: string;
}

export interface DrugBrand {
  id: number;
  drug_id: number;
  brand_name: string;
  manufacturer: string;
}

export interface DosageForm {
  id: number;
  form_name: string;
}

export interface DrugStrength {
  id: number;
  drug_id: number;
  strength: string;
  unit: string;
}

export interface MedicationDetails extends Drug {
  brands: DrugBrand[];
  strengths: DrugStrength[];
  contraindications: string[];
  sideEffects: string[];
  interactions: string[];
  dosageGuidelines: any[];
}

export const medicationService = {
  async searchDrugs(query: string): Promise<Drug[]> {
    const { data, error } = await supabase
      .from('drugs')
      .select('*')
      .ilike('generic_name', `%${query}%`)
      .limit(20);
    
    if (error) throw error;
    return data || [];
  },

  async getDrugsByClass(drugClass: string): Promise<Drug[]> {
    const { data, error } = await supabase
      .from('drugs')
      .select('*')
      .eq('drug_class', drugClass);
    
    if (error) throw error;
    return data || [];
  },

  async getMedicationDetails(drugId: number): Promise<MedicationDetails> {
    // Fetch drug basic info
    const { data: drug, error: drugError } = await supabase
      .from('drugs')
      .select('*')
      .eq('id', drugId)
      .single();
    
    if (drugError) throw drugError;

    // Fetch related data in parallel
    const [
      { data: brands },
      { data: strengths },
      { data: contraindications },
      { data: sideEffects },
      { data: interactions },
      { data: guidelines }
    ] = await Promise.all([
      supabase.from('drug_brands').select('*').eq('drug_id', drugId),
      supabase.from('drug_strengths').select('*').eq('drug_id', drugId),
      supabase.from('drug_contraindications').select('condition').eq('drug_id', drugId),
      supabase.from('drug_side_effects').select('side_effect').eq('drug_id', drugId),
      supabase.from('drug_interactions').select('description').eq('drug_id', drugId),
      supabase.from('drug_dosage_guidelines').select('*').eq('drug_id', drugId)
    ]);

    return {
      ...drug,
      brands: brands || [],
      strengths: strengths || [],
      contraindications: contraindications?.map(c => c.condition) || [],
      sideEffects: sideEffects?.map(s => s.side_effect) || [],
      interactions: interactions?.map(i => i.description) || [],
      dosageGuidelines: guidelines || []
    };
  },

  async getAllDosageForms(): Promise<DosageForm[]> {
    const { data, error } = await supabase
      .from('dosage_forms')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }
};
