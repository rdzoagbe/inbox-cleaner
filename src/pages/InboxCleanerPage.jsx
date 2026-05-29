import { useState, useEffect } from 'react';

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_USER = { name: 'Roland Dzoagbe', email: 'roland@example.com', avatar: 'RD' };
const MOCK_INBOX = { provider: 'Gmail', address: 'roland@gmail.com', providerColor: '#EA4335', providerInitial: 'G' };
const MOCK_SUBSCRIPTIONS = [
  { id: 1, sender: 'Spotify',          email: 'marketing@spotify.com',     category: 'Marketing',  frequency: 'Weekly',    totalEmails: 47,  logoColor: '#1DB954', logoInitial: 'S'  },
  { id: 2, sender: 'The New York Times',email: 'newsletter@nytimes.com',    category: 'Newsletter', frequency: 'Daily',     totalEmails: 312, logoColor: '#000000', logoInitial: 'N'  },
  { id: 3, sender: 'LinkedIn',          email: 'notifications@linkedin.com',category: 'Social',     frequency: '3x / week', totalEmails: 89,  logoColor: '#0A66C2', logoInitial: 'in' },
  { id: 4, sender: 'Substack',          email: 'digest@substack.com',       category: 'Newsletter', frequency: 'Weekly',    totalEmails: 28,  logoColor: '#FF6719', logoInitial: 'S'  },
  { id: 5, sender: 'Amazon',            email: 'deals@amazon.com',          category: 'Promotions', frequency: 'Daily',     totalEmails: 204, logoColor: '#FF9900', logoInitial: 'A'  },
  { id: 6, sender: 'Medium',            email: 'noreply@medium.com',        category: 'Newsletter', frequency: '2x / week', totalEmails: 61,  logoColor: '#000000', logoInitial: 'M'  },
];

