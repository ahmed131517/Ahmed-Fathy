export type Operator = '>' | '<' | '===' | 'includes' | 'not_includes';

export interface RuleCondition {
  field: string; // E.g., 'vitals.bp_systolic' or 'medications'
  operator: Operator;
  value: any;
}

export interface ClinicalRule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  logic: 'AND' | 'OR';
  action: 'ALERT' | 'BLOCK';
  message: string;
  priority: 'low' | 'medium' | 'high';
}
