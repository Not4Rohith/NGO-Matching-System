import React, { useState } from 'react';
import { api } from '../services/api';

const BENCHMARK_SAMPLES = [
  {
    name: '🌊 Assam Floods Emergency',
    query: {
      title: 'River breach flood disaster in lower Assam',
      description: 'Massive flooding displaced 300 villagers. Need rescue boats, tarpaulins, water filtration pumps, and dry rations.',
      category: 'Disaster Relief',
      city: 'Guwahati',
      urgency: 'Critical'
    }
  },
  {
    name: '🩸 ICU Emergency Blood Need',
    query: {
      title: 'Emergency blood transfusion for accident victim',
      description: 'Critical patient in emergency operation theatre needs O-negative blood units and ambulance transport.',
      category: 'Healthcare',
      city: 'Mumbai',
      urgency: 'Critical'
    }
  },
  {
    name: '🐕 Injured Street Puppy Rescue',
    query: {
      title: 'Stray dog hit by vehicle with broken leg',
      description: 'Street dog bleeding with compound bone fracture in Delhi, requires veterinary surgery and emergency shelter.',
      category: 'Animal Welfare',
      city: 'New Delhi',
      urgency: 'High'
    }
  },
  {
    name: '🍲 Starvation & Hunger Relief',
    query: {
      title: 'Hunger relief and cooked food for homeless families',
      description: 'Over 150 daily wage migrant workers without food or kitchen rations facing severe starvation.',
      category: 'Hunger & Food',
      city: 'Bengaluru',
      urgency: 'High'
    }
  },
  {
    name: '📚 Slum Child Literacy Camp',
    query: {
      title: 'Free primary education and school stationery',
      description: 'Need notebooks, storybooks, pencils, and volunteer teachers for 60 underprivileged children.',
      category: 'Education',
      city: 'Kolkata',
      urgency: 'Low'
    }
  }
];

export default function AIMatcherPlayground() {
  const [testQuery, setTestQuery] = useState(BENCHMARK_SAMPLES[0].query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ranEvaluation, setRanEvaluation] = useState(false);

  const runPrediction = async (query = testQuery) => {
    setLoading(true);
    setRanEvaluation(true);
    try {
      const matches = await api.getMatchPreview(query);
      setResults(matches);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectSample = (sample) => {
    setTestQuery(sample.query);
    runPrediction(sample.query);
  };

  return (
    <div className="playground-container">
      <div className="section-header">
        <h2>Interactive AI / NLP Matcher Playground</h2>
        <p>
          Inspect how our NLP text vectorizer, semantic intent parser, and multi-factor recommendation algorithm evaluate and rank humanitarian aid requests.
        </p>
      </div>

      <div className="sample-buttons-strip">
        <span className="strip-title">Try Benchmark Crisis Scenarios:</span>
        {BENCHMARK_SAMPLES.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            className="sample-scenario-btn"
            onClick={() => selectSample(sample)}
          >
            {sample.name}
          </button>
        ))}
      </div>

      <div className="playground-grid">
        {/* Input Panel */}
        <div className="playground-card input-panel">
          <div className="panel-title">1. Test Case Configuration</div>

          <div className="form-group">
            <label>Emergency Title:</label>
            <input
              type="text"
              className="form-input"
              value={testQuery.title}
              onChange={e => setTestQuery({ ...testQuery, title: e.target.value })}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Humanitarian Category:</label>
              <input
                type="text"
                className="form-input"
                value={testQuery.category}
                onChange={e => setTestQuery({ ...testQuery, category: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Location (City):</label>
              <input
                type="text"
                className="form-input"
                value={testQuery.city}
                onChange={e => setTestQuery({ ...testQuery, city: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Crisis Narrative / Details:</label>
            <textarea
              className="form-textarea"
              rows="4"
              value={testQuery.description}
              onChange={e => setTestQuery({ ...testQuery, description: e.target.value })}
            ></textarea>
          </div>

          <button
            type="button"
            className="btn-primary run-predict-btn"
            onClick={() => runPrediction()}
            disabled={loading}
          >
            {loading ? 'Evaluating NLP Vectors...' : '▶ Run Recommendation Model'}
          </button>

          <div className="model-architecture-box">
            <h4>Algorithm Scoring Architecture</h4>
            <code>
              Final Score = [ (0.50 × TF-IDF Sim) + (0.25 × Category Match) + (0.15 × Location Proximity) + (0.10 × Rating/5) ] × Urgency Boost
            </code>
          </div>
        </div>

        {/* Results Panel */}
        <div className="playground-card results-panel">
          <div className="panel-title">
            2. Recommendation Predictions & Math Breakdown
          </div>

          {!ranEvaluation ? (
            <div className="empty-results-box">
              <p>Click "Run Recommendation Model" or select a benchmark scenario above to generate ranked NGO recommendations.</p>
            </div>
          ) : loading ? (
            <div className="evaluating-state">
              <div className="spinner"></div>
              <p>Calculating sparse vector cosine similarities and ranking NGO knowledge base...</p>
            </div>
          ) : (
            <div className="results-stream">
              {results.map((ngo, idx) => (
                <div key={idx} className="eval-result-card">
                  <div className="eval-card-header">
                    <span className="eval-rank">#{idx + 1}</span>
                    <div className="eval-ngo-info">
                      <strong>{ngo.name}</strong>
                      <span className="eval-ngo-cat">🏷️ {ngo.category} &bull; 📍 {ngo.city}</span>
                    </div>
                    <div className="eval-score-bubble">
                      {ngo.match_score}%
                    </div>
                  </div>

                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${Math.min(ngo.match_score, 100)}%` }}
                    ></div>
                  </div>

                  {ngo.breakdown && (
                    <div className="eval-breakdown-grid">
                      <div className="breakdown-stat">
                        <span className="b-val">{ngo.breakdown.text_similarity}%</span>
                        <span className="b-lbl">NLP Cosine Sim</span>
                      </div>
                      <div className="breakdown-stat">
                        <span className="b-val">{ngo.breakdown.category_match}%</span>
                        <span className="b-lbl">Sector Match</span>
                      </div>
                      <div className="breakdown-stat">
                        <span className="b-val">{ngo.breakdown.location_match}%</span>
                        <span className="b-lbl">City Proximity</span>
                      </div>
                      <div className="breakdown-stat">
                        <span className="b-val">{ngo.breakdown.urgency_handling ? '✓ Yes' : '✕ No'}</span>
                        <span className="b-lbl">Urgency Fit</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
