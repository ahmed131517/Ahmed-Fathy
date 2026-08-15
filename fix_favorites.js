import fs from 'fs';

let content = fs.readFileSync('src/components/prescriptions/FavoritesQuickBar.tsx', 'utf8');

// The brandName: '...' is inside objects. We can replace it using regex.
content = content.replace(/name:\s*'([^']+)',\s*brandName:\s*'([^']+)'/g, (match, name, brandName) => {
    // If brandName already contains the generic name, leave it.
    if (brandName.includes('(')) return match;
    // Otherwise format it
    // Wait, some brand names are 'Brand / Brand'. Let's just do `${brandName} (${name})`
    // but wait! The user asked for "Neurontin (Gabapentin)", so we just strip the dosage from the brand name if it's there.
    let baseBrand = brandName.split(' ')[0]; // or just use the full brandName
    // actually just use the whole brandName if it doesn't have the dosage, but it's safer to just append it:
    return `name: '${name}', brandName: '${brandName} (${name})'`;
});

fs.writeFileSync('src/components/prescriptions/FavoritesQuickBar.tsx', content);
