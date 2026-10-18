const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const CSV_PATH = path.join(__dirname, '..', '..', 'ml', 'dataset', 'ngos.csv');
const PREDICT_SCRIPT = path.join(__dirname, '..', '..', 'ml', 'src', 'predict.py');

// Parse CSV manually for fallback JS matcher
let cachedNGOs = null;
const loadCSVNGOs = () => {
  if (cachedNGOs) return cachedNGOs;
  if (!fs.existsSync(CSV_PATH)) return [];

  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(line => line.trim().length > 0);
  const headers = lines[0].split(',').map(h => h.trim());

  cachedNGOs = [];
  for (let i = 1; i < lines.length; i++) {
    // Basic CSV parser handling quoted commas
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const values = [];
    let match;
    while ((match = regex.exec(lines[i])) !== null) {
      if (match.index === regex.lastIndex) regex.lastIndex++;
      let val = match[1] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).replace(/""/g, '"');
      }
      values.push(val);
      if (regex.lastIndex >= lines[i].length) break;
    }

    if (values.length >= headers.length) {
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      cachedNGOs.push({
        ngo_id: parseInt(row.id || i),
        name: row.name,
        category: row.category,
        subcategories: row.subcategories,
        city: row.city,
        state: row.state,
        rating: parseFloat(row.rating || 4.5),
        contact_phone: row.contact_phone,
        contact_email: row.contact_email,
        website: row.website,
        description: row.description,
        keywords: row.keywords,
        urgency_levels_handled: (row.urgency_levels_handled || '').split(',').map(s => s.trim())
      });
    }
  }
  return cachedNGOs;
};

// Pure JavaScript fallback NLP matcher
const jsFallbackMatcher = (requestData, topK = 5) => {
  const ngos = loadCSVNGOs();
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
    if (reqCategory && (ngo.category.toLowerCase().includes(reqCategory) || reqCategory.includes(ngo.category.toLowerCase()))) {
      catMatch = 1.0;
    } else if (reqCategory && ngo.subcategories && ngo.subcategories.toLowerCase().includes(reqCategory)) {
      catMatch = 0.75;
    }

    let locMatch = 0.5;
    if (reqCity && ngo.city.toLowerCase().includes(reqCity)) {
      locMatch = 1.0;
    }

    const ratingFactor = (ngo.rating || 4.5) / 5.0;
    const handlesUrgency = ngo.urgency_levels_handled.includes(reqUrgency);
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

/**
 * Matches an aid request to candidate NGOs.
 * Runs Python ML predict script with automatic fallback to JS matcher.
 */
const matchAidRequest = async (requestData, topK = 5) => {
  return new Promise((resolve) => {
    const payload = JSON.stringify(requestData).replace(/"/g, '\\"');
    const command = `python "${PREDICT_SCRIPT}" "${payload}"`;

    exec(command, { timeout: 4000 }, (error, stdout) => {
      if (!error && stdout) {
        try {
          const parsed = JSON.parse(stdout.trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            return resolve(parsed.slice(0, topK));
          }
        } catch (e) {
          // parse failed, use fallback
        }
      }
      // Use fallback matching
      const fallbackResults = jsFallbackMatcher(requestData, topK);
      resolve(fallbackResults);
    });
  });
};

module.exports = { matchAidRequest, loadCSVNGOs };
