import { db, DrugInteraction, DrugContraindication, DrugSideEffect } from '@/lib/db';
import { toast } from 'sonner';

export interface Drug {
  mechanism_of_action?: string;
  adult_dose?: string;
  pediatric_dose?: string;
  renal_dose?: string;
  hepatic_dose?: string;
  pregnancy_category?: string;
  lactation?: string;
  food_interactions?: string[];
  monitoring_parameters?: string[];
  lab_tests?: string[];
  storage?: string;
  patient_counseling?: string[];
  references?: string[];
  id?: number;
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
  async addInteraction(drug1Name: string, drug2Name: string, severity: string, description: string) {
    // Find drug IDs by name (case-insensitive)
    let allDrugs = await db.drugs.toArray();
    let drug1 = allDrugs.find(d => d.generic_name.toLowerCase() === drug1Name.toLowerCase());
    let drug2 = allDrugs.find(d => d.generic_name.toLowerCase() === drug2Name.toLowerCase());

    // Add missing drugs if not found
    if (!drug1) {
      const id = await db.drugs.add({ generic_name: drug1Name, drug_class: 'Unknown', atc_code: 'Unknown' });
      drug1 = { id, generic_name: drug1Name, drug_class: 'Unknown', atc_code: 'Unknown' };
    }
    if (!drug2) {
      const id = await db.drugs.add({ generic_name: drug2Name, drug_class: 'Unknown', atc_code: 'Unknown' });
      drug2 = { id, generic_name: drug2Name, drug_class: 'Unknown', atc_code: 'Unknown' };
    }

    // Map AI severity to DB severity
    let dbSeverity: 'Minor' | 'Moderate' | 'Major' = 'Minor';
    if (severity === 'severe') dbSeverity = 'Major';
    else if (severity === 'moderate') dbSeverity = 'Moderate';
    else if (severity === 'mild') dbSeverity = 'Minor';
    else throw new Error(`Unsupported severity: ${severity}`);

    // Check if interaction already exists
    const existing = await db.drug_interactions.filter(i => 
      (i.drug1_id === drug1.id && i.drug2_id === drug2.id) ||
      (i.drug1_id === drug2.id && i.drug2_id === drug1.id)
    ).first();

    if (existing) {
      // Update existing interaction
      await db.drug_interactions.update(existing.id as number, {
        severity: dbSeverity,
        description
      });
      return;
    }

    await db.drug_interactions.add({
      drug1_id: drug1.id as number,
      drug2_id: drug2.id as number,
      severity: dbSeverity,
      description
    });
  },

  async reseed() {
    await db.drugs.clear();
    await db.drug_brands.clear();
    await db.drug_interactions.clear();
    await db.drug_contraindications.clear();
    await db.drug_side_effects.clear();
    await this.seedDrugsIfEmpty();
  },

