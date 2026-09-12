/* ============================================================
   HOST + PLAYER BUZZER
   Fuer Formate, in denen Spieler ausser dem Buzzer nichts eingeben.
   Namenseingabe und Buzzer leben direkt auf host.html.
   ============================================================ */
(function(){
  'use strict';
  const cfg = window.KA_HOST_BUZZER_CONFIG || {};
  if(!cfg.format || !cfg.table || !cfg.game || !window.KA_SB || !window.KA_PUBLIC) return;
  if(new URLSearchParams(location.search).get('stream') === '1') return;

  const sb = window.KA_SB;
  const side = document.querySelector('.buzz-side');
  if(!side) return;

  let myName = String(sessionStorage.getItem(cfg.nameKey || ('ka_player_'+cfg.format)) || '').trim();
  let latest = null;
  let pending = false;

  const style = document.createElement('style');
  style.textContent = `
    .ka-host-playerbox{width:100%;display:flex;flex-direction:column;gap:7px;align-items:stretch;margin-top:8px}
    .ka-host-playerbox input{width:100%;box-sizing:border-box;padding:9px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(7,11,22,.88);color:#fff;font:700 12px/1.2 Inter,system-ui,sans-serif;outline:none}
    .ka-host-playerbox input:focus{border-color:rgba(255,209,102,.75);box-shadow:0 0 0 3px rgba(255,209,102,.10)}
    .ka-host-playerbox button{border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:9px 10px;background:rgba(255,255,255,.08);color:#fff;font:900 11px/1 Inter,system-ui,sans-serif;cursor:pointer}
    .ka-host-playerbox .ka-host-playername{font:900 11px/1.25 Inter,system-ui,sans-serif;color:#fff;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ka-host-playerbox .ka-host-playerstatus{min-height:14px;font:700 9px/1.25 Inter,system-ui,sans-serif;color:rgba(231,236,248,.65);text-align:center}
    .buzz-orb.ka-player-buzz{cursor:pointer;user-select:none;transition:transform .12s ease,filter .18s ease,opacity .18s ease}
    .buzz-orb.ka-player-buzz:not(:disabled):active{transform:scale(.94)}
    .buzz-orb.ka-player-buzz:disabled{cursor:not-allowed;filter:saturate(.35);opacity:.48}
    .buzz-orb.ka-player-buzz.ka-ready{filter:drop-shadow(0 0 15px rgba(255,65,105,.52))}
  `;
  document.head.appendChild(style);

  let buzz = side.querySelector('.buzz-orb');
  if(buzz && buzz.tagName !== 'BUTTON'){
    const b = document.createElement('button');
    b.type = 'button';
    b.className = buzz.className;
    b.innerHTML = buzz.innerHTML;
    for(const a of Array.from(buzz.attributes)) if(a.name !== 'class') b.setAttribute(a.name,a.value);
    buzz.replaceWith(b);
    buzz = b;
  }
  if(!buzz) return;
  buzz.classList.add('ka-player-buzz');

  const box = document.createElement('div');
  box.className = 'ka-host-playerbox';
  side.appendChild(box);

  function esc(s){ const d=document.createElement('div'); d.textContent=String(s||''); return d.innerHTML; }
  function players(){ return (latest && latest.players) || {}; }
  function activeName(){ return (latest?.buzzQueue || []).find(n => !(latest?.buzzedOut || []).includes(n)) || ''; }
  function solved(){
    if(!latest) return true;
    if(cfg.game === 'emoji') return !!latest.solved;
    if(cfg.game === 'weristdas') return !!latest.solved;
    if(cfg.game === 'morph') return Number(latest.revealStep || 0) >= 2;
    return true;
  }
  function hasRound(){
    if(!latest) return false;
    if(cfg.game === 'emoji') return latest.riddleIndex != null;
    if(cfg.game === 'weristdas') return latest.imageIndex != null;
    if(cfg.game === 'morph') return latest.morphIndex != null;
    return false;
  }
  function canBuzz(){
    if(!myName || !latest || !Object.prototype.hasOwnProperty.call(players(),myName)) return false;
    if(!hasRound() || solved()) return false;
    if((latest.buzzQueue || []).includes(myName)) return false;
    if((latest.buzzedOut || []).includes(myName)) return false;
    return true;
  }
  function status(){
    if(!myName) return 'Name eingeben und beitreten.';
    if(!latest) return 'Verbinde…';
    if(!hasRound()) return cfg.game === 'emoji' ? 'Warte auf Rätsel…' : 'Warte auf Bild…';
    if(solved()) return 'Runde beendet.';
    if((latest.buzzedOut || []).includes(myName)) return 'Falsch – warte auf die nächste Runde.';
    const a = activeName();
    if(a === myName) return 'Du bist dran!';
    if((latest.buzzQueue || []).includes(myName)) return 'Gebuzzert – warte, bis du dran bist.';
    return canBuzz() ? 'Buzzer offen.' : (a ? 'Buzzer belegt.' : 'Warte…');
  }

  function render(){
    buzz.disabled = !canBuzz() || pending;
    buzz.classList.toggle('ka-ready', canBuzz() && !pending);
    if(!myName){
      if(!box.querySelector('input')){
        box.innerHTML = '<input id="kaHostPlayerName" maxlength="32" autocomplete="nickname" placeholder="Dein Name"><button type="button" id="kaHostPlayerJoin">Beitreten</button><div class="ka-host-playerstatus"></div>';
        box.querySelector('#kaHostPlayerJoin').addEventListener('click',()=>join());
        box.querySelector('#kaHostPlayerName').addEventListener('keydown',e=>{ if(e.key==='Enter') join(); });
      }
    } else if(!box.querySelector('.ka-host-playername')){
      box.innerHTML = `<div class="ka-host-playername">${esc(myName)}</div><div class="ka-host-playerstatus"></div>`;
    }
    const s = box.querySelector('.ka-host-playerstatus');
    if(s) s.textContent = status();
  }

  async function fetchState(){
    const {data,error} = await sb.from(cfg.table).select('state').eq('id',1).single();
    if(!error){ latest = data?.state || {}; render(); }
  }

  async function join(forcedName){
    if(pending) return;
    const input = box.querySelector('#kaHostPlayerName');
    const n = window.KA_PUBLIC.normalizeName(forcedName || input?.value || myName);
    if(!n){ input?.focus(); return; }
    pending = true; render();
    try{
      const reg = await window.KA_PUBLIC.registerPlayer(n,cfg.format);
      if(!reg?.ok) return;
      const {data,error} = await sb.rpc('party_buzzer_join',{
        p_game: cfg.game,
        p_name: n,
        p_fresh: !!reg.data?.fresh
      });
      if(error){ console.error('Host-Spielerbeitritt:',error); return; }
      myName = n;
      sessionStorage.setItem(cfg.nameKey || ('ka_player_'+cfg.format),n);
      sessionStorage.setItem('ka_player_'+cfg.format,n);
      latest = data?.state || data || latest;
      render();
      if(window.KA_CAM && typeof window.KA_CAM.refreshIdentity === 'function'){
        await window.KA_CAM.refreshIdentity();
      }
    } finally { pending=false; render(); }
  }

  async function doBuzz(){
    if(pending || !canBuzz()) return;
    pending=true; render();
    try{
      const {data,error} = await sb.rpc('buzz_anhaengen',{
        p_tabelle: cfg.table,
        p_name: myName,
        p_frozen: !!cfg.freeze
      });
      if(error) console.error('Host-Buzzer:',error);
      else latest = data || latest;
    } finally { pending=false; render(); }
  }

  buzz.addEventListener('click',doBuzz);
  fetchState();
  setInterval(fetchState,1000);
  if(myName) join(myName);
  else render();
})();
