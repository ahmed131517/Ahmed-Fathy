import { findClinicalMedicationByName, CLINICAL_KNOWLEDGE_BASE } from '../medications';
import { EgyptianBrand, ClinicalMedication } from '../types/medication';

export interface EgyptianBrandSearchResponse {
  genericName: string;
  drugClass: string;
  brands: EgyptianBrand[];
  averagePriceEgp: number;
  hasShortage: boolean;
  isGenericFullyStockedOut: boolean;
  shortageBrands: EgyptianBrand[];
  inStockBrands: EgyptianBrand[];
  
  // Bioequivalent alternatives: same generic, other active in-stock brands
  bioequivalentAlternatives: EgyptianBrand[];
  
  // Therapeutic alternatives: different generic, same class, fully in-stock brands
  therapeuticAlternatives: Array<{
    genericName: string;
    brand: EgyptianBrand;
  }>;
}

export function searchEgyptianBrands(medicationName: string): EgyptianBrandSearchResponse {
  const med = findClinicalMedicationByName(medicationName);
  
  if (!med) {
    // Return a structured empty state
    return {
      genericName: medicationName,
      drugClass: 'General Therapeutic Class',
      brands: [],
      averagePriceEgp: 0,
      hasShortage: false,
      isGenericFullyStockedOut: false,
      shortageBrands: [],
      inStockBrands: [],
      bioequivalentAlternatives: [],
      therapeuticAlternatives: []
    };
  }

  const brands = med.egyptian_brands || [
    {
      brand_name: `${med.generic_name} 500mg`,
      company: 'Generic Egyptian Pharma',
      price_egp: med.Price || 40.0,
      availability: 'Available',
      dosage_forms: ['Tablet']
    }
  ];

  const totalPrice = brands.reduce((acc, b) => acc + b.price_egp, 0);
  const averagePriceEgp = Math.round((totalPrice / brands.length) * 10) / 10;
  
  // Classify local brands
  const shortageBrands = brands.filter(b => b.availability === 'Shortage' || b.availability === 'Discontinued');
  const inStockBrands = brands.filter(b => b.availability === 'Available');
  
  const hasShortage = shortageBrands.length > 0;
  const isGenericFullyStockedOut = inStockBrands.length === 0;

  // Bioequivalent alternatives (other available brands for the SAME generic drug)
  // If the searched keyword was a specific brand name or just the generic name,
  // we can show other in-stock brands of this generic.
  const bioequivalentAlternatives = inStockBrands;

  // Therapeutic alternatives (other drugs in the same class that are fully available)
  const therapeuticAlternatives: Array<{ genericName: string; brand: EgyptianBrand }> = [];
  
  if (med.Drug_Class) {
    const classMeds = CLINICAL_KNOWLEDGE_BASE.filter(
      m => m.Drug_Class.toLowerCase() === med.Drug_Class.toLowerCase() && m.id !== med.id
    );
    
    for (const alternativeMed of classMeds) {
      if (alternativeMed.egyptian_brands) {
        const availableAltBrands = alternativeMed.egyptian_brands.filter(b => b.availability === 'Available');
        for (const altBrand of availableAltBrands) {
          therapeuticAlternatives.push({
            genericName: alternativeMed.generic_name,
            brand: altBrand
          });
        }
      }
    }
  }

  return {
    genericName: med.generic_name,
    drugClass: med.Drug_Class,
    brands,
    averagePriceEgp,
    hasShortage,
    isGenericFullyStockedOut,
    shortageBrands,
    inStockBrands,
    bioequivalentAlternatives,
    therapeuticAlternatives: therapeuticAlternatives.slice(0, 4) // cap at 4 therapeutic alternatives for elegant layout
  };
}