  async seedDrugsIfEmpty() {
    const count = await db.drugs.count();
    if (count > 0) return;

    console.log("Seeding drugs database...");
    
    // Seed some basic drugs
    const drugs = [
      { id: 1, generic_name: 'Amoxicillin', drug_class: 'Antibiotic', atc_code: 'J01CA04' },
      { id: 2, generic_name: 'Lisinopril', drug_class: 'ACE Inhibitor', atc_code: 'C09AA03' },
      { id: 3, generic_name: 'Ibuprofen', drug_class: 'NSAID', atc_code: 'M01AE01' },
      { id: 4, generic_name: 'Warfarin', drug_class: 'Anticoagulant', atc_code: 'B01AA03' },
      { id: 5, generic_name: 'Aspirin', drug_class: 'NSAID', atc_code: 'N02BA01' },
      { id: 6, generic_name: 'Potassium', drug_class: 'Supplement', atc_code: 'A12BA01' },
      { id: 7, generic_name: 'Metformin', drug_class: 'Antidiabetic', atc_code: 'A10BA02' },
      { id: 8, generic_name: 'Atorvastatin', drug_class: 'Statin', atc_code: 'C10AA05' },
      { id: 9, generic_name: 'Azithromycin', drug_class: 'Macrolide', atc_code: 'J01FA10' },
      { id: 10, generic_name: 'Sertraline', drug_class: 'SSRI', atc_code: 'N06AB06' },
      { id: 11, generic_name: 'Levothyroxine', drug_class: 'Thyroid Hormone', atc_code: 'H03AA01' },
      { id: 12, generic_name: 'Amlodipine', drug_class: 'Calcium Channel Blocker', atc_code: 'C08CA01' },
      { id: 13, generic_name: 'Omeprazole', drug_class: 'PPI', atc_code: 'A02BC01' },
      { id: 14, generic_name: 'Losartan', drug_class: 'ARB', atc_code: 'C09CA01' },
      { id: 15, generic_name: 'Spironolactone', drug_class: 'Diuretic', atc_code: 'C03DA01' },
      { id: 16, generic_name: 'Lithium', drug_class: 'Mood Stabilizer', atc_code: 'N05AN01' },
      { id: 17, generic_name: 'Clopidogrel', drug_class: 'Antiplatelet', atc_code: 'B01AC04' },
      { id: 18, generic_name: 'Metoprolol', drug_class: 'Beta Blocker', atc_code: 'C07AB02' },
      { id: 19, generic_name: 'Gabapentin', drug_class: 'Anticonvulsant', atc_code: 'N03AX12' },
      { id: 20, generic_name: 'Hydrochlorothiazide', drug_class: 'Diuretic', atc_code: 'C03AA03' },
      { id: 21, generic_name: 'Prednisone', drug_class: 'Corticosteroid', atc_code: 'H02AB07' },
      { id: 22, generic_name: 'Furosemide', drug_class: 'Diuretic', atc_code: 'C03CA01' },
      { id: 23, generic_name: 'Albuterol', drug_class: 'Bronchodilator', atc_code: 'R03AC02' }
    ];

    await db.drugs.bulkAdd(drugs);

    await db.drug_brands.bulkAdd([
      { drug_id: 1, brand_name: 'Ibiamox (Amoxicillin)', manufacturer: 'GSK' },
      { drug_id: 2, brand_name: 'Zestril (Lisinopril)', manufacturer: 'Merck' },
      { drug_id: 3, brand_name: 'Brufen (Ibuprofen)', manufacturer: 'Pfizer' },
      { drug_id: 4, brand_name: 'Marevan (Warfarin)', manufacturer: 'BMS' },
      { drug_id: 7, brand_name: 'Cidophage (Metformin)', manufacturer: 'Merck' },
      { drug_id: 8, brand_name: 'Ator (Atorvastatin)', manufacturer: 'Pfizer' },
      { drug_id: 9, brand_name: 'Zithrokan (Azithromycin)', manufacturer: 'Pfizer' },
      { drug_id: 10, brand_name: 'Lustral (Sertraline)', manufacturer: 'Pfizer' },
      { drug_id: 11, brand_name: 'Eltroxin (Levothyroxine)', manufacturer: 'AbbVie' },
      { drug_id: 12, brand_name: 'Alkacap (Amlodipine)', manufacturer: 'Pfizer' },
      { drug_id: 13, brand_name: 'Losec (Omeprazole)', manufacturer: 'AstraZeneca' },
      { drug_id: 14, brand_name: 'Amzaar (Losartan)', manufacturer: 'Merck' },
      { drug_id: 15, brand_name: 'Aldactone (Spironolactone)', manufacturer: 'Pfizer' },
      { drug_id: 16, brand_name: 'Lithobid (Lithium)', manufacturer: 'Novartis' },
      { drug_id: 17, brand_name: 'Plavix (Clopidogrel)', manufacturer: 'Sanofi' },
      { drug_id: 18, brand_name: 'Betaloc (Metoprolol)', manufacturer: 'Novartis' },
      { drug_id: 19, brand_name: 'Gaptin (Gabapentin)', manufacturer: 'Pfizer' },
      { drug_id: 20, brand_name: 'Esidrex (Hydrochlorothiazide)', manufacturer: 'Watson' },
      { drug_id: 21, brand_name: 'Hostacortin (Prednisone)', manufacturer: 'Pfizer' },
      { drug_id: 22, brand_name: 'Lasix (Furosemide)', manufacturer: 'Sanofi' },
      { drug_id: 23, brand_name: 'Ventolin (Albuterol)', manufacturer: 'GSK' }
    ]);

    await db.drug_interactions.bulkAdd([
      { drug1_id: 4, drug2_id: 5, severity: 'Major', description: 'Increased risk of bleeding.' },
      { drug1_id: 2, drug2_id: 6, severity: 'Moderate', description: 'Risk of hyperkalemia.' },
      { drug1_id: 8, drug2_id: 9, severity: 'Moderate', description: 'Increased risk of myopathy and rhabdomyolysis.' },
      { drug1_id: 15, drug2_id: 14, severity: 'Major', description: 'Significantly increased risk of severe hyperkalemia.' },
      { drug1_id: 16, drug2_id: 3, severity: 'Major', description: 'NSAIDs can decrease lithium clearance, leading to lithium toxicity.' },
      { drug1_id: 17, drug2_id: 13, severity: 'Moderate', description: 'Omeprazole may reduce the antiplatelet effect of clopidogrel.' },
      { drug1_id: 18, drug2_id: 2, severity: 'Moderate', description: 'Potential for additive hypotensive effects.' },
      { drug1_id: 20, drug2_id: 15, severity: 'Moderate', description: 'Risk of electrolyte imbalance.' },
      { drug1_id: 21, drug2_id: 3, severity: 'Moderate', description: 'Increased risk of gastrointestinal ulceration.' },
      { drug1_id: 22, drug2_id: 2, severity: 'Moderate', description: 'Increased risk of hypotension and renal impairment.' },
      { drug1_id: 23, drug2_id: 18, severity: 'Moderate', description: 'Antagonistic effect on bronchodilation.' }
    ]);

    await db.drug_contraindications.bulkAdd([
      { drug_id: 1, condition: 'Penicillin allergy', severity: 'Major' },
      { drug_id: 3, condition: 'Peptic Ulcer Disease', severity: 'Major' },
      { drug_id: 7, condition: 'Chronic Kidney Disease', severity: 'Major' },
      { drug_id: 11, condition: 'Untreated thyrotoxicosis', severity: 'Major' },
      { drug_id: 14, condition: 'Pregnancy', severity: 'Major' },
      { drug_id: 15, condition: 'Hyperkalemia', severity: 'Major' },
      { drug_id: 21, condition: 'Systemic fungal infection', severity: 'Major' },
      { drug_id: 22, condition: 'Anuria', severity: 'Major' }
    ]);

    await db.drug_side_effects.bulkAdd([
      { drug_id: 1, side_effect: 'Nausea', frequency: 'Common' },
      { drug_id: 2, side_effect: 'Dry cough', frequency: 'Common' },
      { drug_id: 3, side_effect: 'Stomach pain', frequency: 'Common' },
      { drug_id: 8, side_effect: 'Muscle pain', frequency: 'Uncommon' },
      { drug_id: 11, side_effect: 'Palpitations', frequency: 'Common' },
      { drug_id: 12, side_effect: 'Edema', frequency: 'Common' },
      { drug_id: 13, side_effect: 'Headache', frequency: 'Common' },
      { drug_id: 16, side_effect: 'Tremor', frequency: 'Common' },
      { drug_id: 21, side_effect: 'Weight gain', frequency: 'Common' },
      { drug_id: 22, side_effect: 'Dehydration', frequency: 'Common' },
      { drug_id: 23, side_effect: 'Tachycardia', frequency: 'Common' }
    ]);
  },

