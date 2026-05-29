import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Trash2, Check, Zap, Lock, Plug, LogOut, ChevronDown,
  Plus, X, RefreshCw, ShieldBan, Settings, Bell, Moon, Sun,
  ScanLine, UserCircle, CreditCard, AlertTriangle, ChevronRight,
  Inbox, Sliders
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const MOCK_USER   = { name: 'Roland Dzoagbe', email: 'accensionday@hotmail.fr', avatar: 'RD' };
const FREE_LIMIT  = 5;

const PROVIDER_COLORS = { google: '#EA4335', microsoft: '#0078D4', yahoo: '#6001D2', imap: '#6e6b80' };
const PROVIDER_LABELS = { google: 'Gmail', microsoft: 'Outlook', yahoo: 'Yahoo', imap: 'Email' };

const CATEGORY_STYLES = {
  Marketing:  { bg: 'rgba(164,81,43,0.11)',  text: '#A4512B' },
  Newsletter: { bg: 'rgba(67,85,111,0.10)',  text: '#43556F' },
  Social:     { bg: 'rgba(63,111,80,0.11)',  text: '#3F6F50' },
  Promotions: { bg: 'rgba(143,100,31,0.11)', text: '#8F641F' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const providerColor = p => PROVIDER_COLORS[p] || '#6e6b80';
const providerLabel = p => PROVIDER_LABELS[p] || 'Email';
const saveAccounts      = a => { try { localStorage.setItem('ic_accounts', JSON.stringify(a)); } catch {} };
const loadAccounts      = ()  => { try { return JSON.parse(localStorage.getItem('ic_accounts') || '[]'); } catch { return []; } };
const saveSubscriptions = s => { try { localStorage.setItem('ic_subscriptions', JSON.stringify({ data: s, ts: Date.now() })); } catch {} };
const loadSubscriptions = ()  => { try { const r = JSON.parse(localStorage.getItem('ic_subscriptions') || 'null'); return r?.data || []; } catch { return []; } };
const loadScanTs        = ()  => { try { const r = JSON.parse(localStorage.getItem('ic_subscriptions') || 'null'); return r?.ts || null; } catch { return null; } };

function timeAgo(ts) {
  if (!ts) return null;
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({ accounts, onClose, onRemoveAccount, onAddAccount }) {
  const [tab, setTab]           = useState('account');
  const [scanFreq, setScanFreq] = useState('manual');
  const [theme, setTheme]       = useState('system');
  const [notifyEmail, setNotifyEmail]   = useState(true);
  const [notifyBrowser, setNotifyBrowser] = useState(false);
  const [showDanger, setShowDanger]     = useState(false);

  const tabs = [
    { id: 'account',   label: 'Account',    icon: UserCircle },
    { id: 'inboxes',   label: 'Inboxes',    icon: Inbox },
    { id: 'scanning',  label: 'Scanning',   icon: ScanLine },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Sun },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(16,24,43,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(16,24,43,0.2)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={18} color="var(--accent)" />
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Settings</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{ width: 160, borderRight: '1px solid var(--border)', padding: '12px 8px', flexShrink: 0, overflowY: 'auto' }}>
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, border: 'none', background: tab === t.id ? 'rgba(164,81,43,0.10)' : 'none', color: tab === t.id ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer', textAlign: 'left', marginBottom: 2 }}>
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '20px 22px', overflowY: 'auto' }}>

            {tab === 'account' && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Your InboxClean Account</h3>
                <div className="card" style={{ padding: '14px 16px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>{MOCK_USER.avatar}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{MOCK_USER.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{MOCK_USER.email}</div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '14px 16px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Free Plan</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>5 free unsubscribes per scan</div>
                    </div>
                    <button style={{ padding: '7px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Upgrade · $10</button>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowDanger(v => !v)}>
                    <AlertTriangle size={12} /> Danger Zone <ChevronRight size={12} style={{ transform: showDanger ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                  {showDanger && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button style={{ padding: '8px 14px', background: 'none', border: '1px solid rgba(169,71,64,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--red)', cursor: 'pointer', textAlign: 'left' }}>Clear all scan data</button>
                      <button style={{ padding: '8px 14px', background: 'none', border: '1px solid rgba(169,71,64,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--red)', cursor: 'pointer', textAlign: 'left' }}>Delete account</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'inboxes' && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Connected Inboxes</h3>
                {accounts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>No inboxes connected yet.</div>
                ) : accounts.map(acc => (
                  <div key={acc.grant_id} className="card" style={{ padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: providerColor(acc.provider), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800 }}>
                        {providerLabel(acc.provider).charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{acc.email}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{providerLabel(acc.provider)}</div>
                      </div>
                    </div>
                    <button onClick={() => onRemoveAccount(acc.grant_id)} style={{ background: 'none', border: '1px solid rgba(169,71,64,0.25)', borderRadius: 7, padding: '5px 10px', fontSize: 12, color: 'var(--red)', cursor: 'pointer' }}>Disconnect</button>
                  </div>
                ))}
                <button onClick={onAddAccount} style={{ width: '100%', padding: '10px', background: 'none', border: '1px dashed var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                  <Plus size={13} /> Connect another inbox
                </button>
              </div>
            )}

            {tab === 'scanning' && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Scan Preferences</h3>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Scan Frequency</div>
                  {[['manual', 'Manual only', 'Scan when you click the button'],
                    ['daily', 'Daily', 'Auto-scan every morning'],
                    ['weekly', 'Weekly', 'Auto-scan every Monday']].map(([val, label, desc]) => (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid', borderColor: scanFreq === val ? 'var(--accent)' : 'var(--border)', background: scanFreq === val ? 'rgba(164,81,43,0.05)' : 'transparent', cursor: 'pointer', marginBottom: 8 }}>
                      <input type="radio" checked={scanFreq === val} onChange={() => setScanFreq(val)} style={{ accentColor: 'var(--accent)' }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="card" style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Email lookback window</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>How far back to scan for subscriptions</div>
                  <select style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 13 }}>
                    <option>Last 200 emails</option>
                    <option>Last 500 emails</option>
                    <option>Last 1,000 emails</option>
                    <option>Last 3 months</option>
                    <option>Last 6 months</option>
                  </select>
                </div>
              </div>
            )}

            {tab === 'notifications' && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Notification Preferences</h3>
                {[
                  [notifyEmail, setNotifyEmail, 'Email digest', 'Weekly summary of blocked senders', Mail],
                  [notifyBrowser, setNotifyBrowser, 'Browser notifications', 'Alert when a new scan completes', Bell],
                ].map(([val, setter, label, desc, Icon]) => (
                  <div key={label} className="card" style={{ padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon size={16} color="var(--text-muted)" />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                      </div>
                    </div>
                    <button onClick={() => setter(v => !v)}
                      style={{ width: 40, height: 22, borderRadius: 11, border: 'none', background: val ? 'var(--accent)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: val ? 21 : 3, transition: 'left 0.2s' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab === 'appearance' && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Appearance</h3>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Theme</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[['light', 'Light', Sun], ['dark', 'Dark', Moon], ['system', 'System', Sliders]].map(([val, label, Icon]) => (
                    <button key={val} onClick={() => setTheme(val)}
                      style={{ padding: '14px 10px', borderRadius: 10, border: '1px solid', borderColor: theme === val ? 'var(--accent)' : 'var(--border)', background: theme === val ? 'rgba(164,81,43,0.07)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <Icon size={18} color={theme === val ? 'var(--accent)' : 'var(--text-muted)'} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: theme === val ? 'var(--accent)' : 'var(--text-secondary)' }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Top Nav ──────────────────────────────────────────────────────────────────
function TopNav({ accounts, onAddAccount, onRemoveAccount, onLogout, onScan, scanning,
                  userMenuOpen, setUserMenuOpen, onOpenSettings }) {
  return (
    <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

        <div className="logo" style={{ fontSize: 18, flexShrink: 0 }}>Inbox<span className="acc">Clean</span></div>

        {/* Connected inboxes + scan button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          {accounts.map(acc => (
            <div key={acc.grant_id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 10px 4px 6px', fontSize: 12 }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: providerColor(acc.provider), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
                {providerLabel(acc.provider).charAt(0)}
              </div>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{acc.email}</span>
              <button onClick={() => onRemoveAccount(acc.grant_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', lineHeight: 1 }}><X size={11} /></button>
            </div>
          ))}
          {accounts.length < 5 && (
            <button onClick={onAddAccount} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 20, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 }}>
              <Plus size={11} /> Add inbox
            </button>
          )}
          {accounts.length > 0 && (
            <button onClick={onScan} disabled={scanning}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: scanning ? 'wait' : 'pointer', opacity: scanning ? 0.7 : 1, transition: 'opacity 0.2s' }}>
              <RefreshCw size={12} style={{ animation: scanning ? 'spin 1s linear infinite' : 'none' }} />
              {scanning ? 'Scanning…' : 'Scan Inboxes'}
            </button>
          )}
        </div>

        {/* User menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={setUserMenuOpen}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px', background: userMenuOpen ? 'rgba(16,24,43,0.06)' : 'transparent', border: '1px solid', borderColor: userMenuOpen ? 'var(--border)' : 'transparent', borderRadius: 10, cursor: 'pointer' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>{MOCK_USER.avatar}</div>
            <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{MOCK_USER.name.split(' ')[0]}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>App session</div>
            </div>
            <ChevronDown size={12} color="var(--text-muted)" style={{ marginLeft: 2 }} />
          </button>

          {userMenuOpen && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 8, minWidth: 220, boxShadow: '0 8px 32px rgba(16,24,43,0.12)', zIndex: 50 }}>
              <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{MOCK_USER.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{MOCK_USER.email}</div>
                <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(67,85,111,0.08)', color: '#43556F', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
                  InboxClean account · Free Plan
                </div>
              </div>
              <button onClick={onOpenSettings} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'none', border: 'none', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}>
                <Settings size={14} /> Settings
              </button>
              <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'none', border: 'none', borderRadius: 8, fontSize: 13, color: 'var(--red)', cursor: 'pointer', fontWeight: 500 }}>
                <LogOut size={14} /> Sign out of InboxClean
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </nav>
  );
}

// ─── Connect CTA ──────────────────────────────────────────────────────────────
function ConnectState({ onConnect, connecting, error }) {
  return (
    <div style={{ minHeight: 'calc(100svh - 57px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(164,81,43,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 24 }}>
        <Plug size={28} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px', letterSpacing: '-0.5px' }}>Connect your inbox</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.7, margin: '0 0 32px' }}>
        InboxClean scans your email headers to surface subscriptions. Connect Gmail, Outlook, Yahoo — or all three.
      </p>
      {error && (
        <div style={{ background: 'rgba(169,71,64,0.08)', border: '1px solid rgba(169,71,64,0.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: 'var(--red)', maxWidth: 400 }}>{error}</div>
      )}
      <button onClick={onConnect} disabled={connecting}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 28px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: connecting ? 'wait' : 'pointer', boxShadow: '0 4px 20px rgba(164,81,43,0.28)', marginBottom: 14, opacity: connecting ? 0.75 : 1 }}>
        <Mail size={16} /> {connecting ? 'Redirecting to Nylas…' : 'Connect your inbox'}
      </button>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 48 }}>Gmail · Outlook · Yahoo · Any IMAP — pick your provider on the next screen</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, maxWidth: 600, width: '100%' }}>
        {[
          { icon: '🔒', title: 'Read-only access',  body: 'We only read email headers — sender and date. Never the message body.' },
          { icon: '🚫', title: 'No data stored',    body: 'Your credentials are never stored. Tokens live in your browser session only.' },
          { icon: '⚡', title: 'All providers',     body: 'Powered by Nylas — connect Gmail, Outlook, Yahoo and more from one screen.' },
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

// ─── Scanning skeleton ────────────────────────────────────────────────────────
function ScanningState({ accounts }) {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const iv = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ minHeight: 'calc(100svh - 57px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        {accounts.map(acc => (
          <div key={acc.grant_id} className="card" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 40 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: providerColor(acc.provider), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 800 }}>
              {providerLabel(acc.provider).charAt(0)}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{acc.email}</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'relative', width: 72, height: 72, marginBottom: 24 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid var(--border)' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>📬</div>
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
        Scanning {accounts.length > 1 ? `${accounts.length} inboxes` : 'your inbox'}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>Analysing email headers{dots}</p>
      <div className="card" style={{ width: '100%', maxWidth: 560, padding: 0, overflow: 'hidden' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--border)', flexShrink: 0, animation: 'pulse 1.6s ease-in-out infinite', animationDelay: (i * 0.12) + 's' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, width: '38%', background: 'var(--border)', borderRadius: 4, marginBottom: 7, animation: 'pulse 1.6s ease-in-out infinite', animationDelay: (i * 0.12 + 0.05) + 's' }} />
              <div style={{ height: 10, width: '55%', background: 'var(--border)', borderRadius: 4, animation: 'pulse 1.6s ease-in-out infinite', animationDelay: (i * 0.12 + 0.1) + 's' }} />
            </div>
            <div style={{ height: 22, width: 68, background: 'var(--border)', borderRadius: 20, animation: 'pulse 1.6s ease-in-out infinite', animationDelay: (i * 0.12) + 's' }} />
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

// ─── Paywall modal ────────────────────────────────────────────────────────────
function PaywallModal({ onClose, onUpgrade }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(16,24,43,0.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 'clamp(24px,5vw,40px)', maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(16,24,43,0.20)', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(164,81,43,0.11)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--accent)' }}><Lock size={22} /></div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,4vw,26px)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Unlock Bulk Actions</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>You've used all 5 free actions. Pay once to bulk-remove and block every unwanted sender — no subscription, ever.</p>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
          {['Unlimited unsubscribes & blocks','Bulk select and action all at once','Auto-scan new emails weekly','Works with Gmail, Outlook and Yahoo'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--green)', flexShrink: 0 }}><Check size={13} /></span>{f}
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 'clamp(30px,5vw,38px)', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>$10</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 14, marginLeft: 6 }}>one-time · no subscription</span>
        </div>
        <button onClick={onUpgrade} style={{ width: '100%', padding: 14, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>Unlock for $10</button>
        <button onClick={onClose} style={{ width: '100%', padding: 12, background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: 14, cursor: 'pointer' }}>Maybe later</button>
      </div>
    </div>
  );
}

function Toast({ sender, action, detail }) {
  const colors = { unsubscribe: '#f87171', keep: '#4ade80', block: '#fb923c' };
  const icons  = { unsubscribe: <Trash2 size={13} />, keep: <Check size={13} />, block: <ShieldBan size={13} /> };
  const labels = { unsubscribe: 'Unsubscribed from', keep: 'Keeping', block: 'Blocked' };
  return (
    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: 'var(--text-primary)', color: '#fff', padding: '11px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 100, boxShadow: '0 4px 24px rgba(16,24,43,0.24)', display: 'flex', alignItems: 'center', gap: 8, maxWidth: 'calc(100vw - 32px)' }}>
      <span style={{ color: colors[action], flexShrink: 0 }}>{icons[action]}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {labels[action]} <strong>{sender}</strong>
        {detail && <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 400, marginLeft: 6 }}>· {detail}</span>}
      </span>
    </div>
  );
}

// ─── Floating Bulk Action Bar ─────────────────────────────────────────────────
function BulkActionBar({ count, onBulkUnsubscribe, onBulkBlock, onClear }) {
  return (
    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 90, animation: 'slideUp 0.2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--text-primary)', borderRadius: 14, padding: '10px 14px', boxShadow: '0 8px 32px rgba(16,24,43,0.28)' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginRight: 4 }}>{count} selected</span>
        <button onClick={onBulkUnsubscribe}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <Trash2 size={13} /> Unsubscribe all
        </button>
        <button onClick={onBulkBlock}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#b45309', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <ShieldBan size={13} /> Block all
        </button>
        <button onClick={onClear}
          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, padding: '7px 9px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
          <X size={14} />
        </button>
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function Dashboard({ accounts, subscriptions, scanTs, totalScanned, onAddAccount, onScan, scanning }) {
  const [rows, setRows]               = useState(subscriptions);
  const [selected, setSelected]       = useState(new Set());
  const [actionCount, setActionCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [toast, setToast]             = useState(null);
  const [filter, setFilter]           = useState('All');
  const [upgraded, setUpgraded]       = useState(false);
  const [hoveredRow, setHoveredRow]   = useState(null);
  const [accountFilter, setAccountFilter] = useState('all');
  const [pendingRows, setPendingRows] = useState(new Set()); // rows mid-unsubscribe

  useEffect(() => setRows(subscriptions), [subscriptions]);

  const showToast = (sender, action, detail) => {
    setToast({ sender, action, detail });
    setTimeout(() => setToast(null), 3000);
  };

  const checkLimit = (needed = 1) => {
    if (!upgraded && actionCount + needed > FREE_LIMIT) { setShowPaywall(true); return false; }
    return true;
  };

  const removeRow = (id) => setRows(p => p.filter(s => s.id !== id));

  // Real unsubscribe — calls the backend which handles List-Unsubscribe
  const handleUnsubscribe = async (sub) => {
    if (!checkLimit()) return;
    setPendingRows(p => new Set([...p, sub.id]));
    try {
      const res  = await fetch('/api/unsubscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ grant_id: sub.grant_id, message_id: sub.latestMsgId, sender_email: sub.email }),
      });
      const data = await res.json();
      const detail = data.method === 'http'    ? 'via one-click link'
                   : data.method === 'mailto'  ? `email sent to ${data.to}`
                   : 'removed from list';
      showToast(sub.sender, 'unsubscribe', detail);
    } catch {
      showToast(sub.sender, 'unsubscribe', 'removed from list');
    } finally {
      setPendingRows(p => { const n = new Set(p); n.delete(sub.id); return n; });
      removeRow(sub.id);
      setActionCount(c => c + 1);
      setSelected(p => { const n = new Set(p); n.delete(sub.id); return n; });
    }
  };

  const handleKeep = (id, name) => {
    removeRow(id);
    setSelected(p => { const n = new Set(p); n.delete(id); return n; });
    showToast(name, 'keep');
  };

  const handleBlock = (id, name) => {
    if (!checkLimit()) return;
    removeRow(id); setActionCount(c => c + 1);
    setSelected(p => { const n = new Set(p); n.delete(id); return n; });
    showToast(name, 'block');
  };

  const handleBulkUnsubscribe = async () => {
    if (!checkLimit(selected.size)) return;
    const toProcess = rows.filter(s => selected.has(s.id));
    const count = toProcess.length;
    setPendingRows(new Set(toProcess.map(s => s.id)));
    // Fire all unsubscribes concurrently
    await Promise.allSettled(toProcess.map(sub =>
      fetch('/api/unsubscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ grant_id: sub.grant_id, message_id: sub.latestMsgId, sender_email: sub.email }),
      })
    ));
    setRows(p => p.filter(s => !selected.has(s.id)));
    setActionCount(c => c + count);
    setSelected(new Set());
    setPendingRows(new Set());
    showToast(`${count} senders`, 'unsubscribe', 'all processed');
  };

  const handleBulkBlock = () => {
    if (!checkLimit(selected.size)) return;
    const count = selected.size;
    setRows(p => p.filter(s => !selected.has(s.id)));
    setActionCount(c => c + count);
    setSelected(new Set());
    showToast(`${count} senders`, 'block');
  };

  const toggleSelect = id => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── Sorting ──
  const [sortKey, setSortKey]   = useState('totalEmails'); // default: most emails first
  const [sortDir, setSortDir]   = useState('desc');

  const FREQ_ORDER = { 'Daily': 5, '2x / week': 4, 'Weekly': 3, 'Monthly': 2, 'Occasional': 1 };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const categories = ['All', ...Array.from(new Set(rows.map(s => s.category)))];
  const filtered = rows
    .filter(s => filter === 'All' || s.category === filter)
    .filter(s => accountFilter === 'all' || s.grant_id === accountFilter)
    .slice()
    .sort((a, b) => {
      let av, bv;
      if (sortKey === 'sender')      { av = a.sender.toLowerCase();        bv = b.sender.toLowerCase(); }
      else if (sortKey === 'category')  { av = a.category;                    bv = b.category; }
      else if (sortKey === 'frequency') { av = FREQ_ORDER[a.frequency] || 0;  bv = FREQ_ORDER[b.frequency] || 0; }
      else                              { av = a.totalEmails;                  bv = b.totalEmails; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  const allSelected   = filtered.length > 0 && filtered.every(s => selected.has(s.id));
  const freeRemaining = Math.max(0, FREE_LIMIT - actionCount);

  return (
    <div className="page-main">
      {/* Account tabs — always show "All" even with one account */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        {[{ grant_id: 'all', email: 'All Inboxes', provider: null }, ...accounts].map(acc => (
          <button key={acc.grant_id} onClick={() => setAccountFilter(acc.grant_id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, border: '1px solid', borderColor: accountFilter === acc.grant_id ? 'var(--accent)' : 'var(--border)', background: accountFilter === acc.grant_id ? 'var(--accent)' : 'transparent', color: accountFilter === acc.grant_id ? '#fff' : 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            {acc.provider && (
              <div style={{ width: 14, height: 14, borderRadius: 4, background: providerColor(acc.provider), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 7, fontWeight: 800 }}>
                {providerLabel(acc.provider).charAt(0)}
              </div>
            )}
            {acc.email}
          </button>
        ))}
        <button onClick={onAddAccount}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>
          <Plus size={11} /> Add inbox
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Subscriptions found', value: rows.length,        icon: <Mail size={14} />,     color: '#43556F' },
          { label: 'Actions taken',       value: actionCount,         icon: <Trash2 size={14} />,   color: 'var(--red)' },
          { label: 'Emails saved / mo',   value: actionCount * 14,    icon: <Zap size={14} />,      color: 'var(--accent)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ color: stat.color, display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,30px)', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Free plan bar */}
      {!upgraded && (
        <div className="card" style={{ marginBottom: 16, padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Free plan · {freeRemaining} action{freeRemaining !== 1 ? 's' : ''} remaining</span>
            <button onClick={() => setShowPaywall(true)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Unlock all</button>
          </div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: (actionCount / FREE_LIMIT * 100) + '%', background: freeRemaining === 0 ? 'var(--red)' : 'var(--accent)', borderRadius: 4, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {/* Category filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid', borderColor: filter === cat ? 'var(--accent)' : 'var(--border)', background: filter === cat ? 'var(--accent)' : 'transparent', color: filter === cat ? '#fff' : 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 640 }}>
            {/* Header */}
            <div className="sub-table-header" style={{ display: 'grid', gridTemplateColumns: '36px 1fr 110px 90px 70px 230px', gap: 8, padding: '12px 18px', borderBottom: '1px solid var(--border)', background: 'rgba(16,24,43,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" checked={allSelected}
                  onChange={() => allSelected ? setSelected(new Set()) : setSelected(new Set(filtered.map(s => s.id)))}
                  style={{ cursor: 'pointer', accentColor: 'var(--accent)', width: 15, height: 15 }} />
              </div>
              {[
                { label: 'Sender',    key: 'sender'      },
                { label: 'Category',  key: 'category'    },
                { label: 'Frequency', key: 'frequency'   },
                { label: 'Emails',    key: 'totalEmails' },
                { label: 'Actions',   key: null          },
              ].map(({ label, key }) => (
                <div key={label}
                  onClick={() => key && handleSort(key)}
                  style={{ fontSize: 11, fontWeight: 700, color: key && sortKey === key ? 'var(--accent)' : 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: key ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 4, userSelect: 'none' }}>
                  {label}
                  {key && (
                    <span style={{ opacity: sortKey === key ? 1 : 0.3, fontSize: 10 }}>
                      {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '52px 24px', textAlign: 'center' }}>
                {rows.length === 0 ? (
                  <>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No subscriptions found</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Your inbox looks clean, or the scan hasn't run yet.</div>
                    <button onClick={onScan} disabled={scanning} style={{ padding: '8px 18px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Run a scan now
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>✨</div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>All clean in this category!</div>
                  </>
                )}
              </div>
            ) : filtered.map((sub, idx) => (
              <div key={sub.id}
                onMouseEnter={() => setHoveredRow(sub.id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{ display: 'grid', gridTemplateColumns: '36px 1fr 110px 90px 70px 230px', gap: 8, padding: '13px 18px', borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center', background: selected.has(sub.id) ? 'rgba(164,81,43,0.04)' : hoveredRow === sub.id ? 'rgba(16,24,43,0.018)' : 'transparent', transition: 'background 0.12s' }}>
                <input type="checkbox" checked={selected.has(sub.id)} onChange={() => toggleSelect(sub.id)}
                  style={{ cursor: 'pointer', accentColor: 'var(--accent)', width: 15, height: 15 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: sub.logoColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{sub.logoInitial}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.sender}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.email}</div>
                  </div>
                </div>
                <div><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: CATEGORY_STYLES[sub.category]?.bg, color: CATEGORY_STYLES[sub.category]?.text }}>{sub.category}</span></div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{sub.frequency}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: sub.totalEmails > 100 ? 'var(--red)' : 'var(--text-primary)' }}>
                  {sub.totalEmails}<span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 2 }}>total</span>
                </div>
                {/* Row actions */}
                <div className="sub-row-actions" style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => handleUnsubscribe(sub)} title="Unsubscribe"
                    disabled={pendingRows.has(sub.id)}
                    style={{ padding: '6px 10px', background: hoveredRow === sub.id ? 'rgba(169,71,64,0.12)' : 'rgba(169,71,64,0.07)', color: 'var(--red)', border: '1px solid rgba(169,71,64,0.20)', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: pendingRows.has(sub.id) ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', opacity: pendingRows.has(sub.id) ? 0.5 : 1 }}>
                    {pendingRows.has(sub.id) ? <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={12} />} Unsub
                  </button>
                  <button onClick={() => handleBlock(sub.id, sub.sender)} title="Block & Report Spam"
                    style={{ padding: '6px 10px', background: hoveredRow === sub.id ? 'rgba(180,83,9,0.12)' : 'rgba(180,83,9,0.07)', color: '#b45309', border: '1px solid rgba(180,83,9,0.20)', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                    <ShieldBan size={12} /> Block
                  </button>
                  <button onClick={() => handleKeep(sub.id, sub.sender)} title="Keep"
                    style={{ padding: '6px 8px', background: 'transparent', color: hoveredRow === sub.id ? 'var(--green)' : 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={12} /> Keep
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
        {rows.length} subscription{rows.length !== 1 ? 's' : ''} across {accounts.length} inbox{accounts.length !== 1 ? 'es' : ''}
        {totalScanned > 0 && <> · {totalScanned.toLocaleString()} emails scanned</>}
        {scanTs && <> · Last scan: {timeAgo(scanTs)}</>}
        {' · '}
        <button onClick={onScan} disabled={scanning} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', fontWeight: 600, padding: 0 }}>
          {scanning ? 'Scanning…' : 'Refresh scan'}
        </button>
      </p>

      {/* Floating bulk action bar */}
      {selected.size > 0 && (
        <BulkActionBar
          count={selected.size}
          onBulkUnsubscribe={handleBulkUnsubscribe}
          onBulkBlock={handleBulkBlock}
          onClear={() => setSelected(new Set())}
        />
      )}

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onUpgrade={() => { setUpgraded(true); setShowPaywall(false); }} />}
      {toast && !selected.size && <Toast sender={toast.sender} action={toast.action} />}
    </div>
  );
}

// ─── OAuth callback hook ──────────────────────────────────────────────────────
function useOAuthCallback(onSuccess) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');
    if (!code) return;
    window.history.replaceState({}, '', window.location.pathname);
    fetch('/api/auth/exchange', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code }),
    })
      .then(r => r.json())
      .then(data => { if (data.grant_id) onSuccess(data); })
      .catch(console.error);
  }, [onSuccess]);
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function InboxCleanerPage() {
  const [accounts, setAccounts]           = useState(loadAccounts);
  const [subscriptions, setSubscriptions] = useState(loadSubscriptions);
  const [scanTs, setScanTs]               = useState(loadScanTs);
  const [totalScanned, setTotalScanned]   = useState(0);
  const [scanning, setScanning]           = useState(false);
  const [connecting, setConnecting]       = useState(false);
  const [connectError, setConnectError]   = useState(null);
  const [userMenuOpen, setUserMenuOpen]   = useState(false);
  const [showSettings, setShowSettings]   = useState(false);

  const scanAccount = useCallback(async (grantId) => {
    try {
      const res  = await fetch(`/api/messages?grant_id=${grantId}`);
      const data = await res.json();
      if (data.subscriptions) {
        return {
          subs:         data.subscriptions.map((s, i) => ({ ...s, id: `${grantId}-${i}`, grant_id: grantId })),
          totalScanned: data.totalScanned || 0,
        };
      }
    } catch (err) { console.error(err); }
    return { subs: [], totalScanned: 0 };
  }, []);

  const handleNewGrant = useCallback(async (grantData) => {
    const newAccount = { grant_id: grantData.grant_id, email: grantData.email, provider: grantData.provider };
    setAccounts(prev => {
      if (prev.find(a => a.grant_id === newAccount.grant_id)) return prev;
      const updated = [...prev, newAccount];
      saveAccounts(updated);
      return updated;
    });
    setScanning(true);
    const { subs, totalScanned: ts } = await scanAccount(grantData.grant_id);
    setSubscriptions(prev => {
      const merged = [...prev.filter(s => s.grant_id !== grantData.grant_id), ...subs];
      saveSubscriptions(merged);
      return merged;
    });
    setTotalScanned(ts);
    setScanTs(Date.now());
    setScanning(false);
  }, [scanAccount]);

  useOAuthCallback(handleNewGrant);

  const handleScan = async () => {
    if (!accounts.length || scanning) return;
    setScanning(true);
    const results = await Promise.all(accounts.map(a => scanAccount(a.grant_id)));
    const all     = results.flatMap(r => r.subs);
    const scanned = results.reduce((n, r) => n + r.totalScanned, 0);
    setSubscriptions(all);
    saveSubscriptions(all);
    setTotalScanned(scanned);
    setScanTs(Date.now());
    setScanning(false);
  };

  const handleConnect = async () => {
    setConnecting(true); setConnectError(null);
    try {
      const res  = await fetch('/api/auth/url');
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setConnectError(data.error || 'Failed to get auth URL.'); setConnecting(false); }
    } catch { setConnectError('Could not reach the server.'); setConnecting(false); }
  };

  const handleRemoveAccount = (grant_id) => {
    setAccounts(prev => { const u = prev.filter(a => a.grant_id !== grant_id); saveAccounts(u); return u; });
    setSubscriptions(prev => prev.filter(s => s.grant_id !== grant_id));
  };

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const h = () => setUserMenuOpen(false);
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, [userMenuOpen]);

  const hasAccounts = accounts.length > 0;

  return (
    <div style={{ minHeight: '100svh', background: 'var(--bg)' }}>
      <TopNav
        accounts={accounts}
        onAddAccount={handleConnect}
        onRemoveAccount={handleRemoveAccount}
        onLogout={() => { setAccounts([]); setSubscriptions([]); saveAccounts([]); saveSubscriptions([]); setScanTs(null); setUserMenuOpen(false); }}
        onScan={handleScan}
        scanning={scanning}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={e => { if (e?.stopPropagation) e.stopPropagation(); setUserMenuOpen(v => !v); }}
        onOpenSettings={() => { setUserMenuOpen(false); setShowSettings(true); }}
      />

      {scanning && <ScanningState accounts={accounts} />}

      {!scanning && !hasAccounts && (
        <ConnectState onConnect={handleConnect} connecting={connecting} error={connectError} />
      )}

      {!scanning && hasAccounts && (
        <div className="page" style={{ paddingTop: 28 }}>
          <Dashboard
            accounts={accounts}
            subscriptions={subscriptions}
            scanTs={scanTs}
            totalScanned={totalScanned}
            onAddAccount={handleConnect}
            onScan={handleScan}
            scanning={scanning}
          />
        </div>
      )}

      {showSettings && (
        <SettingsModal
          accounts={accounts}
          onClose={() => setShowSettings(false)}
          onRemoveAccount={handleRemoveAccount}
          onAddAccount={() => { setShowSettings(false); handleConnect(); }}
        />
      )}
    </div>
  );
}
