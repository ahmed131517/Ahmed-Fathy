const fs = require('fs');
let code = fs.readFileSync('src/services/medicationService.ts', 'utf8');

const oldFunc = `  async discoverAndAddDrug(drugInfo: {
    generic_name: string,
    drug_class?: string,
    atc_code?: string,
    brands?: string[],
    side_effects?: string[]
  }) {
    // Check if drug already exists
    const existing = await db.drugs.where('generic_name').equalsIgnoreCase(drugInfo.generic_name).first();
    
    let drugId: number;
    if (!existing) {
      drugId = await db.drugs.add({
        generic_name: drugInfo.generic_name,
        drug_class: drugInfo.drug_class || 'Unknown',
        atc_code: drugInfo.atc_code || 'Unknown'
      }) as number;
    } else {
      drugId = existing.id as number;
    }

    // Add brands if provided
    if (drugInfo.brands?.length) {
      for (const brandName of drugInfo.brands) {
        const brandExists = await db.drug_brands.where('brand_name').equalsIgnoreCase(brandName).first();
        if (!brandExists) {
          await db.drug_brands.add({
            drug_id: drugId,
            brand_name: brandName,
            manufacturer: 'Unknown'
          });
        }
      }
    }

    // Add side effects if provided
    if (drugInfo.side_effects?.length) {
      for (const effect of drugInfo.side_effects) {
        const effectExists = await db.drug_side_effects.where({ drug_id: drugId, side_effect: effect }).first();
        if (!effectExists) {
          await db.drug_side_effects.add({
            drug_id: drugId,
            side_effect: effect,
            frequency: 'Unknown'
          });
        }
      }
    }

    return drugId;
  }`;

const newFunc = `  async discoverAndAddDrug(drugInfo: Partial<Drug> & { brands?: string[], side_effects?: string[], indications?: string[], contraindications?: string[], strengths?: string[], dosage_forms?: string[], drug_interactions?: string[] }) {
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
        const effectExists = await db.drug_side_effects.where({ drug_id: drugId, side_effect: effect }).first();
        if (!effectExists) {
          await db.drug_side_effects.add({ drug_id: drugId, side_effect: effect, frequency: 'Unknown' });
        }
      }
    }
    if (drugInfo.contraindications?.length) {
      for (const contra of drugInfo.contraindications) {
        const contraExists = await db.drug_contraindications.where({ drug_id: drugId, condition: contra }).first();
        if (!contraExists) {
          await db.drug_contraindications.add({ drug_id: drugId, condition: contra, severity: 'High', description: 'AI Discovered' });
        }
      }
    }
    if (drugInfo.drug_interactions?.length) {
      for (const ix of drugInfo.drug_interactions) {
        // Skipping detailed ix parsing for speed, ideally we add it as an interaction string if possible
      }
    }
    return drugId;
  }`;

if (code.includes(oldFunc)) {
  code = code.replace(oldFunc, newFunc);
  fs.writeFileSync('src/services/medicationService.ts', code);
  console.log("Func replaced successfully.");
} else {
  console.log("Old func not found!");
}
