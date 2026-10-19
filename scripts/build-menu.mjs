// Writes the menu from menu.json into index.html.
// Usage: node scripts/build-menu.mjs
// index.html keeps the layout; this only replaces the parts between the <!-- menu:... --> markers.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const menu = JSON.parse(readFileSync(join(root, 'menu.json'), 'utf8'));
const htmlPath = join(root, 'index.html');
let html = readFileSync(htmlPath, 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tl = (n) => `${n} ₺`;

function replace(marker, content) {
  const re = new RegExp(`(<!-- ${marker} -->)[\\s\\S]*?(<!-- /${marker} -->)`);
  if (!re.test(html)) throw new Error(`Marker not found in index.html: ${marker}`);
  html = html.replace(re, `$1${content}$2`);
}

function item(it) {
  const tag = it.new ? ' <span class="tag">Yeni</span>' : '';
  const desc = it.desc ? `\n          <p class="item-desc">${esc(it.desc)}</p>` : '';
  return `
        <li class="item">
          <h3 class="item-head"><span class="item-name">${esc(it.name)}${tag}</span> <span class="price">${tl(it.price)}</span></h3>${desc}
        </li>`;
}

for (const cat of menu.categories) {
  replace(`menu:${cat.id}`, cat.items.map(item).join('') + '\n      ');
  if (html.includes(`<!-- range:${cat.id} -->`)) {
    const prices = cat.items.map((i) => i.price);
    const lo = Math.min(...prices), hi = Math.max(...prices);
    const span = lo === hi ? tl(lo) : `${lo}–${tl(hi)}`;
    replace(`range:${cat.id}`, `${cat.items.length} çeşit · ${span}`);
  }
  if (cat.extra) replace(`extra:${cat.id}`, `${esc(cat.extra.label)} <b>+${tl(cat.extra.price)}</b>`);
}
replace('menu-option', `+${tl(menu.menuOption.price)}`);
replace('menu-data', `\n  <script type="application/json" id="menu-data">${JSON.stringify(menu)}</script>\n  `);

writeFileSync(htmlPath, html);
console.log('index.html updated from menu.json');
