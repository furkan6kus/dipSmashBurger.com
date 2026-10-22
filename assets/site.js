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
