const fs = require('fs');
let content = fs.readFileSync('src/services/medicationService.ts', 'utf8');
content = content.replace(
  /await db\.drug_brands\.bulkAdd\(\[\s*([\s\S]*?)\s*\]\);/,
  (match, p1) => {
    return match; // I'll just look at what I need to do
  }
);
