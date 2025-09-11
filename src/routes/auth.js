import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Department from '../models/Department.js';
import { generateToken, protect } from '../middleware/auth.js';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation.js';

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password, role, phone, departmentId } = req.body;

    console.log('📝 User registration attempt:', { name, email, role, departmentId });
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // For providers, get department name from department ID
    let departmentName = undefined;
    if (role === 'provider' && departmentId) {
      try {
        const departmentDoc = await Department.findById(departmentId);
        if (departmentDoc) {
          departmentName = departmentDoc.name;
        } else {
          console.log('❌ Department not found:', departmentId);
          return res.status(400).json({
            success: false,
            message: 'Invalid department ID'
          });
        }
      } catch (error) {
        console.log('❌ Invalid department ID format:', departmentId);
        return res.status(400).json({
          success: false,
          message: 'Invalid department ID format'
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      department: departmentName,
      departmentId: role === 'provider' ? departmentId : undefined
    });

    console.log('✅ User created successfully in MongoDB:', user._id);
    // Add user to department staff if provider
    if (role === 'provider' && departmentId) {
      await Department.findByIdAndUpdate(departmentId, {
        $push: {
          staff: {
            user: user._id,
            position: 'Field Staff',
            permissions: ['view', 'update']
          }
        }
      });
      console.log('✅ User added to department staff');
    }

    // Generate token
    const token = generateToken(user._id);

    // Prepare a public user object (exclude password and sensitive fields)
    const publicUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    console.log('✅ User registration completed and saved to MongoDB');
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: publicUser,
        token
      }
    });
  } catch (error) {
    console.error('❌ User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email only
    const user = await User.findOne({ email }).select('+password').populate('department');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    // Prepare a public user object (exclude password and sensitive fields)
    const publicUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: publicUser,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('department');
    
    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile()
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

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;