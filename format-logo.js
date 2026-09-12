/*
 * QUIZ-APP — Format Branding / Host
 * Premium format badges. One shared file keeps the host pages clean.
 * The badge is placed in a reserved edge area and repositions itself
 * if a layout element would overlap it.
 */
(function () {
  'use strict';

  const CONFIG = {
    hotzone: {
      name: 'HOTZONE', sub: 'PRECISION • RISK • HEAT',
      colors: ['#ff4d6d', '#ff9f43', '#ffd166'],
      icon: hotIcon
    },
    higherlower: {
      name: 'HIGHER OR LOWER', sub: 'GUESS THE RANKING',
      colors: ['#8ea7ff', '#d9b7ff', '#fff3c4'],
      icon: higherIcon
    },
    morph: {
      name: 'WER IST DAS?', sub: 'IDENTITY REVEAL',
      colors: ['#00e5c7', '#5a78fa', '#b5c6ff'],
      icon: morphIcon
    },
    weristdas: {
      name: 'WER IST DAS?', sub: 'IDENTITY REVEAL',
      colors: ['#00e5c7', '#5a78fa', '#b5c6ff'],
      icon: morphIcon
    },
    'bluff-quiz': {
      name: 'BLUFF-QUIZ', sub: 'TRUTH • LIE • CHAOS',
      colors: ['#a855f7', '#ff3d68', '#ffc857'],
      icon: bluffIcon
    },
    ausreden: {
      name: 'AUSREDENKÖNIG', sub: 'EXCUSES • IMPROV • CROWN',
      colors: ['#3ddc84', '#ffc23d', '#ff9f45'],
      icon: crownIcon
    },
    chatduell: {
      name: 'CHATDUELL', sub: 'TEXT • DUEL • REPLY',
      colors: ['#00e5c7', '#5a78fa', '#c76bff'],
      icon: chatIcon
    },
    emoji: {
      name: 'EMOJI-RÄTSEL', sub: 'DECODE THE CLUES',
      colors: ['#ff6bd6', '#c76bff', '#ffd166'],
      icon: emojiIcon
    },
    imposter: {
      name: 'IMPOSTER', sub: 'FIND THE OUTLIER',
      colors: ['#ff5b3a', '#c44dff', '#f3d27a'],
      icon: imposterIcon
    },
    millionaer: {
      name: 'WER WIRD MILLIONÄR?', sub: 'THE BIG MONEY GAME',
      colors: ['#8b6cff', '#f5c542', '#e8ddff'],
      icon: millionaireIcon
    },
    blackstories: {
      name: 'BLACK STORIES', sub: 'DARK • LOGIC • MYSTERY',
      colors: ['#9b6bff', '#3fe6e0', '#ffb545'],
      icon: blackIcon
    },
    quizduell: {
      name: 'QUIZ DUELL', sub: 'BUZZ • BATTLE • WIN',
      colors: ['#ff3156', '#3f7cff', '#ffd166'],
      icon: quizIcon
    }
  };

  function keyFromPath() {
    const p = location.pathname.toLowerCase().replace(/\\/g, '/');
    const host = p.match(/\/([^/]+)\/host\.html$/);
    if (host) return host[1];
    if (/\/quizduell(?:\/index\.html)?$/.test(p)) return 'quizduell';
    return '';
  }

  function svg(inner, label) {
    return `<svg viewBox="0 0 80 80" role="img" aria-label="${label}" fill="none" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  }

  function frame(c1, c2, c3) {
    return `
      <defs>
        <linearGradient id="g" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
          <stop stop-color="${c1}"/><stop offset=".52" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/>
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stop-color="white" stop-opacity=".92"/><stop offset=".35" stop-color="white" stop-opacity=".12"/><stop offset="1" stop-color="white" stop-opacity=".02"/>
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M24 4h32l20 20v32L56 76H24L4 56V24L24 4Z" fill="url(#g)" fill-opacity=".13" stroke="url(#g)" stroke-width="2.2"/>
      <path d="M26 10h28l16 16v28L54 70H26L10 54V26L26 10Z" stroke="url(#g2)" stroke-width="1" opacity=".42"/>
      <path d="M12 31V25l13-13" stroke="url(#g)" stroke-width="2" stroke-linecap="round" opacity=".85"/>
      <path d="M55 68h-6" stroke="url(#g)" stroke-width="2" stroke-linecap="round" opacity=".85"/>
    `;
  }

  function hotIcon(c) {
    return svg(frame(...c) + `
      <path d="M41 61c9.5-1.5 15-7.5 14.2-15.5-.5-5.2-3.7-9.6-8.6-14.2.2 4.3-1.2 7.1-4.2 9.3.2-5.6-2.6-10.7-8.3-16.2.4 8.1-4.9 11.5-4.9 18.9C27.2 52.2 32.7 61 41 61Z" fill="url(#g)" filter="url(#glow)"/>
      <path d="M40.8 54.5c4.4-.4 7.3-3.3 7.1-7-.1-2.1-1.1-3.8-3.1-5.8-.2 3-1.4 4.8-3.7 5.9.1-3.1-1.1-5.4-3.1-7.5-.1 4.4-3 6.3-3 10.2 0 2.6 2.3 4.1 5.8 4.2Z" fill="white" fill-opacity=".88"/>
    `, 'Hotzone');
  }

  function higherIcon(c) {
    return svg(frame(...c) + `
      <path d="M28 53V25m0 0-7 7m7-7 7 7" stroke="url(#g)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
      <path d="M52 27v28m0 0-7-7m7 7 7-7" stroke="white" stroke-opacity=".88" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M37 40h6" stroke="url(#g2)" stroke-width="3" stroke-linecap="round"/>
      <circle cx="40" cy="40" r="3" fill="white" fill-opacity=".9"/>
    `, 'Higher or Lower');
  }

  function morphIcon(c) {
    return svg(frame(...c) + `
      <circle cx="32" cy="32" r="11" stroke="url(#g)" stroke-width="3"/>
      <path d="M25 57c2.4-7.1 6.8-10.4 15-10.4S52.6 49.9 55 57" stroke="white" stroke-opacity=".9" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M48 25l7 7-7 7" stroke="url(#g)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M55 32H41" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/>
    `, 'Wer ist das');
  }

  function bluffIcon(c) {
    return svg(frame(...c) + `
      <path d="M23 31c5-6 11-9 17-9s12 3 17 9l-5 18c-3.2 4.3-7.2 6.4-12 6.4S31.2 53.3 28 49l-5-18Z" fill="url(#g)" fill-opacity=".2" stroke="url(#g)" stroke-width="3"/>
      <path d="M30 34c3.2-2.2 6.5-3.3 10-3.3s6.8 1.1 10 3.3" stroke="white" stroke-opacity=".9" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="34" cy="40" r="2.2" fill="white"/><circle cx="46" cy="40" r="2.2" fill="white"/>
      <path d="M35 47c3.2 1.7 6.8 1.7 10 0" stroke="url(#g)" stroke-width="2.6" stroke-linecap="round"/>
      <path d="m19 25 8 4M61 25l-8 4" stroke="url(#g2)" stroke-width="2.4" stroke-linecap="round"/>
    `, 'Bluff Quiz');
  }

  function crownIcon(c) {
    return svg(frame(...c) + `
      <path d="m22 30 8 8 10-14 10 14 8-8-3 25H25l-3-25Z" fill="url(#g)" fill-opacity=".22" stroke="url(#g)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M27 49h26M29 55h22" stroke="white" stroke-opacity=".9" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="22" cy="29" r="2.8" fill="white"/><circle cx="40" cy="24" r="2.8" fill="white"/><circle cx="58" cy="29" r="2.8" fill="white"/>
    `, 'Ausredenkönig');
  }

  function chatIcon(c) {
    return svg(frame(...c) + `
      <path d="M20 27c0-3.3 2.7-6 6-6h17c3.3 0 6 2.7 6 6v10c0 3.3-2.7 6-6 6H32l-9 7v-7h-3V27Z" fill="url(#g)" fill-opacity=".18" stroke="url(#g)" stroke-width="3"/>
      <path d="M34 48c0-3.3 2.7-6 6-6h11c3.3 0 6 2.7 6 6v7c0 3.3-2.7 6-6 6h-6l-7 4v-4h-4v-7" fill="#0a0e1a" stroke="white" stroke-opacity=".85" stroke-width="2.5"/>
      <path d="M28 31h13M28 36h9" stroke="white" stroke-opacity=".82" stroke-width="2.4" stroke-linecap="round"/>
    `, 'Chatduell');
  }

  function emojiIcon(c) {
    return svg(frame(...c) + `
      <circle cx="40" cy="40" r="18" fill="url(#g)" fill-opacity=".22" stroke="url(#g)" stroke-width="3"/>
      <circle cx="33.5" cy="36" r="2.3" fill="white"/><circle cx="46.5" cy="36" r="2.3" fill="white"/>
      <path d="M31.5 44c2.6 5 14.4 5 17 0" stroke="white" stroke-opacity=".9" stroke-width="2.7" stroke-linecap="round"/>
      <path d="M22 22h6M52 22h6M22 58h6M52 58h6" stroke="url(#g2)" stroke-width="2.5" stroke-linecap="round"/>
    `, 'Emoji Rätsel');
  }

  function imposterIcon(c) {
    return svg(frame(...c) + `
      <path d="M20 40s7-13 20-13 20 13 20 13-7 13-20 13S20 40 20 40Z" fill="url(#g)" fill-opacity=".16" stroke="url(#g)" stroke-width="3"/>
      <circle cx="40" cy="40" r="6.5" fill="#0a0e1a" stroke="white" stroke-opacity=".9" stroke-width="2.5"/>
      <circle cx="40" cy="40" r="2.2" fill="url(#g)"/>
      <path d="M40 24v-7M28 28l-5-5M52 28l5-5" stroke="white" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"/>
    `, 'Imposter');
  }

  function millionaireIcon(c) {
    return svg(frame(...c) + `
      <path d="M24 57h32M28 57V34h24v23M33 34v-8h14v8" stroke="url(#g)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M31 42h18M31 49h18" stroke="white" stroke-opacity=".82" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="40" cy="18" r="5" fill="url(#g)" fill-opacity=".28" stroke="url(#g)" stroke-width="2.2"/>
      <path d="M40 15v6M37.5 18h5" stroke="white" stroke-opacity=".9" stroke-width="1.8" stroke-linecap="round"/>
    `, 'Wer wird Millionär');
  }

  function blackIcon(c) {
    return svg(frame(...c) + `
      <path d="M20 40s7.2-12 20-12 20 12 20 12-7.2 12-20 12S20 40 20 40Z" fill="url(#g)" fill-opacity=".1" stroke="url(#g)" stroke-width="3"/>
      <circle cx="40" cy="40" r="6" fill="#090712" stroke="white" stroke-opacity=".8" stroke-width="2"/>
      <circle cx="40" cy="40" r="2" fill="url(#g)"/>
      <path d="M63 19c-3-3.5-5.5-4.5-8-4.5 2 3.3 1.8 6.1.5 8.5 2.8-.2 5.1-1.4 7.5-4Z" fill="url(#g)" opacity=".9"/>
      <path d="M57 23c-1.5 2.5-1.5 4.8-.2 7" stroke="white" stroke-opacity=".7" stroke-width="1.8" stroke-linecap="round"/>
    `, 'Black Stories');
  }

  function quizIcon(c) {
    return svg(frame(...c) + `
      <path d="M26 22h28l7 7v27H26c-3.3 0-6-2.7-6-6V28c0-3.3 2.7-6 6-6Z" fill="url(#g)" fill-opacity=".13" stroke="url(#g)" stroke-width="3"/>
      <path d="M47 22v10h10" stroke="white" stroke-opacity=".8" stroke-width="2.3" stroke-linejoin="round"/>
      <path d="m31 44 6 6 12-14" stroke="white" stroke-opacity=".94" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="m58 20 3-6 3 6-3 6-3-6Z" fill="url(#g)"/>
    `, 'Quiz Duell');
  }

  function addStyle() {
    if (document.getElementById('ka-format-logo-style')) return;
    const style = document.createElement('style');
    style.id = 'ka-format-logo-style';
    style.textContent = `
      .ka-format-logo{
        position:fixed; z-index:490; pointer-events:none; user-select:none;
        width:238px; height:48px; display:flex; align-items:center; gap:11px;
        padding:4px 13px 4px 5px; overflow:hidden;
        border:1px solid rgba(255,255,255,.16); border-radius:14px;
        background:linear-gradient(120deg,rgba(10,14,26,.94),rgba(15,19,34,.78));
        box-shadow:0 16px 38px -20px rgba(0,0,0,.95),0 0 0 1px rgba(255,255,255,.025) inset;
        backdrop-filter:blur(10px) saturate(1.18); -webkit-backdrop-filter:blur(10px) saturate(1.18);
        transition:left .35s cubic-bezier(.22,.9,.32,1),right .35s cubic-bezier(.22,.9,.32,1),top .35s cubic-bezier(.22,.9,.32,1),bottom .35s cubic-bezier(.22,.9,.32,1),opacity .2s ease;
      }
      .ka-format-logo::before{
        content:""; position:absolute; inset:0; border-radius:inherit; padding:1px;
        background:linear-gradient(115deg,var(--c1),rgba(255,255,255,.12) 42%,var(--c3));
        -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
        -webkit-mask-composite:xor; mask-composite:exclude; opacity:.72;
      }
      .ka-format-logo::after{
        content:""; position:absolute; top:-20%; bottom:-20%; left:-45%; width:28%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);
        transform:skewX(-18deg); animation:kaLogoSheen 7s ease-in-out infinite;
      }
      @keyframes kaLogoSheen{0%,55%{left:-45%;opacity:0}62%{opacity:.8}74%{left:125%;opacity:0}100%{left:125%;opacity:0}}
      .ka-format-logo .art{width:54px;height:54px;flex:0 0 54px;margin-left:-7px;position:relative;z-index:1;filter:drop-shadow(0 5px 10px rgba(0,0,0,.35));}
      .ka-format-logo .art svg{display:block;width:100%;height:100%;}
      .ka-format-logo .copy{min-width:0;position:relative;z-index:1;display:flex;flex-direction:column;gap:4px;}
      .ka-format-logo .name{font-family:Inter,system-ui,sans-serif;font-size:12px;font-weight:900;letter-spacing:1.25px;line-height:1;white-space:nowrap;color:#f6f7fb;text-shadow:0 2px 10px rgba(0,0,0,.45);}
      .ka-format-logo .sub{font-family:Inter,system-ui,sans-serif;font-size:7px;font-weight:800;letter-spacing:1.6px;line-height:1;color:var(--c2);white-space:nowrap;opacity:.82;}
      .ka-format-logo.is-low{opacity:.92;}
      @media(max-width:900px){
        .ka-format-logo{width:204px;height:42px;gap:8px;padding-right:10px;border-radius:12px;}
        .ka-format-logo .art{width:48px;height:48px;flex-basis:48px;}
        .ka-format-logo .name{font-size:10px;letter-spacing:1px;}
        .ka-format-logo .sub{font-size:6px;letter-spacing:1.15px;}
      }
      @media(max-width:560px){
        .ka-format-logo{width:184px;height:38px;}
        .ka-format-logo .art{width:43px;height:43px;flex-basis:43px;}
        .ka-format-logo .name{font-size:9px;}
        .ka-format-logo .sub{display:none;}
      }
    `;
    document.head.appendChild(style);
  }

  function isVisible(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity || '1') < .08) return false;
    const r = el.getBoundingClientRect();
    return r.width > 18 && r.height > 12 && r.bottom > 0 && r.right > 0 && r.left < innerWidth && r.top < innerHeight;
  }

  function overlap(a,b,pad=6){
    return !(a.right+pad <= b.left || a.left-pad >= b.right || a.bottom+pad <= b.top || a.top-pad >= b.bottom);
  }

  function getObstacles() {
    const selectors = [
      'button','a','input','select','textarea','img',
      '.header','.topbar','.top','.titlebar','.statusbar','.round-badge','.top-right',
      '.lives-strip','.buzz-side','.board','.board-wrap','.stage > *',
      '.players','.ladder','.jokers','.scoreboard','.card','.qframe','.turn-bar',
      '.host-buzz','.sound-toggle','.back-button','.zurueck','.game-pill'
    ];
    const seen = new Set();
    const out = [];
    document.querySelectorAll(selectors.join(',')).forEach(el=>{
      if (!isVisible(el) || seen.has(el)) return;
      seen.add(el);
      const r = el.getBoundingClientRect();
      // Ignore the huge background/stage itself; only meaningful content counts.
      if (r.width > innerWidth*.92 && r.height > innerHeight*.75) return;
      out.push(r);
    });
    return out;
  }

  function position(el, key) {
    const narrow = innerWidth < 700;
    const w = Math.min(narrow ? 184 : 238, innerWidth - 24);
    const h = narrow ? 38 : 48;
    el.style.width = w + 'px';
    el.style.height = h + 'px';

    const margin = narrow ? 10 : 14;
    const backSafe = narrow ? 56 : 66;
    const candidates = [
      {x:backSafe, y:margin, side:'left', label:'tl'},
      {x:margin, y:margin, side:'left', label:'tl2'},
      {x:innerWidth-w-margin, y:margin, side:'right', label:'tr'},
      {x:backSafe, y:innerHeight-h-76, side:'left', label:'bl'},
      {x:innerWidth-w-margin, y:innerHeight-h-76, side:'right', label:'br'},
      {x:(innerWidth-w)/2, y:margin, side:'center', label:'tc'},
      {x:(innerWidth-w)/2, y:innerHeight-h-margin, side:'center', label:'bc'}
    ];

    // Known layouts get a preferred free zone; the collision pass can still move it.
    if (key === 'higherlower') candidates.unshift({x:innerWidth-w-330,y:12,side:'right',label:'hl'});
    if (key === 'blackstories') candidates.unshift({x:72,y:74,side:'left',label:'bs'});
    if (key === 'millionaer') candidates.unshift({x:Math.max(80,(innerWidth-w)/2),y:88,side:'center',label:'wwm'});

    const obstacles = getObstacles();
    let best = null;
    for (const c of candidates) {
      const x = Math.max(6, Math.min(c.x, innerWidth-w-6));
      const y = Math.max(6, Math.min(c.y, innerHeight-h-6));
      const r = {left:x,top:y,right:x+w,bottom:y+h};
      let score = 0;
      for (const o of obstacles) {
        if (overlap(r,o,4)) {
          const ix = Math.max(0, Math.min(r.right,o.right)-Math.max(r.left,o.left));
          const iy = Math.max(0, Math.min(r.bottom,o.bottom)-Math.max(r.top,o.top));
          score += ix*iy;
        }
      }
      // Prefer the top edge and known preferred anchors when equally free.
      score += c.y * .03;
      if (c.label === 'tl' || c.label === 'hl' || c.label === 'bs' || c.label === 'wwm') score -= 8;
      if (!best || score < best.score) best = {x,y,score};
    }

    // If every anchor has content, put the badge into the smallest-overlap corner
    // rather than covering the central game area.
    el.style.left = best.x + 'px';
    el.style.top = best.y + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    el.classList.toggle('is-low', best.score > 2000);
  }

  function add() {
    const key = keyFromPath();
    const cfg = CONFIG[key];
    if (!cfg || document.querySelector('.ka-format-logo')) return;

    if (key === 'quizduell') {
      const hostView = document.getElementById('hostView');
      if (hostView && hostView.classList.contains('hidden')) {
        const mo = new MutationObserver(() => {
          if (!hostView.classList.contains('hidden')) { mo.disconnect(); add(); }
        });
        mo.observe(hostView, {attributes:true, attributeFilter:['class']});
        return;
      }
    }

    addStyle();
    const el = document.createElement('div');
    el.className = 'ka-format-logo';
    el.setAttribute('aria-label', cfg.name);
    el.style.setProperty('--c1', cfg.colors[0]);
    el.style.setProperty('--c2', cfg.colors[1]);
    el.style.setProperty('--c3', cfg.colors[2]);
    el.innerHTML = `<div class="art">${cfg.icon(cfg.colors)}</div><div class="copy"><div class="name">${cfg.name}</div><div class="sub">${cfg.sub}</div></div>`;
    document.body.appendChild(el);

    const reposition = () => position(el, key);
    reposition();
    window.addEventListener('resize', reposition, {passive:true});
    window.addEventListener('orientationchange', () => setTimeout(reposition, 120), {passive:true});

    // Dynamic host layouts (players, boards, scores) can change after load.
    let raf = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(reposition);
    });
    observer.observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['class','style','hidden']});
    setTimeout(reposition, 300);
    setTimeout(reposition, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add);
  else add();
})();
