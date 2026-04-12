const fs = require('fs');

const file = 'src/data/medications.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\{ id: "(form\d+)", name: "([^"]+)", minDose: ([^,]+), maxDose: ([^ \}]+) \}/g, 
  '{ id: "$1", name: "$2", minDose: $3, maxDose: $4, concentration: "", dosage: "", frequency: "", duration: "", instructions: "" }');

fs.writeFileSync(file, content);
console.log("Done");
