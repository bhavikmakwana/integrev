const { normalizeText } = require('./fingerprint');

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

function computeScore(newDeal, candidate){
  // weights
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

module.exports = { similarity, computeScore };
