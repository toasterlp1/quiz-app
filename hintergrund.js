
(function () {

  if (document.body && document.body.dataset.bg === 'aus') return;

  function leseFarbe() {
    const b = document.body;
    if (b && b.dataset.bgFarbe) return b.dataset.bgFarbe;

    const s = getComputedStyle(document.documentElement);
    const kandidaten = ['--accent', '--draw', '--gp', '--mm', '--primary', '--blue'];
    for (const k of kandidaten) {
      const v = s.getPropertyValue(k).trim();
      if (v && v.startsWith('#')) return v;
    }
    return '#6c5ce7';
  }

  function hexRgb(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16)
    ];
  }

  const AKZENT = hexRgb(leseFarbe());

  function verschiebe(rgb, grad) {

    const [r, g, b] = rgb;
    if (grad > 0) return [Math.min(255, b * 0.9 + 30), r * 0.7, g * 0.9 + 20];
    return [g * 0.8, Math.min(255, b * 0.9 + 20), r * 0.85 + 25];
  }
  const AKZENT2 = verschiebe(AKZENT, 1);

  const cv = document.createElement('canvas');
  cv.id = 'ka-bg';
  cv.style.cssText = 'display:block;width:100%;height:100%;';
  const ctx = cv.getContext('2d');

  function einhaengen() {
    if (!document.body) return;

    const huelle = document.createElement('div');
    huelle.id = 'ka-bg-huelle';

    huelle.style.cssText =
      'position:fixed;inset:0;z-index:9998;pointer-events:none;overflow:hidden;' +
      'mix-blend-mode:screen;opacity:.30;';
    huelle.appendChild(cv);
    document.body.appendChild(huelle);
    groesse();
  }

  let W = 0, H = 0, dpr = 1;
  function groesse() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    baue();
  }
  window.addEventListener('resize', groesse);

  let punkte = [];
  const DICHTE = 26000;
  const MAX_VERBINDUNG = 150;

  function baue() {
    const anzahl = Math.min(55, Math.max(18, Math.floor((W * H) / DICHTE)));
    punkte = [];
    for (let i = 0; i < anzahl; i++) {
      punkte.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.5 + 0.7,
        puls: Math.random() * Math.PI * 2
      });
    }
  }

  let t = 0;

  function wolken() {
    const blobs = [
      { c: AKZENT,  x: 0.18 + Math.sin(t * 0.00021) * 0.06, y: 0.14 + Math.cos(t * 0.00017) * 0.05, r: 0.62, a: 0.30 },
      { c: AKZENT2, x: 0.84 + Math.cos(t * 0.00019) * 0.06, y: 0.24 + Math.sin(t * 0.00023) * 0.05, r: 0.55, a: 0.26 },
      { c: AKZENT,  x: 0.50 + Math.sin(t * 0.00013) * 0.08, y: 0.92 + Math.cos(t * 0.00015) * 0.04, r: 0.70, a: 0.22 }
    ];

    ctx.globalCompositeOperation = 'lighter';
    blobs.forEach(b => {
      const cx = b.x * W, cy = b.y * H;
      const rad = Math.min(W, H) * b.r;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      const [r, gr, bl] = b.c;
      g.addColorStop(0, `rgba(${r|0},${gr|0},${bl|0},${b.a})`);
      g.addColorStop(1, `rgba(${r|0},${gr|0},${bl|0},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  function frame() {
    t += 16;
    ctx.clearRect(0, 0, W, H);

    wolken();

    const [ar, ag, ab] = AKZENT;

    for (let i = 0; i < punkte.length; i++) {
      const p = punkte[i];
      for (let j = i + 1; j < punkte.length; j++) {
        const q = punkte[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > MAX_VERBINDUNG * MAX_VERBINDUNG) continue;
        const d = Math.sqrt(d2);
        const a = (1 - d / MAX_VERBINDUNG) * 0.18;
        ctx.strokeStyle = `rgba(${ar},${ag},${ab},${a})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }

    punkte.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.puls += 0.014;

      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20;
      if (p.y > H + 20) p.y = -20;

      const puls = Math.sin(p.puls) * 0.35 + 0.65;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ar},${ag},${ab},${0.75 * puls})`;
      ctx.fill();
    });

    requestAnimationFrame(frame);
  }

  function start() {
    einhaengen();

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      wolken();
      return;
    }
    frame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

})();
