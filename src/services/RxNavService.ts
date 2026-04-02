export interface RxNavInteraction {
  severity: string;
  description: string;
  source: string;
}

export class RxNavService {
  private static BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

  static async getRxCUI(drugName: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/rxcui.json?name=${encodeURIComponent(drugName)}`);
      if (!response.ok) {
        console.warn(`RxNav RxCUI lookup failed for ${drugName}: ${response.status} ${response.statusText}`);
        return null;
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return null;
      }
      const data = await response.json();
      return data.idGroup?.rxnormId?.[0] || null;
    } catch (error) {
      console.error(`Error fetching RxCUI for ${drugName}:`, error);
      return null;
    }
  }

  static async getInteractions(rxcuis: string[]): Promise<RxNavInteraction[]> {
    if (rxcuis.length < 2) return [];
    
    try {
      const response = await fetch(`${this.BASE_URL}/interaction/list.json?rxcuis=${rxcuis.join('+')}`);
      if (!response.ok) {
        console.warn(`RxNav interaction lookup failed: ${response.status} ${response.statusText}`);
        return [];
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return [];
      }
      const data = await response.json();
      
      const interactions: RxNavInteraction[] = [];
      
      data.fullInteractionTypeGroup?.forEach((group: any) => {
        group.fullInteractionType?.forEach((type: any) => {
          type.interactionPair?.forEach((pair: any) => {
            interactions.push({
              severity: pair.severity || 'N/A',
              description: pair.description || 'No description available.',
              source: 'RxNav (NIH)'
            });
          });
        });
      });
      
      return interactions;
    } catch (error) {
      console.error('Error fetching interactions from RxNav:', error);
      return [];
    }
  }

  static async getDrugDetails(rxcui: string) {
    try {
      const [classRes, propRes] = await Promise.all([
        fetch(`${this.BASE_URL}/rxclass/class/byRxcui.json?rxcui=${rxcui}`),
        fetch(`${this.BASE_URL}/rxcui/${rxcui}/allProperties.json?prop=ALL`)
      ]);

      const classData = await classRes.json();
      const propData = await propRes.json();

      return {
        classes: classData.rxclassDrugInfoGroup?.rxclassDrugInfo || [],
        properties: propData.propConceptGroup?.propConcept || []
      };
    } catch (error) {
      console.error('Error fetching drug details:', error);
      return null;
    }
  }

  static async searchDrugs(term: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/displaynames.json`);
      const data = await response.json();
      const names = data.displayTermsList?.term || [];
      return names.filter((name: string) => name.toLowerCase().includes(term.toLowerCase())).slice(0, 10);
    } catch (error) {
      console.error('Error searching drugs:', error);
      return [];
    }
  }

  static async getDrugsByClass(classId: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/rxclass/classMembers.json?classId=${classId}&relaSource=ATC`);
      const data = await response.json();
      return data.drugMemberGroup?.drugMember?.map((m: any) => m.minConcept.name).slice(0, 20) || [];
    } catch (error) {
      console.error('Error fetching drugs by class:', error);
      return [];
    }
  }
}
