/* ============================================================
   QUIZ-APP CAMERA LAYER
   Local camera preview for players + WebRTC uplink to stream view.
   ============================================================ */
(function(){
  'use strict';
  const state={format:'', name:'', role:'player', id:'', stream:null, pc:null, channel:null, remote:new Map(), metaTimer:null};
  const iceServers=[{urls:'stun:stun.l.google.com:19302'}];
  function esc(s){const d=document.createElement('div');d.textContent=String(s||'');return d.innerHTML;}
  function id(){ return state.id || (state.id='cam-'+Math.random().toString(36).slice(2)+Date.now().toString(36)); }
  function channelName(){ return 'quizapp-cam-'+state.format; }
  function send(payload){ try{ return state.channel && state.channel.send({type:'broadcast',event:'cam-signal',payload}); }catch(e){} }
  function addStyle(){ if(document.getElementById('kaCamStyle'))return; const s=document.createElement('style');s.id='kaCamStyle';s.textContent=`
  .ka-player-dock{position:fixed;left:18px;bottom:18px;width:min(330px,calc(100vw - 36px));z-index:9999;padding:14px;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:rgba(10,14,26,.94);backdrop-filter:blur(18px);box-shadow:0 18px 55px rgba(0,0,0,.45);font-family:Inter,system-ui,sans-serif;color:#eef1f8}
  .ka-player-dock .ka-top{display:flex;align-items:center;gap:10px}.ka-player-dock .ka-title{font-weight:900;letter-spacing:.08em;text-transform:uppercase;font-size:12px}.ka-player-dock .ka-status{margin-left:auto;font-size:10px;color:#7f8aa3}.ka-player-dock video{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:14px;background:#05070d;margin:10px 0}.ka-player-dock .ka-name{font-size:16px;font-weight:900}.ka-player-dock .ka-score{color:#00e5c7;font-weight:900}.ka-player-dock .ka-actions{display:flex;gap:8px}.ka-player-dock button{flex:1;border:0;border-radius:12px;padding:11px 12px;font-weight:900;cursor:pointer;background:#172038;color:#eef1f8}.ka-player-dock button.primary{background:linear-gradient(135deg,#00e5c7,#5a78fa);color:#06100f}.ka-player-dock button:disabled{opacity:.4;cursor:not-allowed}
  .ka-stream-wall{position:fixed;right:18px;bottom:18px;z-index:9998;display:grid;grid-template-columns:repeat(2,minmax(180px,280px));gap:12px;max-width:min(620px,calc(100vw - 36px));max-height:46vh;overflow:auto}.ka-stream-card{position:relative;border:1px solid rgba(255,255,255,.14);border-radius:18px;overflow:hidden;background:#090d18;box-shadow:0 14px 40px rgba(0,0,0,.4)}.ka-stream-card video{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:#05070d}.ka-stream-card .ka-meta{position:absolute;left:0;right:0;bottom:0;padding:9px 11px;background:linear-gradient(transparent,rgba(0,0,0,.9));display:flex;justify-content:space-between;align-items:end}.ka-stream-card .ka-meta b{font-size:13px}.ka-stream-card .ka-meta span{font-size:12px;color:#00e5c7;font-weight:900}.ka-stream-empty{padding:16px;border:1px dashed rgba(255,255,255,.15);border-radius:16px;color:#7f8aa3;background:rgba(10,14,26,.8);font-size:12px}
  .ka-stream-mode .ka-player-dock{display:none!important}
  @media(max-width:700px){.ka-stream-wall{grid-template-columns:1fr;right:10px;left:10px;bottom:10px;max-width:none}.ka-player-dock{left:10px;bottom:10px}}
  `;document.head.appendChild(s); }
  function playerUi(){
    addStyle();
    let dock=document.getElementById('kaPlayerDock');
    if(dock)return dock;
    dock=document.createElement('aside');dock.id='kaPlayerDock';dock.className='ka-player-dock';
    dock.innerHTML=`<div class="ka-top"><div class="ka-title">Spieler</div><div class="ka-status" id="kaCamStatus">Kamera aus</div></div><video id="kaLocalVideo" autoplay playsinline muted></video><div class="ka-top"><div class="ka-name" id="kaPlayerName"></div><div class="ka-score" id="kaPlayerScore">0 P</div></div><div class="ka-actions"><button id="kaCamBtn">Kamera aktivieren</button><button id="kaActionBtn" class="primary">BUZZ</button></div>`;
    document.body.appendChild(dock);return dock;
  }
  function streamUi(){
    addStyle();let wall=document.getElementById('kaStreamWall');if(wall)return wall;wall=document.createElement('div');wall.id='kaStreamWall';wall.className='ka-stream-wall';wall.innerHTML='<div class="ka-stream-empty" id="kaStreamEmpty">Warte auf Kameras…</div>';document.body.appendChild(wall);return wall;
  }
  async function cameraOn(){
    if(state.stream)return true;
    try{state.stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:640},height:{ideal:360},frameRate:{ideal:24,max:30}},audio:false});const v=document.getElementById('kaLocalVideo');if(v)v.srcObject=state.stream;const b=document.getElementById('kaCamBtn');if(b)b.textContent='Kamera stoppen';const st=document.getElementById('kaCamStatus');if(st)st.textContent='Live';return true;}catch(e){const st=document.getElementById('kaCamStatus');if(st)st.textContent='Kamera nicht verfügbar';return false;}
  }
  function cameraOff(){if(state.stream){state.stream.getTracks().forEach(t=>t.stop());state.stream=null;}const v=document.getElementById('kaLocalVideo');if(v)v.srcObject=null;const b=document.getElementById('kaCamBtn');if(b)b.textContent='Kamera aktivieren';const st=document.getElementById('kaCamStatus');if(st)st.textContent='Kamera aus';}
  async function makeOffer(to){
    if(!state.stream || !to)return;
    if(state.pc){try{state.pc.close()}catch(e){}}
    const pc=new RTCPeerConnection({iceServers});state.pc=pc;state.pc._to=to;
    state.stream.getTracks().forEach(t=>pc.addTrack(t,state.stream));
    pc.onicecandidate=e=>{if(e.candidate)send({kind:'ice',from:id(),to,candidate:e.candidate});};
    const offer=await pc.createOffer();await pc.setLocalDescription(offer);send({kind:'offer',from:id(),to,sdp:pc.localDescription,name:state.name});
  }
  async function handleSignal(p){
    if(!p||p.from===id())return;
    if(state.role==='player'){
      if(p.kind==='stream-ready' && state.stream) return makeOffer(p.from);
      if(p.kind==='answer' && p.to===id() && state.pc){await state.pc.setRemoteDescription(p.sdp);}
      if(p.kind==='ice' && p.to===id() && state.pc){try{await state.pc.addIceCandidate(p.candidate)}catch(e){}}
      return;
    }
    if(state.role==='stream'){
      if(p.kind==='hello'){send({kind:'stream-ready',from:id(),to:p.from});return;}
      if(p.kind==='meta'){updateCardMeta(p.from,p.name,p.score);return;}
      if(p.kind==='offer' && p.to===id()){
        const old=state.remote.get(p.from);if(old&&old.pc)old.pc.close();
        const pc=new RTCPeerConnection({iceServers});const rec={pc,name:p.name||'Spieler',score:0,video:null};state.remote.set(p.from,rec);
        pc.onicecandidate=e=>{if(e.candidate)send({kind:'ice',from:id(),to:p.from,candidate:e.candidate});};
        pc.ontrack=e=>{const card=ensureCard(p.from,rec.name,rec.score);const v=card.querySelector('video');if(v&&e.streams[0])v.srcObject=e.streams[0];};
        await pc.setRemoteDescription(p.sdp);const ans=await pc.createAnswer();await pc.setLocalDescription(ans);send({kind:'answer',from:id(),to:p.from,sdp:pc.localDescription});return;
      }
      if(p.kind==='ice' && p.to===id()){const rec=state.remote.get(p.from);if(rec)try{await rec.pc.addIceCandidate(p.candidate)}catch(e){}}
    }
  }
  function ensureCard(pid,name,score){
    const wall=streamUi();let card=document.getElementById('kaCam-'+pid.replace(/[^a-z0-9]/gi,''));if(!card){const safe=pid.replace(/[^a-z0-9]/gi,'');card=document.createElement('div');card.className='ka-stream-card';card.id='kaCam-'+safe;card.innerHTML=`<video autoplay playsinline></video><div class="ka-meta"><b></b><span></span></div>`;wall.appendChild(card);const empty=wall.querySelector('.ka-stream-empty');if(empty)empty.remove();}
    card.querySelector('b').textContent=name||'Spieler';card.querySelector('span').textContent=(score==null?'0':score)+' P';return card;
  }
  function updateCardMeta(pid,name,score){const rec=state.remote.get(pid);if(rec){rec.name=name||rec.name;rec.score=score??rec.score;}ensureCard(pid,name,score);}
  async function announce(){send({kind:'hello',from:id(),name:state.name});}
  async function initPlayer(){
    playerUi();document.getElementById('kaPlayerName').textContent=state.name||'Spieler';
    document.getElementById('kaCamBtn').onclick=()=>state.stream?cameraOff():cameraOn();
    document.getElementById('kaActionBtn').onclick=()=>{if(window.KA_PLAYER_HOST&&window.KA_PLAYER_HOST.action)window.KA_PLAYER_HOST.action();};
    announce();
    state.metaTimer=setInterval(()=>{const score=window.KA_PLAYER_HOST&&window.KA_PLAYER_HOST.score?window.KA_PLAYER_HOST.score():0;document.getElementById('kaPlayerScore').textContent=score+' P';send({kind:'meta',from:id(),name:state.name,score});},1000);
    window.addEventListener('beforeunload',cameraOff);
  }
  async function initStream(){document.documentElement.classList.add('ka-stream-mode');document.body.classList.add('ka-stream-mode');streamUi();await new Promise(r=>setTimeout(r,250));send({kind:'stream-ready',from:id()});}
  function init(opts){
    opts=opts||{};state.format=String(opts.format||'').trim();state.name=String(opts.name||'').trim();state.role=opts.role||((new URLSearchParams(location.search).get('stream')==='1')?'stream':'player');
    id();if(!state.format||!window.KA_SB)return;
    state.channel=window.KA_SB.channel(channelName());state.channel.on('broadcast',{event:'cam-signal'},({payload})=>handleSignal(payload)).subscribe(async status=>{if(status==='SUBSCRIBED'){if(state.role==='stream')initStream();else announce();}});
    if(state.role==='player')initPlayer();else initStream();
  }
  window.KA_CAM={init,cameraOn,cameraOff,isOn:()=>!!state.stream};
})();
