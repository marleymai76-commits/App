import { generateSistenfoxLogo } from './src/lib/logoGenerator';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

async function main() {
  console.log('Generating SISTENFOX logo...');
  const logoDataUrl = await generateSistenfoxLogo();
  
  if (!logoDataUrl) {
    console.error('Failed to generate logo.');
    process.exit(1);
  }

  const base64Data = logoDataUrl.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, 'base64');

  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), buffer);
  fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), buffer);

  console.log('Icons generated successfully in /public/icons/');
}

main().catch(console.error);
