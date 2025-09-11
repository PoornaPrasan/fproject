import React, { useState } from 'react';
import { 
  BarChart3, 
  //TrendingUp, 
  Users, 
  FileText,
  Clock,
  CheckCircle,
  //AlertTriangle,
  MapPin,
  //Calendar,
  Download,
  //Filter,
  Star,
  Activity
} from 'lucide-react';
import { useComplaints } from '../../contexts/ComplaintContext';

const SystemAnalytics: React.FC = () => {
  const { analytics } = useComplaints();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'complaints' | 'resolution' | 'satisfaction'>('complaints');

  // Advanced analytics calculations
  const advancedMetrics = {
    totalUsers: 1247,
    newUsersThisMonth: 156,
    totalProviders: 45,
    activeProviders: 42,
    systemUptime: 99.8,
    avgResponseTime: 145, // milliseconds
    peakHours: '2:00 PM - 4:00 PM',
    mostActiveDay: 'Tuesday',
    resolutionTrend: '+12%',
    satisfactionTrend: '+3.2%',
    emergencyResponseTime: 0.8 // hours
  };

  // Category performance data
  const categoryPerformance = [
    { category: 'Water', total: 145, resolved: 138, avgTime: 2.3, satisfaction: 94.2 },
    { category: 'Electricity', total: 89, resolved: 82, avgTime: 1.8, satisfaction: 96.1 },
    { category: 'Roads', total: 203, resolved: 185, avgTime: 4.2, satisfaction: 88.7 },
    { category: 'Sanitation', total: 167, resolved: 162, avgTime: 1.5, satisfaction: 97.3 },
    { category: 'Street Lights', total: 78, resolved: 75, avgTime: 1.2, satisfaction: 95.8 }
  ];

  // Regional performance data
  const regionalData = [
    { region: 'Downtown', complaints: 234, resolved: 218, satisfaction: 93.2 },
    { region: 'North District', complaints: 189, resolved: 175, satisfaction: 91.8 },
    { region: 'South District', complaints: 156, resolved: 148, satisfaction: 94.9 },
    { region: 'East Side', complaints: 143, resolved: 135, satisfaction: 92.3 },
    { region: 'West Side', complaints: 167, resolved: 159, satisfaction: 95.2 }
  ];

  // Time-based data (mock)
  const timeSeriesData = [
    { period: 'Week 1', complaints: 45, resolved: 42, satisfaction: 93.3 },
    { period: 'Week 2', complaints: 52, resolved: 48, satisfaction: 92.1 },
    { period: 'Week 3', complaints: 38, resolved: 35, satisfaction: 94.7 },
    { period: 'Week 4', complaints: 61, resolved: 58, satisfaction: 95.1 }
  ];

  // Provider performance rankings
  const topProviders = [
    { name: 'Sarah Wilson', department: 'Water Services', resolved: 45, rating: 4.8, efficiency: 98.2 },
    { name: 'Mike Johnson', department: 'Electricity', resolved: 38, rating: 4.7, efficiency: 96.5 },
    { name: 'Emily Chen', department: 'Roads', resolved: 52, rating: 4.6, efficiency: 94.8 },
    { name: 'David Rodriguez', department: 'Sanitation', resolved: 41, rating: 4.9, efficiency: 99.1 },
    { name: 'Lisa Thompson', department: 'Street Lights', resolved: 29, rating: 4.5, efficiency: 93.7 }
  ];

  const exportReport = (type: 'pdf' | 'excel') => {
    console.log(`Exporting ${type} report`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
            <p className="text-gray-600 mt-2">Comprehensive performance insights and reporting</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => exportReport('pdf')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={() => exportReport('excel')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
          <div className="flex space-x-2">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' },
              { value: '1y', label: '1 Year' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as '7d' | '30d' | '90d' | '1y')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm text-gray-600">Total Complaints</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalComplaints}</p>
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  +15%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm text-gray-600">Resolution Rate</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round((analytics.resolvedComplaints / analytics.totalComplaints) * 100)}%
                </p>
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  {advancedMetrics.resolutionTrend}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm text-gray-600">Avg Resolution Time</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-gray-900">{analytics.averageResolutionTime}d</p>
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                  -0.5d
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm text-gray-600">Satisfaction Rate</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-gray-900">94.2%</p>
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  {advancedMetrics.satisfactionTrend}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Performance by Category</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {categoryPerformance.map((category) => (
                <div key={category.category} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{category.category}</span>
                    <span className="text-sm text-gray-600">{category.resolved}/{category.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(category.resolved / category.total) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Avg Time: </span>
                      <span className="font-medium">{category.avgTime}d</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Satisfaction: </span>
                      <span className="font-medium">{category.satisfaction}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regional Performance */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Performance by Region</h3>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {regionalData.map((region) => (
                <div key={region.region} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{region.region}</div>
                    <div className="text-sm text-gray-600">{region.resolved}/{region.complaints} resolved</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{region.satisfaction}%</div>
                    <div className="text-sm text-gray-600">satisfaction</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Trends Over Time</h3>
            <div className="flex space-x-2">
              {[
                { value: 'complaints', label: 'Complaints' },
                { value: 'resolution', label: 'Resolution' },
                { value: 'satisfaction', label: 'Satisfaction' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMetric(option.value as 'complaints' | 'resolution' | 'satisfaction')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    selectedMetric === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4">
            {timeSeriesData.map((data) => (
              <div key={data.period} className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {selectedMetric === 'complaints' && data.complaints}
                  {selectedMetric === 'resolution' && data.resolved}
                  {selectedMetric === 'satisfaction' && `${data.satisfaction}%`}
                </div>
                <div className="text-sm text-gray-600">{data.period}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Providers</h3>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProviders.map((provider, index) => (
                <div key={provider.name} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{provider.name}</div>
                    <div className="text-sm text-gray-600">{provider.department}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{provider.resolved} resolved</div>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-gray-600">{provider.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">System Health Metrics</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">System Uptime</span>
                  <span className="font-medium">{advancedMetrics.systemUptime}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${advancedMetrics.systemUptime}%` }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">API Response Time</span>
                  <span className="font-medium">{advancedMetrics.avgResponseTime}ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <div className="text-sm text-gray-600">Peak Hours</div>
                  <div className="font-medium text-gray-900">{advancedMetrics.peakHours}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Most Active Day</div>
                  <div className="font-medium text-gray-900">{advancedMetrics.mostActiveDay}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Emergency Response</div>
                  <div className="font-medium text-gray-900">{advancedMetrics.emergencyResponseTime}h avg</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Active Providers</div>
                  <div className="font-medium text-gray-900">{advancedMetrics.activeProviders}/{advancedMetrics.totalProviders}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;