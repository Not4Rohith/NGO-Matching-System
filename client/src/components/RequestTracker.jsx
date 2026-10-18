import React, { useState } from 'react';

const STATUS_FILTERS = ['All', 'Matched', 'In Progress', 'Resolved', 'Pending'];

export default function RequestTracker({ requests, onUpdateStatus, onOpenReviewModal }) {
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = requests.filter(r => {
    if (filterStatus === 'All') return true;
    return r.status === filterStatus;
  });

  const getUrgencyClass = (urgency) => {
    switch ((urgency || '').toLowerCase()) {
      case 'critical': return 'urgency-badge critical';
      case 'high': return 'urgency-badge high';
      case 'medium': return 'urgency-badge medium';
      default: return 'urgency-badge low';
    }
  };

  const getStatusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'resolved': return 'status-pill resolved';
      case 'in progress': return 'status-pill in-progress';
      case 'matched': return 'status-pill matched';
      default: return 'status-pill pending';
    }
  };

  return (
    <div className="request-tracker-container">
      <div className="section-header">
        <h2>Live Aid Requests & Status Tracking</h2>
        <p>
          Monitor ongoing humanitarian missions, dispatched volunteers, and matched relief operations.
        </p>
      </div>

      <div className="status-tabs-row">
        {STATUS_FILTERS.map(st => (
          <button
            key={st}
            type="button"
            className={`status-tab-btn ${filterStatus === st ? 'active' : ''}`}
            onClick={() => setFilterStatus(st)}
          >
            {st}
            <span className="tab-count">
              {st === 'All' ? requests.length : requests.filter(r => r.status === st).length}
            </span>
          </button>
        ))}
      </div>

      <div className="requests-stream-list">
        {filtered.length === 0 ? (
          <div className="empty-tracker-state">
            <div className="empty-icon">📂</div>
            <h3>No requests found in this status</h3>
            <p>Select another status tab or submit a new aid request to view matching progress.</p>
          </div>
        ) : (
          filtered.map(req => (
            <div key={req._id} className="tracker-card">
              <div className="tracker-card-header">
                <div className="tracker-title-col">
                  <div className="tracker-meta-line">
                    <span className={getStatusClass(req.status)}>{req.status}</span>
                    <span className={getUrgencyClass(req.urgency)}>{req.urgency} Urgency</span>
                    <span className="category-micro-pill">{req.category}</span>
                    <span className="time-stamp">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <h3 className="tracker-title">{req.title}</h3>
                </div>

                <div className="tracker-status-controls">
                  {req.status === 'Matched' && (
                    <button
                      type="button"
                      className="btn-status-action btn-in-progress"
                      onClick={() => onUpdateStatus(req._id, 'In Progress')}
                    >
                      ▶ Mark In Progress
                    </button>
                  )}
                  {req.status === 'In Progress' && (
                    <button
                      type="button"
                      className="btn-status-action btn-resolve"
                      onClick={() => {
                        onUpdateStatus(req._id, 'Resolved');
                        if (req.matchedNGOs && req.matchedNGOs.length > 0) {
                          onOpenReviewModal(req.matchedNGOs[0], req._id);
                        }
                      }}
                    >
                      ✓ Mark Resolved & Rate
                    </button>
                  )}
                  {req.status === 'Resolved' && (
                    <button
                      type="button"
                      className="btn-status-action btn-review"
                      onClick={() => {
                        if (req.matchedNGOs && req.matchedNGOs.length > 0) {
                          onOpenReviewModal(req.matchedNGOs[0], req._id);
                        }
                      }}
                    >
                      ⭐ Write NGO Review
                    </button>
                  )}
                </div>
              </div>

              <p className="tracker-desc">{req.description}</p>

              <div className="tracker-contact-bar">
                <span>📍 <strong>Location:</strong> {req.city}{req.state ? `, ${req.state}` : ''}</span>
                <span>👤 <strong>Requester:</strong> {req.requesterName}</span>
                <span>📞 <strong>Contact:</strong> <a href={`tel:${req.requesterPhone}`}>{req.requesterPhone}</a></span>
              </div>

              {/* Matched NGOs Row */}
              <div className="tracker-matched-ngos-section">
                <div className="matched-header-label">
                  🤖 Matched Response Organizations ({req.matchedNGOs?.length || 0}):
                </div>
                <div className="matched-ngos-pills-row">
                  {req.matchedNGOs?.map((m, i) => (
                    <div key={i} className="tracker-ngo-pill">
                      <span className="pill-score">{m.matchScore}%</span>
                      <strong className="pill-name">{m.name}</strong>
                      <span className="pill-phone">📞 {m.contactPhone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
