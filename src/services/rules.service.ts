import { ClinicalRule, RuleCondition, Operator } from '../types/rules';

/**
 * RulesEngineService evaluates clinical data against predefined rule sets.
 */

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const evaluateCondition = (obj: any, condition: RuleCondition): boolean => {
  const actualValue = getNestedValue(obj, condition.field);
  
  switch (condition.operator) {
    case '>': return actualValue > condition.value;
    case '<': return actualValue < condition.value;
    case '===': return actualValue === condition.value;
    case 'includes': return Array.isArray(actualValue) && actualValue.includes(condition.value);
    case 'not_includes': return Array.isArray(actualValue) && !actualValue.includes(condition.value);
    default: return false;
  }
};

export const RulesEngineService = {
  
  /**
   * Evaluates if any rules are triggered by clinical data.
   */
  evaluateRules(clinicalData: any, rules: ClinicalRule[]): ClinicalRule[] {
    return rules.filter(rule => {
      const results = rule.conditions.map(cond => evaluateCondition(clinicalData, cond));
      return rule.logic === 'AND' 
        ? results.every(r => r) 
        : results.some(r => r);
    });
  }
};
