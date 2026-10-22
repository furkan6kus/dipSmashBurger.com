// Gives the stylesheet and scripts in index.html a new ?v= stamp, so browsers fetch the new
// files instead of an old copy they kept. Run it after changing anything in assets/.
// Usage: node scripts/stamp.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const htmlPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
const v = new Date().toISOString().replace(/\D/g, '').slice(0, 12);
const html = readFileSync(htmlPath, 'utf8')
  .replace(/(href|src)="(assets\/[\w.-]+\.(?:css|js))(?:\?v=\w+)?"/g, `$1="$2?v=${v}"`);
writeFileSync(htmlPath, html);
console.log('assets stamped', v);
