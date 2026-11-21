const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root)){res.writeHead(403).end();return;}
 fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return;}const ext=path.extname(file);res.setHeader('Content-Type',ext==='.js'?'application/javascript':ext==='.css'?'text/css':'text/html');res.end(data);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  for(const [url,player] of [['spielleiter.html',false],['spieler.html',true]]){
   const page=await browser.newPage();
   await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:''}));
   await page.addInitScript((isPlayer)=>{
    if(isPlayer)sessionStorage.setItem('ka_player_songerraten','Tester');
    const sample={revision:0,round:1,stage:0,phase:'playing',players:{Tester:0},participants:['Tester'],locks:{},skipVotes:[]};
    window.KA_SB={
     from(){return{select(){return{eq(){return{single:async()=>({data:{state:sample}})}}}}}},
     rpc:async()=>({data:true}),channel(){return{on(){return this},subscribe(){return this}}}
    };
    window.supabase={createClient(){return window.KA_SB}};
   },player);
   await page.goto('http://127.0.0.1:'+server.address().port+'/songerraten/'+url,{waitUntil:'domcontentloaded'});
   if(player){
    await page.locator('#songSearch').waitFor({timeout:5000});
    await page.locator('#songSearch').fill('dyna');
    await page.locator('[data-choice="Dynamite"]').waitFor({timeout:5000});
    await page.locator('[data-choice="Dynamite"]').click();
    assert.equal(await page.locator('#songLock').isDisabled(),false);
   }else{
    await page.locator('#songCategory').waitFor({timeout:5000});
    assert.equal(await page.locator('[data-catalog]').count(),20);
   }
   await page.close();
  }
  console.log('OK: Guess The Song Spielleitung und Song-Suche starten im Browser');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
