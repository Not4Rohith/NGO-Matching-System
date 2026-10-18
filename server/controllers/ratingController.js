const Rating = require('../models/Rating');
const NGO = require('../models/NGO');
const { isDBConnected } = require('../config/db');

const memoryRatings = [];

// @desc    Add review and rating for an NGO
// @route   POST /api/ratings
// @access  Public
exports.addRating = async (req, res) => {
  try {
    const { ngoId, ngoName, userName, rating, review, aidRequestId } = req.body;

    if (!ngoId || !userName || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: 'Please provide NGO ID, reviewer name, rating (1-5), and review text'
      });
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating score must be between 1 and 5'
      });
    }

    if (isDBConnected()) {
      const newRating = await Rating.create({
        ngoId,
        ngoName: ngoName || '',
        userName,
        rating: numericRating,
        review,
        aidRequest: aidRequestId || null,
        user: req.user ? req.user._id : null
      });

      // Update NGO's average rating in MongoDB
      try {
        const ratings = await Rating.find({ ngoId });
        const avg = ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length;
        await NGO.findOneAndUpdate(
          { $or: [{ _id: ngoId }, { name: ngoName }] },
          { rating: Math.round(avg * 10) / 10, ratingCount: ratings.length }
        );
      } catch (e) {
        // Continue even if NGO rating aggregation encounters mismatch
      }

      return res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: newRating
      });
    } else {
      const mockRating = {
        _id: 'rate_' + Date.now(),
        ngoId,
        ngoName: ngoName || '',
        userName,
        rating: numericRating,
        review,
        createdAt: new Date().toISOString()
      };
      memoryRatings.unshift(mockRating);

      return res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: mockRating
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting rating'
    });
  }
};

// @desc    Get all reviews for an NGO
// @route   GET /api/ratings/ngo/:ngoId
// @access  Public
exports.getNGORatings = async (req, res) => {
  try {
    const { ngoId } = req.params;

    if (isDBConnected()) {
      const ratings = await Rating.find({ ngoId }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: ratings.length,
        data: ratings
      });
    } else {
      const list = memoryRatings.filter(r => String(r.ngoId) === String(ngoId));
      return res.status(200).json({
        success: true,
        count: list.length,
        data: list
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching reviews'
    });
  }
};
