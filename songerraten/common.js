const sb=window.KA_SB; const PHASES=[0.5,2,5,10]; let state=null;
async function loadState(){const {data,error}=await sb.from('song_state').select('state').eq('id',1).single();if(error)throw error;state=data.state||{};return state}
async function saveState(next){state=next;const {error}=await sb.from('song_state').upsert({id:1,state:next,updated_at:new Date().toISOString()},{onConflict:'id'});if(error)throw error;return next}
function players(){return Object.entries(state?.players||{}).map(([name,p])=>({name,...p}))}
function activePlayers(){return players().filter(p=>p.active!==false)}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function subscribe(render){sb.channel('song-state-'+Math.random()).on('postgres_changes',{event:'*',schema:'public',table:'song_state',filter:'id=eq.1'},p=>{state=p.new.state||{};render()}).subscribe();setInterval(()=>loadState().then(render).catch(()=>{}),2500)}
