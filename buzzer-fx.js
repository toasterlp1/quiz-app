
(function () {

  const css = document.createElement('style');
  css.textContent = `
  /* ---------- Buzzer ---------- */
  .buzz-btn, .big-buzz{
    position:relative;
    isolation:isolate;
    overflow:visible !important;
  }

  /* Atem-Puls, solange offen.
     Bewusst ueber den SCHATTEN, nicht ueber transform:scale - ein staendig
     wachsender Button waere ein bewegliches Ziel und kostet beim schnellen
     Buzzern echte Treffsicherheit. */
  .buzz-btn:not(:disabled), .big-buzz:not(:disabled){
    animation:kaAtem 2.4s ease-in-out infinite !important;
  }
  @keyframes kaAtem{
    0%,100%{ filter:brightness(1)    drop-shadow(0 0 22px var(--ka-glow, rgba(255,84,112,.45))); }
    50%    { filter:brightness(1.12) drop-shadow(0 0 42px var(--ka-glow, rgba(255,84,112,.8))); }
  }
  .buzz-btn:not(:disabled):active, .big-buzz:not(:disabled):active{
    transform:scale(.92) !important;
  }

  /* Die Ringe, die nach aussen laufen */
  .ka-ring{
    position:absolute;left:50%;top:50%;
    width:100%;height:100%;
    border-radius:50%;
    border:3px solid var(--ka-ring-farbe, #ff5470);
    transform:translate(-50%,-50%) scale(1);
    opacity:.75;
    pointer-events:none;
    z-index:-1;
    animation:kaRing 900ms cubic-bezier(.15,.6,.3,1) forwards;
  }
  @keyframes kaRing{
    to{ transform:translate(-50%,-50%) scale(2.3); opacity:0; border-width:1px; }
  }

  /* Partikel */
  .ka-funke{
    position:fixed;
    width:8px;height:8px;border-radius:50%;
    pointer-events:none;z-index:99999;
    will-change:transform,opacity;
  }

  /* Gesperrter Buzzer wirkt tot statt nur grau */
  .buzz-btn:disabled, .big-buzz:disabled{
    animation:none !important;
    filter:grayscale(.4) brightness(.7);
  }

  /* ---------- Wartescreen ---------- */
  .ka-warte{
    display:inline-flex;align-items:center;gap:5px;margin-left:4px;
    vertical-align:middle;
  }
  .ka-warte i{
    width:5px;height:5px;border-radius:50%;
    background:currentColor;opacity:.35;
    animation:kaWarte 1.3s ease-in-out infinite;
  }
  .ka-warte i:nth-child(2){ animation-delay:.18s; }
  .ka-warte i:nth-child(3){ animation-delay:.36s; }
  @keyframes kaWarte{
    0%,60%,100%{ opacity:.25; transform:translateY(0); }
    30%        { opacity:1;   transform:translateY(-4px); }
  }

  @media (prefers-reduced-motion: reduce){
    .buzz-btn:not(:disabled), .big-buzz:not(:disabled), .ka-ring, .ka-warte i{ animation:none !important; }
  }
  `;
  (document.head || document.documentElement).appendChild(css);

  function farbeVomButton(btn){
    const s = getComputedStyle(btn);

    const bg = s.backgroundImage || '';
    const treffer = bg.match(/rgb\([^)]+\)/g);
    if(treffer && treffer.length) return treffer[treffer.length - 1];
    const root = getComputedStyle(document.documentElement);
    return (root.getPropertyValue('--bad').trim() || '#ff5470');
  }

  function ringe(btn){
    const farbe = farbeVomButton(btn);
    btn.style.setProperty('--ka-ring-farbe', farbe);
    for(let i = 0; i < 3; i++){
      setTimeout(() => {
        const r = document.createElement('span');
        r.className = 'ka-ring';
        btn.appendChild(r);
        setTimeout(() => r.remove(), 950);
      }, i * 130);
    }
  }

  function funken(btn){
    const box = btn.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const farbe = farbeVomButton(btn);

    for(let i = 0; i < 16; i++){
      const f = document.createElement('span');
      f.className = 'ka-funke';
      f.style.background = farbe;
      f.style.left = cx + 'px';
      f.style.top = cy + 'px';
      document.body.appendChild(f);

      const winkel = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.4;
      const weite = box.width * (0.55 + Math.random() * 0.5);
      const dx = Math.cos(winkel) * weite;
      const dy = Math.sin(winkel) * weite;

      f.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
      ], {
        duration: 620 + Math.random() * 260,
        easing: 'cubic-bezier(.2,.7,.3,1)'
      }).onfinish = () => f.remove();
    }
  }

  function ruettel(btn){
    btn.animate([
      { transform: 'scale(.9) rotate(0deg)' },
      { transform: 'scale(1.06) rotate(-1.5deg)' },
      { transform: 'scale(.98) rotate(1.2deg)' },
      { transform: 'scale(1) rotate(0deg)' }
    ], { duration: 380, easing: 'cubic-bezier(.2,1.4,.4,1)' });
  }

  function binde(){
    const btn = document.querySelector('.buzz-btn, .big-buzz');
    if(!btn || btn.dataset.kaFx) return;
    btn.dataset.kaFx = '1';

    btn.addEventListener('click', () => {
      if(btn.disabled) return;
      ringe(btn);
      funken(btn);
      ruettel(btn);
      if(navigator.vibrate) navigator.vibrate([40, 30, 60]);
    });
  }

  function warteBeleben(){
    document.querySelectorAll('.status, .hint, .waiting').forEach(el => {
      if(el.dataset.kaWarte) return;
      const t = el.textContent || '';
      if(!/…|\.\.\./.test(t)) return;
      el.dataset.kaWarte = '1';
      const rest = t.replace(/…|\.\.\./g, '').trimEnd();
      el.innerHTML = `${rest}<span class="ka-warte"><i></i><i></i><i></i></span>`;
    });
  }

  function start(){
    binde();
    warteBeleben();

    setInterval(() => { binde(); warteBeleben(); }, 700);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

})();
