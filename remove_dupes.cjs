const fs = require('fs');
const path = 'src/data/diagnosisMappings.ts';
let text = fs.readFileSync(path, 'utf8');

// The array is COMMON_DIAGNOSES.
// We can just parse the file text, or do a quick regex.
// Actually, let's just parse it if we were in TS, but we are in a script.
// A simpler way: split by `id: "common_cold"` and keep only the first occurrence.
let firstIndex = text.indexOf('id: "common_cold"');
let firstPart = text.substring(0, firstIndex);
let rest = text.substring(firstIndex);

// Keep the first object
let nextBracket = rest.indexOf('}');
let afterFirstCold = rest.substring(nextBracket + 1);

// Now remove any remaining `{ id: "common_cold" ... }`
afterFirstCold = afterFirstCold.replace(/,\s*{\s*id:\s*"common_cold"[\s\S]*?(?=,\s*{|\]\s*;)/g, '');

fs.writeFileSync(path, firstPart + rest.substring(0, nextBracket + 1) + afterFirstCold, 'utf8');
console.log("Cleaned duplicates");
