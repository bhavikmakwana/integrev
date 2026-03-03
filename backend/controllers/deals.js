const { makeFingerprint, quantityBand } = require('../utils/fingerprint');
const { computeScore } = require('../utils/score');
const { findCandidates, insertDeal } = require('../models/dealModel');

async function precheck(req, res){
  const d = req.body;
  const fingerprint = makeFingerprint(d);
  d.fingerprint = fingerprint;
  d.quantity_band = quantityBand(d.quantity_min, d.quantity_max);

  // find candidates
  const candidates = await findCandidates(d);
  const results = candidates.map(c => ({candidate: c, ...computeScore(d, c)}));
  // pick max score among candidates
  const best = results.sort((a,b)=>b.score-a.score)[0];

  const response = { fingerprint, candidates: results.slice(0,5) };
  if(best){
    response.best = best;
    if(best.score >= 75) response.risk='high';
    else if(best.score >=40) response.risk='medium';
    else response.risk='low';
  } else {
    response.risk='low';
  }

  res.json(response);
}

async function submitDeal(req, res){
  const d = req.body;
  d.quantity_band = quantityBand(d.quantity_min, d.quantity_max);
  d.fingerprint = makeFingerprint(d);
  // determine initial status from provided risk or server-side re-check
  const candidates = await findCandidates(d);
  const results = candidates.map(c => ({candidate: c, ...computeScore(d,c)}));
  const best = results.sort((a,b)=>b.score-a.score)[0];
  let status = 'submitted';
  if(best && best.score >= 75) status = 'flagged';
  const created = await insertDeal(Object.assign({}, d, { status }));
  res.json({ created, best: best || null, status });
}

module.exports = { precheck, submitDeal };
