const fs = require('fs');
let text = fs.readFileSync('src/data/diagnosisMappings.ts', 'utf8');

// fix double commas
text = text.replace(/},,\s*{/g, '},\n  {');
text = text.replace(/\[\s*,\s*{/g, '[\n    {');
text = text.replace(/}\s*,\s*,\s*{/g, '},\n    {');
text = text.replace(/}\s*,\s*{ id: 'pe_/g, '},\n    { id: \'pe_');

// For endocarditis:
const endocarditisStr = 'redFlagsStructured: [\n    ,\n  { id: \\\'endo_stroke\\\', description: "Sudden weakness or speech difficulty (embolic stroke)", triageAction: \\\'Emergency\\\', urgencyLevel: 1 },\n  {\n    id: "common_cold"';

const replacement = 'redFlagsStructured: [\\n      { id: \\\'endo_stroke\\\', description: "Sudden weakness or speech difficulty (embolic stroke)", triageAction: \\\'Emergency\\\', urgencyLevel: 1 }\\n    ],\\n    icd10: "I33.0",\\n    prevalenceScore: 3,\\n    triagePriority: 2\\n  },\\n  {\\n    id: "common_cold"';

// Wait, doing this with regex is safer.
text = text.replace(
  /redFlagsStructured:\s*\[[\s\S]*?id:\s*'endo_stroke'[^}]+},\s*{\s*id:\s*"common_cold"/g,
  'redFlagsStructured: [\n      { id: \\\'endo_stroke\\\', description: "Sudden weakness or speech difficulty (embolic stroke)", triageAction: \\\'Emergency\\\', urgencyLevel: 1 }\n    ],\n    icd10: "I33.0",\n    prevalenceScore: 3,\n    triagePriority: 2\n  },\n  {\n    id: "common_cold"'
);

fs.writeFileSync('src/data/diagnosisMappings.ts', text, 'utf8');
