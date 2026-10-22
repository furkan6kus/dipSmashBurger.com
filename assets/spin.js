// A burger to turn with a finger. A tap on a photo (data-spin) opens the frames of its video;
// dragging left and right moves through them, so the burger turns. Frames load only on opening.

(() => {
  const dlg = document.querySelector('dialog.spin');
  const openers = document.querySelectorAll('[data-spin]');
  if (!dlg || !openers.length || typeof dlg.showModal !== 'function') return;
  const stage = dlg.querySelector('.spin-stage');
  const canvas = stage.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  let dir = '', n = 0, frames = [], pos = 0, drawn = -1, raf = 0, last = 0;
  let auto = 0, vel = 0, drag = null, opener = null;

  const src = (i) => `${dir}/frames/${String(i).padStart(3, '0')}.webp`;
  function load(from) {
    // nearest frames first, so turning works straight away
    for (let d = 0; d < n; d++) {
      for (const i of d ? [from - d, from + d] : [from]) {
        if (i < 0 || i >= n || frames[i]) continue;
        const im = new Image();
        frames[i] = im;
        im.decoding = 'async';
        im.onload = () => { im.ready = true; kick(); };
        im.src = src(i);
      }
    }
  }
  function nearestReady(i) {
    for (let d = 0; d < n; d++) for (const j of [i - d, i + d]) if (frames[j] && frames[j].ready) return j;
    return -1;
  }

  function kick() { if (!raf) raf = requestAnimationFrame(tick); }
  function tick(now) {
    raf = 0;
    const dt = Math.min(48, now - (last || now));
    last = now;
    if (auto) {
      // a slow turn back and forth until the guest takes over
      pos += auto * dt * (n / 4200);
      if (pos >= n - 1 || pos <= 0) { pos = clamp(pos, 0, n - 1); auto = -auto; }
    } else if (!drag && Math.abs(vel) > 0.0004) {
      pos = clamp(pos + vel * dt, 0, n - 1);
      vel *= Math.pow(0.9, dt / 16);
      if (pos === 0 || pos === n - 1) vel = 0;
    }
    const i = Math.round(pos);
    const j = frames[i] && frames[i].ready ? i : nearestReady(i);
    if (j >= 0 && j !== drawn) {
      ctx.drawImage(frames[j], 0, 0, canvas.width, canvas.height);
      drawn = j;
    }
    stage.setAttribute('aria-valuenow', String(i));
    if (auto || drag || Math.abs(vel) > 0.0004 || j !== i) kick();
    else last = 0;
  }

  function takeOver() {
    auto = 0;
    stage.classList.add('is-touched');
  }

  stage.addEventListener('pointerdown', (e) => {
    takeOver();
    stage.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, pos, t: e.timeStamp, lx: e.clientX };
    vel = 0;
    kick();
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const perPx = n / (stage.clientWidth * 1.3);   // one and a bit widths of dragging = the whole turn
    pos = clamp(drag.pos + (e.clientX - drag.x) * perPx, 0, n - 1);
    const dt = Math.max(1, e.timeStamp - drag.t);
    vel = ((e.clientX - drag.lx) * perPx) / dt;
    drag.t = e.timeStamp; drag.lx = e.clientX;
    kick();
  });
  const release = () => { if (!drag) return; drag = null; if (reduce.matches) vel = 0; kick(); };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('keydown', (e) => {
    const step = { ArrowLeft: -2, ArrowRight: 2, Home: -n, End: n }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    takeOver();
    pos = clamp(Math.round(pos) + step, 0, n - 1);
    kick();
  });

  function open(btn) {
    opener = btn;
    // name, price and description come from the menu item with the same photo
    const thumb = document.querySelector(`.item-thumb[data-spin="${btn.dataset.spin}"]`);
    const item = thumb && thumb.closest('.item');
    const text = (sel) => (item && item.querySelector(sel) ? item.querySelector(sel).textContent.trim() : '');
    dlg.querySelector('.spin-name').textContent = text('.item-name');
    dlg.querySelector('.spin-price').textContent = text('.price');
    dlg.querySelector('.spin-desc').textContent = text('.item-desc');

    if (dir !== btn.dataset.spin) {
      dir = btn.dataset.spin;
      n = Number(btn.dataset.frames);
      frames = new Array(n).fill(null);
      drawn = -1;
      stage.style.backgroundImage = `url("${dir}/photo-600.webp")`;
      stage.setAttribute('aria-valuemax', String(n - 1));
    }
    pos = Number(btn.dataset.poster) || 0;
    vel = 0;
    auto = reduce.matches ? 0 : 1;
    stage.classList.remove('is-touched');
    load(Math.round(pos));
    document.documentElement.classList.add('spin-open');
    dlg.showModal();
    stage.focus({ preventScroll: true });
    kick();
  }

  openers.forEach((btn) => btn.addEventListener('click', () => open(btn)));
  // a tap on the dimmed page around the card closes it
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => {
    auto = 0; vel = 0; drag = null;
    document.documentElement.classList.remove('spin-open');
    if (opener) opener.focus({ preventScroll: true });
  });
})();
