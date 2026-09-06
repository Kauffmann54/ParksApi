import assert from 'node:assert/strict';
function formatLive(x){
  if(!x)return '?';
  const s=String(x.status||'').toUpperCase();
  if(s==='DOWN')return 'down';
  if(s==='CLOSED'||s==='REFURBISHMENT')return 'fechado';
  const w=x.queue?.STANDBY?.waitTime;
  return Number.isFinite(w)?String(w):'?';
}
assert.equal(formatLive({status:'OPERATING',queue:{STANDBY:{waitTime:45}}}),'45');
assert.equal(formatLive({status:'DOWN'}),'down');
assert.equal(formatLive({status:'CLOSED'}),'fechado');
assert.equal(formatLive({status:'REFURBISHMENT'}),'fechado');
assert.equal(formatLive({status:'OPERATING',queue:{STANDBY:{waitTime:null}}}),'?');
assert.equal(formatLive(null),'?');
console.log('OK: 6 testes de parsing/status passaram.');