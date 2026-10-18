import React, { useState, useMemo } from 'react';

const SECTORS = [
  'All',
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

export default function NGODirectory({ ngos, onDirectRequest }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedCity, setSelectedCity] = useState('');
  const [activeModalNGO, setActiveModalNGO] = useState(null);

  // Extract unique cities
  const cities = useMemo(() => {
    const set = new Set();
    ngos.forEach(n => {
      if (n.city) set.add(n.city);
    });
    return Array.from(set).sort();
  }, [ngos]);

  // Filtered NGOs
  const filteredNGOs = useMemo(() => {
    return ngos.filter(ngo => {
      const matchesSearch =
        searchQuery === '' ||
        ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ngo.keywords && ngo.keywords.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSector =
        selectedSector === 'All' ||
        ngo.category.toLowerCase().includes(selectedSector.toLowerCase());

      const matchesCity =
        selectedCity === '' ||
        ngo.city.toLowerCase() === selectedCity.toLowerCase();

      return matchesSearch && matchesSector && matchesCity;
    });
  }, [ngos, searchQuery, selectedSector, selectedCity]);

  return (
    <div className="ngo-directory-container">
      <div className="section-header">
        <h2>Verified NGO Network Directory</h2>
        <p>
          Browse certified humanitarian organizations across sectors, locations, and relief specializations.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="directory-controls-bar">
        <div className="search-box-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="directory-search-input"
            placeholder="Search by organization name, mission keywords, or skills..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="city-filter-wrapper">
          <select
            className="city-filter-select"
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
          >
            <option value="">All Cities / Locations</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sector Filter Chips */}
      <div className="sector-chips-row">
        {SECTORS.map(sec => (
          <button
            key={sec}
            type="button"
            className={`sector-chip ${selectedSector === sec ? 'active' : ''}`}
            onClick={() => setSelectedSector(sec)}
          >
            {sec}
          </button>
        ))}
      </div>

      <div className="directory-results-meta">
        Showing <strong>{filteredNGOs.length}</strong> active NGOs
        {selectedSector !== 'All' && ` in ${selectedSector}`}
        {selectedCity && ` in ${selectedCity}`}
      </div>

      {/* NGOs Grid */}
      <div className="ngo-cards-grid">
        {filteredNGOs.map(ngo => (
          <div key={ngo.ngo_id || ngo._id} className="ngo-card">
            <div className="ngo-card-header">
              <div className="ngo-title-wrap">
                <h3 className="ngo-name">{ngo.name}</h3>
                <span className="verified-badge" title="Verified Humanitarian Organization">
                  ✓ Verified
                </span>
              </div>
              <span className="ngo-rating-pill">⭐ {ngo.rating || 4.8}</span>
            </div>

            <div className="ngo-badges-row">
              <span className="category-pill">{ngo.category}</span>
              <span className="location-pill">📍 {ngo.city}, {ngo.state}</span>
              {ngo.capacity && (
                <span className="capacity-pill">👥 {ngo.capacity.toLocaleString()} Capacity</span>
              )}
            </div>

            <p className="ngo-desc">{ngo.description}</p>

            <div className="urgency-support-tags">
              <span className="support-label">Urgency Handled:</span>
              {(ngo.urgency_levels_handled || ['High', 'Critical']).map((lvl, i) => (
                <span key={i} className={`urgency-micro-tag ${lvl.toLowerCase()}`}>
                  {lvl}
                </span>
              ))}
            </div>

            <div className="ngo-card-footer">
              <button
                type="button"
                className="btn-secondary card-btn"
                onClick={() => setActiveModalNGO(ngo)}
              >
                View Details
              </button>
              <button
                type="button"
                className="btn-primary card-btn"
                onClick={() => onDirectRequest(ngo)}
              >
                Direct Request
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* NGO Detail Modal */}
      {activeModalNGO && (
        <div className="modal-backdrop" onClick={() => setActiveModalNGO(null)}>
          <div className="modal-dialog-card" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setActiveModalNGO(null)}
            >
              ✕
            </button>

            <div className="modal-header">
              <h3>{activeModalNGO.name}</h3>
              <div className="modal-meta-row">
                <span className="verified-badge">✓ Certified NGO</span>
                <span className="category-pill">{activeModalNGO.category}</span>
                <span className="ngo-rating-pill">⭐ {activeModalNGO.rating}</span>
              </div>
            </div>

            <div className="modal-body">
              <p className="modal-description">{activeModalNGO.description}</p>

              <div className="modal-detail-grid">
                <div className="modal-detail-item">
                  <strong>Location:</strong>
                  <span>{activeModalNGO.city}, {activeModalNGO.state}</span>
                </div>
                <div className="modal-detail-item">
                  <strong>Emergency Capacity:</strong>
                  <span>{activeModalNGO.capacity?.toLocaleString() || '5,000'} Beneficiaries</span>
                </div>
                <div className="modal-detail-item">
                  <strong>Phone Contact:</strong>
                  <a href={`tel:${activeModalNGO.contact_phone}`} className="phone-link">
                    {activeModalNGO.contact_phone}
                  </a>
                </div>
                <div className="modal-detail-item">
                  <strong>Official Email:</strong>
                  <a href={`mailto:${activeModalNGO.contact_email}`} className="phone-link">
                    {activeModalNGO.contact_email}
                  </a>
                </div>
              </div>

              {activeModalNGO.subcategories && (
                <div className="modal-subcategories">
                  <strong>Key Focus Areas:</strong>
                  <div className="subcat-chips">
                    {(typeof activeModalNGO.subcategories === 'string'
                      ? activeModalNGO.subcategories.split(',')
                      : activeModalNGO.subcategories
                    ).map((sc, i) => (
                      <span key={i} className="subcat-chip">{sc.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {activeModalNGO.website && (
                <a
                  href={activeModalNGO.website}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  Visit Official Website ↗
                </a>
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  const target = activeModalNGO;
                  setActiveModalNGO(null);
                  onDirectRequest(target);
                }}
              >
                Send Aid Request Directly
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
