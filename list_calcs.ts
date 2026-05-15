import * as fs from 'fs';

const filePath = 'src/data/calculators.ts';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',([\s\S]*?)generic_input([\s\S]*?)\}/g;
let match;
let count = 0;
while ((match = regex.exec(content)) !== null) {
  console.log(`- ${match[1]}: ${match[2]}`);
  count++;
}
console.log(`Total: ${count}`);
