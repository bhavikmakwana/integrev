const express = require('express');
const router = express.Router();
const dealsCtrl = require('./controllers/deals');
const { getFlagged, updateStatus } = require('./models/dealModel');

router.post('/deals/precheck', dealsCtrl.precheck);
router.post('/deals/submit', dealsCtrl.submitDeal);

router.get('/admin/flagged', async (req,res)=>{
  const rows = await getFlagged();
  res.json(rows);
});

router.post('/admin/review', async (req,res)=>{
  const {id, action, comments} = req.body; // action: approve|reject|merge
  if(!id || !action) return res.status(400).json({error:'id and action required'});
  const status = action==='approve' ? 'approved' : action==='reject' ? 'rejected' : 'submitted';
  const updated = await updateStatus(id, status, comments);
  res.json(updated);
});

// CRUD endpoints for deals
const { getAllDeals, getDealById, updateDeal, deleteDeal } = require('./models/dealModel');
const { makeFingerprint, quantityBand } = require('./utils/fingerprint');

router.get('/deals', async (req,res)=>{
  const rows = await getAllDeals();
  res.json(rows);
});

router.get('/deals/:id', async (req,res)=>{
  const id = parseInt(req.params.id,10);
  if(isNaN(id)) return res.status(400).json({error:'invalid id'});
  const d = await getDealById(id);
  if(!d) return res.status(404).json({error:'not found'});
  res.json(d);
});

router.put('/deals/:id', async (req,res)=>{
  const id = parseInt(req.params.id,10);
  if(isNaN(id)) return res.status(400).json({error:'invalid id'});
  const updates = req.body;
  // update derived fields
  updates.quantity_band = quantityBand(updates.quantity_min, updates.quantity_max);
  updates.fingerprint = makeFingerprint(updates);
  const updated = await updateDeal(id, updates);
  res.json(updated);
});

router.delete('/deals/:id', async (req,res)=>{
  const id = parseInt(req.params.id,10);
  if(isNaN(id)) return res.status(400).json({error:'invalid id'});
  const deleted = await deleteDeal(id);
  if(!deleted) return res.status(404).json({error:'not found'});
  res.json(deleted);
});

module.exports = router;
