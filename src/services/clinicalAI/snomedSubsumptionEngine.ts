import { SNOMED_HIERARCHY_DICTIONARY, SNOMEDConcept } from '@/data/snomedHierarchy';

/**
 * Normalizes input terms or keys for fuzzy lookup against SNOMED concepts.
 */
function normalizeSnomedKey(key: string): string {
  if (!key) return '';
  return key.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Finds a matching SNOMEDConcept from the hierarchy dictionary.
 */
export function findSNOMEDConcept(termOrCode: string): SNOMEDConcept | undefined {
  if (!termOrCode) return undefined;
  const clean = normalizeSnomedKey(termOrCode);

  // 1. Direct SNOMED Code match
  if (SNOMED_HIERARCHY_DICTIONARY[termOrCode]) {
    return SNOMED_HIERARCHY_DICTIONARY[termOrCode];
  }

  // 2. Loop through concepts
  for (const concept of Object.values(SNOMED_HIERARCHY_DICTIONARY)) {
    if (concept.snomedCode === clean) return concept;
    if (normalizeSnomedKey(concept.canonicalKey) === clean) return concept;
    if (normalizeSnomedKey(concept.term) === clean) return concept;

    const synonymMatch = concept.synonyms.some(s => {
      const normSyn = normalizeSnomedKey(s);
      return normSyn === clean || clean.includes(normSyn) || normSyn.includes(clean);
    });

    if (synonymMatch) return concept;
  }

  return undefined;
}

/**
 * Recursively retrieves all ancestor SNOMED Concepts (parents, grandparents)
 * up the poly-hierarchical graph for a given concept.
 */
export function getSNOMEDAncestors(termOrCode: string): SNOMEDConcept[] {
  const concept = findSNOMEDConcept(termOrCode);
  if (!concept) return [];

  const visitedCodes = new Set<string>();
  const ancestors: SNOMEDConcept[] = [];

  function traverse(current: SNOMEDConcept) {
    if (!current || !current.parentCodes) return;

    for (const parentCode of current.parentCodes) {
      if (visitedCodes.has(parentCode)) continue;
      visitedCodes.add(parentCode);

      const parentConcept = SNOMED_HIERARCHY_DICTIONARY[parentCode];
      if (parentConcept) {
        ancestors.push(parentConcept);
        traverse(parentConcept); // Recursive poly-hierarchical traversal
      }
    }
  }

  traverse(concept);
  return ancestors;
}

export interface SubsumptionMatchResult {
  isMatch: boolean;
  childConcept?: SNOMEDConcept;
  parentConcept?: SNOMEDConcept;
  relationshipPath: string; // e.g. "Precordial Squeezing ➔ Chest Pain (SNOMED: 29857009)"
}

/**
 * Checks whether childInput is subsumed by (is a child or descendant of) parentInput
 * in the SNOMED CT poly-hierarchical ontology graph.
 */
export function checkSNOMEDSubsumption(
  childInput: string,
  parentInput: string
): SubsumptionMatchResult {
  if (!childInput || !parentInput) {
    return { isMatch: false, relationshipPath: '' };
  }

  const childConcept = findSNOMEDConcept(childInput);
  const parentConcept = findSNOMEDConcept(parentInput);

  const cleanChild = normalizeSnomedKey(childInput);
  const cleanParent = normalizeSnomedKey(parentInput);

  // 1. Direct identity match
  if (cleanChild && cleanParent && cleanChild === cleanParent) {
    return {
      isMatch: true,
      childConcept,
      parentConcept,
      relationshipPath: `Direct Concept Match: ${childInput}`
    };
  }

  if (childConcept && parentConcept) {
    if (childConcept.snomedCode === parentConcept.snomedCode) {
      return {
        isMatch: true,
        childConcept,
        parentConcept,
        relationshipPath: `Exact SNOMED Code Match (${childConcept.snomedCode})`
      };
    }

    // Traversal check
    const ancestors = getSNOMEDAncestors(childConcept.snomedCode);
    const matchedAncestor = ancestors.find(a => a.snomedCode === parentConcept.snomedCode || a.canonicalKey === parentConcept.canonicalKey);

    if (matchedAncestor) {
      return {
        isMatch: true,
        childConcept,
        parentConcept,
        relationshipPath: `Subsumed via SNOMED CT: ${childConcept.term} ➔ ${matchedAncestor.term} (${matchedAncestor.snomedCode})`
      };
    }
  }

  // Fallback: If parentInput is a canonical string like "chest_pain" or "sore_throat" or "dyspnea", check if childConcept's ancestors match that canonical key
  if (childConcept) {
    const ancestors = getSNOMEDAncestors(childConcept.snomedCode);
    const matchedByCanonical = ancestors.find(a => 
      a.canonicalKey === cleanParent || 
      normalizeSnomedKey(a.term) === cleanParent ||
      a.canonicalKey.replace(/_/g, '') === cleanParent
    );

    if (matchedByCanonical) {
      return {
        isMatch: true,
        childConcept,
        parentConcept: matchedByCanonical,
        relationshipPath: `Subsumed via SNOMED CT: ${childConcept.term} ➔ ${matchedByCanonical.term} (${matchedByCanonical.snomedCode})`
      };
    }
  }

  return { isMatch: false, relationshipPath: '' };
}
