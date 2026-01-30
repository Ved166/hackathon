import React from 'react';

type Props = {
  onChoose: (role: 'personal' | 'startup') => void;
};

export default function ModeSelection({ onChoose }: Props) {
  return (
    <div className="mode-select-root">
      <div className="mode-card">
        <h2>How do you want to use the app?</h2>
        <div className="mode-sub">Choose your financial workspace</div>

        <div className="mode-grid">
          <div className="mode-tile" onClick={() => onChoose('personal')}> 
            <div className="mode-icon">💼</div>
            <div className="mode-title">Personal Finance</div>
            <div className="mode-desc">Track income, expenses, budgets, goals, and investments</div>
            <button className="mode-cta">Continue</button>
          </div>

          <div className="mode-tile" onClick={() => onChoose('startup')}> 
            <div className="mode-icon">🚀</div>
            <div className="mode-title">Startup Finance</div>
            <div className="mode-desc">Manage cash flow, burn rate, runway, tasks, and compliance</div>
            <button className="mode-cta mode-cta-primary">Continue</button>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-soft)' }}>You can switch modes later from Settings.</div>
      </div>
    </div>
  );
}
