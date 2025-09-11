import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import User from '../models/User.js';

// @desc    Get all complaints
// @route   GET /api/v1/complaints
// @access  Public
export const getComplaints = async (req, res, next) => {
  try {
    console.log('GET /complaints request received');
    console.log('User role:', req.user?.role);
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers);

    // Validate MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. Current state:', mongoose.connection.readyState);
      return res.status(500).json({
        success: false,
        message: 'Database connection error'
      });
    }

    let query = {};

    // Build query based on filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.isEmergency) query.isEmergency = req.query.isEmergency === 'true';

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
    }

    // Location-based filter
    if (req.query.lat && req.query.lng && req.query.radius) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const radius = parseFloat(req.query.radius);

      query['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius / 6378.1] // radius in kilometers
        }
      };
    }

    // Handle department filter - if department name is provided, find department ID
    if (req.query.department) {
      try {
        console.log('Filtering by department:', req.query.department);

        // First try to match by department ID
        if (mongoose.Types.ObjectId.isValid(req.query.department)) {
          let department = await Department.findById(req.query.department);
          if (department) {
            console.log('Found department by ID:', department.name);
            query.department = department._id;
          } else {
            console.log('Department not found by ID');
          }
        } 

        // If not found by ID or ID was invalid, try to find by name
        if (!query.department) {
          const escapedDepartment = req.query.department.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const department = await Department.findOne({
            name: { $regex: new RegExp(`^${escapedDepartment}$`, 'i') }
          });

          if (department) {
            console.log('Found department by name:', department.name);
            query.department = department._id;
          } else {
            console.log('Department not found by name');
            // Return empty results rather than error
            query.department = null;
          }
        }
      } catch (error) {
        console.error('Error finding department:', error);
        return res.status(500).json({
          success: false,
          message: 'Error finding department',
          error: error.message
        });
      }
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    // Sort
    const sortBy = req.query.sort || '-createdAt';

    console.log('Final query:', JSON.stringify(query, null, 2));

    // Find complaints with the constructed query
    const complaints = await Complaint.find(query)
      .populate('department', 'name')
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit)
      .lean(); // Convert to plain JavaScript objects

    console.log(`Found ${complaints.length} complaints`);

    // Count total documents for pagination
    const total = await Complaint.countDocuments(query);

    // Pagination result
    const pagination = {};

    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    // Send response
    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      pagination,
      data: {
        complaints: complaints.map(complaint => ({
          ...complaint,
          id: complaint._id // Ensure id is available for frontend
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint
// @route   GET /api/v1/complaints/:id
// @access  Public
export const getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('department', 'name contactInfo')
      .populate('updates.createdBy', 'name email avatar');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    // Increment view count
    complaint.viewCount += 1;
    await complaint.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new complaint
// @route   POST /api/v1/complaints
// @access  Private
export const createComplaint = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.submittedBy = req.user.id;

    // Find appropriate department based on category and location
    const departments = await Department.findByCategory(req.body.category);

    if (departments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No department found for this category'
      });
    }

    // For now, assign to the first department found
    // In a real app, you might want more sophisticated logic
    req.body.department = departments[0]._id;

    // Set priority based on emergency status
    if (req.body.isEmergency) {
      req.body.priority = 'critical';
    }

    const complaint = await Complaint.create(req.body);

    // Populate the created complaint
    await complaint.populate('submittedBy', 'name email');
    await complaint.populate('department', 'name');

    // Emit real-time notification
    const io = req.app.get('io');
    io.to('admin').emit('new-complaint', {
      complaint: complaint,
      message: `New ${complaint.isEmergency ? 'emergency ' : ''}complaint submitted`
    });

    if (complaint.isEmergency) {
      io.to('provider').emit('emergency-complaint', {
        complaint: complaint,
        message: 'Emergency complaint requires immediate attention'
      });
    }

    res.status(201).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint
// @route   PUT /api/v1/complaints/:id
// @access  Private
export const updateComplaint = async (req, res, next) => {
  try {
    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    // Track status changes for notifications
    const oldStatus = complaint.status;
    const newStatus = req.body.status;

    complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('department', 'name');

    // Send real-time notification for status changes
    if (oldStatus !== newStatus && newStatus) {
      const io = req.app.get('io');

      // Notify the complaint submitter
      io.to(`complaint-${complaint._id}`).emit('status-update', {
        complaint: complaint,
        oldStatus,
        newStatus,
        message: `Complaint status updated to ${newStatus}`
      });

      // Notify relevant users
      io.to('citizen').emit('complaint-update', {
        complaintId: complaint._id,
        status: newStatus
      });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint
// @route   DELETE /api/v1/complaints/:id
// @access  Private
export const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add update to complaint
// @route   POST /api/v1/complaints/:id/updates
// @access  Private (Provider/Admin)
export const addComplaintUpdate = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    const update = {
      message: req.body.message,
      createdBy: req.user.id,
      type: req.body.type || 'progress_update',
      isInternal: req.body.isInternal || false,
      attachments: req.body.attachments || []
    };

    complaint.updates.push(update);
    await complaint.save();

    await complaint.populate('updates.createdBy', 'name email avatar');

    // Send real-time notification
    const io = req.app.get('io');
    io.to(`complaint-${complaint._id}`).emit('new-update', {
      complaint: complaint._id,
      update: complaint.updates[complaint.updates.length - 1],
      message: 'New update added to your complaint'
    });

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate complaint
// @route   POST /api/v1/complaints/:id/rate
// @access  Private (Complaint owner)
export const rateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    if (complaint.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        error: 'Can only rate resolved complaints'
      });
    }

    complaint.rating = req.body.rating;
    complaint.feedback = req.body.feedback;

    await complaint.save();

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign complaint to provider
// @route   PUT /api/v1/complaints/:id/assign
// @access  Private (Admin/Provider)
export const assignComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    // Verify the user being assigned is a provider
    const provider = await User.findById(req.body.assignedTo);
    if (!provider || provider.role !== 'provider') {
      return res.status(400).json({
        success: false,
        error: 'Can only assign to service providers'
      });
    }

    complaint.assignedTo = req.body.assignedTo;
    complaint.status = 'under_review';

    await complaint.save();

    await complaint.populate('assignedTo', 'name email');

    // Send real-time notification
    const io = req.app.get('io');
    io.to(`complaint-${complaint._id}`).emit('assignment-update', {
      complaint: complaint,
      assignedTo: complaint.assignedTo,
      message: 'Complaint has been assigned to a service provider'
    });

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints by location
// @route   GET /api/v1/complaints/location
// @access  Public
export const getComplaintsByLocation = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const complaints = await Complaint.getComplaintsByRadius(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius)
    ).populate('submittedBy', 'name')
     .populate('department', 'name');

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's complaints
// @route   GET /api/v1/complaints/my
// @access  Private
export const getMyComplaints = async (req, res, next) => {
  try {
    console.log('getMyComplaints req.user:', req.user);
    // Use req.user._id or req.user.id
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User not found in request' });
    }
    const complaints = await Complaint.find({ submittedBy: userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: { complaints }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assigned complaints (for providers)
// @route   GET /api/v1/complaints/assigned
// @access  Private (Provider)
export const getAssignedComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    let query = { assignedTo: req.user.id };

    // Apply filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;
    if (req.query.priority) query.priority = req.query.priority;

    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email')
      .populate('department', 'name')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    const total = await Complaint.countDocuments(query);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      data: complaints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload complaint attachment
// @route   POST /api/v1/complaints/:id/attachments
// @access  Private
export const uploadComplaintAttachment = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    // Handle file upload logic here
    // This would typically involve uploading to cloud storage
    const attachment = {
      filename: req.body.filename,
      url: req.body.url,
      type: req.body.type,
      size: req.body.size
    };

    complaint.attachments.push(attachment);
    await complaint.save();

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint analytics
// @route   GET /api/v1/complaints/analytics
// @access  Public
export const getComplaintAnalytics = async (req, res, next) => {
  try {
    const analytics = await Complaint.getAnalytics();

    // Get complaints by category
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get complaints by status
    const statusStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly trends
    const monthlyTrends = await Complaint.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          complaints: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...analytics,
        categoryStats,
        statusStats,
        monthlyTrends
      }
    });
  } catch (error) {
    next(error);
  }
};


// Get all complaints for the logged-in user
export const getUserComplaints = async (req, res) => {
  try {
    const userId = req.user.id; // Assumes authentication middleware sets req.user
    const complaints = await Complaint.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all complaints without filters
// @route   GET /api/v1/complaints/all
// @access  Private (Admin/Provider)
export const getAllComplaints = async (req, res) => {
  console.log('Fetching all complaints...');

  try {
    const complaints = await Complaint.find()
      .populate('submittedBy', '_id name')
      .populate('assignedTo', 'name avatar')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    console.log('Complaints fetched successfully:', complaints.length);

    res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};