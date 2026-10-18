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
    if (!userName.trim() || !reviewText.trim()) {
      alert('Please enter your name and review comments.');
      return;
    }

    const selectedNGO = ngos.find(n => String(n.ngo_id || n._id) === String(selectedNGOId)) || ngos[0];

    setSubmitting(true);
    try {
      await onAddRating({
        ngoId: String(selectedNGOId),
        ngoName: selectedNGO?.name || 'Verified NGO',
        userName: userName.trim(),
        rating: ratingVal,
        review: reviewText.trim()
      });
      setShowForm(false);
      setUserName('');
      setReviewText('');
      setRatingVal(5);
    } catch (err) {
      alert('Error submitting feedback: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-container">
      <div className="section-header-block">
        <h2>Community Reviews & Performance Ratings</h2>
        <p>Verified feedback and mission ratings from citizens, community coordinators, and partner organizations.</p>
      </div>

      <div className="ratings-header-bar">
        <div className="rating-summary-group">
          <div className="big-rating-score">4.9</div>
          <div>
            <div className="stars-gold-row">★★★★★</div>
            <div className="rating-count-subtitle">{ratings.length} Community Ratings Recorded</div>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary-green"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Submit a Review'}
        </button>
      </div>

      {showForm && (
        <form className="pro-review-form" onSubmit={handleSubmit}>
          <h3>Submit an NGO Evaluation Review</h3>

          <div className="form-columns-2">
            <div className="form-field">
              <label>Select Organization *</label>
              <select
                className="input-control select-control"
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

            <div className="form-field">
              <label>Your Name *</label>
              <input
                type="text"
                className="input-control"
                placeholder="Full name or organization"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label>Rating (1 to 5 Stars) *</label>
            <div className="star-selection-row">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star-select-btn ${ratingVal >= star ? 'active' : ''}`}
                  onClick={() => setRatingVal(star)}
                >
                  ★
                </button>
              ))}
              <span className="star-selection-label">{ratingVal} of 5 Stars</span>
            </div>
          </div>

          <div className="form-field">
            <label>Review & Feedback Details *</label>
            <textarea
              className="input-control textarea-control"
              rows="3"
              placeholder="Describe the speed of response, quality of supplies, or assistance provided..."
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn-primary-green"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Post Verified Review'}
          </button>
        </form>
      )}

      <div className="reviews-grid">
        {ratings.map(r => (
          <div key={r._id} className="pro-review-card">
            <div className="review-card-header-row">
              <div>
                <strong className="reviewer-name-text">{r.userName}</strong>
                <span className="reviewed-ngo-tag">for {r.ngoName || 'Verified NGO'}</span>
              </div>
              <span className="stars-gold-pill">★ {r.rating}.0</span>
            </div>
            <p className="review-comment-text">"{r.review}"</p>
            <div className="review-date-stamp">
              {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Verified Submission'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
