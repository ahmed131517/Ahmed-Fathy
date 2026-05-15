import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Ensure ChartContainer import if we use it
  // But wait, it's easier to just add 'w-full min-w-0' to parent div
  // if parent is just a div wrapping ResponsiveContainer.

  // Let's find: `<ResponsiveContainer`
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<ResponsiveContainer')) {
      // Look back a few lines to find the parent div
      for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
        if (lines[j].includes('<div ') && !lines[j].includes('min-w-0')) {
          lines[j] = lines[j].replace('className="', 'className="w-full min-w-0 ');
          changed = true;
          break;
        }
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walk('./src');
