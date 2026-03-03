import React from 'react'
import * as localStore from '../utils/localStore'

function Modal({children,onClose}){
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}} onClick={onClose}>
      <div style={{background:'#fff',padding:18,borderRadius:8,minWidth:320,maxWidth:'90%'}} onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export default function DealsList(){
  const [deals, setDeals] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [editing, setEditing] = React.useState(null);

  React.useEffect(()=>{ fetchDeals(); },[]);

  async function fetchDeals(){
    setLoading(true);
    try{
      const res = await fetch('/api/deals');
      if(res.ok){ const j = await res.json(); setDeals(j); setLoading(false); return; }
    }catch(e){ }
    const j = await localStore.getDeals();
    setDeals(j);
    setLoading(false);
  }

  function openView(d){ setSelected(d); }
  function openEdit(d){ setEditing(Object.assign({}, d)); }

  async function saveEdit(){
    try{
      const res = await fetch(`/api/deals/${editing.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(editing) });
      if(res.ok){ await fetchDeals(); setEditing(null); return; }
    }catch(e){ }
    await localStore.updateDeal(editing.id, editing);
    await fetchDeals();
    setEditing(null);
  }

  async function doDelete(id){
    if(!window.confirm('Delete this deal?')) return;
    try{
      const res = await fetch(`/api/deals/${id}`, { method: 'DELETE' });
      if(res.ok){ await fetchDeals(); return; }
    }catch(e){ }
    await localStore.deleteDeal(id);
    await fetchDeals();
  }

  return (
    <div>
      <h3>All Deals</h3>
      {loading ? 'Loading...' : (
        <div className="card">
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{textAlign:'left',borderBottom:'1px solid #eee'}}>
                <th>Date</th><th>Customer</th><th>Product</th><th>Qty</th><th>Location</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deals.map(d=> (
                <tr key={d.id} style={{borderBottom:'1px solid #f1f3f6'}}>
                  <td style={{padding:'8px 6px'}}>{d.created_at ? new Date(d.created_at).toLocaleDateString() : ''}</td>
                  <td style={{padding:'8px 6px'}}>{d.customer_name}</td>
                  <td style={{padding:'8px 6px'}}>{d.product}</td>
                  <td style={{padding:'8px 6px'}}>{d.quantity_band || ''}</td>
                  <td style={{padding:'8px 6px'}}>{d.location}</td>
                  <td style={{padding:'8px 6px'}}>{d.status}</td>
                  <td style={{padding:'6px'}}>
                    <button className="btn" onClick={()=>openView(d)}>View</button>
                    <button className="btn" style={{marginLeft:8}} onClick={()=>openEdit(d)}>Edit</button>
                    <button className="btn" style={{marginLeft:8}} onClick={()=>doDelete(d.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal onClose={()=>setSelected(null)}>
          <h4>Deal Detail</h4>
          <div><strong>Customer:</strong> {selected.customer_name}</div>
          <div><strong>Product:</strong> {selected.product}</div>
          <div><strong>Quantity:</strong> {selected.quantity_min} - {selected.quantity_max} ({selected.quantity_band})</div>
          <div><strong>Location:</strong> {selected.location}</div>
          <div><strong>Expected:</strong> {selected.expected_close_date}</div>
          <div><strong>Owner:</strong> {selected.deal_owner}</div>
          {selected.cost_matrix && (<div style={{marginTop:8}}><strong>Cost matrix:</strong>
            <pre style={{background:'#f6f8fb',padding:8,borderRadius:6}}>{typeof selected.cost_matrix === 'string' ? selected.cost_matrix : JSON.stringify(selected.cost_matrix, null, 2)}</pre>
          </div>)}
          <div style={{marginTop:8}}><button className="btn" onClick={()=>setSelected(null)}>Close</button></div>
        </Modal>
      )}

      {editing && (
        <Modal onClose={()=>setEditing(null)}>
          <h4>Edit Deal</h4>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <input className="input" name="customer_name" value={editing.customer_name||''} onChange={e=>setEditing({...editing, customer_name:e.target.value})} />
            <input className="input" name="product" value={editing.product||''} onChange={e=>setEditing({...editing, product:e.target.value})} />
            <input className="input" name="quantity_min" value={editing.quantity_min||''} onChange={e=>setEditing({...editing, quantity_min:e.target.value})} />
            <input className="input" name="quantity_max" value={editing.quantity_max||''} onChange={e=>setEditing({...editing, quantity_max:e.target.value})} />
            <input className="input" name="location" value={editing.location||''} onChange={e=>setEditing({...editing, location:e.target.value})} />
            <input className="input" name="expected_close_date" value={editing.expected_close_date||''} onChange={e=>setEditing({...editing, expected_close_date:e.target.value})} />
            <textarea className="input full" name="cost_matrix" rows={4} value={editing.cost_matrix? (typeof editing.cost_matrix === 'string' ? editing.cost_matrix : JSON.stringify(editing.cost_matrix)) : ''} onChange={e=>setEditing({...editing, cost_matrix:e.target.value})}></textarea>
            <input className="input" name="deal_owner" value={editing.deal_owner||''} onChange={e=>setEditing({...editing, deal_owner:e.target.value})} />
          </div>
          <div style={{marginTop:10}}>
            <button className="btn btn-primary" onClick={saveEdit}>Save</button>
            <button className="btn" style={{marginLeft:8}} onClick={()=>setEditing(null)}>Cancel</button>
          </div>
        </Modal>
      )}

    </div>
  )
}