import React, { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('citizen');

  if (!isOpen) return null;

  const handleDemoLogin = (demoRole) => {
    let mockUser;
    if (demoRole === 'citizen') {
      mockUser = { id: 'usr_demo_1', name: 'Aarav Sharma', email: 'aarav@citizen.org', role: 'citizen' };
    } else if (demoRole === 'ngo') {
      mockUser = { id: 'usr_demo_2', name: 'Priya Deshmukh', email: 'priya@goonj.org', role: 'ngo', organizationName: 'Goonj Relief' };
    } else {
      mockUser = { id: 'usr_demo_3', name: 'Admin Coordinator', email: 'admin@reliefhub.org', role: 'admin' };
    }
    onLoginSuccess(mockUser);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    const user = {
      id: 'usr_' + Date.now(),
      name: name || email.split('@')[0],
      email,
      role
    };
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog-card auth-modal-card" onClick={e => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose}>✕</button>

        <div className="auth-modal-header">
          <div className="auth-icon">🔐</div>
          <h3>{isRegister ? 'Create ReliefHub Account' : 'Sign in to ReliefHub'}</h3>
          <p>Join the humanitarian aid matching network</p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="demo-login-strip">
          <span className="demo-strip-label">Fast Demo Logins:</span>
          <div className="demo-chips-grid">
            <button
              type="button"
              className="demo-chip-btn"
              onClick={() => handleDemoLogin('citizen')}
            >
              👤 Citizen User
            </button>
            <button
              type="button"
              className="demo-chip-btn"
              onClick={() => handleDemoLogin('ngo')}
            >
              🏢 NGO Coordinator
            </button>
            <button
              type="button"
              className="demo-chip-btn"
              onClick={() => handleDemoLogin('admin')}
            >
              🛡️ Platform Admin
            </button>
          </div>
        </div>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Rohan Vernekar"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address:</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Role:</label>
              <select
                className="form-select"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="citizen">Citizen / Aid Requester</option>
                <option value="ngo">NGO Representative</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary auth-submit-btn">
            {isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch-text">
          {isRegister ? (
            <>Already have an account? <span onClick={() => setIsRegister(false)}>Sign In</span></>
          ) : (
            <>Need an account? <span onClick={() => setIsRegister(true)}>Register</span></>
          )}
        </div>
      </div>
    </div>
  );
}
