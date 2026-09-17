(function(){
  'use strict';
  let ctx=null,lastSecond=null,lastKey='';
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
    const c=context(); if(!c) return;
    const now=c.currentTime;
    const osc=c.createOscillator(), gain=c.createGain();
    osc.type='sine';
    osc.frequency.setValueAtTime(sec<=3?980:sec<=6?760:620,now);
    gain.gain.setValueAtTime(0.0001,now);
    gain.gain.exponentialRampToValueAtTime(sec<=3?0.18:0.11,now+.012);
    gain.gain.exponentialRampToValueAtTime(0.0001,now+(sec<=3?.14:.095));
    osc.connect(gain);gain.connect(c.destination);osc.start(now);osc.stop(now+.18);
    if(sec<=3){
      const o2=c.createOscillator(),g2=c.createGain();
      o2.type='square';o2.frequency.value=sec===1?1320:1120;
      g2.gain.setValueAtTime(.0001,now+.16);g2.gain.exponentialRampToValueAtTime(.075,now+.17);g2.gain.exponentialRampToValueAtTime(.0001,now+.23);
      o2.connect(g2);g2.connect(c.destination);o2.start(now+.16);o2.stop(now+.25);
    }
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
  window.KA_DRAMA={pulse,reset,unlock:context};
  ['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,()=>context(),{once:true,passive:true}));
})();
