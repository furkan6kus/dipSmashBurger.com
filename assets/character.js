// Dip's character eats his way through the menu as you scroll.
// The video is stored as sprite sheets (assets/character/480-N.webp, 25 frames each, 5x5) and
// drawn one frame at a time on a canvas, so scrolling moves it forward and back on every phone.
// Wide screens: one card per sheet stays beside the menu and follows the whole page.
// Narrow screens: a card at the head of each part plays that part's scene as it passes.

(() => {
  const cards = [...document.querySelectorAll('[data-char]')];
  if (!cards.length || !window.requestAnimationFrame) return;

  const FPS = 15, FRAMES = 150, COLS = 5, PER = 25, SIZE = 480, END = (FRAMES - 1) / FPS;
  const SRC = (k) => `assets/character/480-${k}.webp`;
  const wide = matchMedia('(min-width: 900px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // seconds in the video where each part of the menu starts (wide screens)
  const ANCHORS = [
    ['#smash', 'top', 0],
    ['#tavuk', 'top', 2.9],
    ['.sheet-first .sheet-body', 'bottom', 4.2],
    ['#kizartmalar', 'top', 4.25],
    ['#soslar', 'top', 6.1],
    ['#icecekler', 'top', 6.7],
    ['#tatli', 'top', 8.4],
    ['.sheet-second .sheet-body', 'bottom', END],
  ].map(([sel, edge, t]) => ({ el: document.querySelector(sel), edge, t })).filter((a) => a.el);

  // with reduced motion: one still per scene, no in-betweens
  const STILLS = [[4.22, 1.9], [6.6, 5.4], [8.4, 7.8], [Infinity, 9.4]];
  const still = (t) => STILLS.find(([until]) => t <= until)[1];

  // ---------- sprite sheets, loaded when needed ----------
  const sheets = [];
  const sheet = (k) => {
    if (k < 0 || k >= Math.ceil(FRAMES / PER)) return null;
    if (!sheets[k]) {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => { im.ready = true; kick(); };
      im.src = SRC(k);
      sheets[k] = im;
    }
    return sheets[k];
  };
  const frameAt = (t) => Math.max(0, Math.min(FRAMES - 1, Math.round(t * FPS)));
  const sheetOf = (i) => Math.floor(i / PER);

  // ---------- one state per card ----------
  const states = cards.map((el) => {
    const canvas = el.querySelector('canvas');
    const seg = el.dataset.seg ? el.dataset.seg.split(',').map(Number) : null;
    return { el, canvas, ctx: canvas.getContext('2d'), seg, inline: el.dataset.char === 'inline', cur: seg ? seg[0] : 0, target: seg ? seg[0] : 0, drawn: -1, near: false };
  });

  // only work on cards that are on or near the screen
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const s = states.find((x) => x.el === e.target);
      s.near = e.isIntersecting;
      if (s.near) warm(s);
    }
    kick();
  }, { rootMargin: '600px 0px' });
  states.forEach((s) => io.observe(s.el));

  // start loading the frames a card will need before it is reached
  function warm(s) {
    if (s.inline) {
      const [a, b] = s.seg;
      for (let k = sheetOf(frameAt(a)); k <= sheetOf(frameAt(b)); k++) sheet(k);
    } else {
      for (let k = 0; k < Math.ceil(FRAMES / PER); k++) sheet(k);
    }
  }

  const active = (s) => s.near && (s.inline ? !wide.matches : wide.matches);

  // where the page is, in video seconds (wide screens)
  function pageTime() {
    const ref = innerHeight * 0.45;
    const pts = ANCHORS.map((a) => {
      const r = a.el.getBoundingClientRect();
      return [(a.edge === 'top' ? r.top : r.bottom) - ref, a.t];
    });
    if (pts[0][0] > 0) return pts[0][1];
    for (let i = 0; i < pts.length - 1; i++) {
      const [y0, t0] = pts[i], [y1, t1] = pts[i + 1];
      if (y1 > 0) return t0 + (t1 - t0) * (-y0 / Math.max(1, y1 - y0));
    }
    return pts[pts.length - 1][1];
  }

  // how far a narrow-screen card has travelled through the screen, in its own scene's seconds
  function cardTime(s) {
    const r = s.el.getBoundingClientRect(), vh = innerHeight;
    const start = vh * 0.92, end = vh * 0.1 - r.height * 0.25;
    const p = Math.max(0, Math.min(1, (start - r.top) / (start - end)));
    return s.seg[0] + (s.seg[1] - s.seg[0]) * p;
  }

  function draw(s, i) {
    const im = sheet(sheetOf(i));
    sheet(sheetOf(i) + 1); // the next one, before it is needed
    if (!im || !im.ready) return false;
    const j = i % PER, sx = (j % COLS) * SIZE, sy = Math.floor(j / COLS) * SIZE;
    const { width: w, height: h } = s.canvas;
    s.ctx.drawImage(im, sx, sy + (s.inline ? 6 : 0), SIZE, h, 0, 0, w, h);
    s.drawn = i;
    if (!s.el.classList.contains('is-live')) s.el.classList.add('is-live');
    return true;
  }

  let raf = 0;
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }
  function tick() {
    raf = 0;
    let moving = false;
    const t = wide.matches ? pageTime() : 0;
    for (const s of states) {
      if (!active(s)) continue;
      let target = s.inline ? cardTime(s) : t;
      if (reduce.matches) { target = still(target); s.cur = target; }
      s.target = target;
      // ease toward the scroll position so a fast flick still reads as motion
      const d = s.target - s.cur;
      s.cur = Math.abs(d) < 0.02 ? s.target : s.cur + d * 0.22;
      if (s.cur !== s.target) moving = true;
      const i = frameAt(s.cur);
      if (i !== s.drawn) draw(s, i); // if its sheet is still loading, onload calls kick() again
    }
    if (moving) kick();
  }

  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  wide.addEventListener?.('change', kick);
  reduce.addEventListener?.('change', kick);
  kick();
})();
