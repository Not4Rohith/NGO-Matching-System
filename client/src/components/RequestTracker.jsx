import React, { useState } from 'react';

const STATUS_OPTIONS = ['All', 'Matched', 'In Progress', 'Resolved', 'Pending'];

export default function RequestTracker({ requests, onUpdateStatus, onOpenReviewModal }) {
  const [activeStatus, setActiveStatus] = useState('All');

  const filtered = requests.filter(r => {
    if (activeStatus === 'All') return true;
    return r.status === activeStatus;
  });

  const getUrgencyClass = (urgency) => {
    switch ((urgency || '').toLowerCase()) {
      case 'critical': return 'urgency-pill-critical';
      case 'high': return 'urgency-pill-high';
      case 'medium': return 'urgency-pill-medium';
      default: return 'urgency-pill-low';
    }
  };

  const getStatusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'resolved': return 'status-pill-resolved';
      case 'in progress': return 'status-pill-progress';
      case 'matched': return 'status-pill-matched';
      default: return 'status-pill-pending';
    }
  };

  return (
    <div className="section-container">
      <div className="section-header-block">
        <h2>Aid Request Tracking Board</h2>
        <p>Monitor the status of registered aid requests, verified NGO matches, and ongoing relief operations.</p>
      </div>

      <div className="tracker-filter-tabs">
        {STATUS_OPTIONS.map(st => (
          <button
            key={st}
            type="button"
            className={`tracker-tab ${activeStatus === st ? 'active' : ''}`}
            onClick={() => setActiveStatus(st)}
          >
            {st}
            <span className="tab-pill-count">
              {st === 'All' ? requests.length : requests.filter(r => r.status === st).length}
            </span>
          </button>
        ))}
      </div>

      <div className="tracker-list">
        {filtered.length === 0 ? (
          <div className="empty-tracker-message">
            <p>No aid requests currently found under the "{activeStatus}" status.</p>
          </div>
        ) : (
          filtered.map(req => (
            <div key={req._id} className="pro-tracker-card">
              <div className="tracker-card-top-row">
                <div className="tracker-card-badges">
                  <span className={`status-pill ${getStatusClass(req.status)}`}>{req.status}</span>
                  <span className={`urgency-pill ${getUrgencyClass(req.urgency)}`}>{req.urgency} Urgency</span>
                  <span className="category-tag-neutral">{req.category}</span>
                  <span className="tracker-date-text">
                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>

                <div className="tracker-action-buttons">
                  {req.status === 'Matched' && (
                    <button
                      type="button"
                      className="btn-action-status btn-status-start"
                      onClick={() => onUpdateStatus(req._id, 'In Progress')}
                    >
                      Start Operation
                    </button>
                  )}
                  {req.status === 'In Progress' && (
                    <button
                      type="button"
                      className="btn-action-status btn-status-resolve"
                      onClick={() => {
                        onUpdateStatus(req._id, 'Resolved');
                        if (req.matchedNGOs && req.matchedNGOs.length > 0) {
                          onOpenReviewModal(req.matchedNGOs[0], req._id);
                        }
                      }}
                    >
                      Mark Resolved
                    </button>
                  )}
                  {req.status === 'Resolved' && (
                    <button
                      type="button"
                      className="btn-action-status btn-status-review"
                      onClick={() => {
                        if (req.matchedNGOs && req.matchedNGOs.length > 0) {
                          onOpenReviewModal(req.matchedNGOs[0], req._id);
                        }
                      }}
                    >
                      Write Review
                    </button>
                  )}
                </div>
              </div>

              <h3 className="tracker-req-title">{req.title}</h3>
              <p className="tracker-req-desc">{req.description}</p>

              <div className="tracker-meta-details-bar">
                <span><strong>Location:</strong> {req.city}{req.state ? `, ${req.state}` : ''}</span>
                <span><strong>Contact:</strong> {req.requesterName}</span>
                <span><strong>Phone:</strong> <a href={`tel:${req.requesterPhone}`}>{req.requesterPhone}</a></span>
              </div>

              {req.matchedNGOs && req.matchedNGOs.length > 0 && (
                <div className="tracker-matched-section">
                  <span className="matched-label">Matched NGOs:</span>
                  <div className="matched-chips-wrap">
                    {req.matchedNGOs.map((m, idx) => (
                      <div key={idx} className="matched-ngo-chip">
                        <span className="chip-score">{m.matchScore}%</span>
                        <span className="chip-name">{m.name}</span>
                        {m.contactPhone && <span className="chip-phone">({m.contactPhone})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
