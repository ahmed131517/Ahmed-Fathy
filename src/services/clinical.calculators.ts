/**
 * Dynamic Clinical Calculators Engine
 */

export const ClinicalCalculators = {
  // BMI = kg/m2
  calculateBMI: (weightKg: number, heightCm: number): number => {
    if (heightCm === 0) return 0;
    return parseFloat((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));
  },

  // Cockcroft-Gault for eGFR (Estimated Glomerular Filtration Rate)
  // Simplified for prototype: (140 - age) * weightKg / (72 * creatinine)
  calculateEGFR: (age: number, weightKg: number, creatinine: number, isFemale: boolean): number => {
    if (creatinine === 0) return 0;
    
    let gfr = ((140 - age) * weightKg) / (72 * creatinine);
    if (isFemale) gfr *= 0.85;
    
    return parseFloat(gfr.toFixed(1));
  },

  // CHA2DS2-VASc score
  calculateCHA2DS2VASc: (data: { 
    age: number, 
    isFemale: boolean, 
    hasCHF: boolean, 
    hasHTN: boolean, 
    hasDiabetes: boolean, 
    hasStroke: boolean, 
    hasVascularDisease: boolean 
  }): number => {
    let score = 0;
    if (data.hasCHF) score += 1;
    if (data.hasHTN) score += 1;
    if (data.age >= 75) score += 2;
    else if (data.age >= 65) score += 1;
    if (data.hasDiabetes) score += 1;
    if (data.hasStroke) score += 2;
    if (data.hasVascularDisease) score += 1;
    if (data.isFemale) score += 1;
    return score;
  }
};
