(function () {

  const MIC = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4a2.6 2.6 0 0 1 2.6 2.6v4.8a2.6 2.6 0 1 1-5.2 0V6.6A2.6 2.6 0 0 1 12 4Z" fill="currentColor"/>
    <path d="M6.8 11a5.2 5.2 0 0 0 10.4 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M12 16.2V19" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
  </svg>`;

  const STAR = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3.4l2.55 5.17 5.7.83-4.13 4.02.98 5.68L12 16.42l-5.1 2.68.97-5.68L3.75 9.4l5.7-.83L12 3.4Z"
          fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
  </svg>`;

  const HINT = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 5.5h15a1.5 1.5 0 0 1 1.5 1.5v7.6a1.5 1.5 0 0 1-1.5 1.5H12l-4.4 3.2v-3.2H4.5A1.5 1.5 0 0 1 3 14.6V7a1.5 1.5 0 0 1 1.5-1.5Z"
          fill="currentColor"/>
    <circle cx="8.4" cy="10.8" r="1.05" fill="#1a1500"/>
    <circle cx="12" cy="10.8" r="1.05" fill="#1a1500"/>
    <circle cx="15.6" cy="10.8" r="1.05" fill="#1a1500"/>
  </svg>`;

  function badge(svg, variant) {
    return `<span class="ka-badge ka-badge--${variant}">${svg}</span>`;
  }

  window.KA = {
    mic:  () => badge(MIC,  'mic'),
    star: () => badge(STAR, 'star'),
    hint: () => badge(HINT, 'hint')
  };

  const css = document.createElement('style');
  css.textContent = `
  .ka-badge{
    display:inline-flex;align-items:center;justify-content:center;
    width:30px;height:30px;border-radius:50%;
    flex:0 0 30px;line-height:0;
    box-shadow:0 2px 10px rgba(0,0,0,.45);
    animation:kaBadgeIn .34s cubic-bezier(.2,1.3,.4,1);
  }
  .ka-badge svg{width:17px;height:17px;display:block;}

  /* gruen — ist am Zug / hat gebuzzert */
  .ka-badge--mic{
    background:linear-gradient(160deg,#2fd07a,#17a35c);
    border:2px solid rgba(255,255,255,.85);
    color:#fff;
  }
  /* gelb — Stern, wer dran ist */
  .ka-badge--star{
    background:linear-gradient(160deg,#ffd95e,#f0a92a);
    border:2px solid rgba(255,255,255,.85);
    color:#5a3c00;
  }
  /* gelb — gibt das Hinweiswort */
  .ka-badge--hint{
    background:linear-gradient(160deg,#ffd95e,#f0a92a);
    border:2px solid rgba(255,255,255,.85);
    color:#5a3c00;
  }

  @keyframes kaBadgeIn{
    from{ opacity:0; transform:scale(.4) rotate(-25deg); }
    to  { opacity:1; transform:scale(1) rotate(0); }
  }

  /* ---------- Aktiv-Rahmen ---------- */
  .ka-live-green{
    border-color:#2fd07a !important;
    box-shadow:0 0 0 1px rgba(47,208,122,.5), 0 0 26px rgba(47,208,122,.55) !important;
    animation:kaGlowGreen 1.9s ease-in-out infinite;
  }
  .ka-live-yellow{
    border-color:#ffd95e !important;
    box-shadow:0 0 0 1px rgba(255,217,94,.5), 0 0 26px rgba(255,217,94,.55) !important;
    animation:kaGlowYellow 1.9s ease-in-out infinite;
  }
  @keyframes kaGlowGreen{
    0%,100%{ box-shadow:0 0 0 1px rgba(47,208,122,.45), 0 0 18px rgba(47,208,122,.42); }
    50%    { box-shadow:0 0 0 1px rgba(47,208,122,.7),  0 0 34px rgba(47,208,122,.75); }
  }
  @keyframes kaGlowYellow{
    0%,100%{ box-shadow:0 0 0 1px rgba(255,217,94,.45), 0 0 18px rgba(255,217,94,.42); }
    50%    { box-shadow:0 0 0 1px rgba(255,217,94,.7),  0 0 34px rgba(255,217,94,.75); }
  }

  /* Badge oben rechts auf einer Spielerkachel platzieren */
  .ka-badge-tr{
    position:absolute;top:-10px;right:-8px;z-index:5;
  }
  /* Badge oben mittig ueber der Kachel */
  .ka-badge-tc{
    position:absolute;top:-14px;left:50%;transform:translateX(-50%);z-index:5;
  }

  @media (prefers-reduced-motion: reduce){
    .ka-badge, .ka-live-green, .ka-live-yellow{ animation:none; }
  }
  `;
  (document.head || document.documentElement).appendChild(css);

})();