const FREE_LIMIT = 5;

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_STYLES = {
  Marketing:  { bg: 'rgba(164,81,43,0.11)',  text: '#A4512B' },
  Newsletter: { bg: 'rgba(67,85,111,0.10)',  text: '#43556F' },
  Social:     { bg: 'rgba(63,111,80,0.11)',  text: '#3F6F50' },
  Promotions: { bg: 'rgba(143,100,31,0.11)', text: '#8F641F' },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconTrash    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconCheck    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconMail     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2 4 12 13 22 4"/></svg>;
const IconBolt     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconLock     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconPlug     = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8H6a2 2 0 0 0-2 2v3a6 6 0 0 0 12 0v-3a2 2 0 0 0-2-2Z"/></svg>;
const IconLogout   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconChevron  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IconScan     = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>;

// ─── Sub-components ───────────────────────────────────────────────────────────

function TopNav({ appState, onStateChange, onLogout, userMenuOpen, setUserMenuOpen }) {
  const stateLabels = { disconnected: 'Disconnected', scanning: 'Scanning', populated: 'Connected' };
  const stateColors = { disconnected: '#6e6b80', scanning: '#8F641F', populated: '#3F6F50' };
  const stateDotBg  = { disconnected: '#6e6b80', scanning: '#c98a2e', populated: '#3F6F50' };

  return (
    <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

        {/* Logo */}
        <div className="logo" style={{ fontSize: 18, flexShrink: 0 }}>
          Inbox<span className="acc">Clean</span>
        </div>

        {/* Dev preview toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(143,100,31,0.08)', border: '1px solid rgba(143,100,31,0.22)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#8F641F', flexShrink: 0 }}>
          <span>Preview:</span>
          {['disconnected', 'scanning', 'populated'].map(s => (
            <button key={s} onClick={() => onStateChange(s)}
              style={{ padding: '3px 8px', borderRadius: 5, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: appState === s ? '#8F641F' : 'transparent',
                color: appState === s ? '#fff' : '#8F641F' }}>
              {stateLabels[s]}
            </button>
          ))}
        </div>

        {/* User menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={() => setUserMenuOpen(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px', background: userMenuOpen ? 'rgba(16,24,43,0.06)' : 'transparent', border: '1px solid', borderColor: userMenuOpen ? 'var(--border)' : 'transparent', borderRadius: 10, cursor: 'pointer' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>{MOCK_USER.avatar}</div>
            <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{MOCK_USER.name.split(' ')[0]}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: stateColors[appState] }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: stateDotBg[appState], display: 'inline-block' }} />
                {stateLabels[appState]}
              </div>
            </div>
            <span style={{ color: 'var(--text-muted)', marginLeft: 2 }}><IconChevron /></span>
          </button>

          {userMenuOpen && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 8, minWidth: 200, boxShadow: '0 8px 32px rgba(16,24,43,0.12)', zIndex: 50 }}>
              <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{MOCK_USER.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{MOCK_USER.email}</div>
                <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(67,85,111,0.08)', color: '#43556F', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>App Session · Free Plan</div>
              </div>
              <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'none', border: 'none', borderRadius: 8, fontSize: 13, color: 'var(--red)', cursor: 'pointer', fontWeight: 500 }}>
                <IconLogout /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function DisconnectedState({ onConnect }) {
  return (
    <div style={{ minHeight: 'calc(100svh - 57px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', textAlign: 'center' }}>

      <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(164,81,43,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 24 }}>
        <IconPlug />
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
        Connect your inbox
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.7, margin: '0 0 32px' }}>
        InboxClean scans your email headers to find subscriptions you forgot about. No email content is ever read or stored.
      </p>

      <button onClick={onConnect}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(164,81,43,0.28)', marginBottom: 14 }}>
        <IconMail /> Connect your inbox
      </button>
      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Works with Gmail, Outlook and Yahoo · OAuth 2.0 · Read-only access</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 48, maxWidth: 600, width: '100%' }}>
        {[
          { icon: '🔒', title: 'Read-only access', body: 'We only read email headers — sender, subject, date. Never the body.' },
          { icon: '🚫', title: 'No data stored',   body: 'Your credentials are never stored. OAuth tokens stay in your session.' },
          { icon: '⚡', title: 'Instant scan',      body: 'Results appear in seconds. Powered by Unipile Universal API.' },
        ].map(f => (
          <div key={f.title} className="card" style={{ padding: '16px 14px', textAlign: 'left' }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScanningState() {
  const [progress, setProgress] = useState(12);
  const [stage, setStage]       = useState(0);
  const stages = [
    'Authenticating with Gmail…',
    'Fetching inbox headers…',
    'Analysing sender patterns…',
    'Identifying subscriptions…',
    'Almost done…',
  ];

  useEffect(() => {
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 92) { clearInterval(iv); return 92; }
        return p + Math.random() * 4 + 1;
      });
      setStage(s => Math.min(s + 1, stages.length - 1));
    }, 900);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ minHeight: 'calc(100svh - 57px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', textAlign: 'center' }}>

      {/* Inbox badge */}
      <div className="card" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', marginBottom: 32, borderRadius: 40 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: MOCK_INBOX.providerColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800 }}>{MOCK_INBOX.providerInitial}</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{MOCK_INBOX.address}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Connected inbox</span>
      </div>

      {/* Animated scan icon */}
      <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 24 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid var(--border)' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
          <IconScan />
        </div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>Scanning your inbox</h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, height: 20 }}>{stages[stage]}</p>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 360, height: 6, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', width: Math.round(progress) + '%', background: 'var(--accent)', borderRadius: 4, transition: 'width 0.8s ease' }} />
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Math.round(progress)}% complete · scanning 2,341 emails</p>

      {/* Skeleton rows */}
      <div className="card" style={{ width: '100%', maxWidth: 600, marginTop: 40, padding: 0, overflow: 'hidden' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--border)', flexShrink: 0, animation: 'pulse 1.6s ease-in-out infinite', animationDelay: (i * 0.15) + 's' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, width: '40%', background: 'var(--border)', borderRadius: 4, marginBottom: 7, animation: 'pulse 1.6s ease-in-out infinite', animationDelay: (i * 0.15 + 0.05) + 's' }} />
              <div style={{ height: 10, width: '60%', background: 'var(--border)', borderRadius: 4, animation: 'pulse 1.6s ease-in-out infinite', animationDelay: (i * 0.15 + 0.1) + 's' }} />
            </div>
            <div style={{ height: 22, width: 72, background: 'var(--border)', borderRadius: 20, animation: 'pulse 1.6s ease-in-out infinite', animationDelay: (i * 0.15) + 's' }} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}

