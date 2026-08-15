import fs from 'fs';

let content = fs.readFileSync('src/data/medications.ts', 'utf8');

// I will just use a generic regex to replace name: "..." with generic_name: "...", trade_name: "Brand (...)"
// But wait, there are forms as well: name: "10mg tablet". We should only replace the top-level name.
// We can parse the TS file as text or just use a simpler approach.
