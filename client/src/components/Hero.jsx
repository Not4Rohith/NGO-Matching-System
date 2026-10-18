import React from 'react';
import heroImg from '../assets/hero.png';
import reactLogo from '../assets/react.svg';
import viteLogo from '../assets/vite.svg';

export default function Hero({ onPostRequest, onExploreDirectory, stats }) {
  return (
    <section className="hero-section">
      <div className="hero-badge">
        <span className="pulse-dot"></span>
        AI-Powered Humanitarian Matcher & Emergency Relief
      </div>

      <div className="hero-graphics">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="Relief Network Illustration" />
          <img src={reactLogo} className="framework" alt="React 19" />
          <img src={viteLogo} className="vite" alt="Vite 8" />
        </div>
      </div>

      <h1 className="hero-title">
        Connecting Urgent Aid with Verified NGOs
      </h1>

      <p className="hero-description">
        ReliefHub bridges citizens in distress and specialized NGOs through intelligent
        NLP text parsing and multi-factor recommendation algorithms. Fast, transparent, and built for emergency response.
      </p>

      <div className="hero-cta-group">
        <button
          type="button"
          className="btn-primary cta-btn"
          onClick={onPostRequest}
        >
          📢 Post Emergency Aid Request
        </button>
        <button
          type="button"
          className="btn-secondary cta-btn"
          onClick={onExploreDirectory}
        >
          🏢 Explore 25+ Verified NGOs
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalNGOs || 25}+</div>
          <div className="stat-label">Verified Organizations</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalRequests || 48}+</div>
          <div className="stat-label">Aid Cases Processed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">98.4%</div>
          <div className="stat-label">NLP Match Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">&lt; 15m</div>
          <div className="stat-label">Avg Response Velocity</div>
        </div>
      </div>
    </section>
  );
}
