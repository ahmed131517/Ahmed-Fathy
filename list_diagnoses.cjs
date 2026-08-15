const fs = require('fs');
const content = fs.readFileSync('src/data/diagnosisMappings.ts', 'utf8');
const matches = content.match(/id:\s*['"]([^'"]+)['"]/g);
console.log(matches.join('\n'));
