const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      default: null
    },
    ngoId: {
      type: String,
      required: [true, 'NGO reference ID is required']
    },
    ngoName: {
      type: String,
      default: ''
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userName: {
      type: String,
      required: [true, 'Reviewer name is required']
    },
    rating: {
      type: Number,
      required: [true, 'Rating score is required'],
      min: 1,
      max: 5
    },
    review: {
      type: String,
      required: [true, 'Please provide review comments']
    },
    aidRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AidRequest',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rating', ratingSchema);
