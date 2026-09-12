/* Stream mode: OBS-safe, display-only view. Use ?stream=1. */
(function(){
  'use strict';
  const p=new URLSearchParams(location.search);
  if(p.get('stream')!=='1') return;
  document.documentElement.classList.add('ka-stream');
  document.body.classList.add('ka-stream');
  const style=document.createElement('style');
  style.textContent=`
    html.ka-stream,body.ka-stream{cursor:default!important}
    body.ka-stream #ka-zurueck,
    body.ka-stream .ka-combined,
    body.ka-stream .ka-player-dock,
    body.ka-stream .ka-stream-controls,
    body.ka-stream .ka-host-playerbox,
    body.ka-stream #qdHostPlayer,
    body.ka-stream .controls,
    body.ka-stream .toolbar,
    body.ka-stream .actions,
    body.ka-stream .admin,
    body.ka-stream .master,
    body.ka-stream .player-controls,
    body.ka-stream .player-panel,
    body.ka-stream [data-stream-hide]{display:none!important}
    body.ka-stream button,body.ka-stream input,body.ka-stream select,body.ka-stream textarea,
    body.ka-stream a{pointer-events:none!important}
  `;
  document.head.appendChild(style);
  function lock(){
    document.querySelectorAll('button,input,select,textarea,a,[onclick]').forEach(el=>{
      el.setAttribute('tabindex','-1');
      if(el.tagName==='BUTTON'||el.tagName==='INPUT'||el.tagName==='SELECT'||el.tagName==='TEXTAREA') el.disabled=true;
    });
    const b=document.getElementById('ka-zurueck'); if(b) b.style.display='none';
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',lock); else lock();
  new MutationObserver(lock).observe(document.documentElement,{childList:true,subtree:true});
})();
