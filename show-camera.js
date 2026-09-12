/* ============================================================
   SHOW CAMERA LAYER
   Gemeinsame Kamera-Buehne fuer Streamer-Spieler + OBS.
   - LiveKit SFU
   - nur Kamera, kein Mikrofon
   - gleiche Kachelgroesse fuer alle Teilnehmer
   - Supabase Edge Function erzeugt kurzlebige LiveKit-Tokens
   ============================================================ */
(function(){
  'use strict';

  const KA = window.KA_SHOW_CAMERA = window.KA_SHOW_CAMERA || {};
  // Backwards-compatible alias used by older host/player join code.
  window.KA_CAM = KA;
  const LIVEKIT_CDN = 'https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js';
  let layer = null;
  let room = null;
  let lkLoading = null;
  let started = false;
  let localCameraOn = false;
  let wantsCameraOn = false;
  let connectPromise = null;
  let reconnectTimer = null;
  let reconnectAttempt = 0;
  let connectedRole = null;
  let connectedIdentity = null;
  const cards = new Map();

  function format(){
    const parts = location.pathname.split('/').filter(Boolean);
    const known = ['ausreden','bluff-quiz','blackstories','emoji','higherlower','hotzone','imposter','millionaer','morph','quizduell','weristdas'];
    return parts.find(p => known.includes(p)) || '';
  }

  function isStream(){ return new URLSearchParams(location.search).get('stream') === '1'; }

  function sessionId(){
    const q = new URLSearchParams(location.search);
    const fromUrl = String(q.get('session') || '').trim();
    if(/^[A-Za-z0-9_-]{32,128}$/.test(fromUrl)) return fromUrl;
    if(/^[A-Za-z0-9_-]{32,128}$/.test(String(window.KA_SHOW_SESSION || ''))) return String(window.KA_SHOW_SESSION);
    try {
      const stored = String(localStorage.getItem('ka_show_session') || '').trim();
      return /^[A-Za-z0-9_-]{32,128}$/.test(stored) ? stored : '';
    } catch(e) { return ''; }
  }

  function opaqueId(prefix){
    const id = prefix + '_' + crypto.randomUUID();
    return id.replace(/[^A-Za-z0-9:_-]/g,'').slice(0,128);
  }

  function currentPlayer(){
    try {
      let p = null;
      const fmt = format();
      const sid = sessionId();
      const playerSession = String(sessionStorage.getItem('ka_player_session_'+fmt) || '').trim();
      // Nach einem Reset darf eine alte Browser-Identitaet nicht noch kurz als
      // Kamera-Spieler auftauchen, bevor public-client.js die Seite neu laedt.
      if(sid && playerSession && playerSession !== sid) return null;
      const raw = sessionStorage.getItem('ka_current_player_'+fmt);
      if(raw){
        try { p = JSON.parse(raw); } catch(e) {}
      }

      // Bestehende Spielseiten speichern den Namen teils noch im sessionStorage.
      // Dadurch funktioniert die Kamera auch nach dem Wechsel von der Buzzer-
      // auf die gemeinsame Host/Spieler-Seite, ohne den Namen erneut abzufragen.
      if(p && p.format && p.format !== fmt) p=null;
      if(!p || !p.name){
        const keys = {
          emoji:['er_name'],
          weristdas:['wid_name'],
          morph:['mo_name'],
          hotzone:['hz_name'],
          millionaer:['wwm_name'],
          'bluff-quiz':['bl_name'],
          ausreden:['ak_name','ar_name'],
          quizduell:['quizduell_player_name','quiz_name'],
          higherlower:[], blackstories:[], imposter:[]
        }[fmt] || [];
        let name='';
        for(const key of keys){
          name=String(sessionStorage.getItem(key)||'').trim();
          if(name) break;
        }
        if(name) p={name,format:fmt};
      }
      if(!p || !p.name) return null;

      // Pro Browser-Tab eine eigene LiveKit-Identitaet. localStorage waere
      // tabuebergreifend und kann bei mehreren Fenstern denselben Teilnehmer
      // aus dem Raum werfen. Vorhandene sessionStorage-Spieler-ID bleibt stabil.
      const idKey='ka_camera_participant_id_'+fmt;
      let participantId = String(p.participantId || sessionStorage.getItem(idKey) || '').trim();
      if(!/^[A-Za-z0-9:_-]{8,128}$/.test(participantId)){
        participantId = opaqueId('p');
      }
      sessionStorage.setItem(idKey, participantId);
      p.participantId = participantId;
      sessionStorage.setItem('ka_current_player_'+fmt, JSON.stringify(p));
      return p;
    } catch(e) { return null; }
  }

  function observerId(){
    try {
      let id = String(sessionStorage.getItem('ka_camera_observer_id') || '').trim();
      if(!/^[A-Za-z0-9:_-]{8,128}$/.test(id)){
        id = opaqueId('obs');
        sessionStorage.setItem('ka_camera_observer_id', id);
      }
      return id;
    } catch(e){ return opaqueId('obs'); }
  }

  function personIcon(){return '<div class="ka-placeholder-inner"><div class="ka-person"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2"></circle><path d="M5.5 20c.7-3.8 3-5.8 6.5-5.8s5.8 2 6.5 5.8"></path></svg></div><div class="ka-placeholder-label">Kamera aus</div></div>';}

  function ensure(){
    if(layer) return layer;
    layer=document.createElement('div');
    layer.className='ka-camera-layer';
    layer.dataset.format=format();
    if(isStream()) layer.classList.add('ka-stream');
    layer.hidden=true;
    layer.innerHTML='<div class="ka-camera-empty" hidden></div>';
    if(isStream()){ document.documentElement.classList.add('ka-stream-mode'); document.body.classList.add('ka-stream-mode'); }
    document.body.appendChild(layer);
    return layer;
  }

  function normalizePlayers(players){
    if(!Array.isArray(players)) return [];
    return players.map((p,i)=>typeof p==='string'
      ? {id:p,name:p,score:0,hasVideo:false}
      : ({id:p.id||p.name||String(i),name:p.name||p.spieler||'Spieler',score:p.score??p.punkte??p.points??p.leben??0,hasVideo:!!p.hasVideo}));
  }

  function ensureCard(p){
    const id=String(p.id);
    let card=cards.get(id);
    if(card) return card;
    card=document.createElement('div');
    card.className='ka-camera-card';
    card.dataset.playerId=id;
    card.innerHTML='<div class="ka-placeholder">'+personIcon()+'</div><video playsinline autoplay muted></video><div class="ka-camera-live">KAMERA</div><div class="ka-camera-meta"><div class="ka-camera-name"></div><div class="ka-camera-score"></div></div>';
    ensure().appendChild(card);
    cards.set(id,card);
    return card;
  }

  function stageLayout(count){
    const fmt=format();
    // Imposter ist die Ausnahme zur normalen unteren Kamera-Reihe:
    // maximal drei große Kameras pro Reihe (z.B. 6 Spieler = 3 x 2).
    if(fmt==='imposter') return {cols:Math.min(3,Math.max(1,count)),rows:Math.ceil(count/3)};
    // Black Stories nutzt links/rechts eigene Seiten-Spalten; die Grid-Werte
    // werden dort nur als Fallback gebraucht.
    if(fmt==='blackstories') return {cols:2,rows:Math.max(1,Math.ceil(count/2))};
    // Alle anderen Formate: eine ruhige Kamera-Reihe unten.
    return {cols:Math.max(1,count),rows:1};
  }

  KA.render=function(players,opts={}){
    const list=normalizePlayers(players).slice(0,8); const el=ensure();
    const count=list.length;
    el.hidden=count===0;
    document.body.classList.toggle('ka-has-cameras',count>0);
    if(!count) return el;
    el.style.setProperty('--ka-count', String(count));
    el.dataset.count=String(count);
    const layout=stageLayout(count);
    el.style.setProperty('--ka-cols', String(layout.cols));
    el.style.setProperty('--ka-rows', String(layout.rows));
    const keep=new Set(list.map(p=>String(p.id)));
    for(const [id,card] of cards){if(!keep.has(id)){card.remove();cards.delete(id);}}
    const me=currentPlayer();
    list.forEach((p,index)=>{
      const card=ensureCard(p);
      card.dataset.index=String(index);
      card.removeAttribute('data-side');
      card.removeAttribute('data-side-row');
      if(format()==='blackstories'){
        const split=Math.ceil(count/2);
        const side=index<split?'left':'right';
        const row=index<split?index:(index-split);
        card.dataset.side=side;
        card.dataset.sideRow=String(row+1);
      }
      card.querySelector('.ka-camera-name').textContent=p.name;
      const label=opts.scoreLabel || 'PUNKTE';
      card.querySelector('.ka-camera-score').textContent=(p.score ?? 0)+' '+label;
      card.classList.toggle('is-local',!!(me&&me.name===p.name));
      if(!card.classList.contains('has-video')) card.querySelector('.ka-camera-live').classList.remove('on');
      card.querySelector('.ka-camera-live').textContent=card.classList.contains('has-video')?'LIVE':'CAM AUS';
    });
    updateOwnControls();
    return el;
  };

  KA.updateScore=function(id,score,label){
    const c=cards.get(String(id));
    if(c)c.querySelector('.ka-camera-score').textContent=(score??0)+' '+(label||'PUNKTE');
  };

  KA.attachVideo=function(id,track){
    const c=cards.get(String(id));
    if(!c)return false;
    const v=c.querySelector('video');
    try{
      if(track && typeof track.attach === 'function') track.attach(v);
      else if(track instanceof MediaStream){v.srcObject=track;v.play().catch(()=>{});}
      else v.srcObject=null;
    }catch(e){}
    c.classList.toggle('has-video',!!track);
    const live=c.querySelector('.ka-camera-live');
    live.classList.toggle('on',!!track);
    live.textContent=track?'LIVE':'CAM AUS';
    return true;
  };

  KA.detachVideo=function(id){
    const c=cards.get(String(id)); if(!c)return false;
    const v=c.querySelector('video');
    try{v.srcObject=null;}catch(e){}
    c.classList.remove('has-video');
    const live=c.querySelector('.ka-camera-live');
    live.classList.remove('on');
    live.textContent='CAM AUS';
    return true;
  };

  KA.clear=function(){
    if(room){try{room.disconnect();}catch(e){} room=null;}
    connectedRole=null; connectedIdentity=null;
    if(layer)layer.remove(); layer=null; cards.clear(); started=false; localCameraOn=false;
  };

  function readScoreFromDom(name){
    const root=document.getElementById('scoreboard') || document.querySelector('.scoreboard');
    if(!root) return null;
    const nodes=[...root.querySelectorAll('*')];
    const hit=nodes.find(n=>n.children.length===0 && (n.textContent||'').trim()===name);
    if(!hit) return null;
    const parent=hit.closest('[data-player],.score-item,.spieler,.player,.score-row,li,div') || hit.parentElement;
    const nums=((parent&&parent.textContent)||'').match(/-?\d+/g);
    return nums&&nums.length ? Number(nums[nums.length-1]) : null;
  }

  async function gamePlayers(){
    const fmt=format(); const sb=window.KA_SB; if(!sb) return null;
    try{
      const map={emoji:['er_state','state',1],weristdas:['wid_state','state',1],morph:['mo_state','state',1],higherlower:['hl_state','state',1],imposter:['imp_state','state',1],hotzone:['hz_state','state',1],millionaer:['wwm_state','state',1],blackstories:['bs_state','data','main']};
      const cfg=map[fmt]; if(!cfg) return null;
      const {data}=await sb.from(cfg[0]).select(cfg[1]).eq('id',cfg[2]).single(); const st=data&&data[cfg[1]]||{};
      if(fmt==='higherlower') return (st.players||[]).map(p=>({id:p.name,name:p.name,score:Number(p.score||0)}));
      if(fmt==='blackstories') return (st.players||[]).map(p=>({id:p.name,name:p.name,score:Number(p.score||0)}));
      if(fmt==='hotzone') return Object.entries(st.players||{}).map(([name,p])=>({id:name,name,score:Number((p&&p.score)||0),team:p&&p.team||null}));
      return Object.entries(st.players||{}).map(([name,v])=>({id:name,name,score:typeof v==='number'?v:Number((v&&v.score)||0)}));
    }catch(e){return null;}
  }

  async function autoSync(){
    let rows=await gamePlayers();
    const names=(window.KA_CREW&&window.KA_CREW.names)?window.KA_CREW.names():[];
    if(!rows) rows=[];
    names.forEach(name=>{ if(!rows.some(p=>p.name===name)) rows.push({id:name,name,score:readScoreFromDom(name) ?? 0}); });
    const me=currentPlayer();
    if(me && me.name && !rows.some(p=>p.name===me.name)) rows.push({id:me.name,name:me.name,score:0});
    KA.render(rows,{scoreLabel:'PUNKTE'});
    // Falls die Seite vor der Namenseingabe als Observer verbunden war, wird sie
    // nach dem Join automatisch auf einen Player-Token hochgestuft. Kein Reload,
    // keine DevTools und kein Cache-Loeschen noetig.
    if(me && roomConnected() && (connectedRole!=='player' || connectedIdentity!==me.participantId) && !connectPromise){
      connect(true).then(()=>{ if(wantsCameraOn) return enableOwnCamera(); }).catch(()=>scheduleReconnect());
    }
    if(format()==='hotzone'){
      rows.forEach(p=>{
        const c=cards.get(String(p.id));
        const zone=document.querySelector('[data-ka-team-zone="'+(p.team||'none')+'"]');
        if(c&&zone) zone.appendChild(c);
      });
      // Team-Zonen kennen ihre eigene Spielerzahl. So kann Hotzone 1–3 Spieler
      // pro Team gross darstellen und erst bei 4 Spielern auf 2x2 wechseln.
      document.querySelectorAll('.ka-hotzone-team-cams[data-ka-team-zone]').forEach(zone=>{
        zone.dataset.count=String(zone.querySelectorAll('.ka-camera-card').length);
      });
    }
  }

  function updateOwnControls(){
    if(!layer) return;
    layer.querySelectorAll('.ka-camera-toggle').forEach(btn=>btn.remove());
    const me=currentPlayer();
    if(isStream() || !me) return;
    const id=findCardId(me.name);
    const card=cards.get(String(id));
    if(!card) return;
    const button=document.createElement('button');
    button.type='button';
    button.className='ka-camera-toggle';
    button.textContent=localCameraOn?'Kamera aus':'Kamera an';
    button.classList.toggle('on',localCameraOn);
    button.title='Nur Bild – kein Mikrofon';
    button.addEventListener('click',()=>KA.toggleCamera());
    card.appendChild(button);
  }

  async function loadLiveKit(){
    if(window.LivekitClient) return window.LivekitClient;
    if(lkLoading) return lkLoading;
    lkLoading=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src=LIVEKIT_CDN;
      s.async=true;
      s.onload=()=>window.LivekitClient?resolve(window.LivekitClient):reject(new Error('LiveKit SDK wurde nicht geladen.'));
      s.onerror=()=>reject(new Error('LiveKit SDK konnte nicht geladen werden.'));
      document.head.appendChild(s);
    });
    return lkLoading;
  }

  async function fetchCameraToken(identity,name,role){
    const sid=sessionId();
    if(!sid) throw new Error('Keine Spiel-Session angegeben.');
    if(!window.KA_SB || !window.KA_SB.functions) throw new Error('Supabase-Client ist nicht bereit.');
    const cfg=window.KA_CAMERA_CONFIG || {};
    const functionName=String(cfg.functionName || 'livekit-token').trim();
    const {data,error}=await window.KA_SB.functions.invoke(functionName,{
      body:{session:sid,format:format(),identity,name,role:role||'player'}
    });
    if(error) throw new Error(error.message || 'Kamera-Token konnte nicht geladen werden.');
    if(!data || !data.token || !data.url) throw new Error((data&&data.message)||'Kamera-Server hat keine gültigen Zugangsdaten geliefert.');
    return data;
  }

  function participantName(p){ return String((p&&p.name) || '').trim(); }

  function findCardId(name){
    for(const [id,c] of cards){ if((c.querySelector('.ka-camera-name')?.textContent||'')===name) return id; }
    return name;
  }

  function setParticipantVideo(participant,track){
    const name=participantName(participant); if(!name)return;
    const id=findCardId(name); KA.attachVideo(id,track);
  }

  function bindParticipant(p){
    if(!p || !p.videoTrackPublications) return;
    p.videoTrackPublications.forEach(pub=>{ if(pub && pub.track) setParticipantVideo(p,pub.track); });
  }

  function roomConnected(){
    if(!room) return false;
    const st=String(room.state || room.connectionState || '').toLowerCase();
    return st==='connected';
  }

  function clearReconnectTimer(){
    if(reconnectTimer){ clearTimeout(reconnectTimer); reconnectTimer=null; }
  }

  function scheduleReconnect(delay){
    if(!sessionId() || reconnectTimer || document.visibilityState==='hidden') return;
    const waits=[800,1500,3000,5000,8000,12000];
    const ms=delay ?? waits[Math.min(reconnectAttempt,waits.length-1)];
    reconnectAttempt++;
    reconnectTimer=setTimeout(async()=>{
      reconnectTimer=null;
      try{
        await connect(true);
        reconnectAttempt=0;
        if(wantsCameraOn && !isStream() && currentPlayer()) await enableOwnCamera();
      }catch(err){
        console.info('[Quiz-App] Kamera-Neuverbindung wartet:',err&&err.message||err);
        scheduleReconnect();
      }
    },ms);
  }

  async function connect(force){
    if(roomConnected() && !force) return room;
    if(connectPromise) return connectPromise;
    connectPromise=(async()=>{
      if(room){
        try{ await room.disconnect(); }catch(e){}
        room=null;
        connectedRole=null; connectedIdentity=null;
      }
      const stream=isStream();
      const me=currentPlayer();
      const observer=stream || !me;
      const role=observer?'observer':'player';
      const identity=observer?observerId():me.participantId;
      const data=await fetchCameraToken(identity,stream?'OBS':(observer?'HOST':me.name),role);
      const lk=await loadLiveKit();
      const nextRoom=new lk.Room({adaptiveStream:true,dynacast:true});
      room=nextRoom;

      nextRoom.on(lk.RoomEvent.TrackSubscribed,(track,publication,participant)=>{
        if(track.kind!==lk.Track.Kind.Video) return;
        setParticipantVideo(participant,track);
      });
      nextRoom.on(lk.RoomEvent.TrackUnsubscribed,(track,publication,participant)=>{
        if(track.kind!==lk.Track.Kind.Video) return;
        KA.detachVideo(findCardId(participantName(participant)));
      });
      nextRoom.on(lk.RoomEvent.ParticipantDisconnected,participant=>{
        KA.detachVideo(findCardId(participantName(participant)));
      });
      if(lk.RoomEvent.Disconnected) nextRoom.on(lk.RoomEvent.Disconnected,()=>{
        if(room===nextRoom) room=null;
        connectedRole=null; connectedIdentity=null;
        localCameraOn=false;
        updateOwnControls();
        scheduleReconnect();
      });
      if(lk.RoomEvent.Reconnected) nextRoom.on(lk.RoomEvent.Reconnected,()=>{
        reconnectAttempt=0; clearReconnectTimer();
        nextRoom.remoteParticipants.forEach(bindParticipant);
      });

      await nextRoom.connect(data.url,data.token,{autoSubscribe:true});
      connectedRole=role;
      connectedIdentity=identity;
      reconnectAttempt=0; clearReconnectTimer();
      nextRoom.remoteParticipants.forEach(bindParticipant);
      return nextRoom;
    })();
    try{return await connectPromise;}
    finally{connectPromise=null;}
  }

  async function enableOwnCamera(){
    const me=currentPlayer();
    if(!me) return false;
    // Eine Host-Seite kann zuerst als Observer verbinden und erst danach
    // einen Spielernamen erhalten. Vor dem Publizieren MUSS dann ein neuer
    // Player-Token geholt werden, sonst meldet LiveKit "insufficient permissions".
    if(!roomConnected() || connectedRole!=='player' || connectedIdentity!==me.participantId){
      await connect(true);
    }
    const lk=window.LivekitClient;
    const lp=room && room.localParticipant;
    if(!lp) throw new Error('Kamera-Raum ist noch nicht verbunden.');
    await lp.setCameraEnabled(true);
    localCameraOn=true;
    const source=lk.Track && lk.Track.Source ? lk.Track.Source.Camera : 'camera';
    const pub=lp.getTrackPublication ? lp.getTrackPublication(source) : null;
    if(pub && pub.track) KA.attachVideo(me.name,pub.track);
    updateOwnControls();
    return true;
  }

  KA.toggleCamera=async function(){
    const me=currentPlayer();
    if(!me) return false;
    try{
      if(localCameraOn || wantsCameraOn){
        wantsCameraOn=false;
        if(roomConnected() && room.localParticipant) await room.localParticipant.setCameraEnabled(false);
        localCameraOn=false;
        KA.detachVideo(me.name);
      }else{
        wantsCameraOn=true;
        await enableOwnCamera();
      }
      updateOwnControls();
      return localCameraOn;
    }catch(err){
      localCameraOn=false;
      console.warn('[Quiz-App] Kamera konnte nicht gestartet werden:',err);
      scheduleReconnect(900);
      updateOwnControls();
      const button=layer && layer.querySelector('.ka-camera-toggle');
      if(button){
        button.textContent='Kamera verbindet…';
        button.title=String((err&&err.message)||err||'Kamera konnte nicht gestartet werden.');
        setTimeout(()=>{ updateOwnControls(); },2200);
      }
      return false;
    }
  };

  KA.refreshIdentity=async function(){
    try{
      if(room){ await room.disconnect(); }
    }catch(e){}
    room=null;
    connectedRole=null; connectedIdentity=null;
    localCameraOn=false;
    wantsCameraOn=false;
    clearReconnectTimer();
    started=false;
    updateOwnControls();
    return KA.start();
  };

  KA.start=async function(){
    if(started) return;
    started=true;
    ensure();
    autoSync();
    if(!KA._timer) KA._timer=setInterval(autoSync,1200);
    updateOwnControls();

    // public-client.js holt die gemeinsame Show-Session zentral aus Supabase.
    // Darauf warten, bevor LiveKit verbindet; sonst koennen zwei Browser
    // versehentlich in unterschiedlichen Raeumen landen.
    try {
      if(window.KA_SHOW_SESSION_READY && typeof window.KA_SHOW_SESSION_READY.then==='function')
        await window.KA_SHOW_SESSION_READY;
    } catch(e) {}

    if(!sessionId()) return;
    try { await connect(); }
    catch(err){ console.info('[Quiz-App] Kamera-Verbindung wartet:',err.message); scheduleReconnect(); }
  };


  function wakeCamera(){
    if(!sessionId()) return;
    if(!roomConnected()) scheduleReconnect(100);
    else if(wantsCameraOn && !localCameraOn && currentPlayer()) enableOwnCamera().catch(()=>scheduleReconnect());
  }
  window.addEventListener('online',wakeCamera);
  window.addEventListener('pageshow',wakeCamera);
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') wakeCamera(); });

  window.addEventListener('resize',()=>{ if(layer&&!layer.hidden) autoSync(); });
  window.addEventListener('ka:camera-score',e=>{const d=e.detail||{};KA.updateScore(d.id??d.name,d.score,d.label);});
  if(window.KA_CREW_READY) window.KA_CREW_READY.then(()=>KA.start());
  window.addEventListener('ka-crew-ready',()=>KA.start());
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>KA.start(),{once:true});
  else KA.start();
})();
