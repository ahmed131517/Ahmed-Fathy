import fs from 'fs';
import path from 'path';

const root = './src';

const chartContainerImport = `import { ChartContainer } from '@/components/ui/ChartContainer';`;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes('<ResponsiveContainer')) return;
  if (!content.includes('recharts')) return;

  let changed = false;

  // Add import if not present
  if (!content.includes('ChartContainer')) {
    const importMatch = content.match(/import.*recharts.*/);
    if (importMatch) {
      content = content.replace(importMatch[0], importMatch[0] + '\n' + chartContainerImport);
      changed = true;
    }
  }

  // We want to replace <ResponsiveContainer ...> with <ChartContainer><ResponsiveContainer ...>
  // But wait! We might end up with duplicate ChartContainers if some already exist, or if we wrap the div itself instead of substituting.
  // Actually, replacing <div ...> that directly contains ResponsiveContainer is tricky.
  // Instead, let's just use regex to wrap ResponsiveContainer with ChartContainer ONLY IF it's not already wrapped by ChartContainer.
  
  // We can do this:
  // Find `<ResponsiveContainer`, look backwards. If it's `>ChartContainer<`, do nothing. Then find `</ResponsiveContainer>`. Wrap.
  const rcRegex = /(<ResponsiveContainer[^>]*>[\s\S]*?<\/ResponsiveContainer>)/g;
  let newContent = content.replace(rcRegex, (match) => {
    // Check if it's already wrapped.
    // We can't easily look back, but we can do a naive wrap and then fix duplicate `<ChartContainer><ChartContainer>` later?
    changed = true;
    // Just replace it.
    return `<ChartContainer height={300}>\n${match}\n</ChartContainer>`;
  });

  // Now, if we wrapped it inside a div that we previously added "h-[300px]", we might have `<div className="... h-[300px] ..."><ChartContainer><ResponsiveContainer...`.
  // That's fine! 
  // Let's remove duplicate ChartContainers just in case:
  newContent = newContent.replace(/<ChartContainer[^>]*>\s*<ChartContainer[^>]*>/g, '<ChartContainer height={300}>');
  newContent = newContent.replace(/<\/ChartContainer>\s*<\/ChartContainer>/g, '</ChartContainer>');

  // Also some ChartContainers we added manually earlier might have different heights, maybe keep the ones we added the first time.
  // Let's just fix the files we already changed. If we just wrap all <ResponsiveContainer> in <div className="w-full h-[300px] min-w-0">, maybe that's simpler!

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules')) walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walk(root);
