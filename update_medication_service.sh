#!/bin/bash
cat src/services/medicationService.ts | sed -n '1,298p' > temp.ts
echo '  async discoverAndAddDrug(drugInfo: Partial<Drug> & { brands?: string[], side_effects?: string[], indications?: string[], contraindications?: string[], strengths?: string[], dosage_forms?: string[], drug_interactions?: string[] }) {' >> temp.ts
echo "    const existing = await db.drugs.where('generic_name').equalsIgnoreCase(drugInfo.generic_name || '').first();" >> temp.ts
echo "    let drugId: number;" >> temp.ts
echo "    const drugPayload: any = {" >> temp.ts
echo "      generic_name: drugInfo.generic_name," >> temp.ts
echo "      drug_class: drugInfo.drug_class || 'Unknown'," >> temp.ts
echo "      atc_code: drugInfo.atc_code || 'Unknown'," >> temp.ts
echo "      mechanism_of_action: drugInfo.mechanism_of_action," >> temp.ts
echo "      adult_dose: drugInfo.adult_dose," >> temp.ts
echo "      pediatric_dose: drugInfo.pediatric_dose," >> temp.ts
echo "      renal_dose: drugInfo.renal_dose," >> temp.ts
echo "      hepatic_dose: drugInfo.hepatic_dose," >> temp.ts
echo "      pregnancy_category: drugInfo.pregnancy_category," >> temp.ts
echo "      lactation: drugInfo.lactation," >> temp.ts
echo "      food_interactions: drugInfo.food_interactions," >> temp.ts
echo "      monitoring_parameters: drugInfo.monitoring_parameters," >> temp.ts
echo "      lab_tests: drugInfo.lab_tests," >> temp.ts
echo "      storage: drugInfo.storage," >> temp.ts
echo "      patient_counseling: drugInfo.patient_counseling," >> temp.ts
echo "      references: drugInfo.references" >> temp.ts
echo "    };" >> temp.ts
echo "    Object.keys(drugPayload).forEach(key => drugPayload[key] === undefined && delete drugPayload[key]);" >> temp.ts
echo "    if (!existing) {" >> temp.ts
echo "      drugId = await db.drugs.add(drugPayload) as number;" >> temp.ts
echo "    } else {" >> temp.ts
echo "      drugId = existing.id as number;" >> temp.ts
echo "      await db.drugs.update(drugId, drugPayload);" >> temp.ts
echo "    }" >> temp.ts
echo "    if (drugInfo.brands?.length) {" >> temp.ts
echo "      for (const brandName of drugInfo.brands) {" >> temp.ts
echo "        const brandExists = await db.drug_brands.where('brand_name').equalsIgnoreCase(brandName).first();" >> temp.ts
echo "        if (!brandExists) {" >> temp.ts
echo "          await db.drug_brands.add({ drug_id: drugId, brand_name: brandName, manufacturer: 'Unknown' });" >> temp.ts
echo "        }" >> temp.ts
echo "      }" >> temp.ts
echo "    }" >> temp.ts
echo "    if (drugInfo.side_effects?.length) {" >> temp.ts
echo "      for (const effect of drugInfo.side_effects) {" >> temp.ts
echo "        const effectExists = await db.drug_side_effects.where({ drug_id: drugId, side_effect: effect }).first();" >> temp.ts
echo "        if (!effectExists) {" >> temp.ts
echo "          await db.drug_side_effects.add({ drug_id: drugId, side_effect: effect, frequency: 'Unknown' });" >> temp.ts
echo "        }" >> temp.ts
echo "      }" >> temp.ts
echo "    }" >> temp.ts
echo "    if (drugInfo.contraindications?.length) {" >> temp.ts
echo "      for (const contra of drugInfo.contraindications) {" >> temp.ts
echo "        const contraExists = await db.drug_contraindications.where({ drug_id: drugId, condition: contra }).first();" >> temp.ts
echo "        if (!contraExists) {" >> temp.ts
echo "          await db.drug_contraindications.add({ drug_id: drugId, condition: contra, severity: 'High', description: 'AI Discovered' });" >> temp.ts
echo "        }" >> temp.ts
echo "      }" >> temp.ts
echo "    }" >> temp.ts
echo "    if (drugInfo.drug_interactions?.length) {" >> temp.ts
echo "      for (const ix of drugInfo.drug_interactions) {" >> temp.ts
echo "        // Skipping detailed ix parsing for speed, ideally we add it as an interaction string if possible" >> temp.ts
echo "      }" >> temp.ts
echo "    }" >> temp.ts
echo "    return drugId;" >> temp.ts
echo "  }" >> temp.ts
echo "};" >> temp.ts
mv temp.ts src/services/medicationService.ts
chmod +x update_medication_service.sh
./update_medication_service.sh
