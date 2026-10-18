import React from 'react';

export default function Navbar({ activeTab, setActiveTab, theme, toggleTheme, user, onOpenAuth, onLogout }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '🌐' },
    { id: 'request-aid', label: 'Post Aid Request', icon: '📢', badge: 'AI Match' },
    { id: 'directory', label: 'NGO Directory', icon: '🏢' },
    { id: 'tracker', label: 'Request Tracker', icon: '📊' },
    { id: 'matcher-demo', label: 'AI Matcher Demo', icon: '🧠' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' }
  ];

  return (
    <header className="site-header">
      <div className="nav-container">
        <div className="brand" onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer' }}>
          <div className="brand-logo">🤝</div>
          <div className="brand-text">
            <span className="brand-title">ReliefHub</span>
            <span className="brand-subtitle">NGO Matching & Aid Network</span>
          </div>
        </div>

        <nav className="nav-links">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {user ? (
            <div className="user-profile-badge">
              <span className="user-avatar">👤</span>
              <span className="user-name">{user.name}</span>
              <button type="button" className="logout-btn" onClick={onLogout} title="Logout">
                ✕
              </button>
            </div>
          ) : (
            <button type="button" className="login-pill-btn" onClick={onOpenAuth}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
