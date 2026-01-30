import React from 'react';

type Props = {
  onSelect: (role: 'personal' | 'startup') => void;
};

export default function RoleModal({ onSelect }: Props) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3 style={{ marginTop: 0 }}>Welcome to FinanceOS</h3>
        <p style={{ color: 'var(--text-soft)', marginBottom: 12 }}>Are you using FinanceOS for personal finance or a startup?</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="mode-pill" onClick={() => onSelect('personal')} style={{ padding: '10px 16px' }}>
            Personal
          </button>
          <button className="mode-pill mode-active" onClick={() => onSelect('startup')} style={{ padding: '10px 16px' }}>
            Startup
          </button>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-soft)' }}>
          You can change this later in Settings.
        </div>
      </div>
    </div>
  );
}
