
import fs from 'fs';
import path from 'path';

const root = './src';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes('ChartContainer')) return;
  
  // 1. Replace import
  content = content.replace(/import { ChartContainer } from '.*';/g, "import { ChartWrapper } from '@/components/ui/ChartWrapper';");
  
  // 2. Replace component tag
  // Need to be careful with <ChartContainer ....> and </ChartContainer>
  content = content.replace(/<ChartContainer/g, '<ChartWrapper');
  content = content.replace(/<\/ChartContainer>/g, '</ChartWrapper>');

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${filePath}`);
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
