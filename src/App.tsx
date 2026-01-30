import { useEffect, useState } from 'react';
import './App.css';
import './index.css';
import ModeSelection from './components/ModeSelection';
import PersonalDashboard from './components/PersonalDashboard';
import StartupDashboard from './components/StartupDashboard';

type Mode = 'unified' | 'personal' | 'startup';
type Theme = 'dark' | 'light';

type Snapshot = {
  balance: number;
  income: number;
  expense: number;
  startupCash: number;
  runwayDays?: number;
  activeAlerts?: number;
};

const SNAPSHOT_PRESETS: Record<Mode, { balance: number; income: number; expense: number; startupCash: number }> = {
  unified: { balance: 12450, income: 3200, expense: 3300, startupCash: 68200 },
  personal: { balance: 12450, income: 3200, expense: 5300, startupCash: 0 },
  startup: { balance: 68200, income: 15500, expense: 0, startupCash: 68200 },
};

function App() {
  const [mode, setMode] = useState<Mode>('unified');
  const [theme, setTheme] = useState<Theme>('dark');

  // live snapshot state
  const [snapshotData, setSnapshotData] = useState<Snapshot | null>(null);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const apiBase = (import.meta.env.VITE_API_BASE as string) ?? '/v1';


  useEffect(() => {
    const stored = window.localStorage.getItem('financeos-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // show mode selection AFTER login
    // keep a flag to auto-redirect if user previously chose default mode
    const saved = window.localStorage.getItem('financeos-default-mode');
    if (saved) {
      setMode(saved === 'startup' ? 'startup' : 'unified');
      setRoute(saved === 'startup' ? 'dashboard_startup' : 'dashboard_personal');
      setShowModeSelection(false);
    }
  }, []);

  const [route, setRoute] = useState<'dashboard' | 'budgets' | 'investments' | 'startup' | 'dashboard_personal' | 'dashboard_startup'>('dashboard');
  const [budgets, setBudgets] = useState<Array<any> | null>(null);
  const [investments, setInvestments] = useState<Array<any> | null>(null);
  const [startupInfo, setStartupInfo] = useState<any | null>(null);

  // login & role modal
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  // show mode selection on first visit if user hasn't chosen a default mode yet
  const [showModeSelection, setShowModeSelection] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem('financeos-default-mode');
      return !saved;
    } catch (err) {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('financeos-theme', theme);
  }, [theme]);

  // Fetch live snapshot from backend
  useEffect(() => {
    let mounted = true;
    async function loadSnapshot() {
      setLoadingSnapshot(true);
      try {
        const res = await fetch(`${apiBase}/dashboard/snapshot`);
        if (!res.ok) throw new Error(`Snapshot request failed: ${res.status}`);
        const json = await res.json();
        if (mounted) setSnapshotData(json as Snapshot);
      } catch (err) {
        console.error('Failed to load snapshot', err);
      } finally {
        if (mounted) setLoadingSnapshot(false);
      }
    }
    loadSnapshot();
    return () => {
      mounted = false;
    };
  }, [apiBase]);

  // Fetch budgets when route is budgets
  useEffect(() => {
    let mounted = true;
    async function loadBudgets() {
      if (route !== 'budgets') return;
      try {
        const res = await fetch(`${apiBase}/budgets`);
        if (!res.ok) throw new Error(`Budgets request failed: ${res.status}`);
        const json = await res.json();
        if (mounted) setBudgets(json);
      } catch (err) {
        console.error('Failed to load budgets', err);
      }
    }
    loadBudgets();
    return () => {
      mounted = false;
    };
  }, [apiBase, route]);

  // Fetch investments when route is investments
  useEffect(() => {
    let mounted = true;
    async function loadInvestments() {
      if (route !== 'investments') return;
      try {
        const res = await fetch(`${apiBase}/investments`);
        if (!res.ok) throw new Error(`Investments request failed: ${res.status}`);
        const json = await res.json();
        if (mounted) setInvestments(json);
      } catch (err) {
        console.error('Failed to load investments', err);
      }
    }
    loadInvestments();
    return () => {
      mounted = false;
    };
  }, [apiBase, route]);

  // Fetch startup info (runway + forecast) when route is startup
  useEffect(() => {
    let mounted = true;
    async function loadStartup() {
      if (route !== 'startup') return;
      try {
        const [runwayRes, forecastRes] = await Promise.all([
          fetch(`${apiBase}/runway`),
          fetch(`${apiBase}/cashflow/forecast`),
        ]);
        const runway = await runwayRes.json();
        const forecast = await forecastRes.json();
        if (mounted) setStartupInfo({ runway, forecast });
      } catch (err) {
        console.error('Failed to load startup info', err);
      }
    }
    loadStartup();
    return () => {
      mounted = false;
    };
  }, [apiBase, route]);

  // prefer live snapshot when available, otherwise fall back to presets per mode
  const mergedSnapshot: Snapshot = { ...SNAPSHOT_PRESETS[mode], ...(snapshotData ?? {}) };
  const snapshot = mergedSnapshot;
  const runwayDays = snapshotData?.runwayDays ?? (mode === 'startup' ? 150 : 60);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  async function handleModeChoose(role: 'personal' | 'startup') {
    setMode(role === 'startup' ? 'startup' : 'personal');
    setShowModeSelection(false);
    window.localStorage.setItem('financeos-default-mode', role);

    try {
      await fetch(`${apiBase}/users/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultMode: role }),
      });
    } catch (err) {
      console.error('Failed to save default mode to backend', err);
    }

    setRoute(role === 'startup' ? 'dashboard_startup' : 'dashboard_personal');
  }



  return (
    <div className="finance-root">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-pill">
            <span className="brand-dot" />
            <div>
              <div className="brand-text-main">FinanceOS</div>
              <div className="brand-text-sub">Unified Finance</div>
            </div>
          </div>
        </div>

        <div>
          <div className="sidebar-section-label">main</div>
          <nav className="sidebar-nav">
            <button className={`nav-item ${route === 'dashboard' ? 'nav-active' : ''}`} onClick={() => setRoute('dashboard')}>
              <span>
                <span className="nav-item-dot" />
                <span>Dashboard</span>
              </span>
              <span>⌘1</span>
            </button>
            <button className={`nav-item ${route === 'budgets' ? 'nav-active' : ''}`} onClick={() => setRoute('budgets')}>
              <span>
                <span className="nav-item-dot" />
                <span>Budgets</span>
              </span>
              <span>⌘2</span>
            </button>
            <button className={`nav-item ${route === 'investments' ? 'nav-active' : ''}`} onClick={() => setRoute('investments')}>
              <span>
                <span className="nav-item-dot" />
                <span>Investments</span>
              </span>
              <span>⌘3</span>
            </button>
            <button className={`nav-item ${route === 'startup' ? 'nav-active' : ''}`} onClick={() => setRoute('startup')}>
              <span>
                <span className="nav-item-dot" />
                <span>Startup Finance</span>
              </span>
              <span>⌘4</span>
            </button>
          </nav>
        </div>

        <div>
          <div className="sidebar-section-label">system</div>
          <nav className="sidebar-nav">
            <button className="nav-item">
              <span>
                <span className="nav-item-dot" />
                <span>Goals</span>
              </span>
            </button>
            <button className="nav-item">
              <span>
                <span className="nav-item-dot" />
                <span>Compliance</span>
              </span>
            </button>
            <button className="nav-item">
              <span>
                <span className="nav-item-dot" />
                <span>Settings</span>
              </span>
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div>AI Guardian active · Zero-trust</div>
          <div className="sidebar-footer-cta">
            <div style={{ fontSize: '0.78rem', marginBottom: 4 }}>Today&apos;s focus</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 500 }}>Keep runway above 3 months</div>
          </div>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div>
            <div className="mode-switcher">
              <button
                className={`mode-pill ${mode === 'unified' ? 'mode-active' : ''}`}
                onClick={() => setMode('unified')}
              >
                Unified
              </button>
              <button
                className={`mode-pill ${mode === 'personal' ? 'mode-active' : ''}`}
                onClick={() => setMode('personal')}
              >
                Personal
              </button>
              <button
                className={`mode-pill ${mode === 'startup' ? 'mode-active' : ''}`}
                onClick={() => setMode('startup')}
              >
                Startup
              </button>
            </div>
          </div>

          <div className="topbar-right">
            <div className="chip-neutral">Financial Health: Safe</div>
            <button
              className={`theme-toggle ${theme === 'dark' ? 'theme-toggle-dark' : ''}`}
              onClick={toggleTheme}
            >
              <span className="theme-toggle-knob" />
              <span>{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
            </button>
            <div className="user-badge">
              <div className="user-avatar" />
              <div>
                <div className="user-text-main">You</div>
                <div className="user-text-sub">FinanceOS Core</div>
              </div>
            </div>
          </div>
        </header>

        <div className="headline-row">
          <div>
            <div className="headline-title">
              {route === 'dashboard' ? 'Dashboard' : route === 'budgets' ? 'Budgets' : route === 'investments' ? 'Investments' : 'Startup Finance'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: 4 }}>
              {route === 'dashboard' ? 'Live snapshot · All accounts synced · Threat detection active' : ''}
            </div>
          </div>
          <div className="headline-status-pill">
            <span className="headline-status-dot" />
            <span>Real-time monitoring</span>
          </div>
        </div>

        {showModeSelection && <ModeSelection onChoose={handleModeChoose} />}

        <section className="grid-main">
          {route === 'dashboard' && (
            <>
              <div>
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Financial Snapshot</div>
                    <div className="card-tag">{loadingSnapshot ? 'Loading…' : 'Live · Last 24h'}</div>
                  </div>
                  <div className="snapshot-grid">
                    <div className="snapshot-tile">
                      <div className="snapshot-label">Balance</div>
                      <div className="snapshot-amount">₹{snapshot.balance.toLocaleString('en-IN')}</div>
                      <div className="snapshot-subtext">Includes savings, current and UPI wallets.</div>
                      <div className="snapshot-trend">+3.2% vs last month</div>
                    </div>
                    <div className="snapshot-tile">
                      <div className="snapshot-label">Income</div>
                      <div className="snapshot-amount">₹{snapshot.income.toLocaleString('en-IN')}</div>
                      <div className="snapshot-subtext">Committed inflows this month.</div>
                      <div className="snapshot-trend">On track</div>
                    </div>
                    <div className="snapshot-tile">
                      <div className="snapshot-label">Expense</div>
                      <div className="snapshot-amount">₹{snapshot.expense.toLocaleString('en-IN')}</div>
                      <div className="snapshot-subtext">Discretionary + fixed spends.</div>
                      <div className="snapshot-trend" style={{ color: 'var(--danger)' }}>72% of budget used</div>
                    </div>
                    <div className="snapshot-tile">
                      <div className="snapshot-label">Startup Cash</div>
                      <div className="snapshot-amount">₹{snapshot.startupCash.toLocaleString('en-IN')}</div>
                      <div className="snapshot-subtext">Operating runway: {runwayDays} days.</div>
                      <div className="snapshot-trend">Safe zone</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: 16, marginTop: 14 }}>
                  <div className="card card-subtle">
                    <div className="card-header">
                      <div className="card-title">Budget vs Spending</div>
                      <div className="card-tag">3 active alerts</div>
                    </div>
                    <div className="budget-list">
                      <div className="budget-row">
                        <div className="budget-main">
                          <div className="budget-label">Food & Dining</div>
                          <div className="budget-meta">₹9,025 / ₹12,000</div>
                          <div className="budget-bar-outer">
                            <div className="budget-bar-inner" style={{ width: '75%' }} />
                          </div>
                        </div>
                        <div className="budget-chip">75% used</div>
                      </div>
                      <div className="budget-row">
                        <div className="budget-main">
                          <div className="budget-label">Rent & EMI</div>
                          <div className="budget-meta">₹35,000 / ₹40,000</div>
                          <div className="budget-bar-outer">
                            <div className="budget-bar-inner" style={{ width: '88%' }} />
                          </div>
                        </div>
                        <div className="budget-chip" style={{ color: 'var(--warn)' }}>88% used</div>
                      </div>
                      <div className="budget-row">
                        <div className="budget-main">
                          <div className="budget-label">Startup Burn</div>
                          <div className="budget-meta">₹85,000 / ₹1,50,000</div>
                          <div className="budget-bar-outer">
                            <div className="budget-bar-inner" style={{ width: '56%' }} />
                          </div>
                        </div>
                        <div className="budget-chip">56% used</div>
                      </div>
                    </div>
                  </div>

                  <div className="card card-subtle">
                    <div className="card-header">
                      <div className="card-title">{mode === 'startup' ? 'Startup Income vs Expense' : 'Market Trends'}</div>
                      <div className="card-tag">Simulated · Visual only</div>
                    </div>
                    <div className="chart-placeholder">
                      <div className="chart-line" />
                      <div className="chart-path" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="right-column"> 
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">AI Risk & Alerts</div>
                    <div className="card-tag">FinanceOS Core</div>
                  </div>
                  <div className="pill-list">
                    <span className="pill">Budget breach watch · Food & Dining</span>
                    <span className="pill">EMI on 5th · Auto-detect</span>
                    <span className="pill">Runway guardrail: 90+ days</span>
                  </div>
                </div>

                <div className="card card-subtle">
                  <div className="card-header">
                    <div className="card-title">What FinanceOS is watching</div>
                    <div className="card-tag">Explainable AI</div>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <li style={{ marginBottom: 8 }}>• Budget breach probability in next 30 days based on your last 90 days of behaviour.</li>
                    <li style={{ marginBottom: 8 }}>• EMI contribution balance between partners and likelihood of future conflict.</li>
                    <li>• Liquidity risk if you commit to new high-ticket decisions this month (car, rent, team hires).</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {route === 'dashboard_personal' && (
            <PersonalDashboard />
          )}

          {route === 'dashboard_startup' && (
            <StartupDashboard />
          )}

          {route === 'budgets' && (
            <>
              <div>
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Budgets</div>
                    <div className="card-tag">{budgets === null ? 'Loading…' : `${budgets.length} budgets`}</div>
                  </div>
                  <div className="budget-list">
                    {budgets && budgets.length > 0 ? (
                      budgets.map((b) => {
                        const pct = Math.round((b.spent / b.allocated) * 100);
                        return (
                          <div className="budget-row" key={b.id}>
                            <div className="budget-main">
                              <div className="budget-label">{b.name}</div>
                              <div className="budget-meta">₹{b.spent.toLocaleString('en-IN')} / ₹{b.allocated.toLocaleString('en-IN')}</div>
                              <div className="budget-bar-outer">
                                <div className="budget-bar-inner" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <div className="budget-chip">{pct}% used</div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: 16, color: 'var(--text-soft)' }}>No budgets found.</div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div className="card">
                    <div className="card-header">
                      <div className="card-title">Create Budget (example)</div>
                    </div>
                    <div style={{ padding: 12 }}>
                      <em>Use POST /v1/budgets to create a budget (backend supports mock create).</em>
                    </div>
                  </div>
                </div>
              </div>

              <div className="right-column">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Budget Alerts</div>
                    <div className="card-tag">AI · Explainable</div>
                  </div>
                  <div style={{ padding: 12 }}>Watchlist: Food & Dining, Rent & EMI</div>
                </div>
              </div>
            </>
          )}

          {route === 'investments' && (
            <>
              <div>
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Investments</div>
                    <div className="card-tag">{investments === null ? 'Loading…' : `${investments.length} items`}</div>
                  </div>
                  <div style={{ padding: 12 }}>
                    {investments && investments.length > 0 ? (
                      investments.map((it) => (
                        <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8 }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{it.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>Value: ₹{it.value.toLocaleString('en-IN')}</div>
                          </div>
                          <div style={{ color: it.changePercent >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{it.changePercent}%</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: 'var(--text-soft)', padding: 12 }}>No investments found.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="right-column">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Portfolio Summary</div>
                  </div>
                  <div style={{ padding: 12 }}>Total invested: ₹{(investments || []).reduce((s, it) => s + (it?.value || 0), 0).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </>
          )}

          {route === 'startup' && (
            <>
              <div>
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Startup Overview</div>
                    <div className="card-tag">{startupInfo ? 'Live' : 'Loading…'}</div>
                  </div>
                  <div style={{ padding: 12 }}>
                    {startupInfo ? (
                      <div>
                        <div style={{ marginBottom: 8 }}>Runway: <strong>{startupInfo.runway.runwayDays} days</strong></div>
                        <div style={{ marginBottom: 8 }}>Next 90-day forecast: {startupInfo.forecast.horizonDays} days</div>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-soft)' }}>Loading startup data…</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="right-column">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Runway Guard</div>
                  </div>
                  <div style={{ padding: 12 }}>Keep runway above 90 days · Current: {snapshotData?.runwayDays ?? 'N/A'}</div>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
