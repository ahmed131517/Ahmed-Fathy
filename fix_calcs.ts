import * as fs from 'fs';

let content = fs.readFileSync('src/data/calculators.ts', 'utf8');

// The string `},` followed by whitespace and `return null; } },`
const doubleEndRegex = /\},\s*return null;\s*\}\s*\},/g;
content = content.replace(doubleEndRegex, '},');

fs.writeFileSync('src/data/calculators.ts', content);
console.log('Fixed double ends!');
