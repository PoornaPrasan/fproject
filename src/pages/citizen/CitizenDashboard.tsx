import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  //BarChart3,
  Plus
} from 'lucide-react';
import { useComplaints } from '../../contexts/ComplaintContext';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';

const CitizenDashboard: React.FC = () => {
  const { complaints, myComplaints, analytics } = useComplaints();
  const { user } = useAuth();
  
  const userComplaints = myComplaints.slice(0, 5);
  const recentComplaints = complaints.slice(0, 6);

  const stats = [
    {
      name: 'My Complaints',
      value: myComplaints.length,
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
      href: '/citizen/track'
    },
    {
      name: 'In Progress',
      value: myComplaints.filter(c => c.status === 'in_progress').length,
      icon: Clock,
      color: 'text-orange-600 bg-orange-50',
      href: '/citizen/track'
    },
    {
      name: 'Resolved',
      value: myComplaints.filter(c => c.status === 'resolved').length,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
      href: '/citizen/track'
    },
    {
      name: 'Community Issues',
      value: complaints.length,
      icon: Users,
      color: 'text-purple-600 bg-purple-50',
      href: '/citizen/community'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Track your complaints and stay updated on community issues</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Report a New Issue</h2>
              <p className="text-blue-100">Help improve your community by reporting problems</p>
            </div>
            <Link
              to="/citizen/submit"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Submit Complaint</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Recent Complaints */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My Recent Complaints</h3>
              <Link
                to="/citizen/track"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {userComplaints.length > 0 ? (
              <div className="space-y-4">
                {userComplaints.map((complaint) => (
                  <div key={complaint.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {complaint.isEmergency ? (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {complaint.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {complaint.location.address}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <StatusBadge status={complaint.status} />
                        <span className="text-xs text-gray-400">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No complaints submitted yet</p>
                <Link
                  to="/citizen/submit"
                  className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                >
                  Submit your first complaint
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Community Activity */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Community Activity</h3>
              <Link
                to="/citizen/community"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentComplaints.map((complaint) => (
                <div key={complaint.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {complaint.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {complaint.location.address}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <StatusBadge status={complaint.status} />
                      <span className="text-xs text-gray-400 capitalize">
                        {complaint.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.totalComplaints}</div>
            <div className="text-sm text-gray-600">Total Complaints</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analytics.resolvedComplaints}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(((analytics.resolvedComplaints / analytics.totalComplaints) * 100) || 0)}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{analytics.averageResolutionTime}d</div>
            <div className="text-sm text-gray-600">Avg Resolution</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;