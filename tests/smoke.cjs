const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const modes=['quizduell','higherlower','emoji','weristdas','morph','millionaer','bluff-quiz','ausreden','blackstories','imposter','hotzone','songerraten'];
let pages=0,scripts=0;
function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())scan(full);else if(entry.name.endsWith('.js')){new vm.Script(fs.readFileSync(full,'utf8'),{filename:full});scripts++;}else if(entry.name.endsWith('.html')){const content=fs.readFileSync(full,'utf8');pages++;for(const match of content.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(!/\bsrc\s*=/.test(match[1]))new vm.Script(match[2],{filename:full});}for(const match of content.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["']/gi)){const url=match[1];if(/^(?:https?:|data:|#)/.test(url))continue;const local=url.split('?')[0];if(local&&/\.(?:js|css)$/.test(local))assert(fs.existsSync(path.resolve(path.dirname(full),local)),`${entry.name}: ${local} fehlt`);}}}}
scan(root);
for(const mode of modes){assert(fs.existsSync(path.join(root,mode,'index.html')),`${mode}: Einstiegsseite fehlt`);if(mode!=='quizduell')for(const role of ['host.html','spielleiter.html'])assert(fs.existsSync(path.join(root,mode,role)),`${mode}: ${role} fehlt`);}
const universal=fs.readFileSync(path.join(root,'stream.html'),'utf8');
assert(universal.includes("songerraten:'./songerraten/host.html?stream=1'"),'Guess The Song fehlt in OBS');
const songJs=fs.readFileSync(path.join(root,'songerraten/song.js'),'utf8');
assert(songJs.includes("sb.rpc('song_submit_guess'"),'Atomare Song-Tippabgabe fehlt');
assert(songJs.includes("sb.rpc('song_vote_skip'"),'Serverseitige Skip-Abstimmung fehlt');
assert(songJs.includes("sb.rpc('song_get_guesses'"),'Geschützte Song-Auflösung fehlt');
assert(songJs.includes("sb.rpc('song_commit'"),'Atomare Regieänderung fehlt');
const design=fs.readFileSync(path.join(root,'studio-overhaul.css'),'utf8');
const broadcast=fs.readFileSync(path.join(root,'broadcast-design.css'),'utf8');
assert(broadcast.includes("@import url('./studio-overhaul.css"),'Designsystem wird nicht eingebunden');
assert(broadcast.includes('grid-template-columns:repeat(var(--ka-count,1),minmax(0,1fr))'),'Die Kamerareihe muss die verfügbare Bühnenbreite nutzen');
assert(broadcast.includes('body.ka-has-cameras[data-format="higherlower"] .stage'),'Higher or Lower muss Kameraplatz freihalten');
assert(broadcast.includes('body.ka-has-cameras[data-format="quizduell"] #hostView .board-wrap'),'Quizduell braucht eine großflächige Bühne');
for(const mode of modes)assert(design.includes(`data-format="${mode}"`),`${mode}: individuelle Designregeln fehlen`);
const cardLayout=require('../higherlower/card-layout.js');
for(const [width,height,count] of [[1880,760,15],[1880,510,15],[1200,560,15],[750,440,15],[1880,760,6]]){
  const grid=cardLayout.calculate(width,height,count);
  assert.equal(grid.positions.length,count);
  if(count===15&&width>1000)assert(grid.rows>=2,'Higher or Lower muss mindestens zwei Kartenreihen verwenden');
  grid.positions.forEach(p=>{assert(p.x>=0&&p.y>=0);assert(p.x+grid.width<=width+1&&p.y+grid.height<=height+1);});
  grid.positions.forEach((p,i)=>grid.positions.forEach((q,j)=>{if(j<=i)return;const intersects=p.x<q.x+grid.width&&p.x+grid.width>q.x&&p.y<q.y+grid.height&&p.y+grid.height>q.y;assert(!intersects,`Higher or Lower: Karten ${i+1} und ${j+1} überlappen`);}));
}
const quizData=vm.runInNewContext(fs.readFileSync(path.join(root,'quizduell/questions.js'),'utf8')+';CATEGORIES');
assert.equal(quizData.length,12);
for(const cat of quizData)for(let n=1;n<=5;n++)assert(cat.levels[n]?.[0]?.frage&&cat.levels[n]?.[0]?.antwort);
for(const cat of quizData.filter(c=>['KINDERSERIEN INTRO','ERKENNE DEN STREAMER','POP-SHARDS'].includes(c.name)))for(let n=1;n<=5;n++)assert.equal(cat.levels[n][0].audioDuration,5);
console.log(`OK: ${modes.length} Modi, ${pages} HTML-Seiten und ${scripts} JavaScript-Dateien geprüft`);
