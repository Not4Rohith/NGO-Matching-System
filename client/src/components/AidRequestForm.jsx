import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const CATEGORIES = [
  'General Aid',
  'Disaster Relief',
  'Healthcare',
  'Hunger & Food',
  'Child Welfare',
  'Education',
  'Animal Welfare',
  'Women Empowerment',
  'Clean Water',
  'Mental Health',
  'Environment'
];

const URGENCIES = [
  { level: 'Low', color: '#10b981', desc: 'Planned supplies / Long-term aid' },
  { level: 'Medium', color: '#f59e0b', desc: 'Required within 48-72 hours' },
  { level: 'High', color: '#f97316', desc: 'Critical within 12-24 hours' },
  { level: 'Critical', color: '#ef4444', desc: 'Immediate life-saving emergency' }
];

export const PRESET_SCENARIOS = [
  {
    label: '🌊 Assam Floods',
    title: 'Severe Flood Relief & Clean Drinking Water',
    category: 'Disaster Relief',
    urgency: 'Critical',
    city: 'Guwahati',
    description: 'Over 120 families stranded due to sudden river overflow. Complete breakdown of clean water supply and food rations. Urgent rescue boats and dry food kits required.'
  },
  {
    label: '🩸 Medical Blood Need',
    title: 'Urgent O-Negative Blood Units for Surgery',
    category: 'Healthcare',
    urgency: 'Critical',
    city: 'Mumbai',
    description: 'Emergency trauma surgery at civic hospital for multi-vehicle crash victim. Need 3 units of O-negative blood and ambulance standby immediately.'
  },
  {
    label: '🐕 Street Animal Rescue',
    title: 'Injured Stray Dog Fractured Leg',
    category: 'Animal Welfare',
    urgency: 'High',
    city: 'New Delhi',
    description: 'Street puppy hit by speeding car near metro station with severe compound leg fracture and open wound. Needs rescue van and immediate vet surgery.'
  },
  {
    label: '🍲 Slum Food Support',
    title: 'Dry Rations & Meals for Daily Wage Laborers',
    category: 'Hunger & Food',
    urgency: 'Medium',
    city: 'Bengaluru',
    description: 'Community of 80 construction worker families out of work with little children facing severe malnutrition and empty kitchens. Needs rice, dal, and wheat bags.'
  }
];

