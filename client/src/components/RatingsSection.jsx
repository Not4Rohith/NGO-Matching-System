import React, { useState } from 'react';

export default function RatingsSection({ ratings, ngos, onAddRating }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedNGOId, setSelectedNGOId] = useState(ngos[0]?.ngo_id || '1');
  const [userName, setUserName] = useState('');
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName || !reviewText) {
      alert('Please enter your name and review.');
      return;
    }

    const selectedNGO = ngos.find(n => String(n.ngo_id || n._id) === String(selectedNGOId)) || ngos[0];

    setSubmitting(true);
    try {
      await onAddRating({
        ngoId: String(selectedNGOId),
        ngoName: selectedNGO?.name || 'Verified NGO',
        userName,
        rating: ratingVal,
        review: reviewText
      });
      setShowForm(false);
      setUserName('');
      setReviewText('');
      setRatingVal(5);
    } catch (err) {
      alert('Failed to submit review: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ratings-section-container">
      <div className="section-header">
        <h2>Community Ratings & Impact Reviews</h2>
        <p>
          Real stories and verified feedback from citizens and coordinators served by our partner NGOs.
        </p>
      </div>

      <div className="ratings-top-bar">
        <div className="summary-stars">
          <span className="big-rating-number">4.8</span>
          <div>
            <div className="stars-row">★★★★★</div>
            <span className="rating-count-label">Based on {ratings.length} community reviews</span>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Close Review Form' : '✍️ Write a Community Review'}
        </button>
      </div>

      {showForm && (
        <form className="write-review-card" onSubmit={handleSubmit}>
          <h3>Write a Feedback Review for an NGO</h3>

          <div className="form-row-2">
            <div className="form-group">
              <label>Select Organization:</label>
              <select
                className="form-select"
                value={selectedNGOId}
                onChange={e => setSelectedNGOId(e.target.value)}
              >
                {ngos.map(ngo => (
                  <option key={ngo.ngo_id || ngo._id} value={ngo.ngo_id || ngo._id}>
                    {ngo.name} ({ngo.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Your Name:</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Priya Patel"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Rating (1 to 5 Stars):</label>
            <div className="star-picker-row">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star-pick-btn ${ratingVal >= star ? 'active' : ''}`}
                  onClick={() => setRatingVal(star)}
                >
                  ★
                </button>
              ))}
              <span className="star-val-text">{ratingVal} / 5 Stars</span>
            </div>
          </div>

          <div className="form-group">
            <label>Your Feedback / Experience:</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Tell others how this NGO assisted you or your community during the emergency..."
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Submitting Review...' : 'Submit Feedback'}
          </button>
        </form>
      )}

      <div className="reviews-cards-grid">
        {ratings.map(r => (
          <div key={r._id} className="review-card">
            <div className="review-card-top">
              <div>
                <strong className="reviewer-name">{r.userName}</strong>
                <span className="reviewed-ngo-name">for {r.ngoName || 'Verified NGO'}</span>
              </div>
              <div className="review-stars-pill">
                {'★'.repeat(r.rating)}{'☆'.repeat(Math.max(0, 5 - r.rating))}
              </div>
            </div>
            <p className="review-body">"{r.review}"</p>
            <div className="review-date">
              {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Verified Review'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
