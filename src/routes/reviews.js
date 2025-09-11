import express from 'express';
import Review from '../models/Review.js';
import Complaint from '../models/Complaint.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validateReviewCreation, validateObjectId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
router.get('/', optionalAuth, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { 
      department, 
      category, 
      rating, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build query
    const query = {};
    
    if (department) query.department = department;
    if (category) query.category = category;
    if (rating) {
      if (rating.includes('-')) {
        const [min, max] = rating.split('-').map(Number);
        query.rating = { $gte: min, $lte: max };
      } else {
        query.rating = parseInt(rating);
      }
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .populate('complaint', 'title category')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('department', 'name code')
      .populate('complaint', 'title category')
      .populate('serviceProvider', 'name avatar')
      .populate('replies.user', 'name avatar');

    if (!review || review.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        review
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, validateReviewCreation, async (req, res) => {
  try {
    const {
      complaint: complaintId,
      title,
      content,
      rating,
      type = 'complaint',
      aspects,
      photos,
      isAnonymous,
      tags,
      category
    } = req.body;

    if (type === 'system') {
      // System-wide review: use title, content, rating, and category
      const review = await Review.create({
        user: req.user._id,
        type: 'system',
        title,
        content,
        rating,
        category
      });
      await review.populate([
        { path: 'user', select: 'name avatar' }
      ]);
      return res.status(201).json({
        success: true,
        message: 'System review created successfully',
        data: { review }
      });
    }

    console.log('📝 New review submission:', { complaintId, rating, user: req.user.email });
    // Check if complaint exists and is resolved
    const complaint = await Complaint.findById(complaintId)
      .populate('department');

    if (!complaint) {
      console.log('❌ Complaint not found for review:', complaintId);
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (complaint.status !== 'resolved') {
      console.log('❌ Complaint not resolved, cannot review:', complaintId);
      return res.status(400).json({
        success: false,
        message: 'Can only review resolved complaints'
      });
    }

    // Check if user owns the complaint
    if (complaint.submittedBy.toString() !== req.user._id.toString()) {
      console.log('❌ User does not own complaint:', req.user.email);
      return res.status(403).json({
        success: false,
        message: 'You can only review your own complaints'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      complaint: complaintId,
      user: req.user._id
    });

    if (existingReview) {
      console.log('❌ Review already exists for complaint:', complaintId);
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this complaint'
      });
    }

    // Create review
    const review = await Review.create({
      complaint: complaintId,
      user: req.user._id,
      department: complaint.department._id,
      serviceProvider: complaint.assignedTo,
      title,
      content,
      rating,
      aspects: aspects || {},
      photos: photos || [],
      category: complaint.category,
      location: {
        address: complaint.location.address,
        city: complaint.location.city,
        region: complaint.location.region,
        zipCode: complaint.location.zipCode
      },
      isAnonymous: isAnonymous || false,
      tags: tags || [],
      metadata: {
        source: 'web',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    console.log('✅ Review created successfully in MongoDB:', review._id);
    // Update complaint with review reference
    complaint.feedback = {
      rating,
      comment: content,
      submittedAt: new Date()
    };
    await complaint.save();

    console.log('✅ Complaint updated with feedback in MongoDB');
    // Populate the response
    await review.populate([
      { path: 'user', select: 'name avatar' },
      { path: 'department', select: 'name code' },
      { path: 'complaint', select: 'title category' },
      { path: 'serviceProvider', select: 'name avatar' }
    ]);

    console.log('✅ Review submission completed and saved to MongoDB');
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review
      }
    });
  } catch (error) {
    console.error('❌ Review creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Review owner only)
router.put('/:id', protect, validateObjectId, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const allowedFields = ['title', 'content', 'rating', 'aspects', 'photos', 'tags'];
    const updateData = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    Object.assign(review, updateData);
    await review.save();

    await review.populate([
      { path: 'user', select: 'name avatar' },
      { path: 'department', select: 'name code' },
      { path: 'complaint', select: 'title category' },
      { path: 'serviceProvider', select: 'name avatar' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Vote helpful on review
// @route   PUT /api/reviews/:id/helpful
// @access  Private
router.put('/:id/helpful', protect, validateObjectId, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.voteHelpful(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        helpfulVotes: review.helpfulVotes.count,
        notHelpfulVotes: review.notHelpfulVotes.count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Vote not helpful on review
// @route   PUT /api/reviews/:id/not-helpful
// @access  Private
router.put('/:id/not-helpful', protect, validateObjectId, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.voteNotHelpful(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        helpfulVotes: review.helpfulVotes.count,
        notHelpfulVotes: review.notHelpfulVotes.count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Add reply to review
// @route   POST /api/reviews/:id/replies
// @access  Private
router.post('/:id/replies', protect, validateObjectId, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Reply cannot exceed 500 characters'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const replyData = {
      user: req.user._id,
      content: content.trim(),
      isOfficial: req.user.role === 'provider' || req.user.role === 'admin'
    };

    await review.addReply(replyData);

    await review.populate('replies.user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: {
        reply: review.replies[review.replies.length - 1]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get reviews by department
// @route   GET /api/reviews/department/:departmentId
// @access  Public
router.get('/department/:departmentId', validateObjectId, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { sortBy, sortOrder, minRating, maxRating } = req.query;

    const options = {
      page,
      limit,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder === 'asc' ? 1 : -1,
      minRating: minRating ? parseInt(minRating) : undefined,
      maxRating: maxRating ? parseInt(maxRating) : undefined
    };

    const reviews = await Review.getByDepartment(req.params.departmentId, options);
    const total = await Review.countDocuments({ 
      department: req.params.departmentId, 
      status: 'approved' 
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get review statistics for department
// @route   GET /api/reviews/department/:departmentId/stats
// @access  Public
router.get('/department/:departmentId/stats', validateObjectId, async (req, res) => {
  try {
    const stats = await Review.getStatistics(req.params.departmentId);

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || {
          totalReviews: 0,
          averageRating: 0,
          ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner or Admin)
router.delete('/:id', protect, validateObjectId, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;