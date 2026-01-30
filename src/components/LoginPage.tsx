import React, { useState } from 'react';

type Props = {
  onLogin: (identifier: string) => void;
};

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    onLogin(email);
  }

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-top">
          <div className="auth-logo" aria-hidden>
            <div className="brand-dot" />
          </div>
          <div className="auth-appname">FinanceOS</div>
        </div>

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-sub">Sign in to continue to your dashboard</p>

        <form className="auth-form" onSubmit={submit}>
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />

          <label className="auth-label">Password</label>
          <div className="auth-password-row">
            <input
              className="auth-input auth-input-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="auth-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="auth-actions">
            <a className="auth-forgot" href="#">Forgot password?</a>
            <button className="auth-primary" type="submit">Log in</button>
          </div>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <div className="auth-footer">
          <span>Don’t have an account?</span>
          <a className="auth-signup" href="#">Sign up</a>
        </div>
      </div>
    </div>
  );
}
