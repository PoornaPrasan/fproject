import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'document'],
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const updateSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  attachments: [attachmentSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['status_change', 'progress_update', 'message'],
    default: 'progress_update'
  },
  isInternal: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true,
    index: '2dsphere'
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  region: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  }
});

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a complaint title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a complaint description'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: [
      'electricity',
      'water',
      'roads',
      'sanitation',
      'street_lights',
      'drainage',
      'public_transport',
      'other'
    ]
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'in_progress', 'resolved', 'closed'],
    default: 'submitted'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  location: {
    type: locationSchema,
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  attachments: [attachmentSchema],
  updates: [updateSchema],
  resolvedAt: {
    type: Date,
    default: null
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [1000, 'Feedback cannot be more than 1000 characters']
  },
  estimatedResolutionTime: {
    type: Number, // in hours
    default: null
  },
  actualResolutionTime: {
    type: Number, // in hours
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ submittedBy: 1, createdAt: -1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ department: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ priority: 1, isEmergency: 1 });

// Virtual for complaint age in days
complaintSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for resolution time in hours
complaintSchema.virtual('resolutionTimeHours').get(function() {
  if (this.resolvedAt) {
    return Math.floor((this.resolvedAt - this.createdAt) / (1000 * 60 * 60));
  }
  return null;
});

// Pre-save middleware to calculate actual resolution time
complaintSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
    this.actualResolutionTime = Math.floor((this.resolvedAt - this.createdAt) / (1000 * 60 * 60));
  }
  next();
});

// Static method to get complaints by location radius
complaintSchema.statics.getComplaintsByRadius = function(lat, lng, radius) {
  return this.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius / 6378.1] // radius in kilometers
      }
    }
  });
};

// Static method to get analytics data
complaintSchema.statics.getAnalytics = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        totalComplaints: { $sum: 1 },
        resolvedComplaints: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        averageRating: { $avg: '$rating' },
        averageResolutionTime: { $avg: '$actualResolutionTime' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalComplaints: 0,
    resolvedComplaints: 0,
    averageRating: 0,
    averageResolutionTime: 0
  };
};

export default mongoose.model('Complaint', complaintSchema);