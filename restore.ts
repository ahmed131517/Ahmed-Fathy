import { execSync } from 'child_process';
execSync('git checkout -- src/data/calculators.ts');
console.log('Restored!');
