import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Star,
  AlertTriangle,
  //Calendar,
  //MapPin,
  Users,
  Award
} from 'lucide-react';
import { useComplaints } from '../../contexts/ComplaintContext';
import { useAuth } from '../../contexts/AuthContext';

const ProviderAnalytics: React.FC = () => {
  const { complaints } = useComplaints();
  const { user } = useAuth();
  
  // Filter complaints assigned to this provider
  const assignedComplaints = complaints.filter(c => c.assignedTo === user?.id);
  
  // Calculate provider-specific metrics
  const providerMetrics = {
    totalAssigned: assignedComplaints.length,
    resolved: assignedComplaints.filter(c => c.status === 'resolved').length,
    averageRating: assignedComplaints.filter(c => c.rating).length > 0
      ? assignedComplaints.reduce((sum, c) => sum + (c.rating || 0), 0) / assignedComplaints.filter(c => c.rating).length
      : 0,
    averageResolutionTime: 2.8, // Mock data
    emergencyResponse: assignedComplaints.filter(c => c.isEmergency).length,
    resolutionRate: assignedComplaints.length > 0 
      ? (assignedComplaints.filter(c => c.status === 'resolved').length / assignedComplaints.length) * 100
      : 0
  };

  // Monthly performance data (mock)
  const monthlyData = [
    { month: 'Jan', assigned: 12, resolved: 11, rating: 4.2 },
    { month: 'Feb', assigned: 15, resolved: 14, rating: 4.5 },
    { month: 'Mar', assigned: 18, resolved: 16, rating: 4.3 },
    { month: 'Apr', assigned: 22, resolved: 20, rating: 4.6 },
    { month: 'May', assigned: 19, resolved: 18, rating: 4.4 },
    { month: 'Jun', assigned: 25, resolved: 23, rating: 4.7 }
  ];

  // Category breakdown
  const categoryBreakdown = assignedComplaints.reduce((acc, complaint) => {
    acc[complaint.category] = (acc[complaint.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const performanceMetrics = [
    {
      title: 'Resolution Rate',
      value: `${Math.round(providerMetrics.resolutionRate)}%`,
      change: '+5%',
      changeType: 'increase' as const,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'Average Rating',
      value: providerMetrics.averageRating.toFixed(1),
      change: '+0.3',
      changeType: 'increase' as const,
      icon: Star,
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      title: 'Avg Resolution Time',
      value: `${providerMetrics.averageResolutionTime}d`,
      change: '-0.5d',
      changeType: 'decrease' as const,
      icon: Clock,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Emergency Response',
      value: providerMetrics.emergencyResponse.toString(),
      change: '0',
      changeType: 'neutral' as const,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
        <p className="text-gray-600 mt-2">Track your performance and service quality metrics</p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.title} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${metric.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      metric.changeType === 'increase' ? 'bg-green-100 text-green-800' :
                      metric.changeType === 'decrease' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Performance Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Performance</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 w-8">{data.month}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(data.resolved / data.assigned) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {data.resolved}/{data.assigned}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{data.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Complaints by Category</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {Object.entries(categoryBreakdown).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {category.replace('_', ' ')}
                  </span>
                  <div className="flex-1">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(count / assignedComplaints.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Top Achievements */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">High Resolution Rate</p>
                <p className="text-xs text-green-700">95% completion rate this month</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-900">Excellent Rating</p>
                <p className="text-xs text-yellow-700">4.7/5 average customer rating</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Fast Response</p>
                <p className="text-xs text-blue-700">Below average resolution time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Feedback</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {assignedComplaints
              .filter(c => c.feedback && c.rating)
              .slice(0, 3)
              .map((complaint) => (
                <div key={complaint.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center space-x-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < (complaint.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 italic">"{complaint.feedback}"</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {complaint.title} - {new Date(complaint.resolvedAt || '').toLocaleDateString()}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Performance Goals */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Goals</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Resolution Rate Target</span>
                <span className="font-medium">95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(providerMetrics.resolutionRate, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current: {Math.round(providerMetrics.resolutionRate)}%
              </p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Average Rating Target</span>
                <span className="font-medium">4.5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(providerMetrics.averageRating / 5) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current: {providerMetrics.averageRating.toFixed(1)}
              </p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Response Time Target</span>
                <span className="font-medium">≤ 2 days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, 100 - (providerMetrics.averageResolutionTime / 5) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current: {providerMetrics.averageResolutionTime}d
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{providerMetrics.totalAssigned}</div>
            <div className="text-sm text-gray-600">Total Assigned</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{providerMetrics.resolved}</div>
            <div className="text-sm text-gray-600">Successfully Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {assignedComplaints.filter(c => c.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-600">Currently In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {assignedComplaints.filter(c => c.rating && c.rating >= 4).length}
            </div>
            <div className="text-sm text-gray-600">High Satisfaction (4+ stars)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderAnalytics;