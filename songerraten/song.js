(()=>{
'use strict';
const sb=window.KA_SB, director=location.pathname.endsWith('spielleiter.html');
const params=new URLSearchParams(location.search), stream=params.has('stream'), playerView=location.pathname.endsWith('/spieler.html');
const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const DURATIONS=[.5,1,3,5,10],POINTS=[5,4,3,2,1],CATALOG=typeof SONG_KATALOG!=='undefined'?SONG_KATALOG:[];
const blank=()=>({revision:0,round:0,roundId:'',phase:'idle',stage:0,players:{},participants:[],locks:{},skipVotes:[],results:[],revealed:false,answer:'',artist:''});
let state=blank(),chosen=null,files=[],playingTimeout=null,autoStages=false,busy=false,joined='',search='',choice='';
try{joined=sessionStorage.getItem('ka_player_songerraten')||'';}catch(e){}
const normalized=s=>String(s||'').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const stage=()=>Math.max(0,Math.min(4,Number(state.stage)||0));
const players=()=>{const active=new Set(Object.keys(state.players||{}));return Array.isArray(state.participants)&&state.participants.length
 ? [...new Set(state.participants)].filter(n=>active.has(n))
 : [...active];};
const unlocked=()=>players().filter(n=>!(n in (state.locks||{})));
const status=message=>{const x=$('status')||$('connection');if(x)x.textContent=message;};
async function fetchState(){if(!sb)return;const {data,error}=await sb.from('song_state').select('state').eq('id',1).single();if(error){status('Verbindung zur Song-Datenbank fehlt');return;}acceptState(data.state);}
function acceptState(data){
 if(Number(data?.revision||0)<Number(state.revision||0))return;
 const previous=state;state={...blank(),...(data||{})};
 if(playerView&&joined&&!Object.prototype.hasOwnProperty.call(state.players||{},joined)){
   joined='';choice='';
   try{sessionStorage.removeItem('ka_player_songerraten');sessionStorage.removeItem('ka_current_player_songerraten');}catch(e){}
   status('Du bist nicht mehr in dieser Runde. Über „Spieler“ neu beitreten.');
 }
 render();
 if(director&&state.round===previous.round&&Number(state.stage)>Number(previous.stage)&&autoStages){playSegment();}
}
async function change(mutator){
 if(busy)return false;
 const secret=$('directorKey')?.value.trim();
 if(!secret){status('Regieschlüssel fehlt');return false;}
 if(!sb){status('Keine Supabase-Verbindung');return false;}
 busy=true;
 try{
  for(let retry=0;retry<5;retry++){
   const {data,error}=await sb.from('song_state').select('state').eq('id',1).single();
   if(error)throw error;
   const before={...blank(),...data.state},next=structuredClone(before);
   mutator(next);
   const result=await sb.rpc('song_commit',{p_state:next,p_expected:Number(before.revision||0),p_secret:secret});
   if(result.error)throw result.error;
   if(result.data===true){acceptState({...next,revision:Number(before.revision||0)+1});return true;}
  }
  throw Error('Gleichzeitige Änderung – bitte erneut versuchen');
 }catch(e){status('Speichern fehlgeschlagen: '+e.message+(String(e.message).includes('song_commit')?' · SQL-Datei erneut vollständig ausführen.':''));return false;}
 finally{busy=false;}
}
function stopAudio(){clearTimeout(playingTimeout);playingTimeout=null;const a=$('player');if(a){a.pause();try{a.currentTime=0;}catch(e){}}}
function selectSong(song){
 chosen=song;const title=$('title'),artist=$('artist');
 if(title)title.value=song.titel;if(artist)artist.value=song.interpret;
 if($('selectedSong'))$('selectedSong').textContent=song.titel+' · '+song.interpret;
 stopAudio();
 const a=$('player');if(!a)return;
 const matching=files.find(f=>normalized(f.file.name).includes(normalized(song.titel)));
 a.src=matching?matching.url:'audio/'+normalized(song.titel)+'.mp3';
 a.load();
}
function playSegment(){
 if(!director||!chosen)return;
 const a=$('player');if(!a)return;
 clearTimeout(playingTimeout);a.pause();
 try{a.currentTime=0;}catch(e){}
 const duration=DURATIONS[stage()];
 const start=()=>{clearTimeout(playingTimeout);playingTimeout=setTimeout(()=>a.pause(),duration*1000);};
 const promise=a.play();
 if(promise&&promise.then)promise.then(start).catch(()=>status('Audio konnte nicht gestartet werden. MP3 prüfen.'));
 else start();
 autoStages=true;
}
function renderResults(){
 const list=$('songResults');if(!list)return;
 list.innerHTML=state.revealed?(state.results||[]).map(r=>
  '<div class="song-result"><strong>'+esc(r.name)+'</strong><span>'+esc(r.guess)+'</span><b class="'+(r.points>0?'positive':'negative')+'">'+(r.points>0?'+':'')+r.points+'</b></div>'
 ).join(''):'';
}
function render(){
 const names=players(),locks=state.locks||{},votes=state.skipVotes||[],remaining=unlocked();
 const current=DURATIONS[stage()],count=votes.filter(n=>remaining.includes(n)).length;
 const stepText=current.toLocaleString('de-DE')+' Sekunden';
 if($('songStep'))$('songStep').textContent=stepText+' · '+POINTS[stage()]+' Punkte';
 if($('songProgress'))$('songProgress').textContent=Object.keys(locks).length+'/'+names.length+' eingeloggt';
 if($('skipStatus'))$('skipStatus').textContent=stage()===4?'Letzte Hörstufe – jetzt einen Song wählen':count+'/'+remaining.length+' Skip';
 if($('round'))$('round').textContent='RUNDE '+(state.round||'—');
 if($('phase'))$('phase').textContent=state.revealed?'AUFLÖSUNG':state.phase==='ready'?'ALLE EINGELOGGT':state.phase==='idle'?'BEREIT':'SONG ERRATEN';
 if($('answer'))$('answer').textContent=state.revealed?[state.answer,state.artist].filter(Boolean).join(' — '):'Welcher Song ist das?';
 if($('roster'))$('roster').innerHTML=names.map(n=>'<div class="roster-pill"><b>'+esc(n)+'</b><span>'+esc(state.revealed?String(state.players?.[n]??0):(n in locks?'✓':'…'))+'</span></div>').join('');
 if($('order'))$('order').textContent=state.revealed?'':Object.keys(locks).length+' von '+names.length+' Tipps abgegeben';
 if($('timer'))$('timer').textContent=current.toLocaleString('de-DE')+' s';
 if($('reveal'))$('reveal').disabled=state.phase!=='ready'||!chosen;
 if($('new'))$('new').disabled=!chosen;
 if($('songDirectorStatus'))$('songDirectorStatus').textContent=state.phase==='ready'?'Alle Tipps liegen vor. Jetzt auflösen.':state.phase==='playing'?'Hörstufe '+stepText+' · '+count+'/'+remaining.length+' Skip':'Bereit – Song auswählen und Neue Runde starten';
 if($('players'))$('players').innerHTML=Object.entries(state.players||{}).map(([n,p])=>'<div class="person"><b>'+esc(n)+'</b><span>'+Number(p||0)+' Punkte</span><button data-name="'+esc(n)+'" data-delta="-1">−</button><button data-name="'+esc(n)+'" data-delta="1">+</button><button data-remove="'+esc(n)+'">Entfernen</button></div>').join('');
 if(playerView){
  const locked=joined in locks,canPlay=state.phase==='playing'&&!state.revealed&&names.includes(joined);
  if($('songGuess'))$('songGuess').hidden=locked||!canPlay;
  if($('songLock')){$('songLock').disabled=locked||!canPlay||!choice;}
  if($('songSkip')){$('songSkip').hidden=stage()===4||locked||!canPlay;$('songSkip').disabled=votes.includes(joined);}
  if($('songLocked'))$('songLocked').textContent=!joined?'Bitte über „Spieler“ neu beitreten.':locked?'Tipp eingeloggt · '+DURATIONS[locks[joined]].toLocaleString('de-DE')+' s':(!canPlay?'Warte auf die nächste Runde':'');
 }
 renderResults();
}
function initPlayer(){
 const center=document.querySelector('.song-center');if(!center)return;
 center.insertAdjacentHTML('beforeend','<div class="song-play-panel"><div class="song-stat"><span id="songStep"></span><span id="songProgress"></span></div><div id="songGuess"><input id="songSearch" autocomplete="off" placeholder="Songtitel suchen" aria-label="Songtitel suchen"><div id="songSuggestions" class="song-suggestions"></div><button id="songLock" disabled>Einloggen</button></div><button id="songSkip">Skip stimmen</button><span id="skipStatus"></span><p id="songLocked"></p><div id="songResults" class="song-results"></div></div>');
 $('buzz')?.remove();
 const input=$('songSearch'),list=$('songSuggestions');
 let searchId=0,searchTimer=0,currentController=null,results=[],visible=0;
 const escapeResult=s=>esc(s);
 function paintResults(){
  const matches=results.slice(0,visible);
  list.innerHTML=matches.map((s,i)=>'<button type="button" data-song-index="'+i+'"><span>'+escapeResult(s.titel)+'</span><small>'+escapeResult(s.interpret)+'</small></button>').join('');
  if(results.length>visible)list.insertAdjacentHTML('beforeend','<button type="button" class="song-more" data-more="true">Weitere Songs anzeigen ('+(results.length-visible)+')</button>');
  if(input.value.trim().length>=2){
   list.insertAdjacentHTML('beforeend','<button type="button" class="song-custom" data-custom="true">„'+escapeResult(input.value.trim())+'“ <small>Titel selbst eingeben, falls er nicht gefunden wird</small></button>');
  }
 }
 async function searchItunes(term,signal){
  const url='https://itunes.apple.com/search?media=music&entity=song&limit=100&term='+encodeURIComponent(term);
  const response=await fetch(url,{signal,mode:'cors'});
  if(!response.ok)throw Error('iTunes HTTP '+response.status);
  const body=await response.json();
  return (body.results||[]).filter(r=>r.trackName&&r.artistName).map(r=>({titel:r.trackName,interpret:r.artistName}));
 }
 async function searchMusicBrainz(term,signal){
  // MusicBrainz ergaenzt seltenere und nicht im iTunes Store angebotene Titel.
  const url='https://musicbrainz.org/ws/2/recording/?fmt=json&limit=100&query='+encodeURIComponent(term);
  const response=await fetch(url,{signal,mode:'cors'});
  if(!response.ok)throw Error('MusicBrainz HTTP '+response.status);
  const body=await response.json();
  return (body.recordings||[]).filter(r=>r.title).map(r=>({titel:r.title,interpret:(r['artist-credit']||[]).map(a=>a.artist?.name||'').filter(Boolean).join(', ')||'Unbekannt'}));
 }
 function appendUnique(rows){
  const seen=new Set(results.map(r=>normalized(r.titel+' '+r.interpret)));
  for(const song of rows){
   const key=normalized(song.titel+' '+song.interpret);
   if(key&&!seen.has(key)){results.push(song);seen.add(key);}
  }
 }
 async function suggestions(){
  const id=++searchId;
  currentController?.abort();currentController=new AbortController();
  const signal=currentController.signal,term=input.value.trim();
  results=[];visible=0;
  if(term.length<2){list.innerHTML='<p class="song-search-info">Mindestens 2 Buchstaben eingeben.</p>';return;}
  list.innerHTML='<p class="song-search-info">Songs werden gesucht…</p>';
  let success=false;
  try{
   const songs=await searchItunes(term,signal);
   if(id!==searchId)return;
   appendUnique(songs);success=true;visible=Math.min(results.length,20);paintResults();
  }catch(e){if(id!==searchId||signal.aborted)return;}
  // Zweite Quelle: keine lokale Liste der moeglichen Loesungen verwenden.
  if(id!==searchId||signal.aborted)return;
  if(term.length>=3){
   try{
    const songs=await searchMusicBrainz(term,signal);
    if(id!==searchId)return;
    appendUnique(songs);success=true;visible=Math.max(visible,Math.min(results.length,20));paintResults();
   }catch(e){if(id!==searchId||signal.aborted)return;}
  }
  if(id!==searchId)return;
  if(!results.length){
   list.innerHTML='<p class="song-search-info">'+(success?'Keine Treffer gefunden.':'Musiksuche nicht erreichbar. Bitte Internetverbindung prüfen.')+'</p>';
   paintResults();
  }
 }
 input.oninput=()=>{
  choice='';$('songLock').disabled=true;
  currentController?.abort();clearTimeout(searchTimer);
  searchTimer=setTimeout(suggestions,360);
 };
 list.onclick=e=>{
  const item=e.target.closest('button');if(!item)return;
  if(item.dataset.more){visible=Math.min(results.length,visible+20);paintResults();return;}
  const selected=item.dataset.custom==='true'?{titel:input.value.trim(),interpret:''}:results[Number(item.dataset.songIndex)];
  if(!selected?.titel)return;
  choice=selected.titel;
  input.value=selected.interpret?selected.titel+' · '+selected.interpret:selected.titel;
  list.innerHTML='';$('songLock').disabled=false;
  // Auswahl muss bestehen bleiben, selbst wenn die Suche im Hintergrund noch laeuft.
  ++searchId;currentController?.abort();clearTimeout(searchTimer);
 };
 $('songLock').onclick=async()=>{if(!choice||!joined||!sb)return;const {data,error}=await sb.rpc('song_submit_guess',{p_name:joined,p_title:choice});if(error){status('Tipp konnte nicht gespeichert werden. Ist das SQL-Update ausgeführt?');return;}if(!data){status('Dieser Tipp wurde nicht angenommen.');return;}choice='';input.value='';await fetchState();};
 $('songSkip').onclick=async()=>{if(!joined||!sb)return;const {data,error}=await sb.rpc('song_vote_skip',{p_name:joined});if(error){status('Skip konnte nicht gespeichert werden. Ist das SQL-Update ausgeführt?');return;}if(data)await fetchState();};
}
function initDirector(){
 const cards=document.querySelectorAll('.studio-card');
 if(cards.length<2)return;
 cards[0].innerHTML='<h2>Songs</h2><label>MP3-Dateien optional auswählen<input id="files" type="file" accept="audio/*" multiple></label><select id="songCategory"></select><div id="songCatalog" class="song-list"></div><div id="selectedSong" class="song-selected"></div><audio id="player" preload="metadata" controls></audio><div class="actions"><button id="play">Ausschnitt abspielen</button><button id="pause">Stopp</button></div><label>Spotify-Link (optional)<input id="spotify" type="url" placeholder="https://open.spotify.com/track/…"></label><button id="spotifyOpen" class="secondary">Spotify öffnen</button>';
 cards[1].innerHTML='<h2>Runde</h2><label>Regieschlüssel<input id="directorKey" type="password" autocomplete="off"></label><input id="title" type="hidden"><input id="artist" type="hidden"><div id="songStep" class="song-director-step"></div><div id="songDirectorStatus"></div><div id="songProgress"></div><div id="skipStatus"></div><div class="actions"><button id="new">Neue Runde</button><button id="reveal">Alle Tipps auflösen</button></div><div id="songResults" class="song-results"></div>';
 const select=$('songCategory');select.innerHTML='<option value="">Alle Kategorien</option>'+[...new Set(CATALOG.map(x=>x.kategorie))].map(c=>'<option>'+esc(c)+'</option>').join('');
 function draw(){const cat=select.value;$('songCatalog').innerHTML=CATALOG.map((s,i)=>({...s,i})).filter(s=>!cat||s.kategorie===cat).map(s=>'<button class="song-choice" data-catalog="'+s.i+'">'+esc(s.titel)+' · '+esc(s.interpret)+'</button>').join('');}
 select.onchange=draw;draw();
 $('songCatalog').onclick=e=>{const b=e.target.closest('[data-catalog]');if(b)selectSong(CATALOG[Number(b.dataset.catalog)]);};
 $('files').onchange=()=>{files.forEach(f=>URL.revokeObjectURL(f.url));files=Array.from($('files').files||[]).map(file=>({file,url:URL.createObjectURL(file)}));if(chosen)selectSong(chosen);};
 $('play').onclick=playSegment;$('pause').onclick=stopAudio;
 $('spotifyOpen').onclick=()=>{try{const u=new URL($('spotify').value);if(u.hostname!=='open.spotify.com'||!u.pathname.startsWith('/track/'))throw Error();window.open(u.href,'_blank','noopener');}catch(e){status('Ungültiger Spotify-Track-Link');}};
 $('player').onerror=()=>status('Songdatei nicht gefunden. Bitte Audioordner und Dateinamen prüfen.');
 $('new').onclick=async()=>{
  if(!chosen)return;
  stopAudio();autoStages=false;
  await change(s=>{s.round=Number(s.round||0)+1;s.roundId=crypto.randomUUID();s.phase='playing';s.stage=0;s.revealed=false;s.answer='';s.artist='';s.participants=Object.keys(s.players||{});s.locks={};s.skipVotes=[];s.results=[];s.queue=[];s.out=[];s.timerEnd=null;});
 };
 $('reveal').onclick=async()=>{
  if(!chosen||state.phase!=='ready')return;
  const round=state.round;
  const {data,error}=await sb.rpc('song_get_guesses');
  if(error){status('Tipps können nicht geladen werden. SQL-Update ausführen.');return;}
  const submitted=(data||[]).filter(row=>players().includes(row.player_name));
  if(submitted.length!==players().length){status('Noch nicht alle Spieler eingeloggt.');return;}
  const rows=submitted.map(r=>({name:r.player_name,guess:r.song_title,stage:r.stage_index,points:normalized(r.song_title)===normalized(chosen.titel)?POINTS[r.stage_index]:-1}));
  const correct=chosen;
  if(await change(s=>{
   if(s.round!==round||s.revealed)return;
   for(const row of rows)s.players[row.name]=(Number(s.players[row.name])||0)+row.points;
   s.results=rows;s.phase='revealed';s.revealed=true;s.answer=correct.titel;s.artist=correct.interpret;
  }))stopAudio();
 };
 $('add').onclick=()=>{const n=$('addName').value.trim();if(n)change(s=>{s.players[n]??=0;$('addName').value='';});};
 $('players').onclick=e=>{const b=e.target.closest('button');if(!b)return;const n=b.dataset.name||b.dataset.remove;change(s=>{if(!(n in s.players))return;if(b.dataset.remove){
   delete s.players[n];
   s.participants=(s.participants||[]).filter(name=>name!==n);
   if(s.locks)delete s.locks[n];
   s.skipVotes=(s.skipVotes||[]).filter(name=>name!==n);
   s.queue=(s.queue||[]).filter(name=>name!==n);
   s.out=(s.out||[]).filter(name=>name!==n);
   s.results=(s.results||[]).filter(row=>row.name!==n);
   const roster=s.participants.length;
   if(roster===0){s.phase='idle';s.revealed=false;}
   else if(s.phase==='ready'&&Object.keys(s.locks||{}).length<roster)s.phase='playing';
   else if(s.phase==='playing'&&Object.keys(s.locks||{}).length>=roster)s.phase='ready';
  }else{s.players[n]+=Number(b.dataset.delta);}});};
}
if(director)initDirector();else if(playerView)initPlayer();
if(sb){
 fetchState();
 sb.channel('song_sync_'+Math.random()).on('postgres_changes',{event:'*',schema:'public',table:'song_state'},p=>{if(p.new?.state)acceptState(p.new.state);}).subscribe();
 setInterval(fetchState,6500);
}else status('Verbindung nicht verfügbar');
})();
