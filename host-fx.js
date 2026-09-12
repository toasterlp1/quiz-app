
(function () {

  var audioCtx = null;
  var masterGain = null;
  var MASTER = 0.12;

  function tonAn() {
    try { return localStorage.getItem('ka_sound') !== 'aus'; } catch (e) { return true; }
  }

  function ctx() {
    if (!tonAn()) return null;
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = MASTER;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function ton(freq, start, dauer, typ, vol) {
    var c = ctx();
    if (!c) return;
    var t0 = c.currentTime + (start || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = typ || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    var spitze = (vol == null ? 1 : vol);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(spitze, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dauer);
    osc.connect(g); g.connect(masterGain);
    osc.start(t0);
    osc.stop(t0 + dauer + 0.02);
  }

  function gleiten(vonF, nachF, start, dauer, typ, vol) {
    var c = ctx();
    if (!c) return;
    var t0 = c.currentTime + (start || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = typ || 'sine';
    osc.frequency.setValueAtTime(vonF, t0);
    osc.frequency.exponentialRampToValueAtTime(nachF, t0 + dauer);
    var spitze = (vol == null ? 1 : vol);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(spitze, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dauer);
    osc.connect(g); g.connect(masterGain);
    osc.start(t0);
    osc.stop(t0 + dauer + 0.02);
  }

  var SOUND = {
    buzz: function () {
      ton(180, 0, 0.16, 'square', 0.8);
      ton(120, 0.02, 0.22, 'sine', 1);
    },
    joker: function () {
      ton(520, 0, 0.09, 'triangle', 0.6);
      ton(700, 0.07, 0.09, 'triangle', 0.6);
      ton(950, 0.14, 0.14, 'triangle', 0.7);
    },
    correct: function () {
      ton(660, 0, 0.14, 'sine', 0.8);
      ton(880, 0.1, 0.22, 'sine', 0.9);
    },
    wrong: function () {
      ton(160, 0, 0.22, 'sawtooth', 0.7);
      ton(120, 0.04, 0.26, 'sine', 0.8);
    },
    lifeLost: function () {
      gleiten(520, 130, 0, 0.5, 'triangle', 0.9);
    }
  };

  const css = document.createElement('style');
  css.textContent = `
  #ka-fx{
    position:fixed;inset:0;z-index:2147480000;
    pointer-events:none;overflow:hidden;
    display:none;
  }
  #ka-fx.an{display:block;}

  /* Farbiger Blitz ueber den ganzen Schirm */
  #ka-fx .blitz{
    position:absolute;inset:0;
    background:radial-gradient(ellipse at center, var(--fx) 0%, transparent 62%);
    opacity:0;
    animation:kaBlitz 1.5s cubic-bezier(.15,.7,.3,1) forwards;
  }
  @keyframes kaBlitz{
    0%  { opacity:0; }
    8%  { opacity:.55; }
    30% { opacity:.22; }
    100%{ opacity:0; }
  }

  /* Schockwellen-Ringe aus der Mitte */
  #ka-fx .welle{
    position:absolute;left:50%;top:50%;
    width:220px;height:220px;margin:-110px 0 0 -110px;
    border-radius:50%;
    border:6px solid var(--fx);
    opacity:.9;
    animation:kaWelle 1.25s cubic-bezier(.1,.65,.25,1) forwards;
  }
  @keyframes kaWelle{
    0%  { transform:scale(.25); opacity:.95; border-width:10px; }
    100%{ transform:scale(11);  opacity:0;   border-width:1px; }
  }

  /* Die Karte in der Mitte */
  #ka-fx .karte{
    position:absolute;left:50%;top:50%;
    transform:translate(-50%,-50%);
    display:flex;flex-direction:column;align-items:center;gap:14px;
    animation:kaKarte 1.9s cubic-bezier(.16,1.5,.3,1) forwards;
  }
  @keyframes kaKarte{
    0%  { transform:translate(-50%,-50%) scale(.3) rotate(-8deg); opacity:0; }
    14% { transform:translate(-50%,-50%) scale(1.16) rotate(2deg); opacity:1; }
    24% { transform:translate(-50%,-50%) scale(1) rotate(0deg); opacity:1; }
    78% { transform:translate(-50%,-50%) scale(1) rotate(0deg); opacity:1; }
    100%{ transform:translate(-50%,-50%) scale(1.12); opacity:0; }
  }

  #ka-fx .avatar{
    width:132px;height:132px;border-radius:50%;
    border:5px solid var(--fx);
    box-shadow:0 0 46px var(--fx), 0 12px 40px rgba(0,0,0,.7);
    background:#0d1220;object-fit:cover;
    animation:kaAvatar .9s ease-out;
  }
  @keyframes kaAvatar{
    0%,100%{ box-shadow:0 0 40px var(--fx), 0 12px 40px rgba(0,0,0,.7); }
    50%    { box-shadow:0 0 90px var(--fx), 0 12px 40px rgba(0,0,0,.7); }
  }

  #ka-fx .name{
    font-family:'Anton',sans-serif;
    font-size:clamp(48px, 7vw, 104px);
    letter-spacing:5px;text-transform:uppercase;color:#fff;
    text-shadow:0 0 34px var(--fx), 0 5px 0 rgba(0,0,0,.55), 0 0 90px var(--fx);
    line-height:1;white-space:nowrap;
  }
  #ka-fx .was{
    font-family:'Anton',sans-serif;
    font-size:clamp(22px, 2.6vw, 38px);
    letter-spacing:7px;text-transform:uppercase;
    color:var(--fx);
    text-shadow:0 0 26px var(--fx);
    padding:9px 30px;border:3px solid var(--fx);border-radius:999px;
    background:rgba(0,0,0,.45);
  }

  /* Funken */
  #ka-fx .funke{
    position:absolute;width:12px;height:12px;border-radius:50%;
    background:var(--fx);
    box-shadow:0 0 14px var(--fx);
  }

  /* Bildschirm ruckelt kurz */
  @keyframes kaRuckeln{
    0%,100%{ transform:translate(0,0); }
    12%{ transform:translate(-9px, 5px); }
    24%{ transform:translate(8px, -6px); }
    36%{ transform:translate(-6px, -4px); }
    48%{ transform:translate(6px, 5px); }
    62%{ transform:translate(-4px, 2px); }
    78%{ transform:translate(3px, -2px); }
  }
  body.ka-ruckelt{ animation:kaRuckeln .55s cubic-bezier(.36,.07,.19,.97); }

  @media (prefers-reduced-motion: reduce){
    #ka-fx *, body.ka-ruckelt{ animation-duration:.01ms !important; }
  }

  /* ---------- Herz zerbricht (fuer Formate mit Leben) ---------- */
  #ka-fx .herz-buehne{
    position:absolute;left:50%;top:50%;
    transform:translate(-50%,-50%);
    display:flex;flex-direction:column;align-items:center;gap:20px;
  }
  #ka-fx .herz{
    position:relative;width:200px;height:200px;
    filter:drop-shadow(0 0 40px var(--fx));
  }
  #ka-fx .herz .haelfte{
    position:absolute;inset:0;
    display:flex;align-items:center;justify-content:center;
    font-size:200px;line-height:1;color:var(--fx);
    clip-path:inset(0 50% 0 0);
    animation:herzLinks 1.5s cubic-bezier(.2,.7,.3,1) forwards;
  }
  #ka-fx .herz .haelfte.rechts{
    clip-path:inset(0 0 0 50%);
    animation:herzRechts 1.5s cubic-bezier(.2,.7,.3,1) forwards;
  }
  #ka-fx .herz .voll{
    position:absolute;inset:0;
    display:flex;align-items:center;justify-content:center;
    font-size:200px;line-height:1;color:var(--fx);
    animation:herzBeben .35s ease-in-out;
  }
  @keyframes herzBeben{
    0%,100%{ transform:scale(1) rotate(0deg); }
    20%{ transform:scale(1.15) rotate(-4deg); }
    40%{ transform:scale(1.08) rotate(4deg); }
    60%{ transform:scale(1.15) rotate(-3deg); }
    80%{ transform:scale(1.05) rotate(2deg); }
  }
  @keyframes herzLinks{
    0%,20%{ transform:translate(0,0) rotate(0deg); opacity:1; }
    100%{ transform:translate(-160px,90px) rotate(-42deg); opacity:0; }
  }
  @keyframes herzRechts{
    0%,20%{ transform:translate(0,0) rotate(0deg); opacity:1; }
    100%{ transform:translate(160px,90px) rotate(42deg); opacity:0; }
  }
  /* Riss-Blitz genau in der Mitte */
  #ka-fx .riss{
    position:absolute;left:50%;top:0;width:5px;height:100%;
    margin-left:-2.5px;background:#fff;
    box-shadow:0 0 22px 5px var(--fx);
    transform:scaleY(0);transform-origin:top;
    animation:rissRein .32s cubic-bezier(.2,.9,.3,1) forwards;
  }
  @keyframes rissRein{
    0%{ transform:scaleY(0); opacity:0; }
    45%{ transform:scaleY(1); opacity:1; }
    100%{ transform:scaleY(1); opacity:0; }
  }
  #ka-fx .scherbe{
    position:absolute;width:16px;height:16px;
    background:var(--fx);
    box-shadow:0 0 12px var(--fx);
    clip-path:polygon(50% 0,100% 62%,68% 100%,20% 82%,0 38%);
  }

  /* ---------- Richtig: Lichtstrahlen + Haken ---------- */
  #ka-fx .strahlen{
    position:absolute;left:50%;top:50%;width:0;height:0;
  }
  #ka-fx .strahl{
    position:absolute;left:0;top:0;width:8px;height:60vh;
    margin-left:-4px;transform-origin:top center;
    background:linear-gradient(to bottom, var(--fx), transparent 70%);
    opacity:0;animation:strahlDreh 1.6s ease-out forwards;
  }
  @keyframes strahlDreh{
    0%{ opacity:0; }
    20%{ opacity:.7; }
    100%{ opacity:0; }
  }
  #ka-fx .ring-puls{
    position:absolute;left:50%;top:50%;width:180px;height:180px;
    margin:-90px 0 0 -90px;border-radius:50%;
    border:5px solid var(--fx);opacity:0;
    animation:ringPuls 1.1s cubic-bezier(.1,.65,.25,1) forwards;
  }
  @keyframes ringPuls{
    0%{ transform:scale(.4); opacity:.95; }
    100%{ transform:scale(4.5); opacity:0; }
  }
  #ka-fx .symbol{
    position:absolute;left:50%;top:50%;
    transform:translate(-50%,-50%);
    font-size:200px;line-height:1;color:var(--fx);
    filter:drop-shadow(0 0 40px var(--fx));
    animation:symbolRein 1.7s cubic-bezier(.16,1.5,.3,1) forwards;
  }
  @keyframes symbolRein{
    0%{ transform:translate(-50%,-50%) scale(.2) rotate(-14deg); opacity:0; }
    16%{ transform:translate(-50%,-50%) scale(1.25) rotate(4deg); opacity:1; }
    28%{ transform:translate(-50%,-50%) scale(1) rotate(0deg); opacity:1; }
    76%{ transform:translate(-50%,-50%) scale(1) rotate(0deg); opacity:1; }
    100%{ transform:translate(-50%,-50%) scale(1.2); opacity:0; }
  }
  /* Falsch: hartes Zittern des Symbols */
  #ka-fx .symbol.zittert{
    animation:symbolRein 1.7s cubic-bezier(.16,1.5,.3,1) forwards, symbolZitter .4s ease-in-out 3;
  }
  @keyframes symbolZitter{
    0%,100%{ margin-left:0; }
    25%{ margin-left:-14px; }
    75%{ margin-left:14px; }
  }
  `;
  (document.head || document.documentElement).appendChild(css);

  let buehne = null;
  function holeBuehne(){
    if(buehne) return buehne;
    buehne = document.createElement('div');
    buehne.id = 'ka-fx';
    document.body.appendChild(buehne);
    return buehne;
  }

  let laeuft = false;

  function zeige(opt){

    if(laeuft) return;
    laeuft = true;

    const b = holeBuehne();
    const farbe = opt.farbe || '#ff3860';
    b.style.setProperty('--fx', farbe);
    b.className = 'an';

    const avatarHtml = opt.avatar
      ? `<img class="avatar" src="${opt.avatar}" alt="">`
      : '';

    b.innerHTML = `
      <div class="blitz"></div>
      <div class="welle"></div>
      <div class="welle" style="animation-delay:.16s"></div>
      <div class="welle" style="animation-delay:.32s"></div>
      <div class="karte">
        ${avatarHtml}
        <div class="name">${opt.name || ''}</div>
        <div class="was">${opt.was || ''}</div>
      </div>`;

    funken(b, farbe);

    document.body.classList.add('ka-ruckelt');
    setTimeout(() => document.body.classList.remove('ka-ruckelt'), 600);

    setTimeout(() => {
      b.className = '';
      b.innerHTML = '';
      laeuft = false;
    }, 2000);
  }

  function funken(b, farbe){
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    for(let i = 0; i < 30; i++){
      const f = document.createElement('span');
      f.className = 'funke';
      f.style.left = cx + 'px';
      f.style.top = cy + 'px';
      b.appendChild(f);

      const winkel = (Math.PI * 2 * i) / 30 + (Math.random() - .5) * .5;
      const weite = 260 + Math.random() * 520;
      const dx = Math.cos(winkel) * weite;
      const dy = Math.sin(winkel) * weite;
      const gr = .5 + Math.random() * 1.4;

      f.animate([
        { transform: `translate(-50%,-50%) scale(${gr})`, opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
      ], {
        duration: 900 + Math.random() * 500,
        easing: 'cubic-bezier(.14,.75,.25,1)'
      });
    }
  }

  function scherben(b, farbe){
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    for(let i = 0; i < 22; i++){
      const s = document.createElement('span');
      s.className = 'scherbe';
      s.style.left = cx + 'px';
      s.style.top = cy + 'px';
      b.appendChild(s);
      const winkel = Math.PI * (0.15 + Math.random() * 0.7);
      const weite = 200 + Math.random() * 440;
      const dx = Math.cos(winkel) * weite * (Math.random() < .5 ? -1 : 1);
      const dy = Math.abs(Math.sin(winkel)) * weite + 120;
      const dreh = (Math.random() * 720 - 360);
      const gr = .5 + Math.random() * 1.2;
      s.animate([
        { transform: `translate(-50%,-50%) scale(${gr}) rotate(0deg)`, opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${gr*.6}) rotate(${dreh}deg)`, opacity: 0 }
      ], { duration: 1000 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' });
    }
  }

  function zeigeHerz(opt){
    if(laeuft) return;
    laeuft = true;
    const b = holeBuehne();
    const farbe = opt.farbe || '#ff3860';
    b.style.setProperty('--fx', farbe);
    b.className = 'an';

    b.innerHTML = `
      <div class="blitz"></div>
      <div class="herz-buehne">
        <div class="herz">
          <div class="voll">\u2665</div>
          <div class="riss"></div>
          <div class="haelfte links">\u2665</div>
          <div class="haelfte rechts">\u2665</div>
        </div>
        ${opt.name ? `<div class="name">${opt.name}</div>` : ''}
        <div class="was">Leben verloren</div>
      </div>`;

    setTimeout(() => scherben(b, farbe), 340);

    document.body.classList.add('ka-ruckelt');
    setTimeout(() => document.body.classList.remove('ka-ruckelt'), 600);

    setTimeout(() => { b.className = ''; b.innerHTML = ''; laeuft = false; }, 2100);
  }

  function zeigeSymbol(opt){
    if(laeuft) return;
    laeuft = true;
    const b = holeBuehne();
    const farbe = opt.farbe || '#3ddc84';
    b.style.setProperty('--fx', farbe);
    b.className = 'an';

    const strahlen = opt.strahlen
      ? '<div class="strahlen">' +
          Array.from({length:12}, (_, i) =>
            `<div class="strahl" style="transform:rotate(${i*30}deg);animation-delay:${i*0.02}s"></div>`
          ).join('') +
        '</div>'
      : '';

    b.innerHTML = `
      <div class="blitz"></div>
      ${strahlen}
      <div class="ring-puls"></div>
      <div class="ring-puls" style="animation-delay:.18s"></div>
      <div class="symbol${opt.zittert ? ' zittert' : ''}">${opt.zeichen}</div>
      ${opt.name ? `<div class="karte" style="top:74%"><div class="name" style="font-size:clamp(28px,3.4vw,52px)">${opt.name}</div></div>` : ''}`;

    if(opt.funken) funken(b, farbe);

    document.body.classList.add('ka-ruckelt');
    setTimeout(() => document.body.classList.remove('ka-ruckelt'), opt.zittert ? 600 : 400);

    setTimeout(() => { b.className = ''; b.innerHTML = ''; laeuft = false; }, 1900);
  }

  window.HOSTFX = {
    buzz(name, avatar){
      SOUND.buzz();
      zeige({ name, avatar, was: 'BUZZ!', farbe: '#ff3860' });
    },
    joker(name, jokerName, farbe, avatar){
      SOUND.joker();
      zeige({ name, avatar, was: jokerName || 'JOKER', farbe: farbe || '#c44dff' });
    },

    lifeLost(name, avatar){
      SOUND.lifeLost();
      zeigeHerz({ name, farbe: '#ff3860' });
    },

    correct(name){
      SOUND.correct();
      zeigeSymbol({ zeichen: '\u2713', farbe: '#3ddc84', strahlen: true, funken: true, name });
    },

    wrong(name){
      SOUND.wrong();
      zeigeSymbol({ zeichen: '\u2717', farbe: '#ff3860', zittert: true, name });
    },

    setSound(an){
      try { localStorage.setItem('ka_sound', an ? 'an' : 'aus'); } catch (e) {}
    },
    soundAn(){
      return tonAn();
    }
  };

})();
