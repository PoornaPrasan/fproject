import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Department from '../models/Department.js';

// @desc    Get system-wide analytics
// @route   GET /api/v1/analytics/system
// @access  Private (Admin)
export const getSystemAnalytics = async (req, res, next) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalCitizens = await User.countDocuments({ role: 'citizen', isActive: true });
    const totalProviders = await User.countDocuments({ role: 'provider', isActive: true });
    const totalDepartments = await Department.countDocuments({ isActive: true });
    
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const pendingComplaints = await Complaint.countDocuments({ 
      status: { $in: ['submitted', 'under_review', 'in_progress'] }
    });
    const emergencyComplaints = await Complaint.countDocuments({ 
      isEmergency: true,
      status: { $ne: 'resolved' }
    });

    // Calculate resolution rate
    const resolutionRate = totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0;

    // Calculate average resolution time
    const resolvedWithTime = await Complaint.find({ 
      status: 'resolved',
      actualResolutionTime: { $exists: true }
    });
    const averageResolutionTime = resolvedWithTime.length > 0 
      ? resolvedWithTime.reduce((sum, c) => sum + c.actualResolutionTime, 0) / resolvedWithTime.length 
      : 0;

    // Calculate average rating
    const ratedComplaints = await Complaint.find({ rating: { $exists: true } });
    const averageRating = ratedComplaints.length > 0 
      ? ratedComplaints.reduce((sum, c) => sum + c.rating, 0) / ratedComplaints.length 
      : 0;

    // Get complaints by status
    const statusDistribution = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get complaints by category
    const categoryDistribution = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          averageResolutionTime: {
            $avg: '$actualResolutionTime'
          }
        }
      }
    ]);

    // Get complaints by priority
    const priorityDistribution = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const analytics = {
      overview: {
        totalUsers,
        totalCitizens,
        totalProviders,
        totalDepartments,
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        emergencyComplaints,
        resolutionRate: Math.round(resolutionRate * 100) / 100,
        averageResolutionTime: Math.round(averageResolutionTime),
        averageRating: Math.round(averageRating * 10) / 10
      },
      distributions: {
        status: statusDistribution,
        category: categoryDistribution,
        priority: priorityDistribution
      }
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department analytics
// @route   GET /api/v1/analytics/department/:id
// @access  Private (Admin/Provider)
export const getDepartmentAnalytics = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Get department-specific analytics
    const totalComplaints = await Complaint.countDocuments({ department: department._id });
    const resolvedComplaints = await Complaint.countDocuments({ 
      department: department._id, 
      status: 'resolved' 
    });
    const pendingComplaints = await Complaint.countDocuments({ 
      department: department._id, 
      status: { $in: ['submitted', 'under_review', 'in_progress'] }
    });

    // Staff performance
    const staffPerformance = await Complaint.aggregate([
      { $match: { department: department._id, assignedTo: { $exists: true } } },
      {
        $group: {
          _id: '$assignedTo',
          totalAssigned: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          averageResolutionTime: {
            $avg: '$actualResolutionTime'
          },
          averageRating: {
            $avg: '$rating'
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          totalAssigned: 1,
          resolved: 1,
          resolutionRate: {
            $multiply: [{ $divide: ['$resolved', '$totalAssigned'] }, 100]
          },
          averageResolutionTime: { $round: ['$averageResolutionTime', 0] },
          averageRating: { $round: ['$averageRating', 1] }
        }
      }
    ]);

    const analytics = {
      overview: {
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0,
        totalStaff: department.totalStaff
      },
      staffPerformance
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user analytics
// @route   GET /api/v1/analytics/user/:id
// @access  Private (Admin)
export const getUserAnalytics = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    let analytics = {};

    if (user.role === 'citizen') {
      // Citizen analytics
      const totalComplaints = await Complaint.countDocuments({ submittedBy: user._id });
      const resolvedComplaints = await Complaint.countDocuments({ 
        submittedBy: user._id, 
        status: 'resolved' 
      });

      const categoryBreakdown = await Complaint.aggregate([
        { $match: { submittedBy: user._id } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]);

      analytics = {
        type: 'citizen',
        totalComplaints,
        resolvedComplaints,
        resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0,
        categoryBreakdown
      };
    } else if (user.role === 'provider') {
      // Provider analytics
      const totalAssigned = await Complaint.countDocuments({ assignedTo: user._id });
      const resolved = await Complaint.countDocuments({ 
        assignedTo: user._id, 
        status: 'resolved' 
      });

      const averageResolutionTime = await Complaint.aggregate([
        { 
          $match: { 
            assignedTo: user._id, 
            status: 'resolved',
            actualResolutionTime: { $exists: true }
          } 
        },
        {
          $group: {
            _id: null,
            avgTime: { $avg: '$actualResolutionTime' }
          }
        }
      ]);

      const averageRating = await Complaint.aggregate([
        { 
          $match: { 
            assignedTo: user._id, 
            rating: { $exists: true }
          } 
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' }
          }
        }
      ]);

      analytics = {
        type: 'provider',
        totalAssigned,
        resolved,
        resolutionRate: totalAssigned > 0 ? (resolved / totalAssigned) * 100 : 0,
        averageResolutionTime: averageResolutionTime[0]?.avgTime || 0,
        averageRating: averageRating[0]?.avgRating || 0
      };
    }

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint trends
// @route   GET /api/v1/analytics/trends
// @access  Private (Admin)
export const getComplaintTrends = async (req, res, next) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    let groupBy = {};
    let sortBy = {};

    if (period === 'daily') {
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      sortBy = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
    } else if (period === 'weekly') {
      groupBy = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
      sortBy = { '_id.year': 1, '_id.week': 1 };
    } else {
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      sortBy = { '_id.year': 1, '_id.month': 1 };
    }

    let matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const trends = await Complaint.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: groupBy,
          totalComplaints: { $sum: 1 },
          resolvedComplaints: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          emergencyComplaints: {
            $sum: { $cond: [{ $eq: ['$isEmergency', true] }, 1, 0] }
          },
          averageResolutionTime: {
            $avg: '$actualResolutionTime'
          }
        }
      },
      { $sort: sortBy },
      { $limit: 50 }
    ]);

    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get performance metrics
