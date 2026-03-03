const { client } = require('../db');

async function insertDeal(deal){
  const q = `INSERT INTO deals
    (customer_name, product, quantity_min, quantity_max, quantity_band, location, expected_close_date, deal_owner, cost_matrix, fingerprint, status, justification)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`;
  // normalize cost_matrix: parse JSON string if provided
  let costMatrix = null;
  if(deal.cost_matrix != null){
    if(typeof deal.cost_matrix === 'string'){
      try { costMatrix = JSON.parse(deal.cost_matrix); } catch(e){ costMatrix = deal.cost_matrix; }
    } else costMatrix = deal.cost_matrix;
  }
  const vals = [
    deal.customer_name,
    deal.product,
    deal.quantity_min,
    deal.quantity_max,
    deal.quantity_band,
    deal.location,
    deal.expected_close_date,
    deal.deal_owner,
    costMatrix,
    deal.fingerprint,
    deal.status || 'submitted',
    deal.justification || null
  ];
  const res = await client.query(q, vals);
  return res.rows[0];
}

async function findCandidates({customer_name, product}){
  // simple candidate selection using ILIKE
  const q = `SELECT * FROM deals WHERE customer_name ILIKE $1 OR product ILIKE $2 ORDER BY created_at DESC LIMIT 50`;
  const res = await client.query(q, [`%${customer_name}%`, `%${product}%`]);
  return res.rows;
}

async function getFlagged(){
  const res = await client.query(`SELECT * FROM deals WHERE status='flagged' ORDER BY created_at DESC`);
  return res.rows;
}

async function updateStatus(id, status, comments){
  const res = await client.query(`UPDATE deals SET status=$1, justification=$2 WHERE id=$3 RETURNING *`, [status, comments || null, id]);
  return res.rows[0];
}

async function getAllDeals(){
  const res = await client.query(`SELECT * FROM deals ORDER BY created_at DESC`);
  return res.rows;
}

async function getDealById(id){
  const res = await client.query(`SELECT * FROM deals WHERE id=$1`, [id]);
  return res.rows[0];
}

async function updateDeal(id, updates){
  // normalize cost_matrix similar to insertDeal
  let costMatrix = null;
  if(updates.cost_matrix != null){
    if(typeof updates.cost_matrix === 'string'){
      try { costMatrix = JSON.parse(updates.cost_matrix); } catch(e){ costMatrix = updates.cost_matrix; }
    } else costMatrix = updates.cost_matrix;
  }
  const q = `UPDATE deals SET
    customer_name=$1, product=$2, quantity_min=$3, quantity_max=$4, quantity_band=$5,
    location=$6, expected_close_date=$7, deal_owner=$8, cost_matrix=$9, fingerprint=$10, status=$11, justification=$12
    WHERE id=$13 RETURNING *`;
  const vals = [
    updates.customer_name,
    updates.product,
    updates.quantity_min,
    updates.quantity_max,
    updates.quantity_band,
    updates.location,
    updates.expected_close_date,
    updates.deal_owner,
    costMatrix,
    updates.fingerprint,
    updates.status,
    updates.justification || null,
    id
  ];
  const res = await client.query(q, vals);
  return res.rows[0];
}

async function deleteDeal(id){
  const res = await client.query(`DELETE FROM deals WHERE id=$1 RETURNING *`, [id]);
  return res.rows[0];
}

module.exports = { insertDeal, findCandidates, getFlagged, updateStatus, getAllDeals, getDealById, updateDeal, deleteDeal };
