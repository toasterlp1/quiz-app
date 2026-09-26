self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    try{const keys=await caches.keys();await Promise.all(keys.filter(k=>/^quiz-app-/i.test(k)).map(k=>caches.delete(k)));}catch(e){}
    try{await self.registration.unregister();}catch(e){}
    try{const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});clients.forEach(c=>c.postMessage({type:'QUIZ_APP_SW_REMOVED',version:'v50'}));}catch(e){}
  })());
});
