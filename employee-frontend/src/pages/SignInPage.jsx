import { useState } from 'react';
import { Icons } from '../components/Icon';
import './HomePage.css';

export default function SignInPage({ onBack, onSignIn }) {
  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (method === 'email') {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
        return 'Enter a valid work email.';
      }
      if (password.length < 4) {
        return 'Password must be at least 4 characters.';
      }
      return null;
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      return 'Enter a valid phone number (10+ digits).';
    }
    if (!/^\d{6}$/.test(code.trim())) {
      return 'Enter the 6-digit verification code.';
    }
    return null;
  };

  const submit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      const identifier = method === 'email' ? email.trim() : phone.replace(/\D/g, '');
      onSignIn({ method, identifier });
      setLoading(false);
    }, 400);
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <button type="button" className="auth-back" onClick={onBack}>
          <Icons.chevronLeft size={16} /> Back to home
        </button>

        <div className="auth-card">
          <div className="auth-card-head">
            <div className="auth-role-icon">
              <Icons.users size={20} />
            </div>
            <div>
              <h1>Sign in</h1>
              <p>Access the employee directory and management tools.</p>
            </div>
          </div>

          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={method === 'email'}
              className={'auth-tab' + (method === 'email' ? ' active' : '')}
              onClick={() => { setMethod('email'); setError(''); }}
            >
              <Icons.mail size={15} /> Email
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={method === 'phone'}
              className={'auth-tab' + (method === 'phone' ? ' active' : '')}
              onClick={() => { setMethod('phone'); setError(''); }}
            >
              <Icons.phone size={15} /> Phone
            </button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {method === 'email' ? (
              <>
                <label className="auth-field">
                  <span>Work email</span>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@northwind.io"
                    autoComplete="email"
                    disabled={loading}
                  />
                </label>
                <label className="auth-field">
                  <span>Password</span>
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                </label>
              </>
            ) : (
              <>
                <label className="auth-field">
                  <span>Mobile number</span>
                  <input
                    className="input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    autoComplete="tel"
                    disabled={loading}
                  />
                </label>
                <label className="auth-field">
                  <span>Verification code</span>
                  <input
                    className="input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code"
                    disabled={loading}
                  />
                </label>
                <p className="auth-hint">Demo: use any 10-digit number and code <code>123456</code></p>
              </>
            )}

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button type="submit" className="btn primary auth-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-demo">
            Demo mode — use any valid email &amp; password (4+ chars), or phone + 6-digit code.
          </p>
        </div>
      </div>
    </div>
  );
}
