// Dip's character eats his way through the menu as you scroll, drawn in white lines on the green.
// Frames are small transparent WebPs (assets/character/{720,480}/NNN.webp) drawn on one fixed
// canvas, so scrolling moves the video forward and back smoothly on every phone.
// Each part of the menu is pinned to a moment of the video (ANCHORS): burger, fries, cola, cookie.
// He stands in one place on the screen (see .char-stage in site.css); only the video moves.

(() => {
  const stage = document.querySelector('.char-stage');
  const canvas = stage && stage.querySelector('canvas');
  if (!canvas || !window.requestAnimationFrame) return;
  const ctx = canvas.getContext('2d');

  const FPS = 15, FRAMES = 150, END = (FRAMES - 1) / FPS;
  const wide = matchMedia('(min-width: 900px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const size = () => (wide.matches ? 720 : 480);
  const src = (i) => `assets/character/${size()}/${String(i).padStart(3, '0')}.webp`;

  const q = (s) => document.querySelector(s);
  const menu = q('#menu');
  const ANCHORS = [
    ['#smash', 'top', 0],
    ['#tavuk', 'top', 2.9],
    ['#tavuk .items', 'bottom', 5.1],             // past the last burger the fries are handed over,
    ['.sheet-first .sheet-body', 'bottom', 5.45], // so they are in his hands as their heading comes up
    ['#kizartmalar', 'top', 5.7],
    ['#soslar', 'top', 6.0],
    ['#icecekler', 'top', 6.7],
    ['#tatli', 'top', 8.4],
    ['.sheet-second .sheet-body', 'bottom', END],
  ].map(([sel, edge, t]) => ({ el: q(sel), edge, t })).filter((a) => a.el);

  // with reduced motion: one still per scene, no in-betweens
  const STILLS = [[5.0, 1.9], [6.6, 5.6], [8.4, 7.8], [Infinity, 9.4]];
  const still = (t) => STILLS.find(([until]) => t <= until)[1];

  // ---------- frames: loaded nearest-first once the menu is close ----------
  let frames = [], loadedSize = 0, wanted = 0, inflight = 0, started = false;
  function reset() {
    frames = new Array(FRAMES).fill(null);
    loadedSize = size();
    canvas.width = canvas.height = loadedSize;
    drawn = -1;
  }
  function pump() {
    while (started && inflight < 6) {
      // the closest frame to where the reader is that is not loaded yet
      let pick = -1;
      for (let d = 0; d < FRAMES && pick < 0; d++) {
        for (const i of [wanted + d, wanted - d]) {
          if (i >= 0 && i < FRAMES && !frames[i]) { pick = i; break; }
        }
      }
      if (pick < 0) return;
      const im = new Image(), forSize = loadedSize;
      frames[pick] = im;
      inflight++;
      im.onload = im.onerror = () => {
        inflight--;
        if (forSize !== loadedSize) return;
        im.ready = im.naturalWidth > 0;
        if (Math.abs(pick - wanted) < 3) kick();
        pump();
      };
      im.decoding = 'async';
      im.src = src(pick);
    }
  }
  // the nearest frame that has arrived, so the character never disappears while others load
  function nearestReady(i) {
    for (let d = 0; d < FRAMES; d++) {
      for (const j of [i - d, i + d]) if (frames[j] && frames[j].ready) return j;
    }
    return -1;
  }

  // ---------- where the reader is, in video seconds ----------
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

  let cur = 0, drawn = -1, raf = 0;
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }
  function tick() {
    raf = 0;
    if (loadedSize !== size()) { reset(); pump(); }
    const m = menu.getBoundingClientRect(), vh = innerHeight;
    if (!started && m.top < vh * 2.5) { started = true; pump(); }

    let target = pageTime();
    if (reduce.matches) { target = still(target); cur = target; }
    const d = target - cur;
    cur = Math.abs(d) < 0.02 ? target : cur + d * 0.2; // ease, so a fast flick still reads as motion
    const i = Math.max(0, Math.min(FRAMES - 1, Math.round(cur * FPS)));
    if (i !== wanted) { wanted = i; pump(); }

    const j = frames[i] && frames[i].ready ? i : nearestReady(i);
    if (j >= 0 && j !== drawn) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frames[j], 0, 0, canvas.width, canvas.height);
      drawn = j;
    }
    if (cur !== target) kick(); // a frame still loading calls kick() itself when it arrives
  }

  reset();
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  wide.addEventListener?.('change', kick);
  reduce.addEventListener?.('change', kick);
  kick();
})();
