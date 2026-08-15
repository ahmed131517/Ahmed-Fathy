const fs = require('fs');
let text = fs.readFileSync('src/data/diagnosisMappings.ts', 'utf8');

const lastIndexOfCommonCold = text.lastIndexOf('{    id: "common_cold"');
// No need to overcomplicate it, if the build worked just keep it, or let's clean it up quickly.
