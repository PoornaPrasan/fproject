import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js'; // Added import for Department
import mongoose from 'mongoose';

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    let query = {};

    // Apply filters
    if (req.query.role) query.role = req.query.role;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';
    if (req.query.department) {
      // Try to find department by ID first, then by name
      if (mongoose.Types.ObjectId.isValid(req.query.department)) {
        query.departmentId = req.query.department;
      } else {
        query.department = req.query.department;
      }
    }

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('department', 'name')
      .populate('departmentId')
      .select('-password')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    const total = await User.countDocuments(query);

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

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('department', 'name contactInfo')
      .populate('departmentId')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private (Admin)
export const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private
export const updateUser = async (req, res, next) => {
  try {
    // Don't allow password updates through this route
    delete req.body.password;

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Soft delete - deactivate instead of removing
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/v1/users/:id/stats
// @access  Private
export const getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    let stats = {};

    if (user.role === 'citizen') {
      // Citizen statistics
      const totalComplaints = await Complaint.countDocuments({ submittedBy: user._id });
      const resolvedComplaints = await Complaint.countDocuments({ 
        submittedBy: user._id, 
        status: 'resolved' 
      });
      const pendingComplaints = await Complaint.countDocuments({ 
        submittedBy: user._id, 
        status: { $in: ['submitted', 'under_review', 'in_progress'] }
      });

      // Average rating given by user
      const ratedComplaints = await Complaint.find({ 
        submittedBy: user._id, 
        rating: { $exists: true } 
      });
      const averageRating = ratedComplaints.length > 0 
        ? ratedComplaints.reduce((sum, c) => sum + c.rating, 0) / ratedComplaints.length 
        : 0;

      stats = {
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0,
        averageRating: averageRating.toFixed(1)
      };
    } else if (user.role === 'provider') {
      // Provider statistics
      const assignedComplaints = await Complaint.countDocuments({ assignedTo: user._id });
      const resolvedComplaints = await Complaint.countDocuments({ 
        assignedTo: user._id, 
        status: 'resolved' 
      });
      const pendingComplaints = await Complaint.countDocuments({ 
        assignedTo: user._id, 
        status: { $in: ['submitted', 'under_review', 'in_progress'] }
      });

      // Average rating received
      const ratedComplaints = await Complaint.find({ 
        assignedTo: user._id, 
        rating: { $exists: true } 
      });
      const averageRating = ratedComplaints.length > 0 
        ? ratedComplaints.reduce((sum, c) => sum + c.rating, 0) / ratedComplaints.length 
        : 0;

      // Average resolution time
      const resolvedWithTime = await Complaint.find({ 
        assignedTo: user._id, 
        status: 'resolved',
        actualResolutionTime: { $exists: true }
      });
      const averageResolutionTime = resolvedWithTime.length > 0 
        ? resolvedWithTime.reduce((sum, c) => sum + c.actualResolutionTime, 0) / resolvedWithTime.length 
        : 0;

      stats = {
        assignedComplaints,
        resolvedComplaints,
        pendingComplaints,
        resolutionRate: assignedComplaints > 0 ? (resolvedComplaints / assignedComplaints) * 100 : 0,
        averageRating: averageRating.toFixed(1),
        averageResolutionTime: Math.round(averageResolutionTime)
      };
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's complaints
// @route   GET /api/v1/users/:id/complaints
// @access  Private
export const getUserComplaints = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    let query = {};
    
    if (user.role === 'citizen') {
      query.submittedBy = user._id;
    } else if (user.role === 'provider') {
      query.assignedTo = user._id;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid user role for this operation'
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('department', 'name')
      .populate('departmentId')
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

// @desc    Update user role
// @route   PUT /api/v1/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role, department } = req.body;

    if (!['citizen', 'provider', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    const updateData = { role };
    
    // If changing to provider, department is required
    if (role === 'provider' && !department) {
      return res.status(400).json({
        success: false,
        error: 'Department is required for provider role'
      });
    }

    if (role === 'provider') {
      // Get department name from department ID
      const departmentDoc = await Department.findById(department);
      if (!departmentDoc) {
        return res.status(400).json({
          success: false,
          error: 'Invalid department'
        });
      }
      updateData.department = departmentDoc.name;
      updateData.departmentId = departmentDoc._id;
    } else {
      updateData.department = undefined;
      updateData.departmentId = undefined;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};