// @route   GET /api/v1/analytics/performance
// @access  Private (Admin)
export const getPerformanceMetrics = async (req, res, next) => {
  try {
    // Top performing departments
    const departmentPerformance = await Complaint.aggregate([
      {
        $group: {
          _id: '$department',
          totalComplaints: { $sum: 1 },
          resolvedComplaints: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          averageResolutionTime: {
            $avg: '$actualResolutionTime'
          },
          averageRating: {
            $avg: '$rating'
          }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $project: {
          name: '$department.name',
          totalComplaints: 1,
          resolvedComplaints: 1,
          resolutionRate: {
            $multiply: [{ $divide: ['$resolvedComplaints', '$totalComplaints'] }, 100]
          },
          averageResolutionTime: { $round: ['$averageResolutionTime', 0] },
          averageRating: { $round: ['$averageRating', 1] }
        }
      },
      { $sort: { resolutionRate: -1 } }
    ]);

    // Top performing providers
    const providerPerformance = await Complaint.aggregate([
      { $match: { assignedTo: { $exists: true } } },
      {
        $group: {
          _id: '$assignedTo',
          totalAssigned: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          averageResolutionTime: {
            $avg: '$actualResolutionTime'
          },
          averageRating: {
            $avg: '$rating'
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          totalAssigned: 1,
          resolved: 1,
          resolutionRate: {
            $multiply: [{ $divide: ['$resolved', '$totalAssigned'] }, 100]
          },
          averageResolutionTime: { $round: ['$averageResolutionTime', 0] },
          averageRating: { $round: ['$averageRating', 1] }
        }
      },
      { $sort: { resolutionRate: -1 } },
      { $limit: 10 }
    ]);

    // SLA compliance
    const slaCompliance = await Complaint.aggregate([
      { $match: { status: 'resolved', actualResolutionTime: { $exists: true } } },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'dept'
        }
      },
      {
        $unwind: '$dept'
      },
      {
        $unwind: '$dept.sla'
      },
      {
        $match: {
          $expr: { $eq: ['$category', '$dept.sla.category'] }
        }
      },
      {
        $project: {
          category: 1,
          actualResolutionTime: 1,
          slaResolutionTime: '$dept.sla.resolutionTime',
          withinSLA: {
            $lte: ['$actualResolutionTime', '$dept.sla.resolutionTime']
          }
        }
      },
      {
        $group: {
          _id: '$category',
          totalComplaints: { $sum: 1 },
          withinSLA: {
            $sum: { $cond: ['$withinSLA', 1, 0] }
          }
        }
      },
      {
        $project: {
          category: '$_id',
          totalComplaints: 1,
          withinSLA: 1,
          complianceRate: {
            $multiply: [{ $divide: ['$withinSLA', '$totalComplaints'] }, 100]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        departmentPerformance,
        providerPerformance,
        slaCompliance
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get location-based analytics
// @route   GET /api/v1/analytics/location
// @access  Private (Admin)
export const getLocationAnalytics = async (req, res, next) => {
  try {
    // Complaints by city
    const cityDistribution = await Complaint.aggregate([
      {
        $group: {
          _id: '$location.city',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Complaints by region
    const regionDistribution = await Complaint.aggregate([
      {
        $group: {
          _id: '$location.region',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Hot spots (areas with high complaint density)
    const hotSpots = await Complaint.aggregate([
      {
        $group: {
          _id: {
            lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 2] },
            lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 2] }
          },
          count: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      },
      { $match: { count: { $gte: 5 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        cityDistribution,
        regionDistribution,
        hotSpots
      }
    });
  } catch (error) {
    next(error);
  }
};