  async searchDrugs(query: string, searchType: 'generic' | 'trade' | 'all' = 'all'): Promise<Drug[]> {
    await this.seedDrugsIfEmpty();
    const lowerQuery = query.toLowerCase();
    
    let genericMatches: any[] = [];
    let brandDrugMatches: any[] = [];
    
    if (searchType === 'generic' || searchType === 'all') {
      genericMatches = await db.drugs
        .filter(d => d.generic_name.toLowerCase().includes(lowerQuery))
        .toArray();
    }
    
    if (searchType === 'trade' || searchType === 'all') {
      const brandMatches = await db.drug_brands
        .filter(b => b.brand_name.toLowerCase().includes(lowerQuery))
        .toArray();
        
      const brandDrugIds = [...new Set(brandMatches.map(b => b.drug_id))];
      const genericMatchIds = new Set(genericMatches.map(d => d.id));
      const uniqueBrandDrugIds = brandDrugIds.filter(id => !genericMatchIds.has(id));
      
      if (uniqueBrandDrugIds.length > 0) {
        brandDrugMatches = await db.drugs.where('id').anyOf(uniqueBrandDrugIds).toArray();
      }
    }
    
    const results = [...genericMatches, ...brandDrugMatches].slice(0, 20);
    return results as Drug[];
  },

  async getDrugsByClass(drugClass: string): Promise<Drug[]> {
    await this.seedDrugsIfEmpty();
    const results = await db.drugs
      .filter(d => d.drug_class === drugClass)
      .toArray();
    return results as Drug[];
  },

  async getMedicationDetails(drugId: number): Promise<MedicationDetails> {
    await this.seedDrugsIfEmpty();
    // Fetch drug basic info
    const drug = await db.drugs.get(drugId);
    if (!drug) throw new Error('Drug not found');

    // Fetch related data in parallel
    const [
      brands,
      strengths,
      contraindications,
      sideEffects,
      interactions1,
      interactions2,
      guidelines
    ] = await Promise.all([
      db.drug_brands.where('drug_id').equals(drugId).toArray(),
      db.drug_strengths.where('drug_id').equals(drugId).toArray(),
      db.drug_contraindications.where('drug_id').equals(drugId).toArray(),
      db.drug_side_effects.where('drug_id').equals(drugId).toArray(),
      db.drug_interactions.where('drug1_id').equals(drugId).toArray(),
      db.drug_interactions.where('drug2_id').equals(drugId).toArray(),
      db.drug_dosage_guidelines.where('drug_id').equals(drugId).toArray()
    ]);

    const interactions = [...interactions1, ...interactions2];

    return {
      ...drug,
      id: drug.id as number,
      brands: brands as DrugBrand[],
      strengths: strengths as DrugStrength[],
      contraindications: contraindications.map(c => c.condition),
      sideEffects: sideEffects.map(s => s.side_effect),
      interactions: interactions.map(i => i.description),
      dosageGuidelines: guidelines
    };
  },

