const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'NGO name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Primary category is required'],
      trim: true
    },
    subcategories: {
      type: [String],
      default: []
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    keywords: {
      type: [String],
      default: []
    },
    capacity: {
      type: Number,
      default: 1000
    },
    urgencyLevelsHandled: {
      type: [String],
      default: ['Low', 'Medium', 'High']
    },
    verified: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 1
    },
    contactPhone: {
      type: String,
      default: ''
    },
    contactEmail: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    activeCases: {
      type: Number,
      default: 0
    },
    resolvedCases: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Text index for search
ngoSchema.index({ name: 'text', description: 'text', keywords: 'text', category: 'text' });

module.exports = mongoose.model('NGO', ngoSchema);
