/* ============================================================
   ACTIVE STREAM MODE
   Meldet dem zentralen OBS-Overlay, welcher Modus aktiv ist.
   Laeuft nur auf echten Host/Spielleiter-Seiten, niemals in ?stream=1.
   ============================================================ */
(function(){
  'use strict';
  const q = new URLSearchParams(location.search);
  if(q.get('stream') === '1') return;

  const parts = location.pathname.split('/').filter(Boolean);
  const known = ['quizduell','hotzone','higherlower','emoji','weristdas','morph','millionaer','bluff-quiz','ausreden','blackstories','imposter'];
  const format = parts.find(p => known.includes(p)) || '';
  if(!format) return;

  let sent = false;
  async function send(){
    if(sent || !window.KA_SB) return false;
    try{
      const {error} = await window.KA_SB.rpc('set_active_stream_mode',{p_mode:format});
      if(error) throw error;
      sent = true;
      return true;
    }catch(e){
      console.warn('Aktiver Stream-Modus konnte nicht gesetzt werden:', e);
      return false;
    }
  }

  window.KA_STREAM_ACTIVE = window.KA_STREAM_ACTIVE || {};
  window.KA_STREAM_ACTIVE.set = async function(mode){
    if(!window.KA_SB) return false;
    const m = String(mode || format).trim();
    if(!known.includes(m)) return false;
    const {error} = await window.KA_SB.rpc('set_active_stream_mode',{p_mode:m});
    if(error){ console.warn('Aktiver Stream-Modus:',error); return false; }
    sent = true;
    return true;
  };

  // Bei normalen host.html / spielleiter.html Seiten sofort aktivieren.
  const file = (parts[parts.length-1] || '').toLowerCase();
  if(file === 'host.html' || file === 'spielleiter.html'){
    let tries=0;
    const t=setInterval(async()=>{
      tries++;
      if(await send() || tries>50) clearInterval(t);
    },100);
  }
})();
