import { useState } from 'react';

const MOCK_SUBSCRIPTIONS = [
  { id: 1, sender: 'Spotify', email: 'marketing@spotify.com', category: 'Marketing', frequency: 'Weekly', totalEmails: 47, logoColor: '#1DB954', logoInitial: 'S' },
  { id: 2, sender: 'The New York Times', email: 'newsletter@nytimes.com', category: 'Newsletter', frequency: 'Daily', totalEmails: 312, logoColor: '#000000', logoInitial: 'N' },
  { id: 3, sender: 'LinkedIn', email: 'notifications@linkedin.com', category: 'Social', frequency: '3x / week', totalEmails: 89, logoColor: '#0A66C2', logoInitial: 'in' },
  { id: 4, sender: 'Substack', email: 'digest@substack.com', category: 'Newsletter', frequency: 'Weekly', totalEmails: 28, logoColor: '#FF6719', logoInitial: 'S' },
  { id: 5, sender: 'Amazon', email: 'deals@amazon.com', category: 'Promotions', frequency: 'Daily', totalEmails: 204, logoColor: '#FF9900', logoInitial: 'A' },
  { id: 6, sender: 'Medium', email: 'noreply@medium.com', category: 'Newsletter', frequency: '2x / week', totalEmails: 61, logoColor: '#000000', logoInitial: 'M' },
];
const FREE_LIMIT = 5;
const CATEGORY_STYLES = {
  Marketing:  { bg: 'rgba(164,81,43,0.11)', text: '#A4512B' },
  Newsletter: { bg: 'rgba(67,85,111,0.10)', text: '#43556F' },
  Social:     { bg: 'rgba(63,111,80,0.11)', text: '#3F6F50' },
  Promotions: { bg: 'rgba(143,100,31,0.11)', text: '#8F641F' },
};
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconMail = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2 4 12 13 22 4"/></svg>;
const IconBolt = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconLock = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

function PaywallModal({ onClose, onUpgrade }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(16,24,43,0.48)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)' }}>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:'clamp(24px,5vw,40px)', maxWidth:420, width:'100%', boxShadow:'0 24px 64px rgba(16,24,43,0.20)', textAlign:'center' }}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(164,81,43,0.11)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'var(--accent)' }}><IconLock /></div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(20px,4vw,26px)', fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>Unlock Bulk Unsubscribe</h2>
        <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.7, marginBottom:24 }}>You have used all 5 free unsubscribes. Pay once to bulk-remove every unwanted sender - no subscription, ever.</p>
        <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 18px', marginBottom:24, textAlign:'left' }}>
          {['Unlimited one-click unsubscribes','Bulk select and remove all at once','Auto-scan new emails weekly','Works with Gmail, Outlook and Yahoo'].map(f => (
            <div key={f} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', fontSize:13, color:'var(--text-secondary)' }}>
              <span style={{ color:'var(--green)', flexShrink:0 }}><IconCheck /></span>{f}
            </div>
          ))}
        </div>
        <div style={{ marginBottom:20 }}>
          <span style={{ fontSize:'clamp(30px,5vw,38px)', fontWeight:800, color:'var(--text-primary)', fontFamily:'var(--font-display)' }}>$10</span>
          <span style={{ color:'var(--text-muted)', fontSize:14, marginLeft:6 }}>one-time · no subscription</span>
        </div>
        <button onClick={onUpgrade} style={{ width:'100%', padding:14, background:'var(--accent)', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer', marginBottom:10 }}>Unlock for $10</button>
        <button onClick={onClose} style={{ width:'100%', padding:12, background:'transparent', color:'var(--text-muted)', border:'none', fontSize:14, cursor:'pointer' }}>Maybe later</button>
      </div>
    </div>
  );
}

