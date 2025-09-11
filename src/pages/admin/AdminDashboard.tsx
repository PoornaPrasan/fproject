import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
  //Clock,
  //TrendingUp,
  Building,
  //MapPin,
  Bell,
  Database,
  Activity
} from 'lucide-react';
import { useComplaints } from '../../contexts/ComplaintContext';

const AdminDashboard: React.FC = () => {
  const { complaints, analytics } = useComplaints();
  
  // System-wide statistics
  const systemStats = {
    totalUsers: 1247,
    totalProviders: 45,
    totalDepartments: 12,
    systemUptime: 99.8,
    activeComplaints: complaints.filter(c => !['resolved', 'closed'].includes(c.status)).length,
    emergencyComplaints: complaints.filter(c => c.isEmergency && !['resolved', 'closed'].includes(c.status)).length,
    avgResolutionTime: analytics.averageResolutionTime,
    satisfactionRate: 94.2
  };

  const quickStats = [
    {
      name: 'Total Users',
      value: systemStats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Active Complaints',
      value: systemStats.activeComplaints,
      icon: FileText,
      color: 'text-orange-600 bg-orange-50',
      change: '-5%',
      changeType: 'decrease'
    },
    {
      name: 'System Uptime',
      value: `${systemStats.systemUptime}%`,
      icon: Activity,
      color: 'text-green-600 bg-green-50',
      change: '+0.2%',
      changeType: 'increase'
    },
    {
      name: 'Emergencies',
      value: systemStats.emergencyComplaints,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
      change: '0',
      changeType: 'neutral'
    }
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage citizen and provider accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Department Setup',
      description: 'Configure departments and services',
      icon: Building,
      href: '/admin/departments',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'System Analytics',
      description: 'View comprehensive reports',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'System Settings',
      description: 'Configure system parameters',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const recentActivity = [
    { type: 'user_registered', message: 'New citizen registered: john.doe@email.com', time: '2 minutes ago' },
    { type: 'complaint_resolved', message: 'Water supply issue resolved in Downtown', time: '15 minutes ago' },
    { type: 'provider_assigned', message: 'Provider assigned to emergency complaint #1234', time: '1 hour ago' },
    { type: 'system_update', message: 'System maintenance completed successfully', time: '2 hours ago' },
    { type: 'department_created', message: 'New department added: Environmental Services', time: '3 hours ago' }
  ];

  const departmentPerformance = [
    { name: 'Water Services', complaints: 45, resolved: 42, rate: 93.3 },
    { name: 'Electricity', complaints: 38, resolved: 35, rate: 92.1 },
    { name: 'Roads & Transport', complaints: 52, resolved: 46, rate: 88.5 },
    { name: 'Sanitation', complaints: 29, resolved: 28, rate: 96.6 },
    { name: 'Street Lighting', complaints: 22, resolved: 21, rate: 95.5 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
        <p className="text-gray-600 mt-2">Monitor and manage the entire complaint management system</p>
      </div>

      {/* System Alerts */}
      {systemStats.emergencyComplaints > 0 && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {systemStats.emergencyComplaints} Emergency Complaint{systemStats.emergencyComplaints > 1 ? 's' : ''} Require Attention
              </h3>
              <div className="mt-2">
                <Link
                  to="/admin/complaints?filter=emergency"
                  className="text-sm text-red-700 underline hover:text-red-600"
                >
                  Review emergency complaints →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      stat.changeType === 'increase' ? 'bg-green-100 text-green-800' :
                      stat.changeType === 'decrease' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.href}
                className={`${action.color} text-white p-6 rounded-lg transition-colors hover:shadow-lg transform hover:scale-105`}
              >
                <Icon className="w-8 h-8 mb-3" />
                <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Department Performance */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
              <Link
                to="/admin/departments"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {departmentPerformance.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                      <span className="text-sm text-gray-600">{dept.resolved}/{dept.complaints}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${dept.rate}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-medium text-gray-900">{dept.rate.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Link
                to="/admin/activity"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === 'user_registered' && <Users className="w-4 h-4 text-blue-500" />}
                    {activity.type === 'complaint_resolved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {activity.type === 'provider_assigned' && <Shield className="w-4 h-4 text-purple-500" />}
                    {activity.type === 'system_update' && <Settings className="w-4 h-4 text-orange-500" />}
                    {activity.type === 'department_created' && <Building className="w-4 h-4 text-indigo-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{analytics.totalComplaints}</div>
            <div className="text-sm text-gray-600">Total Complaints</div>
            <div className="text-xs text-green-600 mt-1">+15% this month</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{analytics.resolvedComplaints}</div>
            <div className="text-sm text-gray-600">Resolved</div>
            <div className="text-xs text-green-600 mt-1">+8% this month</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{systemStats.totalProviders}</div>
            <div className="text-sm text-gray-600">Service Providers</div>
            <div className="text-xs text-blue-600 mt-1">3 new this week</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{systemStats.satisfactionRate}%</div>
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
            <div className="text-xs text-green-600 mt-1">+2.1% this month</div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Server Uptime</span>
                <span className="font-medium">{systemStats.systemUptime}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${systemStats.systemUptime}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Database Performance</span>
                <span className="font-medium">98.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '98.5%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">API Response Time</span>
                <span className="font-medium">145ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Resource Usage</h3>
            <Database className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage Used</span>
              <span className="text-sm font-medium">2.4 TB / 5 TB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium">1,247</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Daily API Calls</span>
              <span className="text-sm font-medium">45,892</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Backup Status</span>
              <span className="text-sm font-medium text-green-600">✓ Current</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-800">2 Emergency Complaints</p>
              <p className="text-xs text-red-600">Require immediate attention</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800">System Maintenance</p>
              <p className="text-xs text-yellow-600">Scheduled for tonight at 2 AM</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800">New Provider Registration</p>
              <p className="text-xs text-blue-600">3 pending approvals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;