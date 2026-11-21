(function(){
  'use strict';
  const query = new URLSearchParams(location.search);
  if(query.get('stream') === '1') return;
  const parts = location.pathname.split('/').filter(Boolean);
  const allowed = new Set(['quizduell','hotzone','higherlower','emoji','weristdas','morph','millionaer','bluff-quiz','ausreden','blackstories','imposter','songerraten']);
  const format = parts.find(part => allowed.has(part));
  if(!format) return;
  const file = (parts[parts.length - 1] || '').toLowerCase();
  if(!['host.html','spielleiter.html','index.html'].includes(file) && !(format === 'quizduell' && file === 'quizduell')) return;

  let busy = false;
  let sent = false;
  async function publish(mode){
    if(busy || !window.KA_SB) return false;
    const normalized=String(mode||format).trim().toLowerCase();
    if(!allowed.has(normalized)) return false;
    busy=true;
    try {
      const result=await window.KA_SB.rpc('ka_set_active_stream_mode_v2',{p_mode:normalized});
      if(result.error) throw result.error;
      sent=true;
      return true;
    } catch(error){
      console.warn('Stream-Modus konnte nicht aktiviert werden. Bitte STREAM_MODUS_SQL_INSTALLIEREN.sql in Supabase ausfuehren.',error);
      return false;
    } finally {busy=false;}
  }
  window.KA_STREAM_ACTIVE=window.KA_STREAM_ACTIVE||{};
  window.KA_STREAM_ACTIVE.set=publish;
  let attempts=0;
  const timer=setInterval(async ()=>{
    if(sent || attempts++ >= 30){clearInterval(timer);return;}
    if(await publish(format)) clearInterval(timer);
  },500);
  window.addEventListener('pageshow',()=>{if(!sent)publish(format);});
})();
