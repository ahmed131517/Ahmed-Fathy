import fs from 'fs';

let content = fs.readFileSync('src/data/medications.ts', 'utf8');

// We want to replace tradeName: "SomethingBrand (Something)" with tradeName: "Something (Something)"
content = content.replace(/tradeName:\s*"([^"]+)Brand\s*\(([^)]+)\)"/g, (match, namePart, genericPart) => {
    return `tradeName: "${namePart} (${genericPart})"`;
});

fs.writeFileSync('src/data/medications.ts', content);
