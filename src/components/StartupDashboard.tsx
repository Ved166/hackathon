import React from 'react';

export default function StartupDashboard() {
  return (
    <>
      <div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Startup Dashboard</div>
            <div className="card-tag">Business survival & decision intelligence</div>
          </div>
          <div style={{ padding: 12 }}>Modules: Cash balance, Burn rate, Runway, Tasks, Compliance, AI alerts.</div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div className="card card-subtle">
            <div className="card-header">
              <div className="card-title">Runway Calculator</div>
            </div>
            <div style={{ padding: 12 }}>Quick runway insights and actions.</div>
          </div>
        </div>
      </div>

      <div className="right-column">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Top Tasks</div>
          </div>
          <div style={{ padding: 12 }}>Tasks due, compliance status, and critical alerts.</div>
        </div>
      </div>
    </>
  );
}
