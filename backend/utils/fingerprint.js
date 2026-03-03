function normalizeText(s){
  if(!s) return '';
  return s.toString().trim().toLowerCase().replace(/\s+/g,' ');
}

function quantityBand(qmin, qmax){
  // if both null -> unknown
  const q = qmin != null ? qmin : qmax != null ? qmax : null;
  if(q == null) return 'unknown';
  if(q <= 1) return '0-1';
  if(q <=5) return '1-5';
  if(q <=10) return '5-10';
  if(q <=20) return '10-20';
  return '20+';
}

function timeWindow(date){
  if(!date) return 'unknown';
  const d = new Date(date);
  if(isNaN(d)) return 'unknown';
  const month = d.getUTCMonth()+1;
  const year = d.getUTCFullYear();
  return `${year}-${String(month).padStart(2,'0')}`; // YYYY-MM
}

function makeFingerprint({customer_name, product, quantity_min, quantity_max, location, expected_close_date}){
  const c = normalizeText(customer_name);
  const p = normalizeText(product);
  const qb = quantityBand(quantity_min, quantity_max);
  const loc = normalizeText(location);
  const tw = timeWindow(expected_close_date);
  return [c,p,qb,loc,tw].join('|');
}

module.exports = { normalizeText, quantityBand, timeWindow, makeFingerprint };
