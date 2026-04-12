/**
 * Drug-Drug Interaction (DDI) Service
 * Integrates with RxNav (NLM) API as a verified clinical database.
 */

export interface InteractionResult {
  source: 'Verified Database' | 'AI Insight' | 'Local Database';
  severity: 'Major' | 'Moderate' | 'Minor' | 'Unknown';
  description: string;
  drugs: string[];
}

export const ddiService = {
  /**
   * Resolves a drug name to an RxNorm Concept Unique Identifier (RxCUI).
   */
  async getRxCui(drugName: string): Promise<string | null> {
    try {
      const response = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName)}`);
      
      if (!response.ok) {
        console.warn(`RxNav getRxCui returned ${response.status} for ${drugName}`);
        return null;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(`RxNav getRxCui returned non-JSON response for ${drugName}`);
        return null;
      }

      const data = await response.json();
      
      if (data.idGroup && data.idGroup.rxnormId) {
        return data.idGroup.rxnormId[0];
      }
      return null;
    } catch (error) {
      console.error(`Failed to resolve RxCUI for ${drugName}:`, error);
      return null;
    }
  },

  /**
   * Fetches interactions for a list of drug names using RxNav API.
   */
  async getVerifiedInteractions(drugNames: string[]): Promise<InteractionResult[]> {
    if (drugNames.length < 2) return [];

    // 1. Resolve all drug names to RxCUIs
    const cuiMap = new Map<string, string>();
    await Promise.all(drugNames.map(async (name) => {
      const cui = await this.getRxCui(name);
      if (cui) cuiMap.set(cui, name);
    }));

    const cuis = Array.from(cuiMap.keys());
    if (cuis.length < 2) return [];

    // 2. Fetch interactions
    try {
      const response = await fetch(`https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${cuis.join('+')}`);
      
      if (!response.ok) {
        console.warn(`RxNav getVerifiedInteractions returned ${response.status}`);
        return [];
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(`RxNav getVerifiedInteractions returned non-JSON response`);
        return [];
      }

      const data = await response.json();
      
      const results: InteractionResult[] = [];

      if (data.fullInteractionTypeGroup) {
        data.fullInteractionTypeGroup.forEach((group: any) => {
          group.fullInteractionType.forEach((type: any) => {
            type.interactionPair.forEach((pair: any) => {
              const severity = pair.severity === 'high' ? 'Major' : pair.severity === 'medium' ? 'Moderate' : 'Minor';
              
              results.push({
                source: 'Verified Database',
                severity: severity as any,
                description: pair.description,
                drugs: pair.interactionConcept.map((c: any) => c.minorspc.name)
              });
            });
          });
        });
      }

      return results;
    } catch (error) {
      console.error("Failed to fetch verified interactions:", error);
      return [];
    }
  }
};