  async getAllDosageForms(): Promise<DosageForm[]> {
    const results = await db.dosage_forms.toArray();
    return results as DosageForm[];
  },

  async bulkImport(data: {
    drugs?: Drug[],
    brands?: DrugBrand[],
    interactions?: DrugInteraction[],
    contraindications?: DrugContraindication[],
    sideEffects?: DrugSideEffect[]
  }) {
    try {
      if (data.drugs?.length) await db.drugs.bulkAdd(data.drugs);
      if (data.brands?.length) await db.drug_brands.bulkAdd(data.brands);
      if (data.interactions?.length) await db.drug_interactions.bulkAdd(data.interactions);
      if (data.contraindications?.length) await db.drug_contraindications.bulkAdd(data.contraindications);
      if (data.sideEffects?.length) await db.drug_side_effects.bulkAdd(data.sideEffects);
      
      toast.success("Bulk import completed successfully");
      return true;
    } catch (error) {
      console.error("Bulk import failed:", error);
      toast.error("Bulk import failed. Check console for details.");
      return false;
    }
  },

  async discoverAndAddDrug(drugInfo: Partial<Drug> & { brands?: string[], side_effects?: string[], indications?: string[], contraindications?: string[], strengths?: string[], dosage_forms?: string[], drug_interactions?: string[] }) {
    const existing = await db.drugs.where('generic_name').equalsIgnoreCase(drugInfo.generic_name || '').first();
    let drugId: number;
    const drugPayload: any = {
      generic_name: drugInfo.generic_name,
      drug_class: drugInfo.drug_class || 'Unknown',
      atc_code: drugInfo.atc_code || 'Unknown',
      mechanism_of_action: drugInfo.mechanism_of_action,
      adult_dose: drugInfo.adult_dose,
      pediatric_dose: drugInfo.pediatric_dose,
      renal_dose: drugInfo.renal_dose,
      hepatic_dose: drugInfo.hepatic_dose,
      pregnancy_category: drugInfo.pregnancy_category,
      lactation: drugInfo.lactation,
      food_interactions: drugInfo.food_interactions,
      monitoring_parameters: drugInfo.monitoring_parameters,
      lab_tests: drugInfo.lab_tests,
      storage: drugInfo.storage,
      patient_counseling: drugInfo.patient_counseling,
      references: drugInfo.references
    };
    Object.keys(drugPayload).forEach(key => drugPayload[key] === undefined && delete drugPayload[key]);
    if (!existing) {
      drugId = await db.drugs.add(drugPayload) as number;
    } else {
      drugId = existing.id as number;
      await db.drugs.update(drugId, drugPayload);
    }
    if (drugInfo.brands?.length) {
      for (const brandName of drugInfo.brands) {
        const brandExists = await db.drug_brands.where('brand_name').equalsIgnoreCase(brandName).first();
        if (!brandExists) {
          await db.drug_brands.add({ drug_id: drugId, brand_name: brandName, manufacturer: 'Unknown' });
        }
      }
    }
    if (drugInfo.side_effects?.length) {
      for (const effect of drugInfo.side_effects) {
        const effects = await db.drug_side_effects.where('drug_id').equals(drugId).toArray();
        const effectExists = effects.find(e => e.side_effect === effect);
        if (!effectExists) {
          await db.drug_side_effects.add({ drug_id: drugId, side_effect: effect, frequency: 'Unknown' });
        }
      }
    }
    if (drugInfo.contraindications?.length) {
      for (const contra of drugInfo.contraindications) {
        const contras = await db.drug_contraindications.where('drug_id').equals(drugId).toArray();
        const contraExists = contras.find(c => c.condition === contra);
        if (!contraExists) {
          await db.drug_contraindications.add({ drug_id: drugId, condition: contra, severity: 'Major' });
        }
      }
    }
    if (drugInfo.drug_interactions?.length) {
      for (const ix of drugInfo.drug_interactions) {
        // Skipping detailed ix parsing for speed, ideally we add it as an interaction string if possible
      }
    }
    return drugId;
  }
};
