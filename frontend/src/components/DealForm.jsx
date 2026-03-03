import React from 'react'
import * as localStore from '../utils/localStore'

function TrafficLight({risk}){
  if(risk==='high') return <div className="traffic-high">🔴 High risk</div>
  if(risk==='medium') return <div className="traffic-medium">🟡 Medium risk</div>
  return <div className="traffic-low">🟢 Low risk</div>
}

export default function DealForm(){
  const [form, setForm] = React.useState({});
  const [precheck, setPrecheck] = React.useState(null);
  const [justification, setJustification] = React.useState('');
  const onChange = e => setForm({...form, [e.target.name]: e.target.value});

  async function handlePrecheck(e){
    e.preventDefault();
    // try backend first, fallback to localStore
    try{
      const res = await fetch('/api/deals/precheck', {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(form)
      });
      if(res.ok){ const j = await res.json(); setPrecheck(j); return; }
    }catch(err){ /* ignore and fallback */ }
    const j = await localStore.precheck(form);
    setPrecheck(j);
  }

  async function handleSubmit(e){
    e.preventDefault();
    const body = Object.assign({}, form, { justification: justification || null });
    // try backend submit first, fallback to localStore
    try{
      const res = await fetch('/api/deals/submit', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
      if(res.ok){ const j = await res.json(); alert('Submitted. Status: ' + j.status); setForm({}); setPrecheck(null); setJustification(''); return; }
    }catch(err){ /* ignore and fallback */ }
    const j = await localStore.submit(body);
    alert('Submitted. Status: ' + j.status);
    setForm({}); setPrecheck(null); setJustification('');
  }

  return (
    <div>
      <form onSubmit={handlePrecheck} className="deal-form card">
        <input className="input" name="customer_name" placeholder="Customer Name" value={form.customer_name||''} onChange={onChange} />
        <input className="input" name="product" placeholder="Product / Category" value={form.product||''} onChange={onChange} />
        <input className="input" name="quantity_min" placeholder="Quantity Min" value={form.quantity_min||''} onChange={onChange} />
        <input className="input" name="quantity_max" placeholder="Quantity Max" value={form.quantity_max||''} onChange={onChange} />
        <input className="input" name="location" placeholder="Location" value={form.location||''} onChange={onChange} />
        <input className="input" name="expected_close_date" placeholder="Expected close (YYYY-MM-DD)" value={form.expected_close_date||''} onChange={onChange} />
        <textarea className="input" name="cost_matrix" placeholder='Cost matrix (JSON or free text)' value={form.cost_matrix||''} onChange={onChange} rows={3} />
        <input className="input" name="deal_owner" placeholder="Deal owner" value={form.deal_owner||''} onChange={onChange} />

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Check for duplicates</button>
        </div>
      </form>

      {precheck && (
        <div className="precheck card">
          <h3>Pre-submit check</h3>
          <TrafficLight risk={precheck.risk} />
          {precheck.best && (
            <div>
              <strong>Top match score:</strong> {precheck.best.score}
              <ul className="reasoning">
                {precheck.best.reasoning.map((r,i)=>(<li key={i}>{r}</li>))}
              </ul>
            </div>
          )}
          {precheck.risk==='medium' && (
            <div>
              <label>Justification (required for medium risk)</label>
              <br/>
              <textarea value={justification} onChange={e=>setJustification(e.target.value)} rows={3} cols={60} />
            </div>
          )}
          <div style={{marginTop:8}}>
            <button onClick={handleSubmit} className="btn btn-primary">Submit Deal</button>
          </div>
        </div>
      )}
    </div>
  )
}
