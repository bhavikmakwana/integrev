// Local storage backed implementation for testing (mirrors backend logic)
// Key: 'deals'

function normalizeText(s){
  if(!s) return '';
  return s.toString().trim().toLowerCase().replace(/\s+/g,' ');
}

export function quantityBand(qmin, qmax){
  const q = qmin != null ? qmin : qmax != null ? qmax : null;
  if(q == null) return 'unknown';
  if(q <= 1) return '0-1';
  if(q <=5) return '1-5';
  if(q <=10) return '5-10';
  if(q <=20) return '10-20';
  return '20+';
}

export function timeWindow(date){
  if(!date) return 'unknown';
  const d = new Date(date);
  if(isNaN(d)) return 'unknown';
  const month = d.getUTCMonth()+1;
  const year = d.getUTCFullYear();
  return `${year}-${String(month).padStart(2,'0')}`;
}

export function makeFingerprint({customer_name, product, quantity_min, quantity_max, location, expected_close_date}){
  const c = normalizeText(customer_name);
  const p = normalizeText(product);
  const qb = quantityBand(quantity_min, quantity_max);
  const loc = normalizeText(location);
  const tw = timeWindow(expected_close_date);
  return [c,p,qb,loc,tw].join('|');
}

// Levenshtein & similarity (copied from backend for consistent behavior)
function levenshtein(a,b){
  if(a===b) return 0;
  const m=a.length,n=b.length;
  if(m===0) return n;
  if(n===0) return m;
  const v0 = new Array(n+1), v1 = new Array(n+1);
  for(let j=0;j<=n;j++) v0[j]=j;
  for(let i=0;i<m;i++){
    v1[0]=i+1;
    for(let j=0;j<n;j++){
      const cost = a[i]===b[j]?0:1;
      v1[j+1]=Math.min(v1[j]+1, v0[j+1]+1, v0[j]+cost);
    }
    for(let j=0;j<=n;j++) v0[j]=v1[j];
  }
  return v1[n];
}

function similarity(a,b){
  a=normalizeText(a||''); b=normalizeText(b||'');
  if(!a && !b) return 1;
  if(!a || !b) return 0;
  const dist = levenshtein(a,b);
  const max = Math.max(a.length,b.length);
  return 1 - (dist / max);
}

export function computeScore(newDeal, candidate){
  const weights = {customer:0.4, product:0.3, quantity:0.1, location:0.1, time:0.1};
  const customerSim = similarity(newDeal.customer_name, candidate.customer_name);
  const productSim = similarity(newDeal.product, candidate.product);
  const qbNew = newDeal.quantity_band || '';
  const qbCand = candidate.quantity_band || '';
  const quantityMatch = qbNew && qbNew===qbCand ? 1 : 0;
  const locationSim = similarity(newDeal.location, candidate.location);
  const timeNew = newDeal.expected_close_date ? (new Date(newDeal.expected_close_date)).toISOString().slice(0,7) : '';
  const timeCand = candidate.expected_close_date ? (new Date(candidate.expected_close_date)).toISOString().slice(0,7) : '';
  const timeMatch = timeNew && timeNew===timeCand ? 1 : 0;

  const score = (
    weights.customer * customerSim +
    weights.product * productSim +
    weights.quantity * quantityMatch +
    weights.location * locationSim +
    weights.time * timeMatch
  ) * 100;

  const reasoning = [];
  reasoning.push(`Customer match: ${customerSim>0.8? 'Strong' : customerSim>0.5? 'Partial' : 'Weak'}`);
  reasoning.push(`Product match: ${productSim>0.8? 'Strong' : productSim>0.5? 'Partial' : 'Weak'}`);
  reasoning.push(`Quantity band: ${quantityMatch? 'Yes' : 'No'}`);
  reasoning.push(`Location match: ${locationSim>0.8? 'Strong' : locationSim>0.5? 'Partial' : 'Weak'}`);
  reasoning.push(`Date overlap: ${timeMatch? 'Yes' : 'No'}`);

  return { score: Math.round(score), reasoning };
}

// Storage helpers
const KEY = 'deals';

function read(){
  try{
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : [];
  }catch(e){
    return [];
  }
}

function write(arr){
  localStorage.setItem(KEY, JSON.stringify(arr));
}

export function getDeals(){
  return read();
}

export function saveDeal(deal){
  const arr = read();
  const nextId = arr.length ? Math.max(...arr.map(d=>d.id)) + 1 : 1;
  const created = Object.assign({ id: nextId, created_at: new Date().toISOString() }, deal);
  arr.push(created);
  write(arr);
  return created;
}

export function findCandidates(d){
  const arr = read();
  const q = normalizeText(d.customer_name);
  const p = normalizeText(d.product);
  // simple filter: contains in customer_name OR product
  return arr.filter(a=> normalizeText(a.customer_name).includes(q) || normalizeText(a.product).includes(p));
}

export async function precheck(d){
  const fingerprint = makeFingerprint(d);
  d.fingerprint = fingerprint;
  d.quantity_band = quantityBand(d.quantity_min, d.quantity_max);

  const candidates = findCandidates(d);
  const results = candidates.map(c=> ({ candidate: c, ...computeScore(d,c) }));
  const best = results.sort((a,b)=>b.score-a.score)[0];
  const response = { fingerprint, candidates: results.slice(0,5) };
  if(best){
    response.best = best;
    if(best.score >= 75) response.risk='high';
    else if(best.score >=40) response.risk='medium';
    else response.risk='low';
  } else response.risk='low';
  return response;
}

export async function submit(d){
  const body = Object.assign({}, d);
  body.quantity_band = quantityBand(body.quantity_min, body.quantity_max);
  body.fingerprint = makeFingerprint(body);
  const candidates = findCandidates(body);
  const results = candidates.map(c=> ({ candidate: c, ...computeScore(body,c) }));
  const best = results.sort((a,b)=>b.score-a.score)[0];
  let status = 'submitted';
  if(best && best.score >= 75) status = 'flagged';
  const created = saveDeal(Object.assign({}, body, { status }));
  return { created, best: best || null, status };
}

export async function getFlagged(){
  const arr = read().filter(d=> d.status === 'flagged').sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
  return arr;
}

export async function review(id, action, comments){
  const arr = read();
  const idx = arr.findIndex(d=> d.id === id);
  if(idx === -1) return null;
  const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : arr[idx].status;
  arr[idx] = Object.assign({}, arr[idx], { status, justification: comments || arr[idx].justification });
  write(arr);
  return arr[idx];
}

export async function updateDeal(id, updates){
  const arr = read();
  const idx = arr.findIndex(d=> d.id === id);
  if(idx === -1) return null;
  // merge and update modified timestamp
  arr[idx] = Object.assign({}, arr[idx], updates, { updated_at: new Date().toISOString() });
  write(arr);
  return arr[idx];
}

export async function deleteDeal(id){
  let arr = read();
  const idx = arr.findIndex(d=> d.id === id);
  if(idx === -1) return null;
  const removed = arr.splice(idx,1)[0];
  write(arr);
  return removed;
}
