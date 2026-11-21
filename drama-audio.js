(function(){
  'use strict';
  let ctx=null,lastSecond=null,lastKey='';
  let timerSample=null;
  const scriptBase=document.currentScript?new URL('.',document.currentScript.src):new URL('../',location.href);
  const defaultTimerUrl=new URL('assets/timer/timer.mp3',scriptBase).href;
  const defaultSample=new Audio(defaultTimerUrl);
  defaultSample.preload='auto';
  defaultSample.addEventListener('error',()=>{if(timerSample===defaultSample)timerSample=null;});
  timerSample=defaultSample;
  function setTimerSound(file){
    if(!file||!file.type.startsWith('audio/'))return false;
    const url=URL.createObjectURL(file);
    if(timerSample&&timerSample.src.startsWith('blob:'))URL.revokeObjectURL(timerSample.src);
    timerSample=new Audio(url);timerSample.preload='auto';return true;
  }
  function context(){
    if(!ctx){
      const C=window.AudioContext||window.webkitAudioContext;
      if(!C) return null;
      ctx=new C();
    }
    if(ctx.state==='suspended') ctx.resume().catch(()=>{});
    return ctx;
  }
  function beep(sec){
    if(timerSample){try{timerSample.pause();timerSample.currentTime=0;timerSample.play().catch(()=>{});}catch(e){}return;}
  }
  function pulse(remainingMs,key){
    const sec=Math.max(0,Math.ceil(Number(remainingMs||0)/1000));
    key=String(key||'default');
    if(key!==lastKey){lastKey=key;lastSecond=null;}
    if(sec>10||sec<=0){lastSecond=sec;return;}
    if(sec===lastSecond)return;
    lastSecond=sec;beep(sec);
  }
  function reset(key){lastKey=String(key||'');lastSecond=null;}
  window.KA_DRAMA={pulse,reset,unlock:context,setTimerSound};
  function attachSoundPicker(){
    const path=location.pathname.toLowerCase();
    if(!path.endsWith('/spielleiter.html')&&!new URLSearchParams(location.search).get('rolle')?.match(/^(spielleiter|master)$/))return;
    const wrap=document.createElement('div');wrap.className='ka-timer-upload';
    wrap.style.cssText='margin:16px 0;padding:12px 15px;border:1px solid #3c4d68;border-radius:13px;background:#142239;color:#d7e6ff;font:700 12px Inter,system-ui,sans-serif';
    const label=document.createElement('label');label.textContent='TIMERSOUND (global: assets/timer/timer.mp3)';
    const input=document.createElement('input');input.type='file';input.accept='audio/*';input.style.cssText='display:block;margin-top:10px;max-width:100%';
    input.onchange=()=>{if(setTimerSound(input.files?.[0]))label.textContent='TIMERSOUND GELADEN';};
    label.append(input);wrap.append(label);document.body.append(wrap);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachSoundPicker,{once:true});else attachSoundPicker();
  ['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,()=>context(),{once:true,passive:true}));
})();
