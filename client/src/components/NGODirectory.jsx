import React, { useState, useMemo } from 'react';

const SECTORS = [
  'All',
  'Disaster Relief',
  'Healthcare',
  'Hunger & Food',
  'Education',
  'Child Welfare',
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

  const cities = useMemo(() => {
    const set = new Set();
    ngos.forEach(n => {
      if (n.city) set.add(n.city);
    });
    return Array.from(set).sort();
  }, [ngos]);

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
    <div className="section-container">
      <div className="section-header-block">
        <h2>Verified NGO Directory</h2>
        <p>Explore certified humanitarian partner organizations across healthcare, disaster relief, education, and social welfare.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="directory-filter-row">
        <div className="search-input-wrap">
          <span className="search-icon-symbol">🔍</span>
          <input
            type="text"
            className="search-input-field"
            placeholder="Search by NGO name, keywords, or focus areas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-action"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <select
          className="city-select-field"
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
        >
          <option value="">All Locations</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Sector Pill Tabs */}
      <div className="sector-pills-container">
        {SECTORS.map(sec => (
          <button
            key={sec}
            type="button"
            className={`sector-tab-pill ${selectedSector === sec ? 'active' : ''}`}
            onClick={() => setSelectedSector(sec)}
          >
            {sec}
          </button>
        ))}
      </div>

      <div className="results-count-text">
        Showing <strong>{filteredNGOs.length}</strong> verified organizations
        {selectedSector !== 'All' && ` in ${selectedSector}`}
        {selectedCity && ` in ${selectedCity}`}
      </div>

      {/* Cards Grid */}
      <div className="ngo-grid-layout">
        {filteredNGOs.map(ngo => (
          <div key={ngo.ngo_id || ngo._id} className="pro-ngo-card">
            <div className="pro-card-header">
              <div>
                <h3 className="pro-card-title">{ngo.name}</h3>
                <span className="verified-green-badge">✓ Verified</span>
              </div>
              <span className="rating-badge">★ {ngo.rating || 4.8}</span>
            </div>

            <div className="pro-card-tags">
              <span className="green-category-tag">{ngo.category}</span>
              <span className="neutral-location-tag">📍 {ngo.city}, {ngo.state}</span>
            </div>

            <p className="pro-card-description">{ngo.description}</p>

            <div className="pro-card-actions">
              <button
                type="button"
                className="btn-card-secondary"
                onClick={() => setActiveModalNGO(ngo)}
              >
                Details
              </button>
              <button
                type="button"
                className="btn-card-primary"
                onClick={() => onDirectRequest(ngo)}
              >
                Request Aid
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {activeModalNGO && (
        <div className="modal-backdrop-clean" onClick={() => setActiveModalNGO(null)}>
          <div className="modal-card-pro" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="modal-dismiss-btn"
              onClick={() => setActiveModalNGO(null)}
            >
              ✕
            </button>

            <div className="modal-top-section">
              <h3>{activeModalNGO.name}</h3>
              <div className="modal-badge-row">
                <span className="verified-green-badge">✓ Verified Organization</span>
                <span className="green-category-tag">{activeModalNGO.category}</span>
                <span className="rating-badge">★ {activeModalNGO.rating}</span>
              </div>
            </div>

            <div className="modal-content-section">
              <p className="modal-bio">{activeModalNGO.description}</p>

              <div className="modal-info-grid">
                <div className="info-grid-cell">
                  <strong>Location</strong>
                  <span>{activeModalNGO.city}, {activeModalNGO.state}</span>
                </div>
                <div className="info-grid-cell">
                  <strong>Capacity</strong>
                  <span>{activeModalNGO.capacity?.toLocaleString() || '5,000'} Beneficiaries</span>
                </div>
                <div className="info-grid-cell">
                  <strong>Contact Phone</strong>
                  <a href={`tel:${activeModalNGO.contact_phone}`} className="green-link">
                    {activeModalNGO.contact_phone || 'Available upon request'}
                  </a>
                </div>
                <div className="info-grid-cell">
                  <strong>Contact Email</strong>
                  <a href={`mailto:${activeModalNGO.contact_email}`} className="green-link">
                    {activeModalNGO.contact_email || 'info@relief.org'}
                  </a>
                </div>
              </div>
            </div>

            <div className="modal-actions-footer">
              {activeModalNGO.website && (
                <a
                  href={activeModalNGO.website}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-card-secondary"
                >
                  Visit Website ↗
                </a>
              )}
              <button
                type="button"
                className="btn-card-primary"
                onClick={() => {
                  const target = activeModalNGO;
                  setActiveModalNGO(null);
                  onDirectRequest(target);
                }}
              >
                Submit Request to this NGO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
