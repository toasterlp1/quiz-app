(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HL_CARD_LAYOUT=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function calculate(width,height,count){
    const w=Math.max(320,Number(width)||1280),h=Math.max(260,Number(height)||600),n=Math.max(0,Math.floor(Number(count)||0));
    if(!n)return {width:0,height:0,positions:[],columns:0,rows:0};
    const margin=Math.max(12,Math.min(34,w*.025));
    const gapX=Math.max(10,Math.min(20,w*.012));
    const gapY=Math.max(14,Math.min(25,h*.035));
    const targetCols=n>=12?8:n>=7?Math.ceil(n/2):n;
    const columns=Math.min(n,targetCols,Math.max(1,Math.floor((w-margin*2+gapX)/(108+gapX))));
    const rows=Math.ceil(n/columns);
    const cardWidth=Math.min(165,Math.max(68,(w-margin*2-(columns-1)*gapX)/columns));
    const heightBudget=(h-margin*2-gapY*(rows-1))/rows;
    const cardHeight=Math.max(58,Math.min(cardWidth*1.32,220,heightBudget));
    const cardW=Math.floor(cardWidth),cardH=Math.floor(cardHeight);
    const usedH=rows*cardH+(rows-1)*gapY;
    const startY=Math.max(6,(h-usedH)/2);
    const positions=Array.from({length:n},(_,i)=>{
      const row=Math.floor(i/columns),col=i%columns;
      const thisRow=Math.min(columns,n-row*columns);
      const rowWidth=thisRow*cardW+(thisRow-1)*gapX;
      return {x:Math.round((w-rowWidth)/2+col*(cardW+gapX)),y:Math.round(startY+row*(cardH+gapY))};
    });
    return {width:cardW,height:cardH,positions,columns,rows};
  }
  return {calculate};
});
