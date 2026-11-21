(function(){
'use strict';
const titles={"Kolosseum":"Colosseum","Schiefer Turm von Pisa":"Leaning Tower of Pisa","Freiheitsstatue (mit Sockel)":"Statue of Liberty","Elizabeth Tower (Big Ben)":"Big Ben","Cheops-Pyramide (heute)":"Great Pyramid of Giza","Washington Monument":"Washington Monument","Eiffelturm (mit Antenne)":"Eiffel Tower","Empire State Building (Dach)":"Empire State Building","Petronas Towers":"Petronas Towers","Taipei 101":"Taipei 101","One World Trade Center (mit Spitze)":"One World Trade Center","CN Tower":"CN Tower","Shanghai Tower":"Shanghai Tower","Tokyo Skytree":"Tokyo Skytree","Burj Khalifa":"Burj Khalifa"};
const overrides={"Petronas Towers":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Petronas%20Towers%20%281%29.jpg","Taipei 101":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Tower%20of%20Taipei%20101.jpg","One World Trade Center (mit Spitze)":"https://commons.wikimedia.org/wiki/Special:Redirect/file/One%20World%20Trade%20Center%20Building.jpg","CN Tower":"https://commons.wikimedia.org/wiki/Special:Redirect/file/CN%20Tower%20-%202025%201.jpg"};
const cache=new Map(Object.entries(overrides));let pending=null;
async function load(){
 if(pending)return pending;
 pending=(async()=>{
  const query='https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&redirects=1&prop=pageimages&pithumbsize=700&titles='+encodeURIComponent(Object.values(titles).join('|'));
  const response=await fetch(query,{mode:'cors'});if(!response.ok)throw Error('Bilddienst '+response.status);
  const result=await response.json();const byTitle={};
  for(const page of Object.values(result.query?.pages||{})){
   if(page.thumbnail?.source)byTitle[page.title.toLowerCase()]=page.thumbnail.source;
  }
  for(const [label,title] of Object.entries(titles)){
   const url=byTitle[title.toLowerCase()];if(url)cache.set(label,url);
  }
  return cache;
 })().catch(e=>{console.warn('Sehenswürdigkeiten: Bilder konnten nicht geladen werden',e);pending=null;return cache;});
 return pending;
}
window.HL_LANDMARK_IMAGES={get:async label=>{await load();return cache.get(label)||'';},fill:async items=>{await load();return items.map(it=>({...it,url:it.url||cache.get(it.label)||''}));}};
})();
