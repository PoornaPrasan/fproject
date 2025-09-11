import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Generate JWT token for a user
export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
}

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: false // Now optional for system reviews
  },
  type: {
    type: String,
    enum: ['complaint', 'system'],
    default: 'complaint'
  },
  title: {
    type: String,
    trim: true,
    required: true
  },
  content: {
    type: String,
    trim: true,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  category: {
    type: String,
    enum: ['electricity', 'water', 'roads', 'sanitation', 'street_lights', 'drainage', 'public_transport', 'other'],
    required: function() { return this.type === 'system'; },
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Review', reviewSchema); 