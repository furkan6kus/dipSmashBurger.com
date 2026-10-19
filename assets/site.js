// Dip Smash Burger: reveals, the menu bar, and the "Menü yap" builder.

const tl = (n) => `${n} ₺`;

// ---------- staggered lists: each item rises a beat after the one before ----------
document.querySelectorAll('[data-stagger]').forEach((list) => {
  [...list.children].forEach((el, i) => {
    el.dataset.reveal = '';
    el.style.setProperty('--i', String(i % 8));
  });
});

// ---------- reveal once on entering the screen; never leaves content hidden ----------
(() => {
  const targets = document.querySelectorAll('[data-reveal], .postcard-card');
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  targets.forEach((el) => io.observe(el));
  // safety net: anything on screen a few seconds after load is shown
  window.addEventListener('load', () => setTimeout(() => {
    targets.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
  }, 2500));
})();

// ---------- the menu bar marks the part you are reading ----------
(() => {
  const links = [...document.querySelectorAll('.catnav a')];
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const sections = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;
  let current = null;
  const set = (id) => {
    if (id === current) return;
    current = id;
    links.forEach((a) => a.removeAttribute('aria-current'));
    const a = byId.get(id);
    if (!a) return;
    a.setAttribute('aria-current', 'true');
    // keep the active tab in view on a phone without moving the page
    const bar = a.parentElement.parentElement;
    const left = a.offsetLeft - bar.clientWidth / 2 + a.clientWidth / 2;
    bar.scrollTo({ left, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  const io = new IntersectionObserver((entries) => {
    const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible[0]) set(visible[0].target.id);
  }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
  sections.forEach((s) => io.observe(s));
})();

// ---------- "Menü yap": choose a burger, see the bill ----------
(() => {
  const root = document.querySelector('[data-builder]');
  const dataEl = document.getElementById('menu-data');
  if (!root || !dataEl) return;
  const data = JSON.parse(dataEl.textContent);
  const cat = (id) => data.categories.find((c) => c.id === id);
  const beef = cat('smash'), chicken = cat('tavuk'), sauces = cat('soslar');
  const burgers = [
    ...beef.items.map((it) => ({ ...it, extra: beef.extra })),
    ...chicken.items.map((it) => ({ ...it, extra: chicken.extra })),
  ];

  const form = root.querySelector('form');
  const burgerBox = root.querySelector('[data-burgers]');
  const sauceBox = root.querySelector('[data-sauces]');
  const extraLabel = root.querySelector('[data-extra-label]');
  const linesEl = root.querySelector('[data-lines]');
  const totalEl = root.querySelector('[data-total]');
  const miniEl = root.querySelector('[data-total-mini]');
  const sumEl = root.querySelector('[data-sum]');
  const receiptEl = root.querySelector('.receipt');
  // on a phone the bill sits below the choices: a small total follows you until the bill is in view
  if (sumEl && receiptEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => sumEl.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0.35 }).observe(receiptEl);
  }

  const chip = (type, name, value, label, price, checked) => {
    const l = document.createElement('label');
    l.className = 'chip';
    l.innerHTML = `<input type="${type}" name="${name}" value="${value}"${checked ? ' checked' : ''}><span>${label} <small>${tl(price)}</small></span>`;
    return l;
  };
  burgers.forEach((b, i) => burgerBox.append(chip('radio', 'burger', i, b.name, b.price, i === 0)));
  sauces.items.forEach((s, i) => sauceBox.append(chip('checkbox', 'sauce', i, s.name, s.price, false)));

  let lastKeys = new Set();
  let lastTotal = null;
  const render = () => {
    const f = new FormData(form);
    const b = burgers[Number(f.get('burger') ?? 0)];
    extraLabel.textContent = `${b.extra.label} +${tl(b.extra.price)}`;
    const lines = [[b.name, b.price]];
    if (f.get('extra')) lines.push([b.extra.label, b.extra.price]);
    if (f.get('menu')) lines.push([`Menü: ${data.menuOption.includes.toLowerCase()}`, data.menuOption.price]);
    f.getAll('sauce').forEach((i) => { const s = sauces.items[Number(i)]; lines.push([s.name, s.price]); });

    const keys = new Set(lines.map(([n]) => n));
    linesEl.replaceChildren(...lines.map(([name, price]) => {
      const li = document.createElement('li');
      if (lastKeys.size && !lastKeys.has(name)) li.className = 'is-new';
      li.innerHTML = '<span></span><span></span>';
      li.children[0].textContent = name;
      li.children[1].textContent = tl(price);
      return li;
    }));
    lastKeys = keys;

    const total = lines.reduce((sum, [, p]) => sum + p, 0);
    totalEl.textContent = tl(total);
    if (miniEl) miniEl.textContent = tl(total);
    if (lastTotal !== null && total !== lastTotal) {
      totalEl.classList.remove('bump'); void totalEl.offsetWidth; totalEl.classList.add('bump');
    }
    lastTotal = total;
  };
  form.addEventListener('change', render);
  form.addEventListener('submit', (e) => e.preventDefault());
  render();
})();
