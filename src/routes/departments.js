import express from 'express';
import Department from '../models/Department.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateDepartmentCreation, validateObjectId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, category, isActive } = req.query;
    
    // Build query
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (category) query.categories = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const departments = await Department.find(query)
      .populate('head', 'name email')
      .populate('staff.user', 'name email avatar')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Department.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        departments,
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

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'name email avatar')
      .populate('staff.user', 'name email avatar role')
      .populate('activeComplaintsCount');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        department
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

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), validateDepartmentCreation, async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      categories,
      contactInfo,
      workingHours,
      serviceAreas,
      head,
      headName,
      headEmail,
      headPhone,
      settings,
      logo,
      color
    } = req.body;

    if (!headName || !headEmail || !headPhone) {
      return res.status(400).json({
        success: false,
        message: 'Department head name, email, and phone are required.'
      });
    }

    console.log('📝 New department creation:', { name, code, admin: req.user.email });
    // Check if department code already exists
    const existingDepartment = await Department.findOne({ 
      $or: [{ code }, { name }] 
    });

    if (existingDepartment) {
      console.log('❌ Department already exists:', code);
      return res.status(400).json({
        success: false,
        message: 'Department with this code or name already exists'
      });
    }

    // Validate head if provided
    if (head) {
      const headUser = await User.findById(head);
      if (!headUser || headUser.role !== 'provider') {
        console.log('❌ Invalid department head:', head);
        return res.status(400).json({
          success: false,
          message: 'Department head must be a valid provider'
        });
      }
    }

    // Auto-generate code if not provided
    const departmentCode = code || name.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
    
    // Ensure we have a valid code
    if (!departmentCode || departmentCode.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Department code is required'
      });
    }
    
    const department = await Department.create({
      name,
      code: departmentCode,
      description,
      categories,
      contactInfo,
      workingHours,
      serviceAreas,
      head,
      headName,
      headEmail,
      headPhone,
      settings,
      logo,
      color
    });

    console.log('✅ Department created successfully in MongoDB:', department._id);
    // Update head user's department if provided
    if (head) {
      await User.findByIdAndUpdate(head, { department: department.name });
      console.log('✅ Department head updated in MongoDB');
    }

    await department.populate([
      { path: 'head', select: 'name email avatar' },
      { path: 'staff.user', select: 'name email avatar' }
    ]);

    console.log('✅ Department creation completed and saved to MongoDB');
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: {
        department
      }
    });
  } catch (error) {
    console.error('❌ Department creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), validateObjectId, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const allowedFields = [
      'name', 'description', 'categories', 'contactInfo', 
      'workingHours', 'serviceAreas', 'head', 'settings', 
      'isActive', 'logo', 'color'
    ];

    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // Validate head if being updated
    if (updateData.head) {
      const headUser = await User.findById(updateData.head);
      if (!headUser || headUser.role !== 'provider') {
        return res.status(400).json({
          success: false,
          message: 'Department head must be a valid provider'
        });
      }
    }

    Object.assign(department, updateData);
    await department.save();

    // Update head user's department
    if (updateData.head) {
      await User.findByIdAndUpdate(updateData.head, { department: department.name });
    }

    await department.populate([
      { path: 'head', select: 'name email avatar' },
      { path: 'staff.user', select: 'name email avatar' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: {
        department
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

// @desc    Add staff to department
// @route   POST /api/departments/:id/staff
// @access  Private (Admin only)
router.post('/:id/staff', protect, authorize('admin'), validateObjectId, async (req, res) => {
  try {
    const { userId, position, permissions } = req.body;

    if (!userId || !position) {
      return res.status(400).json({
        success: false,
        message: 'User ID and position are required'
      });
    }

    const department = await Department.findById(req.params.id);
    const user = await User.findById(userId);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    if (!user || user.role !== 'provider') {
      return res.status(400).json({
        success: false,
        message: 'User must be a valid provider'
      });
    }

    // Check if user is already in department
    const existingStaff = department.staff.find(s => s.user.toString() === userId);
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this department'
      });
    }

    // Add staff member
    department.staff.push({
      user: userId,
      position,
      permissions: permissions || ['view', 'update']
    });

    await department.save();

    // Update user's department
    user.department = department.name;
    await user.save();

    await department.populate('staff.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Staff member added successfully',
      data: {
        staff: department.staff[department.staff.length - 1]
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

// @desc    Update staff member
// @route   PUT /api/departments/:id/staff/:staffId
// @access  Private (Admin only)
router.put('/:id/staff/:staffId', protect, authorize('admin'), validateObjectId, async (req, res) => {
  try {
    const { position, permissions, isActive } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const staffMember = department.staff.id(req.params.staffId);

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Update staff member
    if (position) staffMember.position = position;
    if (permissions) staffMember.permissions = permissions;
    if (isActive !== undefined) staffMember.isActive = isActive;

    await department.save();

    await department.populate('staff.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      data: {
        staff: staffMember
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

// @desc    Remove staff from department
// @route   DELETE /api/departments/:id/staff/:staffId
// @access  Private (Admin only)
router.delete('/:id/staff/:staffId', protect, authorize('admin'), validateObjectId, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const staffMember = department.staff.id(req.params.staffId);

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Remove staff member
    department.staff.pull(req.params.staffId);
    await department.save();

    // Update user's department
    await User.findByIdAndUpdate(staffMember.user, { $unset: { department: 1 } });

    res.status(200).json({
      success: true,
      message: 'Staff member removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get department performance
// @route   GET /api/departments/:id/performance
// @access  Public
router.get('/:id/performance', validateObjectId, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Update performance metrics
    await department.updatePerformance();

    res.status(200).json({
      success: true,
      data: {
        performance: department.performance
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

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), validateObjectId, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has active complaints
    const Complaint = require('../models/Complaint');
    const activeComplaints = await Complaint.countDocuments({
      department: department._id,
      status: { $in: ['submitted', 'under_review', 'in_progress'] }
    });

    if (activeComplaints > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with active complaints'
      });
    }

    // Soft delete - deactivate instead of removing
    department.isActive = false;
    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department deactivated successfully'
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