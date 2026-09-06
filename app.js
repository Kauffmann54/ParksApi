const API_BASE = 'https://api.themeparks.wiki/v1';
const MIN_REFRESH_MS = 5 * 60 * 1000;
const CACHE_PREFIX = 'tp-live-v1:';
const PRIORITY_THRESHOLD = 3.5;

let parks = [], overlay = {entities:[]}, aliases = {}, selectedPark = null, liveById = new Map();
const activeStates = new Set();
const $ = s => document.querySelector(s);

async function boot(){
  [parks, overlay, aliases] = await Promise.all([
    fetch('./parks.json').then(r=>r.json()).then(x=>x.parks),
    fetch('./strategy_overlay.runtime.json').then(r=>r.json()).catch(()=>({entities:[]})),
    fetch('./aliases.json').then(r=>r.json())
  ]);
  renderParks();
  $('#refreshBtn').onclick=refresh;
  $('#copyBtn').onclick=copyText;
  $('#backBtn').onclick=goHome;
  $('#lastRide').onchange=updatePreview;
  document.querySelectorAll('[data-state]').forEach(b=>b.onclick=()=>{b.classList.toggle('active'); const s=b.dataset.state; activeStates.has(s)?activeStates.delete(s):activeStates.add(s); updatePreview();});
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
function renderParks(){
  $('#parkGrid').innerHTML='';
  parks.forEach(p=>{const b=document.createElement('button');b.textContent=p.shortName;b.onclick=()=>selectPark(p);$('#parkGrid').appendChild(b);});
}
function selectPark(p){
  selectedPark=p;liveById.clear();$('#home').classList.add('hidden');$('#parkView').classList.remove('hidden');$('#backBtn').classList.remove('hidden');
  $('#parkName').textContent=p.shortName; $('#updatedAt').textContent='Ainda não atualizado'; hideMessages(); renderRides(); loadCached(true); updatePreview();
}
function goHome(){selectedPark=null;$('#parkView').classList.add('hidden');$('#home').classList.remove('hidden');$('#backBtn').classList.add('hidden');}
function priorityRides(){return overlay.entities.filter(x=>x.parkId===selectedPark.parkId && Number(x.priorityBase)>=PRIORITY_THRESHOLD).sort((a,b)=>b.priorityBase-a.priorityBase);}
function renderRides(){
  const rides=priorityRides(), box=$('#rides'), sel=$('#lastRide'); box.innerHTML=''; sel.innerHTML='<option value="">Nenhuma</option>';
  rides.forEach(r=>{const live=liveById.get(r.entityId); const row=document.createElement('div'); row.className='ride';
    row.innerHTML=`<span>${escapeHtml(aliases[r.entityId]||r.name)}</span><strong class="wait ${statusClass(live)}">${formatLive(live)}</strong>`; box.appendChild(row);
    const o=document.createElement('option');o.value=r.entityId;o.textContent=aliases[r.entityId]||r.name;sel.appendChild(o);
  });
}
async function refresh(){
  if(!selectedPark)return; hideMessages();
  const key=CACHE_PREFIX+selectedPark.parkId; const cached=readCache(key); const now=Date.now();
  if(cached && now-cached.fetchedAt<MIN_REFRESH_MS){applyData(cached.data,cached.fetchedAt,false);showWarning(`Última consulta foi há menos de 5 minutos. Exibindo o dado recém-consultado sem chamar a API novamente.`);return;}
  $('#refreshBtn').disabled=true;$('#refreshBtn').textContent='Atualizando…';
  try{
    const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),12000);
    const res=await fetch(`${API_BASE}/entity/${selectedPark.parkId}/live`,{signal:ctrl.signal,headers:{Accept:'application/json'}});clearTimeout(timer);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data=await res.json(); const fetchedAt=Date.now(); localStorage.setItem(key,JSON.stringify({fetchedAt,data})); applyData(data,fetchedAt,false);
  }catch(e){
    liveById.clear();renderRides();$('#updatedAt').textContent='Falha na atualização — sem dados atuais';
    showError(`Não foi possível consultar a ThemeParks.wiki (${e.name==='AbortError'?'tempo esgotado':e.message}). Nenhuma outra fonte foi usada.`);
    loadCached(false);
  }finally{$('#refreshBtn').disabled=false;$('#refreshBtn').textContent='Atualizar filas';updatePreview();}
}
function applyData(data,fetchedAt,stale){
  liveById=new Map((data.liveData||[]).map(x=>[x.id,x]));
  const dates=(data.liveData||[]).map(x=>Date.parse(x.lastUpdated)).filter(Number.isFinite);
  const t=dates.length?Math.max(...dates):fetchedAt;
  $('#updatedAt').textContent=`Último dado: ${new Date(t).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}${stale?' · DESATUALIZADO':''}`;
  renderRides();updatePreview();
}
function loadCached(onInitial){
  const c=readCache(CACHE_PREFIX+selectedPark.parkId); if(!c)return;
  const age=Date.now()-c.fetchedAt;
  if(onInitial && age<=MIN_REFRESH_MS){applyData(c.data,c.fetchedAt,false);showWarning('Dado recente carregado do cache local. Toque em atualizar quando completar 5 minutos.');}
  else if(!onInitial){applyData(c.data,c.fetchedAt,true);showWarning(`CACHE DESATUALIZADO: última consulta local de ${new Date(c.fetchedAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}.`);}
}
function readCache(k){try{return JSON.parse(localStorage.getItem(k))}catch{return null}}
function formatLive(x){
  if(!x)return '?'; const s=String(x.status||'').toUpperCase();
  if(s==='DOWN')return 'down'; if(s==='CLOSED'||s==='REFURBISHMENT')return 'fechado';
  const w=x.queue?.STANDBY?.waitTime; return Number.isFinite(w)?String(w):'?';
}
function statusClass(x){const v=formatLive(x);return v==='down'?'down':v==='fechado'?'closed':v==='?'?'unknown':''}
function buildText(){
  if(!selectedPark)return ''; const lines=[`PARQUE: ${selectedPark.shortName}`]; const last=$('#lastRide').value;
  if(last) lines.push(`FIZ: ${aliases[last]||priorityRides().find(x=>x.entityId===last)?.name||last}`);
  if(activeStates.size) lines.push('',`ESTADO: ${[...activeStates].join(', ')}`);
  lines.push('');
  priorityRides().forEach(r=>lines.push(`${aliases[r.entityId]||r.name} ${formatLive(liveById.get(r.entityId))}`));
  return lines.join('\n');
}
function updatePreview(){$('#preview').value=buildText()}
async function copyText(){const t=buildText();try{await navigator.clipboard.writeText(t)}catch{$('#preview').select();document.execCommand('copy')}const toast=$('#toast');toast.classList.remove('hidden');setTimeout(()=>toast.classList.add('hidden'),1300)}
function showError(t){$('#errorBox').textContent=t;$('#errorBox').classList.remove('hidden')}
function showWarning(t){$('#staleBox').textContent=t;$('#staleBox').classList.remove('hidden')}
function hideMessages(){$('#errorBox').classList.add('hidden');$('#staleBox').classList.add('hidden')}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
boot();