// backend/schemas/ApplicationSchema.js - UNIFIED VERSION

import mongoose from 'mongoose';
const { Schema } = mongoose;

const applicationSchema = new Schema({
  // The user applying (your code uses 'user', but 'applicant' is more clear)
  // Let's standardize on 'user' since that's what your league owner code uses
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // What they're applying to (League or Tournament)
  target: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType',
    index: true
  },
  
  // Dynamic reference - 'League' or 'Tournament'
  targetType: {
    type: String,
    required: true,
    enum: ['League', 'Tournament']
  },
  
  // Status of application
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'withdrawn'],
    default: 'pending',
    index: true
  },
  
  // When applied
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // When reviewed
  reviewedAt: {
    type: Date
  },
  
  // Who reviewed it
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Optional rejection reason
  rejectionReason: {
    type: String,
    maxlength: 500
  },
  
  // Optional application message from player
  message: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true  // This adds createdAt and updatedAt
});

// Compound indexes for common queries
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ target: 1, status: 1 });
applicationSchema.index({ target: 1, targetType: 1 });

// Prevent duplicate pending applications
applicationSchema.index(
  { user: 1, target: 1, targetType: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: 'pending' }
  }
);

export default mongoose.model('Application', applicationSchema);