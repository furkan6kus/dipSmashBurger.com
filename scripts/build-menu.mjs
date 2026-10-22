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

// an item with a photo gets a picture beside it; tapping it opens the frames to turn (assets/spin.js)
function photo(it) {
  const dir = `assets/products/${it.photo}`;
  const meta = JSON.parse(readFileSync(join(root, dir, 'frames.json'), 'utf8'));
  return `
          <button class="item-thumb" type="button" data-spin="${dir}" data-frames="${meta.frames}" data-poster="${meta.poster}" aria-label="${esc(it.name)}: fotoğrafı aç, parmağınla çevir">
            <img src="${dir}/thumb.webp" alt="" width="120" height="120" loading="lazy" decoding="async">
            <span class="thumb-badge" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6M17.7 2.6v3.8h-3.8M6.3 21.4v-3.8h3.8"/></svg></span>
          </button>`;
}

function item(it) {
  const tag = it.new ? ' <span class="tag">Yeni</span>' : '';
  const desc = it.desc ? `\n          <p class="item-desc">${esc(it.desc)}</p>` : '';
  const head = `
          <h3 class="item-head"><span class="item-name">${esc(it.name)}${tag}</span> <span class="price">${tl(it.price)}</span></h3>${desc}`;
  if (it.photo) {
    return `
        <li class="item item-photo">${photo(it)}
          <div class="item-text">${head.replace(/\n {10}/g, '\n            ')}
          </div>
        </li>`;
  }
  return `
        <li class="item">${head}
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
if (menu.menuOption && html.includes('<!-- menu-option -->')) {
  const o = menu.menuOption;
  replace('menu-option', `Her burger menü olur: ${esc(o.includes.toLocaleLowerCase('tr'))} <b>+${tl(o.price)}</b>`);
}

writeFileSync(htmlPath, html);
console.log('index.html updated from menu.json');
