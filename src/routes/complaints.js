import express from 'express';
import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { 
  validateComplaintCreation, 
  validateComplaintUpdate, 
  validateObjectId, 
  validatePagination 
} from '../middleware/validation.js';
import { getMyComplaints, getAllComplaints } from '../controllers/complaints.js';

const router = express.Router();

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Public (with optional auth for personalized results)
router.get('/', optionalAuth, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { 
      status, 
      category, 
      priority, 
      isEmergency, 
      search, 
      department,
      assignedTo,
      submittedBy,
      latitude,
      longitude,
      radius
    } = req.query;
    
    // Build query
    const query = { visibility: 'public' };
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (isEmergency !== undefined) query.isEmergency = isEmergency === 'true';
    if (department) query.department = department;
    if (assignedTo) query.assignedTo = assignedTo;
    if (submittedBy) query.submittedBy = submittedBy;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    // Location-based search
    if (latitude && longitude) {
      const maxDistance = radius ? parseInt(radius) * 1000 : 10000; // Default 10km
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: maxDistance
        }
      };
    }

    // If user is authenticated, they can see their private complaints
    if (req.user) {
      query.$or = [
        { visibility: 'public' },
        { submittedBy: req.user._id, visibility: 'private' }
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('submittedBy', '_id') // Only populate the _id field
      .populate('assignedTo', 'name avatar')
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Ensure submittedBy is always a string (user id)
    const complaintsWithStringUser = complaints.map(c => {
      const obj = c.toObject();
      obj.submittedBy = typeof obj.submittedBy === 'object' && obj.submittedBy?._id
        ? obj.submittedBy._id.toString()
        : obj.submittedBy;
      return obj;
    });

    const total = await Complaint.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        complaints: complaintsWithStringUser,
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

// @desc    Get complaints submitted by the current user
// @route   GET /api/v1/complaints/my
// @access  Private
router.get('/my', protect, getMyComplaints);

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Public
router.get('/:id', optionalAuth, validateObjectId, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name avatar')
      .populate('assignedTo', 'name avatar')
      .populate('department', 'name code contactInfo')
      .populate('updates.createdBy', 'name avatar');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user can view private complaint
    if (complaint.visibility === 'private') {
      if (!req.user || (
        req.user._id.toString() !== complaint.submittedBy._id.toString() &&
        req.user.role !== 'admin' &&
        req.user._id.toString() !== complaint.assignedTo?._id.toString()
      )) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        complaint
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

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
router.post('/', protect, validateComplaintCreation, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      priority,
      location,
      isEmergency,
      attachments,
      visibility,
      tags
    } = req.body;

    console.log('📝 New complaint submission:', { title, category, user: req.user.email });
    // Find appropriate department
    const departments = await Department.findByService(category, location.zipCode);
    
    if (departments.length === 0) {
      console.log('❌ No department found for category:', category);
      return res.status(400).json({
        success: false,
        message: 'No department found to handle this type of complaint in your area'
      });
    }

    // Use the first matching department (could implement more sophisticated logic)
    const department = departments[0];

    // Create complaint
    const complaint = await Complaint.create({
      title,
      description,
      category,
      subcategory,
      priority: priority || 'medium',
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address,
        city: location.city,
        region: location.region,
        zipCode: location.zipCode,
        landmark: location.landmark
      },
      submittedBy: req.user._id,
      department: department._id,
      isEmergency: isEmergency || false,
      attachments: attachments || [],
      visibility: visibility || 'public',
      tags: tags || [],
      metadata: {
        source: 'web',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    console.log('✅ Complaint created successfully in MongoDB:', complaint._id);
    // Auto-assign if department has auto-assignment enabled
    if (department && department.settings && department.settings.autoAssignment) {
      const availableStaff = await department.getAvailableStaff();
      if (availableStaff.length > 0) {
        // Simple round-robin assignment (could implement more sophisticated logic)
        const assignedStaff = availableStaff[0];
        complaint.assignedTo = assignedStaff.user._id;
        complaint.status = 'under_review';
        await complaint.save();
        console.log('✅ Complaint auto-assigned to staff:', assignedStaff.user.name);
      }
    }

    // Populate the response
    await complaint.populate([
      { path: 'submittedBy', select: 'name avatar' },
      { path: 'assignedTo', select: 'name avatar' },
      { path: 'department', select: 'name code' }
    ]);

    console.log('✅ Complaint submission completed and saved to MongoDB');
    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        complaint
      }
    });
  } catch (error) {
    console.error('❌ Complaint creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
router.put('/:id', protect, validateObjectId, validateComplaintUpdate, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check permissions
    const canUpdate = 
      req.user.role === 'admin' ||
      req.user._id.toString() === complaint.submittedBy.toString() ||
      req.user._id.toString() === complaint.assignedTo?.toString();

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Citizens can only update certain fields
    let allowedFields = ['title', 'description', 'visibility', 'tags'];
    
    // Providers and admins can update more fields
    if (req.user.role === 'provider' || req.user.role === 'admin') {
      allowedFields.push('status', 'priority', 'assignedTo');
    }

    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // Add update entry if status is being changed
    if (updateData.status && updateData.status !== complaint.status) {
      const updateMessage = req.body.updateMessage || `Status changed to ${updateData.status}`;
      complaint.updates.push({
        message: updateMessage,
        type: 'status_change',
        createdBy: req.user._id
      });
    }

    Object.assign(complaint, updateData);
    await complaint.save();

    await complaint.populate([
      { path: 'submittedBy', select: 'name avatar' },
      { path: 'assignedTo', select: 'name avatar' },
      { path: 'department', select: 'name code' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: {
        complaint
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

// @desc    Add update to complaint
// @route   POST /api/complaints/:id/updates
// @access  Private
router.post('/:id/updates', protect, validateObjectId, async (req, res) => {
  try {
    const { message, type, attachments, isPublic } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update message is required'
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check permissions
    const canUpdate = 
      req.user.role === 'admin' ||
      req.user._id.toString() === complaint.submittedBy.toString() ||
      req.user._id.toString() === complaint.assignedTo?.toString();

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const update = {
      message: message.trim(),
      type: type || 'progress_update',
      createdBy: req.user._id,
      attachments: attachments || [],
      isPublic: isPublic !== false
    };

    complaint.updates.push(update);
    await complaint.save();

    await complaint.populate('updates.createdBy', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Update added successfully',
      data: {
        update: complaint.updates[complaint.updates.length - 1]
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

// @desc    Assign complaint to provider
// @route   PUT /api/complaints/:id/assign
// @access  Private (Admin/Department Head)
router.put('/:id/assign', protect, authorize('admin', 'provider'), validateObjectId, async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID is required'
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    const provider = await User.findById(assignedTo);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (!provider || provider.role !== 'provider') {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider'
      });
    }

    await complaint.assignTo(assignedTo, req.user._id);

    await complaint.populate([
      { path: 'submittedBy', select: 'name avatar' },
      { path: 'assignedTo', select: 'name avatar' },
      { path: 'department', select: 'name code' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully',
      data: {
        complaint
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

// @desc    Resolve complaint
// @route   PUT /api/complaints/:id/resolve
// @access  Private (Provider/Admin)
router.put('/:id/resolve', protect, authorize('provider', 'admin'), validateObjectId, async (req, res) => {
  try {
    const { description, attachments } = req.body;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Resolution description is required'
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user can resolve this complaint
    if (req.user.role !== 'admin' && req.user._id.toString() !== complaint.assignedTo?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const resolutionData = {
      description: description.trim(),
      attachments: attachments || []
    };

    await complaint.resolve(resolutionData, req.user._id);

    await complaint.populate([
      { path: 'submittedBy', select: 'name avatar' },
      { path: 'assignedTo', select: 'name avatar' },
      { path: 'department', select: 'name code' },
      { path: 'resolution.resolvedBy', select: 'name avatar' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Complaint resolved successfully',
      data: {
        complaint
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

// @desc    Submit feedback for resolved complaint
// @route   PUT /api/complaints/:id/feedback
// @access  Private (Complaint owner only)
router.put('/:id/feedback', protect, validateObjectId, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Only complaint owner can submit feedback
    if (req.user._id.toString() !== complaint.submittedBy.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Complaint must be resolved to submit feedback
    if (complaint.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Complaint must be resolved before submitting feedback'
      });
    }

    complaint.feedback = {
      rating,
      comment: comment?.trim() || '',
      submittedAt: new Date()
    };

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        feedback: complaint.feedback
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

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin or complaint owner)
router.delete('/:id', protect, validateObjectId, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Only admin or complaint owner can delete
    if (req.user.role !== 'admin' && req.user._id.toString() !== complaint.submittedBy.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete - archive instead of removing
    complaint.isArchived = true;
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint archived successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get all complaints without filters
// @route   GET /api/complaints/all
// @access  Private (Admin/Provider)
router.get('/all', protect, authorize('admin', 'provider'), getAllComplaints);

export default router;