export default function AidRequestForm({ onRequestSubmitted, onNavigateToTracker }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Disaster Relief',
    urgency: 'High',
    city: 'Chennai',
    requesterName: '',
    requesterPhone: '',
    requesterEmail: '',
    description: ''
  });

  const [liveMatches, setLiveMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  // Live preview matching when user inputs details
  useEffect(() => {
    if (!formData.description || formData.description.length < 8) {
      setLiveMatches([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingMatches(true);
      try {
        const matches = await api.getMatchPreview({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          city: formData.city,
          urgency: formData.urgency
        });
        setLiveMatches(matches.slice(0, 3));
      } catch (e) {
        // match preview failure handled
      } finally {
        setLoadingMatches(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description, formData.category, formData.city, formData.urgency]);

  const loadScenario = (s) => {
    setFormData(prev => ({
      ...prev,
      title: s.title,
      category: s.category,
      urgency: s.urgency,
      city: s.city,
      description: s.description
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.requesterName || !formData.requesterPhone) {
      alert('Please fill in all required fields (Title, Description, Name, Phone, and City).');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createAidRequest(formData);
      setSubmittedRequest(created);
      onRequestSubmitted(created);
    } catch (err) {
      alert('Error submitting aid request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="aid-request-container">
      <div className="section-header">
        <h2>Post an Emergency Aid Request</h2>
        <p>
          Fill in the details below. Our NLP algorithm evaluates crisis severity, location, and keywords in real-time to match you with top verified NGOs.
        </p>
      </div>

      {submittedRequest ? (
        <div className="success-banner-card">
          <div className="success-icon">🎉</div>
          <h3>Aid Request Successfully Registered!</h3>
          <p>
            Case Reference: <code>{submittedRequest._id}</code> &bull; Status: <strong>{submittedRequest.status}</strong>
          </p>
          <p>
            Our ML model evaluated and matched <strong>{submittedRequest.matchedNGOs?.length || 0}</strong> certified NGOs for your case.
          </p>

          <div className="matched-ngo-preview-list">
            {submittedRequest.matchedNGOs?.map((ngo, idx) => (
              <div key={idx} className="matched-mini-card">
                <div className="match-score-badge">{ngo.matchScore}% Match</div>
                <h4>{ngo.name}</h4>
                <p>{ngo.category} &bull; {ngo.city}</p>
                {ngo.contactPhone && (
                  <a href={`tel:${ngo.contactPhone}`} className="phone-link">
                    📞 Call: {ngo.contactPhone}
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="action-buttons-row">
            <button
              type="button"
              className="btn-primary"
              onClick={onNavigateToTracker}
            >
              Track Request in Board
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSubmittedRequest(null);
                setFormData({
                  title: '',
                  category: 'Disaster Relief',
                  urgency: 'Medium',
                  city: '',
                  requesterName: '',
                  requesterPhone: '',
                  requesterEmail: '',
                  description: ''
                });
              }}
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <div className="form-layout-grid">
          {/* Main Form */}
          <form className="request-form-card" onSubmit={handleSubmit}>
            <div className="presets-bar">
              <span className="preset-label">Quick Scenario Fill:</span>
              {PRESET_SCENARIOS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="preset-chip"
                  onClick={() => loadScenario(s)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label htmlFor="req-title">Crisis Title *</label>
              <input
                id="req-title"
                type="text"
                className="form-input"
                placeholder="e.g., Flood relief kits needed for 50 stranded families"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="req-cat">Primary Sector *</label>
                <select
                  id="req-cat"
                  className="form-select"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="req-city">City / District *</label>
                <input
                  id="req-city"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Chennai, Mumbai, Delhi"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Urgency Level *</label>
              <div className="urgency-selector-grid">
                {URGENCIES.map(u => (
                  <button
                    key={u.level}
                    type="button"
                    className={`urgency-choice-btn ${formData.urgency === u.level ? 'selected' : ''}`}
                    style={{
                      borderColor: formData.urgency === u.level ? u.color : 'transparent',
                      background: formData.urgency === u.level ? `${u.color}15` : 'var(--code-bg)'
                    }}
                    onClick={() => setFormData({ ...formData, urgency: u.level })}
                  >
                    <span className="dot" style={{ backgroundColor: u.color }}></span>
                    <span className="urgency-title">{u.level}</span>
                    <span className="urgency-sub">{u.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="req-desc">Detailed Emergency Description & Resources Needed *</label>
              <textarea
                id="req-desc"
                className="form-textarea"
                rows="4"
                placeholder="Describe what happened, exact location, number of affected people, and specific aid required (food packets, medicines, blood, shelter, doctor)..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
              ></textarea>
              <span className="form-hint">
                💡 Tip: Mention specific supplies, quantity, and symptoms for higher NLP matching accuracy.
              </span>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="req-name">Requester Name *</label>
                <input
                  id="req-name"
                  type="text"
                  className="form-input"
                  placeholder="Your full name"
                  value={formData.requesterName}
                  onChange={e => setFormData({ ...formData, requesterName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="req-phone">Contact Phone *</label>
                <input
                  id="req-phone"
                  type="tel"
                  className="form-input"
                  placeholder="+91-9876543210"
                  value={formData.requesterPhone}
                  onChange={e => setFormData({ ...formData, requesterPhone: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Running ML Matching...' : '🚀 Submit Request & Notify Matched NGOs'}
            </button>
          </form>

          {/* Live Matcher Side Card */}
          <div className="live-matcher-sidecard">
            <div className="sidecard-header">
              <div className="sidecard-title">
                <span className="ai-icon">⚡</span>
                Live AI Matcher
              </div>
              {loadingMatches && <span className="calculating-badge">Scoring...</span>}
            </div>

            <p className="sidecard-desc">
              Real-time TF-IDF similarity & location-proximity recommendations as you type:
            </p>

            {liveMatches.length > 0 ? (
              <div className="live-matches-stream">
                {liveMatches.map((match, i) => (
                  <div key={i} className="stream-match-card">
                    <div className="stream-card-top">
                      <span className="match-rank">#{i + 1}</span>
                      <strong className="stream-ngo-name">{match.name}</strong>
                      <span className="stream-match-score">{match.match_score}%</span>
                    </div>

                    <div className="match-score-progress-bg">
                      <div
                        className="match-score-progress-bar"
                        style={{ width: `${Math.min(match.match_score, 100)}%` }}
                      ></div>
                    </div>

                    <div className="stream-details">
                      <span>🏷️ {match.category}</span>
                      <span>📍 {match.city}</span>
                      <span>⭐ {match.rating}</span>
                    </div>

                    {match.breakdown && (
                      <div className="stream-breakdown-tags">
                        <span>NLP Sim: {match.breakdown.text_similarity}%</span>
                        <span>Sector: {match.breakdown.category_match}%</span>
                        <span>Location: {match.breakdown.location_match}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-preview-prompt">
                <div className="empty-robot">🤖</div>
                <p>Type your emergency description above to see instant AI NGO recommendations and score breakdowns.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
