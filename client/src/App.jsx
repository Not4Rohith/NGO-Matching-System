import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AidRequestForm from './components/AidRequestForm';
import NGODirectory from './components/NGODirectory';
import RequestTracker from './components/RequestTracker';
import AIMatcherPlayground from './components/AIMatcherPlayground';
import RatingsSection from './components/RatingsSection';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { api } from './services/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ngo_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  const [user, setUser] = useState(() => api.getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [ngos, setNgos] = useState([]);
  const [requests, setRequests] = useState([]);
  const [ratings, setRatings] = useState([]);

  // Review modal state triggered upon resolving an aid request
  const [reviewModalTarget, setReviewModalTarget] = useState(null);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Sync theme to root DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ngo_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load initial dataset from backend API or local storage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ngosData, reqsData, ratingsData] = await Promise.all([
          api.getNGOs(),
          api.getAidRequests(),
          api.getRatings()
        ]);
        setNgos(ngosData);
        setRequests(reqsData);
        setRatings(ratingsData);
      } catch (err) {
        console.error('Data initialization error:', err);
      }
    };
    fetchData();
  }, []);

  const handleRequestSubmitted = (newRequest) => {
    setRequests(prev => [newRequest, ...prev]);
  };

  const handleUpdateStatus = async (id, status, notes = '') => {
    const updated = await api.updateRequestStatus(id, status, notes);
    if (updated) {
      setRequests(prev => prev.map(r => (r._id === id ? { ...r, ...updated } : r)));
    }
  };

  const handleAddRating = async (ratingData) => {
    const created = await api.submitRating(ratingData);
    setRatings(prev => [created, ...prev]);
  };

  const handleDirectRequest = (targetNGO) => {
    setActiveTab('request-aid');
  };

  const handleOpenReviewModal = (ngo, reqId) => {
    setReviewModalTarget({ ngo, reqId });
    setReviewScore(5);
    setReviewComment('');
  };

  const handleSaveResolutionReview = async () => {
    if (!reviewModalTarget) return;
    await handleAddRating({
      ngoId: String(reviewModalTarget.ngo.ngoId || reviewModalTarget.ngo.ngo_id || '1'),
      ngoName: reviewModalTarget.ngo.name,
      userName: user ? user.name : 'Verified Citizen',
      rating: reviewScore,
      review: reviewComment || 'Prompt response and effective assistance provided during our aid case.',
      aidRequestId: reviewModalTarget.reqId
    });
    setReviewModalTarget(null);
    alert('Thank you! Your feedback review has been registered.');
  };

  return (
    <>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          api.setCurrentUser(null);
          setUser(null);
        }}
      />

      <main className="main-content">
        {activeTab === 'overview' && (
          <>
            <Hero
              onPostRequest={() => setActiveTab('request-aid')}
              onExploreDirectory={() => setActiveTab('directory')}
              stats={{
                totalNGOs: ngos.length,
                totalRequests: requests.length
              }}
            />
            <div className="ticks"></div>
            <div style={{ marginTop: '32px' }}>
              <NGODirectory
                ngos={ngos.slice(0, 6)}
                onDirectRequest={handleDirectRequest}
              />
            </div>
          </>
        )}

        {activeTab === 'request-aid' && (
          <AidRequestForm
            onRequestSubmitted={handleRequestSubmitted}
            onNavigateToTracker={() => setActiveTab('tracker')}
          />
        )}

        {activeTab === 'directory' && (
          <NGODirectory
            ngos={ngos}
            onDirectRequest={handleDirectRequest}
          />
        )}

        {activeTab === 'tracker' && (
          <RequestTracker
            requests={requests}
            onUpdateStatus={handleUpdateStatus}
            onOpenReviewModal={handleOpenReviewModal}
          />
        )}

        {activeTab === 'matcher-demo' && (
          <AIMatcherPlayground />
        )}

        {activeTab === 'reviews' && (
          <RatingsSection
            ratings={ratings}
            ngos={ngos}
            onAddRating={handleAddRating}
          />
        )}
      </main>

      <Footer />

      {/* Review Modal for Resolved Requests */}
      {reviewModalTarget && (
        <div className="modal-backdrop" onClick={() => setReviewModalTarget(null)}>
          <div className="modal-dialog-card" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setReviewModalTarget(null)}
            >
              ✕
            </button>
            <div className="modal-header">
              <h3>Rate & Review {reviewModalTarget.ngo.name}</h3>
              <p>How was their assistance and turnaround time for your request?</p>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Rating (1 to 5 Stars):</label>
                <div className="star-picker-row">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-pick-btn ${reviewScore >= star ? 'active' : ''}`}
                      onClick={() => setReviewScore(star)}
                    >
                      ★
                    </button>
                  ))}
                  <span className="star-val-text">{reviewScore} / 5 Stars</span>
                </div>
              </div>

              <div className="form-group">
                <label>Review Feedback:</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Share details of how the relief materials or volunteers arrived..."
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setReviewModalTarget(null)}
              >
                Skip for now
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveResolutionReview}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedUser) => {
          api.setCurrentUser(loggedUser);
          setUser(loggedUser);
        }}
      />
    </>
  );
}

export default App;
