import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Trash2, Check, Zap, Lock, Plug, LogOut, ChevronDown,
  Plus, X, RefreshCw, ShieldBan, Settings, Bell, Moon, Sun,
  ScanLine, UserCircle, CreditCard, AlertTriangle, ChevronRight,
  Inbox, Sliders, ArrowRight, Shield, Clock, Eye, Star, Sparkles
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
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
const saveSubscriptions = s => { try { localStorage.setItem('ic_subs', JSON.stringify(s)); } catch {} };
const loadSubscriptions = ()  => { try { return JSON.parse(localStorage.getItem('ic_subs') || '[]'); } catch { return []; } };
const saveUnsubscribed  = s => { try { localStorage.setItem('ic_unsub_memory', JSON.stringify([...s])); } catch {} };
const loadUnsubscribed  = ()  => { try { return new Set(JSON.parse(localStorage.getItem('ic_unsub_memory') || '[]')); } catch { return new Set(); } };

function ls(key, def) { try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? def; } catch { return def; } }
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light')  { root.setAttribute('data-theme', 'light'); }
  else if (theme === 'dark') { root.setAttribute('data-theme', 'dark'); }
  else { root.removeAttribute('data-theme'); }
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({ accounts, onClose, onRemoveAccount, onAddAccount,
                         theme, onThemeChange, scanFreq, onScanFreqChange,
                         notifyEmail, onNotifyEmailChange, notifyBrowser, onNotifyBrowserChange,
                         onClearScanData }) {
  const [tab, setTab]         = useState('account');
  const [showDanger, setShowDanger] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Derive display user from first connected account
  const primaryAccount = accounts[0];
  const displayEmail   = primaryAccount?.email || '—';
  const displayInitial = displayEmail.charAt(0).toUpperCase();

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
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>{displayInitial}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{displayEmail}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{accounts.length} inbox{accounts.length !== 1 ? 'es' : ''} connected</div>
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
                      {!confirmClear ? (
                        <button onClick={() => setConfirmClear(true)} style={{ padding: '8px 14px', background: 'none', border: '1px solid rgba(169,71,64,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--red)', cursor: 'pointer', textAlign: 'left' }}>
                          Clear all scan data
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1 }}>Are you sure? This removes all scan results.</span>
                          <button onClick={() => { onClearScanData(); setConfirmClear(false); onClose(); }}
                            style={{ padding: '7px 12px', background: 'var(--red)', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>Yes, clear</button>
                          <button onClick={() => setConfirmClear(false)}
                            style={{ padding: '7px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
                        </div>
                      )}
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
                  <div key={acc.email} className="card" style={{ padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: providerColor(acc.provider), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800 }}>
                        {providerLabel(acc.provider).charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{acc.email}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{providerLabel(acc.provider)}</div>
                      </div>
                    </div>
                    <button onClick={() => onRemoveAccount(acc.email)} style={{ background: 'none', border: '1px solid rgba(169,71,64,0.25)', borderRadius: 7, padding: '5px 10px', fontSize: 12, color: 'var(--red)', cursor: 'pointer' }}>Disconnect</button>
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
                    ['30min', 'Every 30 minutes', 'Auto-scan while this tab is open'],
                    ['daily', 'Daily', 'Auto-scan every morning'],
                    ['weekly', 'Weekly', 'Auto-scan every Monday']].map(([val, label, desc]) => (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid', borderColor: scanFreq === val ? 'var(--accent)' : 'var(--border)', background: scanFreq === val ? 'rgba(164,81,43,0.05)' : 'transparent', cursor: 'pointer', marginBottom: 8 }}>
                      <input type="radio" checked={scanFreq === val} onChange={() => onScanFreqChange(val)} style={{ accentColor: 'var(--accent)' }} />
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
                  [notifyEmail, onNotifyEmailChange, 'Email digest', 'Weekly summary of blocked senders', Mail, null],
                  [notifyBrowser, onNotifyBrowserChange, 'Browser notifications', 'Alert when a new scan completes', Bell, 'browser'],
                ].map(([val, setter, label, desc, Icon, type]) => (
                  <div key={label} className="card" style={{ padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon size={16} color="var(--text-muted)" />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                        {type === 'browser' && Notification.permission === 'denied' && (
                          <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 2 }}>Blocked by browser — allow in site settings</div>
                        )}
                      </div>
                    </div>
                    <button onClick={async () => {
                      if (type === 'browser' && !val) {
                        const perm = await Notification.requestPermission();
                        if (perm !== 'granted') return;
                      }
                      setter(!val);
                    }}
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
                    <button key={val} onClick={() => onThemeChange(val)}
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
            <div key={acc.email} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 10px 4px 6px', fontSize: 12 }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: providerColor(acc.provider), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
                {providerLabel(acc.provider).charAt(0)}
              </div>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{acc.email}</span>
              <button onClick={() => onRemoveAccount(acc.email)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', lineHeight: 1 }}><X size={11} /></button>
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
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>{accounts[0]?.email?.charAt(0).toUpperCase() || '?'}</div>
            <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{accounts[0]?.email?.split('@')[0] || 'Account'}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{accounts.length} inbox{accounts.length !== 1 ? 'es' : ''}</div>
            </div>
            <ChevronDown size={12} color="var(--text-muted)" style={{ marginLeft: 2 }} />
          </button>

          {userMenuOpen && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 8, minWidth: 220, boxShadow: '0 8px 32px rgba(16,24,43,0.12)', zIndex: 50 }}>
              <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{accounts[0]?.email || 'No account'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{accounts.length} inbox{accounts.length !== 1 ? 'es' : ''} connected</div>
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
function LandingPage({ onConnect, connecting, error }) {
  return (
    <div style={{ minHeight: '100svh', background: 'var(--bg)' }}>
      {/* Sticky nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="logo">Inbox<span className="acc">Clean</span></div>
          <button onClick={onConnect} disabled={connecting}
            style={{ padding: '8px 18px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: connecting ? 'wait' : 'pointer' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 16px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(164,81,43,0.08)', border: '1px solid rgba(164,81,43,0.18)', borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
          <Sparkles size={13} color="var(--accent)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Stop the inbox clutter</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,6vw,56px)', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 16px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
          Unsubscribe from junk<br />in <span style={{ color: 'var(--accent)' }}>one click</span>
        </h1>
        <p style={{ fontSize: 'clamp(16px,2.5vw,20px)', color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.7 }}>
          InboxCleaner scans your email, finds every subscription and newsletter, and lets you unsubscribe from all of them — instantly.
        </p>

        {error && (
          <div style={{ background: 'rgba(169,71,64,0.08)', border: '1px solid rgba(169,71,64,0.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: 'var(--red)', maxWidth: 400, margin: '0 auto 20px' }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <button onClick={onConnect} disabled={connecting}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: connecting ? 'wait' : 'pointer', boxShadow: '0 6px 28px rgba(164,81,43,0.30)', opacity: connecting ? 0.75 : 1, transition: 'transform 0.15s', transform: 'translateY(0)' }}
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(1px)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <Mail size={17} /> {connecting ? 'Connecting...' : 'Connect your inbox — free'}
            <ArrowRight size={15} />
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Gmail, Outlook, Yahoo — 5 free unsubscribes, no credit card needed</p>

        {/* Mock UI preview */}
        <div style={{ maxWidth: 700, margin: '48px auto 0', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 12px 48px rgba(16,24,43,0.08)' }}>
          <div style={{ background: 'var(--bg-card)', padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>inbox-cleaner.vercel.app</span>
          </div>
          <div style={{ background: 'var(--bg)', padding: '20px 16px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['All', 'Marketing', 'Newsletter', 'Social'].map((c, i) => (
                <span key={c} style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 500, background: i === 0 ? 'var(--accent)' : 'transparent', color: i === 0 ? '#fff' : 'var(--text-muted)', border: `1px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'}` }}>{c}</span>
              ))}
            </div>
            {[
              { name: 'LinkedIn Updates', cat: 'Social', freq: 'Daily', count: 84, color: '#0A66C2' },
              { name: 'Amazon Deals', cat: 'Promotions', freq: 'Weekly', count: 32, color: '#FF9900' },
              { name: 'Morning Brew', cat: 'Newsletter', freq: 'Daily', count: 60, color: '#B45309' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 10, marginBottom: 6, border: '1px solid var(--border)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: row.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{row.name.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{row.freq} · {row.count} emails</div>
                </div>
                <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(169,65,64,0.10)', color: 'var(--red)' }}>Unsub</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '64px 16px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.5px' }}>How it works</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 40, maxWidth: 460, margin: '0 auto 40px' }}>Three steps. Under two minutes. Zero spam afterward.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { step: '1', icon: Plug, title: 'Connect', desc: 'Sign in with Gmail, Outlook, or Yahoo. We only read email headers — never message content.' },
              { step: '2', icon: ScanLine, title: 'Scan', desc: 'We analyze up to 2,000 emails to find every subscription and newsletter you receive.' },
              { step: '3', icon: Trash2, title: 'Clean', desc: 'Review the list, then unsubscribe from junk with one click — or wipe an entire category.' },
            ].map(s => (
              <div key={s.step} style={{ padding: '32px 20px', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>{s.step}</div>
                <s.icon size={24} color="var(--accent)" style={{ marginBottom: 14 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 40px', letterSpacing: '-0.5px', textAlign: 'center' }}>Why InboxCleaner?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { icon: Shield, title: 'Privacy-first', desc: 'We read email headers only — sender, date, subject. Never your message body. Tokens stay in your browser.' },
            { icon: Zap, title: 'Real unsubscribe', desc: 'Not just removing from a list — we send actual RFC 8058 one-click unsubscribes and mailto requests.' },
            { icon: Clock, title: '2-minute cleanup', desc: 'Connect, scan, and clean — average users remove 30+ subscriptions in their first session.' },
            { icon: Eye, title: 'Re-subscribe detection', desc: 'If a sender you unsubscribed from emails you again, we flag it so you can escalate or block.' },
            { icon: Star, title: 'Export & own your data', desc: 'Download your subscription list as CSV anytime. Your data, your control.' },
            { icon: RefreshCw, title: 'Multi-inbox support', desc: 'Connect Gmail, Outlook, Yahoo — scan them all from one dashboard.' },
          ].map(f => (
            <div key={f.title} className="card" style={{ padding: '20px 16px' }}>
              <f.icon size={20} color="var(--accent)" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>{f.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '64px 16px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.5px' }}>Simple pricing</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32 }}>Start free, upgrade when you need more.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {/* Free */}
            <div className="card" style={{ padding: '28px 20px', textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Free</div>
              <div style={{ fontSize: 'clamp(28px,4vw,36px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>$0</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>forever</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['5 unsubscribes per scan', 'All inbox providers', 'Search & filter', 'CSV export'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Check size={14} color="var(--green)" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={onConnect} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                Get started
              </button>
            </div>
            {/* Pro */}
            <div className="card" style={{ padding: '28px 20px', textAlign: 'left', border: '2px solid var(--accent)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, right: 16, background: 'var(--accent)', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Popular</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>Pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 'clamp(28px,4vw,36px)', fontWeight: 900, color: 'var(--text-primary)' }}>$10</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>one-time payment</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Unlimited unsubscribes', 'All inbox providers', 'Re-subscribe detection', 'Priority support', 'Auto-scan scheduling'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Check size={14} color="var(--green)" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={async () => {
                try {
                  const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                } catch {}
              }}
                style={{ width: '100%', padding: '10px', background: 'var(--accent)', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 16px rgba(164,81,43,0.25)' }}>
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px', textAlign: 'center' }}>
        <div className="logo" style={{ fontSize: 18, marginBottom: 8 }}>Inbox<span className="acc">Clean</span></div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Clean your inbox in minutes, not hours.</p>
      </footer>
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
          <div key={acc.email} className="card" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 40 }}>
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
        <button onClick={async () => {
          try {
            const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            const data = await res.json();
            if (data.url) { window.location.href = data.url; return; }
          } catch {}
          onUpgrade();
        }} style={{ width: '100%', padding: 14, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>Unlock for $10</button>
        <button onClick={onClose} style={{ width: '100%', padding: 12, background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: 14, cursor: 'pointer' }}>Maybe later</button>
      </div>
    </div>
  );
}

function Toast({ sender, action }) {
  const colors = { unsubscribe: '#f87171', keep: '#4ade80', block: '#fb923c' };
  const icons  = { unsubscribe: <Trash2 size={13} />, keep: <Check size={13} />, block: <ShieldBan size={13} /> };
  const labels = { unsubscribe: 'Unsubscribed from', keep: 'Keeping', block: 'Blocked' };
  return (
    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: 'var(--text-primary)', color: '#fff', padding: '11px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 100, whiteSpace: 'nowrap', boxShadow: '0 4px 24px rgba(16,24,43,0.24)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: colors[action] }}>{icons[action]}</span>
      {labels[action]} <strong>{sender}</strong>
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
function Dashboard({ accounts, subscriptions, onAddAccount, onScan, scanning }) {
  const [rows, setRows]               = useState(subscriptions);
  const [selected, setSelected]       = useState(new Set());
  const [actionCount, setActionCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [toast, setToast]             = useState(null);
  const [filter, setFilter]           = useState('All');
  const [upgraded, setUpgraded]       = useState(false);
  const [hoveredRow, setHoveredRow]   = useState(null);
  const [accountFilter, setAccountFilter] = useState('all');
  const [pendingRows, setPendingRows] = useState(new Set());
  const [search, setSearch]           = useState('');
  const [unsubMemory, setUnsubMemory] = useState(loadUnsubscribed);

  const showToast = (sender, action) => {
    setToast({ sender, action });
    setTimeout(() => setToast(null), 3000);
  };

  const checkLimit = (needed = 1) => {
    if (!upgraded && actionCount + needed > FREE_LIMIT) { setShowPaywall(true); return false; }
    return true;
  };

  const removeRow = (id) => setRows(p => p.filter(s => s.id !== id));

  const recordUnsub = (email) => {
    setUnsubMemory(prev => {
      const next = new Set(prev); next.add(email.toLowerCase()); saveUnsubscribed(next); return next;
    });
  };

  // Real unsubscribe — calls the backend which handles List-Unsubscribe
  const handleUnsubscribe = async (sub) => {
    if (!checkLimit()) return;
    setPendingRows(p => new Set([...p, sub.id]));
    try {
      const res  = await fetch('/api/gmail/unsubscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ access_token: accounts.find(a => a.email === sub.account_email)?.access_token, message_id: sub.latestMsgId, sender_email: sub.email }),
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
      recordUnsub(sub.email);
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

  const handleBulkUnsubscribe = () => {
    if (!checkLimit(selected.size)) return;
    const count = selected.size;
    setRows(p => p.filter(s => !selected.has(s.id)));
    setActionCount(c => c + count);
    setSelected(new Set());
    showToast(`${count} senders`, 'unsubscribe');
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

  const categories = ['All', ...Array.from(new Set(rows.map(s => s.category)))];
  const searchQ = search.trim().toLowerCase();
  const filtered = rows
    .filter(s => filter === 'All' || s.category === filter)
    .filter(s => accountFilter === 'all' || s.account_email === accountFilter)
    .filter(s => !searchQ || s.sender.toLowerCase().includes(searchQ) || s.email.toLowerCase().includes(searchQ))
    .map(s => ({ ...s, resubscribed: unsubMemory.has(s.email.toLowerCase()) }));
  const allSelected   = filtered.length > 0 && filtered.every(s => selected.has(s.id));
  const freeRemaining = Math.max(0, FREE_LIMIT - actionCount);

  return (
    <div className="page-main">
      {/* Account tabs — always show "All" even with one account */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        {[{ email: 'all', displayName: 'All Inboxes', provider: null }, ...accounts].map(acc => (
          <button key={acc.email} onClick={() => setAccountFilter(acc.email)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, border: '1px solid', borderColor: accountFilter === acc.email ? 'var(--accent)' : 'var(--border)', background: accountFilter === acc.email ? 'var(--accent)' : 'transparent', color: accountFilter === acc.email ? '#fff' : 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            {acc.provider && (
              <div style={{ width: 14, height: 14, borderRadius: 4, background: providerColor(acc.provider), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 7, fontWeight: 800 }}>
                {providerLabel(acc.provider).charAt(0)}
              </div>
            )}
            {acc.displayName || acc.email}
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

      {/* Search + Export row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="search"
            placeholder="Search sender or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
        <button onClick={() => {
          const header = 'Sender,Email,Category,Frequency,Emails\n';
          const csvRows = filtered.map(s => `"${s.sender}","${s.email}","${s.category}","${s.frequency}",${s.totalEmails}`).join('\n');
          const blob = new Blob([header + csvRows], { type: 'text/csv' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
          a.download = 'inbox-cleaner-subscriptions.csv'; a.click();
        }}
          title="Export to CSV"
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {categories.map(cat => {
          const catCount = cat === 'All' ? 0 : rows.filter(s => s.category === cat && (accountFilter === 'all' || s.account_email === accountFilter)).length;
          return (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <button onClick={() => setFilter(cat)}
                style={{ padding: '6px 14px', borderRadius: cat !== 'All' && filter === cat ? '20px 0 0 20px' : 20, border: '1px solid', borderRight: cat !== 'All' && filter === cat ? 'none' : undefined, borderColor: filter === cat ? 'var(--accent)' : 'var(--border)', background: filter === cat ? 'var(--accent)' : 'transparent', color: filter === cat ? '#fff' : 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                {cat}{cat !== 'All' && ` · ${catCount}`}
              </button>
              {cat !== 'All' && filter === cat && catCount > 0 && (
                <button onClick={() => {
                  if (!checkLimit(catCount)) return;
                  const ids = rows.filter(s => s.category === cat && (accountFilter === 'all' || s.account_email === accountFilter)).map(s => s.id);
                  setRows(p => p.filter(s => !ids.includes(s.id)));
                  setActionCount(c => c + ids.length);
                  setSelected(new Set());
                  showToast(`${ids.length} ${cat}`, 'unsubscribe');
                }}
                  title={`Unsubscribe all ${cat}`}
                  style={{ padding: '6px 10px', borderRadius: '0 20px 20px 0', border: '1px solid var(--accent)', borderLeft: 'none', background: 'rgba(164,81,43,0.15)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Unsub all
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 640 }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 110px 90px 70px 230px', gap: 8, padding: '12px 18px', borderBottom: '1px solid var(--border)', background: 'rgba(16,24,43,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" checked={allSelected}
                  onChange={() => allSelected ? setSelected(new Set()) : setSelected(new Set(filtered.map(s => s.id)))}
                  style={{ cursor: 'pointer', accentColor: 'var(--accent)', width: 15, height: 15 }} />
              </div>
              {['Sender', 'Category', 'Frequency', 'Emails', 'Actions'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '52px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>All clean here!</div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.sender}</div>
                      {sub.resubscribed && (
                        <span title="You previously unsubscribed from this sender" style={{ padding: '1px 6px', borderRadius: 8, fontSize: 9, fontWeight: 700, background: 'rgba(169,65,64,0.12)', color: 'var(--red)', whiteSpace: 'nowrap', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Re-subscribed</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.email}</div>
                  </div>
                </div>
                <div><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: CATEGORY_STYLES[sub.category]?.bg, color: CATEGORY_STYLES[sub.category]?.text }}>{sub.category}</span></div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{sub.frequency}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: sub.totalEmails > 100 ? 'var(--red)' : 'var(--text-primary)' }}>
                  {sub.totalEmails}<span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 2 }}>total</span>
                </div>
                {/* Row actions */}
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => handleUnsubscribe(sub)} title="Unsubscribe"
                    style={{ padding: '6px 10px', background: hoveredRow === sub.id ? 'rgba(169,71,64,0.12)' : 'rgba(169,71,64,0.07)', color: 'var(--red)', border: '1px solid rgba(169,71,64,0.20)', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                    <Trash2 size={12} /> Unsub
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

// ─── Token refresh ───────────────────────────────────────────────────────────
async function refreshAccessToken(account) {
  if (!account.refresh_token) return account.access_token;
  try {
    const res = await fetch('/api/auth/google-refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: account.refresh_token }),
    });
    const data = await res.json();
    if (data.access_token) return data.access_token;
  } catch {}
  return account.access_token;
}

// ─── OAuth callback hook ──────────────────────────────────────────────────────
function useOAuthCallback(onSuccess) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');
    if (!code) return;
    window.history.replaceState({}, '', window.location.pathname);
    fetch('/api/auth/google-exchange', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code }),
    })
      .then(r => r.json())
      .then(data => { if (data.access_token) onSuccess(data); })
      .catch(console.error);
  }, [onSuccess]);
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function InboxCleanerPage() {
  const [accounts, setAccounts]           = useState(loadAccounts);
  const [subscriptions, setSubscriptions] = useState(loadSubscriptions);
  const [scanning, setScanning]           = useState(false);
  const [connecting, setConnecting]       = useState(false);
  const [connectError, setConnectError]   = useState(null);
  const [userMenuOpen, setUserMenuOpen]   = useState(false);
  const [showSettings, setShowSettings]   = useState(false);

  // Persisted settings
  const [theme, setThemeState]           = useState(() => ls('ic_theme', 'system'));
  const [scanFreq, setScanFreqState]     = useState(() => ls('ic_scanfreq', 'manual'));
  const [notifyEmail, setNotifyEmailState]     = useState(() => ls('ic_notify_email', true));
  const [notifyBrowser, setNotifyBrowserState] = useState(() => ls('ic_notify_browser', false));

  // Apply theme on mount and on change
  useEffect(() => { applyTheme(theme); }, [theme]);

  // Handle Stripe success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded') === 'true') {
      lsSet('ic_upgraded', true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleThemeChange = (val) => { setThemeState(val); lsSet('ic_theme', val); applyTheme(val); };
  const handleScanFreqChange = (val) => { setScanFreqState(val); lsSet('ic_scanfreq', val); };
  const handleNotifyEmailChange = (val) => { setNotifyEmailState(val); lsSet('ic_notify_email', val); };
  const handleNotifyBrowserChange = (val) => { setNotifyBrowserState(val); lsSet('ic_notify_browser', val); };

  const scanAccount = useCallback(async (account) => {
    try {
      const token = await refreshAccessToken(account);
      if (token !== account.access_token) {
        setAccounts(prev => {
          const updated = prev.map(a => a.email === account.email ? { ...a, access_token: token } : a);
          saveAccounts(updated);
          return updated;
        });
      }
      const res  = await fetch(`/api/gmail/messages?access_token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      if (data.subscriptions) {
        return data.subscriptions.map((s, i) => ({ ...s, id: `${account.email}-${i}`, account_email: account.email }));
      }
    } catch (err) { console.error(err); }
    return [];
  }, []);

  const handleNewGrant = useCallback(async (grantData) => {
    const newAccount = { access_token: grantData.access_token, refresh_token: grantData.refresh_token, email: grantData.email, provider: grantData.provider || 'google' };
    setAccounts(prev => {
      const existing = prev.find(a => a.email === newAccount.email);
      const updated = existing
        ? prev.map(a => a.email === newAccount.email ? newAccount : a)
        : [...prev, newAccount];
      saveAccounts(updated);
      return updated;
    });
    setScanning(true);
    const subs = await scanAccount(newAccount);
    setSubscriptions(prev => {
      const merged = [...prev.filter(s => s.account_email !== grantData.email), ...subs];
      saveSubscriptions(merged);
      return merged;
    });
    setScanning(false);
  }, [scanAccount]);

  useOAuthCallback(handleNewGrant);

  const handleScan = async () => {
    if (!accounts.length || scanning) return;
    setScanning(true);
    const all = await Promise.all(accounts.map(a => scanAccount(a)));
    const subs = all.flat();
    setSubscriptions(subs);
    saveSubscriptions(subs);
    setScanning(false);
    localStorage.setItem('ic_last_scan', String(Date.now()));
    if (notifyBrowser && Notification.permission === 'granted') {
      new Notification('InboxCleaner scan complete', {
        body: `Found ${subs.length} subscription${subs.length !== 1 ? 's' : ''} across ${accounts.length} inbox${accounts.length !== 1 ? 'es' : ''}.`,
        icon: '/favicon.ico',
      });
    }
  };

  // Auto-scan on mount when accounts connected but no cached results
  useEffect(() => {
    if (accounts.length > 0 && subscriptions.length === 0) handleScan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic auto-sync while the tab is open, based on the Scan Frequency setting
  useEffect(() => {
    const FREQ_MS = { '30min': 30 * 60 * 1000, daily: 24 * 60 * 60 * 1000, weekly: 7 * 24 * 60 * 60 * 1000 };
    const intervalMs = FREQ_MS[scanFreq];
    if (!intervalMs || !accounts.length) return;

    const tick = () => {
      const last = Number(localStorage.getItem('ic_last_scan') || 0);
      if (Date.now() - last >= intervalMs) handleScan();
    };
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanFreq, accounts.length]);

  const handleConnect = async () => {
    setConnecting(true); setConnectError(null);
    try {
      const res  = await fetch('/api/auth/google-url');
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setConnectError(data.error || 'Failed to get auth URL.'); setConnecting(false); }
    } catch { setConnectError('Could not reach the server.'); setConnecting(false); }
  };

  const handleRemoveAccount = (accountEmail) => {
    setAccounts(prev => { const u = prev.filter(a => a.email !== accountEmail); saveAccounts(u); return u; });
    setSubscriptions(prev => {
      const u = prev.filter(s => s.account_email !== accountEmail);
      saveSubscriptions(u);
      return u;
    });
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
      {!scanning && !hasAccounts && (
        <LandingPage onConnect={handleConnect} connecting={connecting} error={connectError} />
      )}

      {(hasAccounts || scanning) && (
        <TopNav
          accounts={accounts}
          onAddAccount={handleConnect}
          onRemoveAccount={handleRemoveAccount}
          onLogout={() => { setAccounts([]); saveAccounts([]); setUserMenuOpen(false); }}
          onScan={handleScan}
          scanning={scanning}
          userMenuOpen={userMenuOpen}
          setUserMenuOpen={e => { if (e?.stopPropagation) e.stopPropagation(); setUserMenuOpen(v => !v); }}
          onOpenSettings={() => { setUserMenuOpen(false); setShowSettings(true); }}
        />
      )}

      {scanning && <ScanningState accounts={accounts} />}

      {!scanning && hasAccounts && (
        <div className="page" style={{ paddingTop: 28 }}>
          <Dashboard
            accounts={accounts}
            subscriptions={subscriptions}
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
          theme={theme}
          onThemeChange={handleThemeChange}
          scanFreq={scanFreq}
          onScanFreqChange={handleScanFreqChange}
          notifyEmail={notifyEmail}
          onNotifyEmailChange={handleNotifyEmailChange}
          notifyBrowser={notifyBrowser}
          onNotifyBrowserChange={handleNotifyBrowserChange}
          onClearScanData={() => { setSubscriptions([]); saveSubscriptions([]); }}
        />
      )}
    </div>
  );
}
