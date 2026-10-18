const NGO = require('../models/NGO');
const { isDBConnected } = require('../config/db');
const { loadCSVNGOs } = require('../services/mlService');

// @desc    Get all NGOs with optional filtering and search
// @route   GET /api/ngos
// @access  Public
exports.getAllNGOs = async (req, res) => {
  try {
    const { category, city, search, verified } = req.query;

    if (isDBConnected()) {
      let query = {};

      if (category && category !== 'All') {
        query.category = { $regex: new RegExp(category, 'i') };
      }

      if (city) {
        query.city = { $regex: new RegExp(city, 'i') };
      }

      if (verified !== undefined) {
        query.verified = verified === 'true';
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }

      let ngos = await NGO.find(query).sort({ rating: -1 });

      // If DB has no NGOs yet, seed from CSV
      if (ngos.length === 0 && !category && !city && !search) {
        const csvNGOs = loadCSVNGOs();
        const formatted = csvNGOs.map(n => ({
          name: n.name,
          category: n.category,
          subcategories: (n.subcategories || '').split(',').map(s => s.trim()),
          city: n.city,
          state: n.state,
          description: n.description,
          keywords: (n.keywords || '').split(' '),
          rating: n.rating,
          contactPhone: n.contact_phone,
          contactEmail: n.contact_email,
          website: n.website,
          urgencyLevelsHandled: n.urgency_levels_handled,
          verified: true
        }));
        await NGO.insertMany(formatted);
        ngos = await NGO.find(query).sort({ rating: -1 });
      }

      return res.status(200).json({
        success: true,
        count: ngos.length,
        data: ngos
      });
    } else {
      // Offline / CSV in-memory fallback
      let list = loadCSVNGOs();

      if (category && category !== 'All') {
        list = list.filter(n => n.category.toLowerCase().includes(category.toLowerCase()));
      }

      if (city) {
        list = list.filter(n => n.city.toLowerCase().includes(city.toLowerCase()));
      }

      if (search) {
        const s = search.toLowerCase();
        list = list.filter(n =>
          n.name.toLowerCase().includes(s) ||
          n.description.toLowerCase().includes(s) ||
          n.category.toLowerCase().includes(s)
        );
      }

      return res.status(200).json({
        success: true,
        count: list.length,
        data: list
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching NGOs'
    });
  }
};

// @desc    Get single NGO by ID
// @route   GET /api/ngos/:id
// @access  Public
exports.getNGOById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const ngo = await NGO.findById(id);
      if (!ngo) {
        return res.status(404).json({ success: false, message: 'NGO not found' });
      }
      return res.status(200).json({ success: true, data: ngo });
    } else {
      const list = loadCSVNGOs();
      const found = list.find(n => String(n.ngo_id) === String(id) || n.name.toLowerCase() === id.toLowerCase());
      if (!found) {
        return res.status(404).json({ success: false, message: 'NGO not found' });
      }
      return res.status(200).json({ success: true, data: found });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching NGO'
    });
  }
};

// @desc    Create new NGO profile
// @route   POST /api/ngos
// @access  Private
exports.createNGO = async (req, res) => {
  try {
    if (isDBConnected()) {
      const ngo = await NGO.create(req.body);
      return res.status(201).json({ success: true, data: ngo });
    } else {
      const newNGO = {
        ngo_id: Date.now(),
        ...req.body,
        verified: true,
        rating: 4.5
      };
      return res.status(201).json({ success: true, data: newNGO });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating NGO'
    });
  }
};

// @desc    Seed NGOs from CSV
// @route   POST /api/ngos/seed
// @access  Public
exports.seedNGOs = async (req, res) => {
  try {
    const list = loadCSVNGOs();
    if (isDBConnected()) {
      await NGO.deleteMany({});
      const formatted = list.map(n => ({
        name: n.name,
        category: n.category,
        subcategories: (n.subcategories || '').split(',').map(s => s.trim()),
        city: n.city,
        state: n.state,
        description: n.description,
        keywords: (n.keywords || '').split(' '),
        rating: n.rating,
        contactPhone: n.contact_phone,
        contactEmail: n.contact_email,
        website: n.website,
        urgencyLevelsHandled: n.urgency_levels_handled,
        verified: true
      }));
      await NGO.insertMany(formatted);
    }

    res.status(200).json({
      success: true,
      message: `Successfully seeded ${list.length} NGOs`,
      count: list.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to seed NGOs'
    });
  }
};
