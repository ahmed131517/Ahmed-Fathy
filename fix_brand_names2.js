import fs from 'fs';

let content = fs.readFileSync('src/data/medications.ts', 'utf8');

// replace "Brand (" with " (" in the context of tradeName
content = content.replace(/tradeName:\s*"([^"]+)"/g, (match, val) => {
    // If val ends with ")", and has "Brand (", we replace "Brand (" with " ("
    // E.g. "KetoconazoleBrand (Ketoconazole)" -> "Ketoconazole (Ketoconazole)"
    // Or just global replace "Brand (" with " (" inside the matched val
    let newVal = val.replace(/Brand \(/g, ' (');
    return `tradeName: "${newVal}"`;
});

fs.writeFileSync('src/data/medications.ts', content);
