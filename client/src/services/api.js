import { INITIAL_NGOS, INITIAL_REQUESTS, INITIAL_RATINGS } from '../data/mockData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'
    : 'http://localhost:5000/api'
);

// Local storage keys
const STORAGE_REQUESTS = 'ngo_app_requests';
const STORAGE_RATINGS = 'ngo_app_ratings';
const STORAGE_USER = 'ngo_app_user';

// Initialize localStorage if empty
if (!localStorage.getItem(STORAGE_REQUESTS)) {
  localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(INITIAL_REQUESTS));
}
if (!localStorage.getItem(STORAGE_RATINGS)) {
  localStorage.setItem(STORAGE_RATINGS, JSON.stringify(INITIAL_RATINGS));
}

// Client-side NLP & Heuristic matcher fallback
export const clientSideMatch = (requestData, topK = 5) => {
  const ngos = INITIAL_NGOS;
  const text = `${requestData.title || ''} ${requestData.description || ''}`.toLowerCase();
  const reqCategory = (requestData.category || '').toLowerCase();
  const reqCity = (requestData.city || '').toLowerCase();
  const reqUrgency = requestData.urgency || 'Medium';

  const scored = ngos.map(ngo => {
    let textSim = 0;
    const ngoText = `${ngo.name} ${ngo.category} ${ngo.description} ${ngo.keywords}`.toLowerCase();
    const words = text.split(/\W+/).filter(w => w.length > 3);
    if (words.length > 0) {
      const hits = words.filter(w => ngoText.includes(w)).length;
      textSim = hits / words.length;
    }

    let catMatch = 0;
    if (reqCategory && reqCategory !== 'general aid') {
      if (ngo.category.toLowerCase().includes(reqCategory) || reqCategory.includes(ngo.category.toLowerCase())) {
        catMatch = 1.0;
      } else if (ngo.subcategories && ngo.subcategories.toLowerCase().includes(reqCategory)) {
        catMatch = 0.75;
      }
    } else {
      catMatch = 0.5;
    }

    let locMatch = 0.5;
    if (reqCity && ngo.city.toLowerCase().includes(reqCity)) {
      locMatch = 1.0;
    }

    const ratingFactor = (ngo.rating || 4.5) / 5.0;
    const handlesUrgency = (ngo.urgency_levels_handled || []).includes(reqUrgency);
    const urgencyBoost = handlesUrgency ? 1.15 : (reqUrgency === 'Critical' ? 0.85 : 1.0);

    const baseScore = (0.50 * textSim) + (0.25 * catMatch) + (0.15 * locMatch) + (0.10 * ratingFactor);
    const finalScore = Math.min(baseScore * urgencyBoost, 1.0);
    const confidencePct = Math.round(finalScore * 1000) / 10;

    return {
      ngo_id: ngo.ngo_id,
      name: ngo.name,
      category: ngo.category,
      city: ngo.city,
      state: ngo.state,
      rating: ngo.rating,
      contact_phone: ngo.contact_phone,
      contact_email: ngo.contact_email,
      website: ngo.website,
      description: ngo.description,
      match_score: confidencePct,
      breakdown: {
        text_similarity: Math.round(textSim * 100),
        category_match: Math.round(catMatch * 100),
        location_match: Math.round(locMatch * 100),
        urgency_handling: handlesUrgency
      }
    };
  });

  scored.sort((a, b) => b.match_score - a.match_score);
  return scored.slice(0, topK);
};

export const api = {
  // Fetch NGOs
  async getNGOs(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.city) params.append('city', filters.city);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`${API_BASE}/ngos?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch (e) {
      // Offline fallback
    }

    let list = [...INITIAL_NGOS];
    if (filters.category && filters.category !== 'All') {
      list = list.filter(n => n.category.toLowerCase().includes(filters.category.toLowerCase()));
    }
    if (filters.city) {
      list = list.filter(n => n.city.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(n =>
        n.name.toLowerCase().includes(s) ||
        n.description.toLowerCase().includes(s) ||
        n.category.toLowerCase().includes(s)
      );
    }
    return list;
  },

  // Submit new Aid Request
  async createAidRequest(requestData) {
    try {
      const res = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Offline fallback
    }

    const matches = clientSideMatch(requestData, 5);
    const newRequest = {
      _id: 'req_' + Date.now(),
      ...requestData,
      status: matches.length > 0 ? 'Matched' : 'Pending',
      matchedNGOs: matches.map(m => ({
        ngoId: String(m.ngo_id),
        name: m.name,
        category: m.category,
        city: m.city,
        contactPhone: m.contact_phone,
        contactEmail: m.contact_email,
        matchScore: m.match_score,
        breakdown: m.breakdown
      })),
      createdAt: new Date().toISOString()
    };

    const current = JSON.parse(localStorage.getItem(STORAGE_REQUESTS) || '[]');
    current.unshift(newRequest);
    localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(current));
    return newRequest;
  },

  // Get all Aid Requests
  async getAidRequests() {
    try {
      const res = await fetch(`${API_BASE}/requests`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      // Offline fallback
    }
    return JSON.parse(localStorage.getItem(STORAGE_REQUESTS) || '[]');
  },

  // Update Request status
  async updateRequestStatus(id, status, notes = '') {
    try {
      const res = await fetch(`${API_BASE}/requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolutionNotes: notes })
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Offline fallback
    }

    const current = JSON.parse(localStorage.getItem(STORAGE_REQUESTS) || '[]');
    const idx = current.findIndex(r => r._id === id);
    if (idx !== -1) {
      current[idx].status = status;
      if (status === 'Resolved') current[idx].resolvedAt = new Date().toISOString();
      if (notes) current[idx].resolutionNotes = notes;
      localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(current));
      return current[idx];
    }
    return null;
  },

  // Live Match Preview
  async getMatchPreview(data) {
    try {
      const res = await fetch(`${API_BASE}/requests/match-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Offline fallback
    }
    return clientSideMatch(data, 5);
  },

  // Submit Rating
  async submitRating(ratingData) {
    try {
      const res = await fetch(`${API_BASE}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Offline fallback
    }

    const newRating = {
      _id: 'rate_' + Date.now(),
      ...ratingData,
      createdAt: new Date().toISOString()
    };
    const current = JSON.parse(localStorage.getItem(STORAGE_RATINGS) || '[]');
    current.unshift(newRating);
    localStorage.setItem(STORAGE_RATINGS, JSON.stringify(current));
    return newRating;
  },

  // Get ratings for NGO or all
  async getRatings(ngoId = null) {
    try {
      if (ngoId) {
        const res = await fetch(`${API_BASE}/ratings/ngo/${ngoId}`);
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      }
    } catch (e) {
      // Offline fallback
    }
    const all = JSON.parse(localStorage.getItem(STORAGE_RATINGS) || '[]');
    if (ngoId) return all.filter(r => String(r.ngoId) === String(ngoId));
    return all;
  },

  // Local user authentication state
  getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_USER) || 'null');
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER);
    }
  }
};
