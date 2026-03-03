import React from 'react'
import * as localStore from '../utils/localStore'

export default function AdminDashboard(){
  const [flags, setFlags] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(()=>{ fetchFlags(); },[]);

  async function fetchFlags(){
    setLoading(true);
    const j = await localStore.getFlagged();
    setFlags(j);
    setLoading(false);
  }

  async function review(id, action){
    await localStore.review(id, action);
    fetchFlags();
  }

  return (
    <div>
      <h3>Admin Review</h3>
      {loading ? 'Loading...' : (
        <div>
          {flags.length===0 ? <div>No flagged deals</div> : (
            flags.map(d=> (
              <div key={d.id} className="flag-card">
                <div><strong>{d.customer_name}</strong> — {d.product} — {d.quantity_band} — {d.location}</div>
                <div className="meta">Owner: {d.deal_owner} | Submitted: {new Date(d.created_at).toLocaleString()}</div>
                {d.cost_matrix && (
                  <pre>{typeof d.cost_matrix === 'string' ? d.cost_matrix : JSON.stringify(d.cost_matrix, null, 2)}</pre>
                )}
                <div style={{marginTop:6}}>
                  <button className="btn btn-primary" onClick={()=>review(d.id,'approve')}>Approve</button>
                  <button className="btn" onClick={()=>review(d.id,'reject')} style={{marginLeft:8}}>Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
