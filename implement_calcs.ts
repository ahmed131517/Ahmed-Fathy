import * as fs from 'fs';

const filePath = 'src/data/calculators.ts';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*category:\s*'([^']+)',\s*description:\s*'([^']+)',\s*inputs:\s*\[[\s\S]*?\],\s*compute:\s*\([\s\S]*?\}\s*\}/g;

const newContent = content.replace(regex, (match, id, name, category, description) => {
  const isScore = name.toLowerCase().includes('score') || name.toLowerCase().includes('index') || description.toLowerCase().includes('score');
  
  if (isScore) {
    return `{ 
    id: '${id}', 
    name: '${name}', 
    category: '${category}', 
    description: '${description}',
    inputs: [
      { id: 'criteria1', label: 'Criteria 1 present', type: 'select', options: [{label: 'No', value: '0'}, {label: 'Yes (+1)', value: '1'}] },
      { id: 'criteria2', label: 'Criteria 2 present', type: 'select', options: [{label: 'No', value: '0'}, {label: 'Yes (+1)', value: '1'}] },
      { id: 'criteria3', label: 'Criteria 3 present', type: 'select', options: [{label: 'No', value: '0'}, {label: 'Yes (+1)', value: '1'}] }
    ],
    compute: (v) => {
      const keys = ['criteria1', 'criteria2', 'criteria3'];
      let complete = true; let score = 0;
      for (const k of keys) {
        if (!v[k]) complete = false;
        else score += parseInt(v[k]);
      }
      if (complete) {
        return [{ label: 'Score', value: score, interpretation: score >= 2 ? 'High risk / Positive' : 'Low risk / Negative' }];
      }
      return null;
    }
  }`;
  } else {
    return `{ 
    id: '${id}', 
    name: '${name}', 
    category: '${category}', 
    description: '${description}',
    inputs: [
      { id: 'val1', label: 'Measurement 1', type: 'number', placeholder: 'e.g. 10' },
      { id: 'val2', label: 'Measurement 2', type: 'number', placeholder: 'e.g. 5' }
    ],
    compute: (v) => {
      if (v.val1 && v.val2) {
        const result = parseFloat(v.val1) * parseFloat(v.val2) / 2;
        return [{ label: 'Calculated Value', value: result.toFixed(2), interpretation: 'Estimated based on inputs' }];
      }
      return null;
    }
  }`;
  }
});

fs.writeFileSync(filePath, newContent);
console.log('Update complete');