function PaywallModal({ onClose, onUpgrade }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(16,24,43,0.48)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)' }}>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:'clamp(24px,5vw,40px)', maxWidth:420, width:'100%', boxShadow:'0 24px 64px rgba(16,24,43,0.20)', textAlign:'center' }}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(164,81,43,0.11)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'var(--accent)' }}><IconLock /></div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(20px,4vw,26px)', fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>Unlock Bulk Unsubscribe</h2>
        <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.7, marginBottom:24 }}>You've used all 5 free unsubscribes. Pay once to bulk-remove every unwanted sender — no subscription, ever.</p>
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

function PopulatedState() {
  const [subscriptions, setSubscriptions] = useState(MOCK_SUBSCRIPTIONS);
  const [selected, setSelected]           = useState(new Set());
  const [unsubCount, setUnsubCount]       = useState(0);
  const [showPaywall, setShowPaywall]     = useState(false);
  const [toast, setToast]                 = useState(null);
  const [filter, setFilter]               = useState('All');
  const [upgraded, setUpgraded]           = useState(false);
  const [hoveredRow, setHoveredRow]       = useState(null);

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

  const categories  = ['All', ...Array.from(new Set(MOCK_SUBSCRIPTIONS.map(s => s.category)))];
  const filtered    = filter === 'All' ? subscriptions : subscriptions.filter(s => s.category === filter);
  const freeRemaining = Math.max(0, FREE_LIMIT - unsubCount);
  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <div className="page-main">
      {/* Connected inbox badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 40 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: MOCK_INBOX.providerColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 800 }}>{MOCK_INBOX.providerInitial}</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{MOCK_INBOX.address}</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>Connected inbox</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>— separate from your InboxClean account</span>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12, marginBottom:24 }}>
        {[
          { label:'Subscriptions found', value: MOCK_SUBSCRIPTIONS.length, icon:<IconMail />, color:'#43556F' },
          { label:'Unsubscribed',        value: unsubCount,                 icon:<IconTrash />, color:'var(--red)' },
          { label:'Emails saved / mo',   value: unsubCount * 14,            icon:<IconBolt />, color:'var(--accent)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign:'center', padding:'16px 12px' }}>
            <div style={{ color:stat.color, display:'flex', justifyContent:'center', marginBottom:6 }}>{stat.icon}</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px,4vw,30px)', fontWeight:700, color:'var(--text-primary)' }}>{stat.value}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Free plan bar */}
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

      {/* Filter + bulk action bar */}
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

      {/* Table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 620 }}>
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
        </div>
      </div>

      <p style={{ marginTop:16, fontSize:12, color:'var(--text-muted)', textAlign:'center' }}>
        Scanned 2,341 emails · Last scan: just now
      </p>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onUpgrade={() => { setUpgraded(true); setShowPaywall(false); }} />}
      {toast && <Toast sender={toast.sender} action={toast.action} />}
    </div>
  );
}

// ─── Root page ────────────────────────────────────────────────────────────────
export default function InboxCleanerPage() {
  // 'disconnected' | 'scanning' | 'populated'
  const [appState, setAppState]         = useState('disconnected');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleConnect  = () => setAppState('scanning');
  const handleLogout   = () => { setUserMenuOpen(false); setAppState('disconnected'); };

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = () => setUserMenuOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [userMenuOpen]);

  return (
    <div style={{ minHeight: '100svh', background: 'var(--bg)' }}>
      <TopNav
        appState={appState}
        onStateChange={setAppState}
        onLogout={handleLogout}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={e => { e.stopPropagation?.(); setUserMenuOpen(v => !v); }}
      />

      {appState === 'disconnected' && <DisconnectedState onConnect={handleConnect} />}
      {appState === 'scanning'     && <ScanningState />}
      {appState === 'populated'    && (
        <div className="page" style={{ paddingTop: 28 }}>
          <PopulatedState />
        </div>
      )}
    </div>
  );
}
