import mongoose from 'mongoose';

const scamDetectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  label: {
    type: String,
    required: true,
    enum: ['Scam', 'Not Scam', 'Uncertain'],
    index: true
  },
  reasoning: {
    type: String,
    required: true
  },
  intent: {
    type: String,
    required: true
  },
  risk_factors: [{
    type: String,
    trim: true
  }],
  confidence_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  metadata: {
    processing_time: Number,
    model_used: {
      type: String,
      default: 'gemini-3.6-flash'
    },
    strategy: {
      type: String,
      default: 'react'
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
scamDetectionSchema.index({ user: 1, createdAt: -1 });
scamDetectionSchema.index({ label: 1, createdAt: -1 });

const ScamDetection = mongoose.model('ScamDetection', scamDetectionSchema);

export default ScamDetection;