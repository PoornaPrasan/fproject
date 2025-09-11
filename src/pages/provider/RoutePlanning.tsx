import React, { useState } from 'react';
import { 
  MapPin, 
 //Route, 
  Users, 
  Clock, 
  Calendar,
  //Truck,
  AlertTriangle,
  CheckCircle,
  User,
  //Phone,
  //Mail,
  //Navigation,
  //Settings,
  //BarChart3,
  //Filter,
  Search,
  Plus,
  //Edit,
  Save,
  X,
  FileText,
  //Eye,
  List,
  Grid
} from 'lucide-react';
import { useComplaints } from '../../contexts/ComplaintContext';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { ComplaintStatus, ComplaintCategory, Priority } from '../../types';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  availability: 'available' | 'busy' | 'offline';
  currentWorkload: number; // percentage
  maxTasksPerDay: number;
  currentTasks: number;
  skills: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  workingHours: {
    start: string;
    end: string;
  };
  estimatedCompletionTime: string;
}

interface RouteAssignment {
  id: string;
  staffId: string;
  complaints: string[];
  estimatedDuration: number;
  totalDistance: number;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'assigned' | 'in_progress' | 'completed';
  createdAt: Date;
  scheduledDate: Date;
}

const RoutePlanning: React.FC = () => {
  const { complaints } = useComplaints();
  const { user } = useAuth();
  
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'busy' | 'offline'>('all');
  const [routeName, setRouteName] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Complaint filtering states
  const [complaintSearchTerm, setComplaintSearchTerm] = useState('');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState<ComplaintCategory | 'all'>('all');
  const [complaintPriorityFilter, setComplaintPriorityFilter] = useState<Priority | 'all'>('all');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Mock staff data
  const fieldStaff: Staff[] = [
    {
      id: 'staff-1',
      name: 'John Martinez',
      email: 'john.martinez@provider.com',
      phone: '+1 (555) 123-4567',
      role: 'Senior Technician',
      availability: 'available',
      currentWorkload: 65,
      maxTasksPerDay: 8,
      currentTasks: 5,
      skills: ['Electrical', 'Street Lighting', 'Emergency Response'],
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'Downtown Service Center'
      },
      workingHours: { start: '08:00', end: '17:00' },
      estimatedCompletionTime: '14:30'
    },
    {
      id: 'staff-2',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@provider.com',
      phone: '+1 (555) 234-5678',
      role: 'Water Systems Specialist',
      availability: 'available',
      currentWorkload: 40,
      maxTasksPerDay: 6,
      currentTasks: 2,
      skills: ['Water Systems', 'Plumbing', 'Drainage'],
      location: {
        latitude: 40.7589,
        longitude: -73.9851,
        address: 'North District Office'
      },
      workingHours: { start: '07:00', end: '16:00' },
      estimatedCompletionTime: '12:15'
    },
    {
      id: 'staff-3',
      name: 'Mike Chen',
      email: 'mike.chen@provider.com',
      phone: '+1 (555) 345-6789',
      role: 'Road Maintenance Crew Lead',
      availability: 'busy',
      currentWorkload: 90,
      maxTasksPerDay: 10,
      currentTasks: 9,
      skills: ['Road Repair', 'Heavy Equipment', 'Traffic Management'],
      location: {
        latitude: 40.6892,
        longitude: -74.0445,
        address: 'South Maintenance Yard'
      },
      workingHours: { start: '06:00', end: '15:00' },
      estimatedCompletionTime: '16:45'
    },
    {
      id: 'staff-4',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@provider.com',
      phone: '+1 (555) 456-7890',
      role: 'Sanitation Supervisor',
      availability: 'available',
      currentWorkload: 55,
      maxTasksPerDay: 7,
      currentTasks: 4,
      skills: ['Waste Management', 'Environmental Safety', 'Team Leadership'],
      location: {
        latitude: 40.7831,
        longitude: -73.9712,
        address: 'East Side Depot'
      },
      workingHours: { start: '05:00', end: '14:00' },
      estimatedCompletionTime: '13:20'
    },
    {
      id: 'staff-5',
      name: 'David Kim',
      email: 'david.kim@provider.com',
      phone: '+1 (555) 567-8901',
      role: 'Emergency Response Technician',
      availability: 'offline',
      currentWorkload: 0,
      maxTasksPerDay: 12,
      currentTasks: 0,
      skills: ['Emergency Response', 'Multi-Service', 'Crisis Management'],
      location: {
        latitude: 40.7282,
        longitude: -73.7949,
        address: 'Emergency Response Center'
      },
      workingHours: { start: '00:00', end: '23:59' },
      estimatedCompletionTime: 'Off Duty'
    }
  ];

  // Filter available complaints for assignment
  const availableComplaints = complaints.filter(c => 
    c.assignedTo === user?.id && 
    ['submitted', 'under_review', 'in_progress'].includes(c.status)
  );

  // Filter complaints based on search and filters
  const filteredComplaints = availableComplaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(complaintSearchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(complaintSearchTerm.toLowerCase()) ||
                         complaint.location.address.toLowerCase().includes(complaintSearchTerm.toLowerCase());
    const matchesStatus = complaintStatusFilter === 'all' || complaint.status === complaintStatusFilter;
    const matchesCategory = complaintCategoryFilter === 'all' || complaint.category === complaintCategoryFilter;
    const matchesPriority = complaintPriorityFilter === 'all' || complaint.priority === complaintPriorityFilter;
    const matchesEmergency = !showEmergencyOnly || complaint.isEmergency;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesEmergency;
  });

  const filteredStaff = fieldStaff.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || staff.availability === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleComplaintSelect = (complaintId: string) => {
    setSelectedComplaints(prev => 
      prev.includes(complaintId) 
        ? prev.filter(id => id !== complaintId)
        : [...prev, complaintId]
    );
  };

  const handleSelectAllComplaints = () => {
    if (selectedComplaints.length === filteredComplaints.length) {
      setSelectedComplaints([]);
    } else {
      setSelectedComplaints(filteredComplaints.map(c => c.id));
    }
  };

  const handleAssignRoute = () => {
    if (selectedComplaints.length === 0 || !selectedStaff) {
      alert('Please select complaints and staff member');
      return;
    }

    // Calculate estimated duration and distance
    const estimatedDuration = selectedComplaints.length * 2; // 2 hours per complaint
    const totalDistance = selectedComplaints.length * 5; // 5 km per complaint

    const newRoute: RouteAssignment = {
      id: `route-${Date.now()}`,
      staffId: selectedStaff,
      complaints: selectedComplaints,
      estimatedDuration,
      totalDistance,
      priority: selectedComplaints.some(id => 
        availableComplaints.find(c => c.id === id)?.isEmergency
      ) ? 'high' : 'medium',
      status: 'assigned',
      createdAt: new Date(),
      scheduledDate: new Date(scheduledDate)
    };

    console.log('Assigning route:', newRoute);
    
    // Reset form
    setSelectedComplaints([]);
    setSelectedStaff('');
    setRouteName('');
    setShowAssignModal(false);
    
    alert('Route assigned successfully!');
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-600 bg-green-50';
      case 'busy': return 'text-orange-600 bg-orange-50';
      case 'offline': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 80) return 'bg-red-500';
    if (workload >= 60) return 'bg-orange-500';
    if (workload >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Route Planning</h1>
            <p className="text-gray-600 mt-2">Select complaints and assign optimized routes to field staff</p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            disabled={selectedComplaints.length === 0 || !selectedStaff}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Route ({selectedComplaints.length})
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Available Staff</p>
              <p className="text-2xl font-semibold text-gray-900">
                {fieldStaff.filter(s => s.availability === 'available').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Complaints</p>
              <p className="text-2xl font-semibold text-gray-900">{availableComplaints.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Selected</p>
              <p className="text-2xl font-semibold text-gray-900">{selectedComplaints.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Est. Duration</p>
              <p className="text-2xl font-semibold text-gray-900">{selectedComplaints.length * 2}h</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Emergencies</p>
              <p className="text-2xl font-semibold text-gray-900">
                {availableComplaints.filter(c => c.isEmergency).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Complaint Selection - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Complaints for Route</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Complaint Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={complaintSearchTerm}
                  onChange={(e) => setComplaintSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={complaintStatusFilter}
                onChange={(e) => setComplaintStatusFilter(e.target.value as ComplaintStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="in_progress">In Progress</option>
              </select>
              
              <select
                value={complaintCategoryFilter}
                onChange={(e) => setComplaintCategoryFilter(e.target.value as ComplaintCategory | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="electricity">Electricity</option>
                <option value="water">Water</option>
                <option value="roads">Roads</option>
                <option value="sanitation">Sanitation</option>
                <option value="street_lights">Street Lights</option>
                <option value="drainage">Drainage</option>
                <option value="public_transport">Public Transport</option>
                <option value="other">Other</option>
              </select>
              
              <select
                value={complaintPriorityFilter}
                onChange={(e) => setComplaintPriorityFilter(e.target.value as Priority | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Additional Filters */}
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showEmergencyOnly}
                  onChange={(e) => setShowEmergencyOnly(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Emergency Only</span>
              </label>
              
              <button
                onClick={handleSelectAllComplaints}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedComplaints.length === filteredComplaints.length ? 'Deselect All' : 'Select All'} ({filteredComplaints.length})
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'} max-h-96 overflow-y-auto`}>
              {filteredComplaints.map((complaint) => (
                <div 
                  key={complaint.id} 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedComplaints.includes(complaint.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => handleComplaintSelect(complaint.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{complaint.title}</h4>
                        {complaint.isEmergency && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <input
                          type="checkbox"
                          checked={selectedComplaints.includes(complaint.id)}
                          onChange={() => handleComplaintSelect(complaint.id)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{complaint.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{complaint.location.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                        <span className="capitalize">{complaint.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1 ml-2">
                      <StatusBadge status={complaint.status} />
                      <StatusBadge priority={complaint.priority} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredComplaints.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
                <p className="text-gray-500">
                  {complaintSearchTerm || complaintStatusFilter !== 'all' || complaintCategoryFilter !== 'all' || complaintPriorityFilter !== 'all' || showEmergencyOnly
                    ? "No complaints match your current filters."
                    : "No complaints available for assignment."
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Staff Selection - Takes 1 column */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Select Staff Member</h3>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'available' | 'busy' | 'offline')}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredStaff.map((staff) => (
                <div 
                  key={staff.id} 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedStaff === staff.id
                      ? 'border-blue-500 bg-blue-50'
                      : staff.availability === 'offline'
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => staff.availability !== 'offline' && setSelectedStaff(staff.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{staff.name}</h4>
                        <p className="text-sm text-gray-600">{staff.role}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(staff.availability)}`}>
                          {staff.availability}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {staff.currentTasks}/{staff.maxTasksPerDay}
                      </div>
                      <div className="text-xs text-gray-500">tasks</div>
                    </div>
                  </div>

                  {/* Workload Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Workload</span>
                      <span>{staff.currentWorkload}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getWorkloadColor(staff.currentWorkload)}`}
                        style={{ width: `${staff.currentWorkload}%` }}
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 mb-1">Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {staff.skills.slice(0, 2).map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {skill}
                        </span>
                      ))}
                      {staff.skills.length > 2 && (
                        <span className="text-xs text-gray-500">+{staff.skills.length - 2} more</span>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center mb-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{staff.workingHours.start}-{staff.workingHours.end}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{staff.location.address}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Items Summary */}
      {(selectedComplaints.length > 0 || selectedStaff) && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Route Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Selected Staff</h4>
              {selectedStaff ? (
                <div className="bg-white rounded-lg p-3">
                  <p className="font-medium text-gray-900">
                    {fieldStaff.find(s => s.id === selectedStaff)?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {fieldStaff.find(s => s.id === selectedStaff)?.role}
                  </p>
                </div>
              ) : (
                <p className="text-blue-700">No staff selected</p>
              )}
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Route Details</h4>
              <div className="bg-white rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Complaints:</span>
                    <span className="font-medium ml-2">{selectedComplaints.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Est. Duration:</span>
                    <span className="font-medium ml-2">{selectedComplaints.length * 2}h</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Est. Distance:</span>
                    <span className="font-medium ml-2">{selectedComplaints.length * 5} km</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Emergencies:</span>
                    <span className="font-medium ml-2">
                      {selectedComplaints.filter(id => 
                        availableComplaints.find(c => c.id === id)?.isEmergency
                      ).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Assign Route to Field Staff</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Route Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Route Name</label>
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="Enter route name (e.g., Downtown Morning Route)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Scheduled Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Selected Staff */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selected Staff Member</label>
                  {selectedStaff ? (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">
                            {fieldStaff.find(s => s.id === selectedStaff)?.name}
                          </p>
                          <p className="text-sm text-blue-700">
                            {fieldStaff.find(s => s.id === selectedStaff)?.role}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedStaff('')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                      Please select a staff member from the availability list
                    </p>
                  )}
                </div>

                {/* Selected Complaints */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Complaints ({selectedComplaints.length})
                  </label>
                  {selectedComplaints.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedComplaints.map(complaintId => {
                        const complaint = availableComplaints.find(c => c.id === complaintId);
                        return complaint ? (
                          <div key={complaintId} className="p-2 bg-gray-50 rounded border">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                                <p className="text-xs text-gray-600">{complaint.location.address}</p>
                              </div>
                              <button
                                onClick={() => handleComplaintSelect(complaintId)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                      Please select complaints from the available list
                    </p>
                  )}
                </div>

                {/* Route Summary */}
                {selectedComplaints.length > 0 && selectedStaff && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">Route Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700">Total Tasks:</span>
                        <span className="font-medium ml-2">{selectedComplaints.length}</span>
                      </div>
                      <div>
                        <span className="text-green-700">Estimated Duration:</span>
                        <span className="font-medium ml-2">{selectedComplaints.length * 2}h</span>
                      </div>
                      <div>
                        <span className="text-green-700">Estimated Distance:</span>
                        <span className="font-medium ml-2">{selectedComplaints.length * 5} km</span>
                      </div>
                      <div>
                        <span className="text-green-700">Priority Level:</span>
                        <span className="font-medium ml-2">
                          {selectedComplaints.some(id => 
                            availableComplaints.find(c => c.id === id)?.isEmergency
                          ) ? 'High' : 'Medium'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignRoute}
                  disabled={selectedComplaints.length === 0 || !selectedStaff}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Assign Route
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePlanning;