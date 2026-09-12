/* ============================================================
   QUIZ-APP SERVER CLOCK
   Synchronisiert Browser-/App-Zeit mit Supabase, damit Timer und
   Reveal-Animationen auf allen Geraeten gleich laufen, auch wenn
   die lokale Systemuhr abweicht.
   ============================================================ */
(function(global){
  'use strict';
  let offsetMs=0;
  let synced=false;
  let syncing=null;
  let lastSync=0;

  function clientNow(){ return Date.now(); }
  function now(){ return clientNow()+offsetMs; }

  async function sync(force){
    if(syncing) return syncing;
    if(!force && synced && clientNow()-lastSync < 30000) return offsetMs;
    syncing=(async()=>{
      const sb=global.KA_SB;
      if(!sb || typeof sb.rpc!=='function') return offsetMs;
      let best=null;
      for(let i=0;i<3;i++){
        const t0=clientNow();
        try{
          const {data,error}=await sb.rpc('server_now_ms');
          const t1=clientNow();
          if(error) throw error;
          const server=Number(data);
          if(!Number.isFinite(server)) continue;
          const rtt=t1-t0;
          const off=server-((t0+t1)/2);
          if(!best || rtt<best.rtt) best={rtt,off};
        }catch(e){
          // Offline/kurzer Verbindungsfehler: lokale Uhr bleibt als Fallback.
        }
      }
      if(best){
        // Grosse Uhrenabweichungen sind erlaubt; genau dafuer existiert der Sync.
        offsetMs=best.off;
        synced=true;
        lastSync=clientNow();
      }
      return offsetMs;
    })();
    try{return await syncing;}finally{syncing=null;}
  }

  const api={now,sync,get offsetMs(){return offsetMs;},get synced(){return synced;}};
  global.KA_TIME=api;
  global.KA_NOW=now;
  api.ready=sync(true);

  setInterval(()=>sync(false),60000);
  global.addEventListener('online',()=>sync(true));
  global.addEventListener('pageshow',()=>sync(true));
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') sync(true); });
})(window);
