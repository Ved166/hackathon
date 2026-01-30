import React from 'react';

export default function PersonalDashboard() {
  return (
    <>
      <div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Personal Dashboard</div>
            <div className="card-tag">Money intelligence for individuals</div>
          </div>
          <div style={{ padding: 12 }}>Modules: Income vs Expenses, Budgets, Goals, Investments, AI insights.</div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div className="card card-subtle">
            <div className="card-header">
              <div className="card-title">Monthly Snapshot</div>
            </div>
            <div style={{ padding: 12 }}>Placeholder charts & quick actions.</div>
          </div>
        </div>
      </div>

      <div className="right-column">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Savings & Goals</div>
          </div>
          <div style={{ padding: 12 }}>Track progress toward goals and set targets.</div>
        </div>
      </div>
    </>
  );
}
