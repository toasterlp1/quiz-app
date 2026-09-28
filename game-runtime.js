(function(){
  'use strict';
  const sb=window.KA_SB; if(!sb)return;
  const path=location.pathname.toLowerCase();
  const formats=['quizduell','higherlower','emoji','weristdas','morph','blackstories','imposter','hotzone','millionaer','bluff-quiz','ausreden','codenames'];
  const format=formats.find(f=>path.includes('/'+f+'/'))||''; if(!format)return;
  const autoFormats=new Set(['emoji','weristdas','morph']);
  const nativeTimerFormats=new Set(['emoji','weristdas','morph','higherlower','blackstories']);
  const isStream=new URLSearchParams(location.search).get('stream')==='1';
  const isMaster=/spielleiter\.html$/i.test(path)||(format==='quizduell'&&new URLSearchParams(location.search).get('rolle')==='spielleiter')||(format==='codenames'&&/index\.html$/i.test(path));
  const TEAM={rot:['ROT','#ef334e'],blau:['BLAU','#2d7ff9'],gruen:['GRÜN','#22c55e'],gelb:['GELB','#f5b82e'],lila:['LILA','#a855f7'],orange:['ORANGE','#f97316']};
  let runtime=null, players=[], channel=null, timerTick=null;
  const now=()=>typeof window.KA_NOW==='function'?window.KA_NOW():Date.now();
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function ensureTimer(){
    let el=document.getElementById('ka-runtime-timer');
    if(!el){el=document.createElement('div');el.id='ka-runtime-timer';el.hidden=true;document.body.appendChild(el)}
    return el;
  }
  function remaining(){
    if(!runtime||!runtime.timer_running||!runtime.timer_ends_at)return null;
    return Math.max(0,new Date(runtime.timer_ends_at).getTime()-now());
  }
  function renderTimer(){
    const el=ensureTimer();
    if(nativeTimerFormats.has(format)){el.hidden=true;return;}
    if(!runtime){el.hidden=true;return;}
    let ms=remaining();
    if(ms===null){
      const v=Number(runtime.timer_paused_remaining_ms||runtime.timer_duration_seconds*1000||0);
      if(v<=0){el.hidden=true;return} ms=v;
    }
    el.hidden=false;
    const sec=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(sec/60),s=sec%60;
    el.textContent=m+':'+String(s).padStart(2,'0');
    el.classList.toggle('danger',runtime.timer_running&&sec<=10&&sec>0);
    if(runtime.timer_running&&window.KA_DRAMA) KA_DRAMA.pulse(ms,'manual:'+format+':'+String(runtime.timer_started_at||''));
  }
  function renderTeams(){
    let strip=document.getElementById('ka-team-strip');
    if(!strip){strip=document.createElement('div');strip.id='ka-team-strip';document.body.appendChild(strip)}
    if(!runtime||runtime.play_mode!=='team'){strip.innerHTML='';strip.hidden=true;decorateCams();return}
    strip.hidden=false;
    const a=runtime.assignments||{};
    const used=[...new Set(Object.values(a).filter(x=>TEAM[x]))];
    const scores={};
    document.querySelectorAll('.ka-camera-card').forEach(card=>{
      const name=(card.querySelector('.ka-camera-name')?.textContent||'').trim(); const team=a[name];
      if(!team||!TEAM[team])return;
      const raw=(card.querySelector('.ka-camera-score')?.textContent||'').trim();
      const m=raw.match(/-?\d+/); const val=m?Number(m[0]):0; const label=raw.replace(/-?\d+/,'').trim();
      if(!scores[team])scores[team]={value:0,label:label}; scores[team].value+=val; if(!scores[team].label&&label)scores[team].label=label;
    });
    strip.innerHTML=used.map(k=>{const s=scores[k];return `<div class="ka-team-pill" style="--team:${TEAM[k][1]}"><i class="ka-team-dot"></i><span>${TEAM[k][0]}</span>${s?`<b class="ka-team-score">${s.value}${s.label?' '+esc(s.label):''}</b>`:''}</div>`}).join('');
    decorateCams();
  }
  function decorateCams(){
    const a=(runtime&&runtime.play_mode==='team'&&runtime.assignments)||{};
    let discovered=false;
    document.querySelectorAll('.ka-camera-card').forEach(card=>{
      const found=(card.querySelector('.ka-camera-name')?.textContent||'').trim();
      if(found&&!players.some(p=>p.name===found)){players.push({name:found});discovered=true;}

      const name=found;const t=a[name];
      if(t&&TEAM[t]){card.dataset.team=t;card.dataset.teamLabel=TEAM[t][0];card.style.setProperty('--ka-team',TEAM[t][1]);}
      else{delete card.dataset.team;delete card.dataset.teamLabel;card.style.removeProperty('--ka-team');}
    });
    if(discovered) renderAdmin();
  }
  function renderAdmin(){
    if(!isMaster||isStream)return;
    let box=document.getElementById('ka-runtime-admin');
    if(!box){box=document.createElement('section');box.id='ka-runtime-admin';document.body.appendChild(box)}
    const mode=runtime?.play_mode||'solo';
    const ass=runtime?.assignments||{};
    const playerRows=players.map(p=>`<div class="ka-player-row"><div class="ka-player-name">${esc(p.name)}</div><select data-team-name="${esc(p.name)}"><option value="">–</option>${Object.entries(TEAM).map(([k,v])=>`<option value="${k}" ${ass[p.name]===k?'selected':''}>${v[0]}</option>`).join('')}</select></div>`).join('');
    const timer=nativeTimerFormats.has(format)?'':`<div class="ka-row"><input id="ka-duration" type="number" min="10" max="600" step="5" value="${Number(runtime?.timer_duration_seconds||60)}" aria-label="Sekunden"><button id="ka-start">START</button><button id="ka-pause">PAUSE</button><button id="ka-reset">RESET</button></div>`;
    box.innerHTML=`<div class="ka-rh"><span>SPIEL</span><span>${format.toUpperCase()}</span></div><div class="ka-rbody"><div class="ka-row"><button id="ka-solo" ${mode==='solo'?'disabled':''}>SOLO</button><button id="ka-team" ${mode==='team'?'disabled':''}>TEAM</button></div>${mode==='team'?`<div>${playerRows||'<div class="ka-mini">Keine Spieler</div>'}</div>`:''}${timer}</div>`;
    box.querySelector('#ka-solo')?.addEventListener('click',()=>rpc('game_runtime_set_mode',{p_format:format,p_mode:'solo'}));
    box.querySelector('#ka-team')?.addEventListener('click',()=>rpc('game_runtime_set_mode',{p_format:format,p_mode:'team'}));
    box.querySelectorAll('[data-team-name]').forEach(sel=>sel.addEventListener('change',()=>rpc('game_runtime_set_assignment',{p_format:format,p_name:sel.dataset.teamName,p_team:sel.value||null})));
    box.querySelector('#ka-start')?.addEventListener('click',()=>{const sec=Math.max(10,Math.min(600,Number(box.querySelector('#ka-duration')?.value||60)));rpc('game_runtime_timer_start',{p_format:format,p_seconds:sec})});
    box.querySelector('#ka-pause')?.addEventListener('click',()=>rpc('game_runtime_timer_pause',{p_format:format}));
    box.querySelector('#ka-reset')?.addEventListener('click',()=>{const sec=Math.max(10,Math.min(600,Number(box.querySelector('#ka-duration')?.value||60)));rpc('game_runtime_timer_reset',{p_format:format,p_seconds:sec})});
  }
  async function rpc(name,args){const {data,error}=await sb.rpc(name,args);if(error){console.warn(name,error.message);return}if(data)runtime=data;renderAll()}
  function renderAll(){renderTimer();renderTeams();renderAdmin()}
  async function loadRuntime(){
    const {data,error}=await sb.rpc('game_runtime_get',{p_format:format});
    if(!error&&data){runtime=data;renderAll()}
  }
  async function loadPlayers(){
    let names=[];
    const {data}=await sb.from('public_players').select('name').eq('format',format).eq('active',true).order('name');
    if(Array.isArray(data)) names=data.map(x=>x.name);
    if(format==='quizduell'){
      const q=await sb.from('quiz_players').select('name').order('joined_at');
      if(Array.isArray(q.data)) names=[...names,...q.data.map(x=>x.name)];
    }
    const map={higherlower:['hl_state','state'],emoji:['er_state','state'],weristdas:['wid_state','state'],morph:['mo_state','state'],hotzone:['hz_state','state'],millionaer:['wwm_state','state'],blackstories:['bs_state','data'],imposter:['imp_state','state']};
    if(map[format]){
      const [table,col]=map[format]; const q=await sb.from(table).select(col).eq('id',format==='blackstories'?'main':1).maybeSingle();
      const s=q.data&&q.data[col]; const ps=s&&s.players;
      if(Array.isArray(ps)) names.push(...ps.map(x=>typeof x==='string'?x:x&&x.name).filter(Boolean));
      else if(ps&&typeof ps==='object') names.push(...Object.keys(ps));
    }
    names=[...new Set(names.map(x=>String(x||'').trim()).filter(Boolean))];
    players=names.map(name=>({name}));renderAdmin();
  }
  async function boot(){
    await Promise.all([loadRuntime(),loadPlayers()]);
    try{channel=sb.channel('game-runtime-'+format+'-'+Math.random().toString(36).slice(2))
      .on('postgres_changes',{event:'*',schema:'public',table:'game_runtime',filter:'format=eq.'+format},p=>{runtime=p.new||runtime;renderAll()})
      .on('postgres_changes',{event:'*',schema:'public',table:'public_players',filter:'format=eq.'+format},()=>loadPlayers())
      .subscribe();}catch(e){console.warn(e)}
    timerTick=setInterval(()=>{renderTimer();renderTeams()},250);
    new MutationObserver(()=>decorateCams()).observe(document.body,{childList:true,subtree:true,characterData:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden){loadRuntime();loadPlayers()}});
    window.addEventListener('online',()=>{loadRuntime();loadPlayers()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.KA_GAME_RUNTIME={format,get state(){return runtime},reload:loadRuntime};
})();
