import Department from '../models/Department.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';

// @desc    Get all departments
// @route   GET /api/v1/departments
// @access  Public
export const getDepartments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    let query = { isActive: true };

    // Apply filters
    if (req.query.category) {
      query.categories = { $in: [req.query.category] };
    }

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const departments = await Department.find(query)
      .populate('head', 'name email')
      .populate('staff.user', 'name email')
      .sort('name')
      .skip(startIndex)
      .limit(limit);

    const total = await Department.countDocuments(query);

    res.status(200).json({
      success: true,
      count: departments.length,
      total,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department
// @route   GET /api/v1/departments/:id
// @access  Public
export const getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'name email avatar')
      .populate('staff.user', 'name email avatar')
      .populate('activeComplaints');

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new department
// @route   POST /api/v1/departments
// @access  Private (Admin)
export const createDepartment = async (req, res) => {
  try {
    // Map manager fields to headName, headEmail, headPhone
    const { manager, ...rest } = req.body;
    const departmentData = {
      ...rest,
      headName: manager?.name || '',
      headEmail: manager?.email || '',
      headPhone: manager?.phone || ''
    };
    const department = await Department.create(departmentData);
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update department
// @route   PUT /api/v1/departments/:id
// @access  Private (Admin)
export const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('head', 'name email')
     .populate('staff.user', 'name email');

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/v1/departments/:id
// @access  Private (Admin)
export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Check if department has active complaints
    const activeComplaints = await Complaint.countDocuments({
      department: department._id,
      status: { $in: ['submitted', 'under_review', 'in_progress'] }
    });

    if (activeComplaints > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete department with active complaints'
      });
    }

    // Soft delete - deactivate instead of removing
    department.isActive = false;
    await department.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add staff to department
// @route   POST /api/v1/departments/:id/staff
// @access  Private (Admin)
export const addStaffToDepartment = async (req, res, next) => {
  try {
    const { userId, position } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is already in the department
    const existingStaff = department.staff.find(
      staff => staff.user.toString() === userId && staff.isActive
    );

    if (existingStaff) {
      return res.status(400).json({
        success: false,
        error: 'User is already a staff member of this department'
      });
    }

    // Add staff to department
    await department.addStaff(userId, position);

    // Update user's role and department
    if (user.role === 'citizen') {
      user.role = 'provider';
    }
    user.department = department._id;
    await user.save();

    await department.populate('staff.user', 'name email');

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove staff from department
// @route   DELETE /api/v1/departments/:id/staff/:userId
// @access  Private (Admin)
export const removeStaffFromDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove staff from department
    await department.removeStaff(req.params.userId);

    // Update user's role back to citizen if they're not head of any department
    const isHeadOfDepartment = await Department.findOne({ 
      head: user._id, 
      isActive: true 
    });

    if (!isHeadOfDepartment) {
      user.role = 'citizen';
      user.department = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department statistics
// @route   GET /api/v1/departments/:id/stats
// @access  Private (Admin/Provider)
export const getDepartmentStats = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Get complaint statistics
    const totalComplaints = await Complaint.countDocuments({ 
      department: department._id 
    });

    const resolvedComplaints = await Complaint.countDocuments({ 
      department: department._id, 
      status: 'resolved' 
    });

    const pendingComplaints = await Complaint.countDocuments({ 
      department: department._id, 
      status: { $in: ['submitted', 'under_review', 'in_progress'] }
    });

    const emergencyComplaints = await Complaint.countDocuments({ 
      department: department._id, 
      isEmergency: true,
      status: { $ne: 'resolved' }
    });

    // Calculate average resolution time
    const resolvedWithTime = await Complaint.find({ 
      department: department._id, 
      status: 'resolved',
      actualResolutionTime: { $exists: true }
    });

    const averageResolutionTime = resolvedWithTime.length > 0 
      ? resolvedWithTime.reduce((sum, c) => sum + c.actualResolutionTime, 0) / resolvedWithTime.length 
      : 0;

    // Calculate average rating
    const ratedComplaints = await Complaint.find({ 
      department: department._id, 
      rating: { $exists: true } 
    });

    const averageRating = ratedComplaints.length > 0 
      ? ratedComplaints.reduce((sum, c) => sum + c.rating, 0) / ratedComplaints.length 
      : 0;

    // Get complaints by category
    const categoryStats = await Complaint.aggregate([
      { $match: { department: department._id } },
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

    // Get monthly trends
    const monthlyTrends = await Complaint.aggregate([
      { $match: { department: department._id } },
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

    const stats = {
      totalComplaints,
      resolvedComplaints,
      pendingComplaints,
      emergencyComplaints,
      resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0,
      averageResolutionTime: Math.round(averageResolutionTime),
      averageRating: averageRating.toFixed(1),
      totalStaff: department.totalStaff,
      categoryStats,
      monthlyTrends
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department complaints
// @route   GET /api/v1/departments/:id/complaints
// @access  Private (Admin/Provider)
export const getDepartmentComplaints = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    let query = { department: department._id };

    // Apply filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.isEmergency) query.isEmergency = req.query.isEmergency === 'true';

    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
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