function Toast({ sender, action }) {
  const isUnsub = action === 'unsubscribe';
  return (
    <div style={{ position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)', background:'var(--text-primary)', color:'#fff', padding:'11px 20px', borderRadius:10, fontSize:13, fontWeight:500, zIndex:100, whiteSpace:'nowrap', boxShadow:'0 4px 24px rgba(16,24,43,0.24)', display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ color: isUnsub ? '#f87171' : '#4ade80' }}>{isUnsub ? <IconTrash /> : <IconCheck />}</span>
      {isUnsub ? 'Unsubscribed from' : 'Keeping'} <strong>{sender}</strong>
    </div>
  );
}

export default function InboxCleanerPage() {
  const [subscriptions, setSubscriptions] = useState(MOCK_SUBSCRIPTIONS);
  const [selected, setSelected] = useState(new Set());
  const [unsubCount, setUnsubCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('All');
  const [upgraded, setUpgraded] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  const showToast = (sender, action) => { setToast({ sender, action }); setTimeout(() => setToast(null), 2600); };
  const handleUnsubscribe = (id, name) => {
    if (!upgraded && unsubCount >= FREE_LIMIT) { setShowPaywall(true); return; }
    setSubscriptions(p => p.filter(s => s.id !== id));
    setUnsubCount(c => c + 1);
    setSelected(p => { const n = new Set(p); n.delete(id); return n; });
    showToast(name, 'unsubscribe');
  };
  const handleKeep = (id, name) => {
    setSubscriptions(p => p.filter(s => s.id !== id));
    setSelected(p => { const n = new Set(p); n.delete(id); return n; });
    showToast(name, 'keep');
  };
  const handleBulkUnsubscribe = () => {
    if (!upgraded && unsubCount + selected.size > FREE_LIMIT) { setShowPaywall(true); return; }
    const count = selected.size;
    setSubscriptions(p => p.filter(s => !selected.has(s.id)));
    setUnsubCount(c => c + count);
    setSelected(new Set());
    showToast(count + ' senders', 'unsubscribe');
  };
  const toggleSelect = id => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const categories = ['All', ...Array.from(new Set(MOCK_SUBSCRIPTIONS.map(s => s.category)))];
  const filtered = filter === 'All' ? subscriptions : subscriptions.filter(s => s.category === filter);
  const freeRemaining = Math.max(0, FREE_LIMIT - unsubCount);
  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="logo">Inbox<span className="acc">Clean</span></div>
          <div className="tagline">EMAIL SUBSCRIPTION MANAGER</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(63,111,80,0.11)', color:'#3F6F50', padding:'6px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#3F6F50', display:'inline-block' }} /> Gmail connected
          </div>
          {!upgraded && <div style={{ background:'rgba(164,81,43,0.11)', color:'var(--accent)', padding:'6px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>{freeRemaining} free left</div>}
          {upgraded && <div style={{ background:'rgba(63,111,80,0.11)', color:'#3F6F50', padding:'6px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>Premium</div>}
        </div>
      </div>

      <div className="page-main">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12, marginBottom:24 }}>
          {[
            { label:'Subscriptions found', value:MOCK_SUBSCRIPTIONS.length, icon:<IconMail />, color:'#43556F' },
            { label:'Unsubscribed', value:unsubCount, icon:<IconTrash />, color:'var(--red)' },
            { label:'Emails saved / mo', value:unsubCount * 14, icon:<IconBolt />, color:'var(--accent)' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ textAlign:'center', padding:'16px 12px' }}>
              <div style={{ color:stat.color, display:'flex', justifyContent:'center', marginBottom:6 }}>{stat.icon}</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px,4vw,30px)', fontWeight:700, color:'var(--text-primary)' }}>{stat.value}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {!upgraded && (
          <div className="card" style={{ marginBottom:16, padding:'14px 18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Free plan · {freeRemaining} unsubscribe{freeRemaining !== 1 ? 's' : ''} remaining</span>
              <button onClick={() => setShowPaywall(true)} style={{ fontSize:12, fontWeight:600, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0 }}>Unlock all</button>
            </div>
            <div style={{ height:6, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
              <div style={{ height:'100%', width:(unsubCount / FREE_LIMIT * 100) + '%', background: freeRemaining === 0 ? 'var(--red)' : 'var(--accent)', borderRadius:4, transition:'width 0.4s ease' }} />
            </div>
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:14 }}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{ padding:'6px 14px', borderRadius:20, border:'1px solid', borderColor: filter === cat ? 'var(--accent)' : 'var(--border)', background: filter === cat ? 'var(--accent)' : 'transparent', color: filter === cat ? '#fff' : 'var(--text-secondary)', fontSize:12, fontWeight:500, cursor:'pointer' }}>{cat}</button>
            ))}
          </div>
          {selected.size > 0 && (
            <button onClick={handleBulkUnsubscribe} style={{ padding:'8px 16px', background:'var(--red)', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              <IconTrash /> Unsubscribe {selected.size} selected
            </button>
          )}
        </div>

        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'36px 1fr 110px 95px 80px 190px', gap:8, padding:'12px 18px', borderBottom:'1px solid var(--border)', background:'rgba(16,24,43,0.03)' }}>
            <div style={{ display:'flex', alignItems:'center' }}>
              <input type="checkbox" checked={allSelected} onChange={() => allSelected ? setSelected(new Set()) : setSelected(new Set(filtered.map(s => s.id)))} style={{ cursor:'pointer', accentColor:'var(--accent)', width:15, height:15 }} />
            </div>
            {['Sender','Category','Frequency','Emails','Actions'].map(h => (
              <div key={h} style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', letterSpacing:'0.06em', textTransform:'uppercase' }}>{h}</div>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding:'52px 24px', textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>All clean in this category!</div>
          ) : filtered.map((sub, idx) => (
            <div key={sub.id} onMouseEnter={() => setHoveredRow(sub.id)} onMouseLeave={() => setHoveredRow(null)}
              style={{ display:'grid', gridTemplateColumns:'36px 1fr 110px 95px 80px 190px', gap:8, padding:'14px 18px', borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none', alignItems:'center', background: selected.has(sub.id) ? 'rgba(164,81,43,0.04)' : hoveredRow === sub.id ? 'rgba(16,24,43,0.018)' : 'transparent', transition:'background 0.12s' }}>
              <input type="checkbox" checked={selected.has(sub.id)} onChange={() => toggleSelect(sub.id)} style={{ cursor:'pointer', accentColor:'var(--accent)', width:15, height:15 }} />
              <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:sub.logoColor, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: sub.logoInitial.length > 1 ? 9 : 13, fontWeight:800, flexShrink:0 }}>{sub.logoInitial}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{sub.sender}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{sub.email}</div>
                </div>
              </div>
              <div><span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:CATEGORY_STYLES[sub.category]?.bg, color:CATEGORY_STYLES[sub.category]?.text }}>{sub.category}</span></div>
              <div style={{ fontSize:13, color:'var(--text-secondary)' }}>{sub.frequency}</div>
              <div style={{ fontSize:13, fontWeight:600, color: sub.totalEmails > 100 ? 'var(--red)' : 'var(--text-primary)' }}>{sub.totalEmails}<span style={{ fontSize:10, color:'var(--text-muted)', fontWeight:400, marginLeft:2 }}>total</span></div>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => handleUnsubscribe(sub.id, sub.sender)} style={{ padding:'7px 12px', background: hoveredRow === sub.id ? 'rgba(169,71,64,0.12)' : 'rgba(169,71,64,0.07)', color:'var(--red)', border:'1px solid rgba(169,71,64,0.20)', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}><IconTrash /> Unsubscribe</button>
                <button onClick={() => handleKeep(sub.id, sub.sender)} style={{ padding:'7px 10px', background: hoveredRow === sub.id ? 'rgba(63,111,80,0.10)' : 'transparent', color: hoveredRow === sub.id ? '#3F6F50' : 'var(--text-muted)', border:'1px solid var(--border)', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}><IconCheck /> Keep</button>
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop:16, fontSize:12, color:'var(--text-muted)', textAlign:'center' }}>
          Scanned 2,341 emails · Last scan: just now
        </p>
      </div>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onUpgrade={() => { setUpgraded(true); setShowPaywall(false); }} />}
      {toast && <Toast sender={toast.sender} action={toast.action} />}
    </div>
  );
}
