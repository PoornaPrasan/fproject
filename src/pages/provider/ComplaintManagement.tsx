import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Search,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Eye,
  Edit,
  UserCheck
} from 'lucide-react';
import { useComplaints } from '../../contexts/ComplaintContext';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { ComplaintStatus, ComplaintCategory, Priority, Complaint } from '../../types';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const ComplaintManagement: React.FC = () => {
  const { updateComplaintStatus, addComplaintUpdate, isLoading } = useComplaints();
  const { user } = useAuth();
  
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'assigned_to_me' | 'unassigned'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('under_review');

  // Fetch all complaints from the backend
  useEffect(() => {
    const fetchAllComplaints = async () => {
      setLoadingComplaints(true);
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user || !user.token) {
          console.log('No authenticated user found');
          return;
        }

        const response = await fetch('http://localhost:5000/api/v1/complaints', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch complaints: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.data?.complaints) {
          // Transform the data to match our Complaint interface
          const transformedComplaints = data.data.complaints.map((complaint: any) => ({
            id: complaint._id,
            _id: complaint._id,
            title: complaint.title,
            description: complaint.description,
            category: complaint.category,
            status: complaint.status,
            priority: complaint.priority,
            location: {
              type: complaint.location.type,
              coordinates: complaint.location.coordinates,
              address: complaint.location.address,
              city: complaint.location.city,
              region: complaint.location.region,
              latitude: complaint.location.coordinates[1],
              longitude: complaint.location.coordinates[0]
            },
            submittedBy: complaint.submittedBy?._id || complaint.submittedBy,
            assignedTo: complaint.assignedTo?._id || complaint.assignedTo,
            attachments: complaint.attachments || [],
            isEmergency: complaint.isEmergency,
            createdAt: new Date(complaint.createdAt),
            updatedAt: new Date(complaint.updatedAt),
            resolvedAt: complaint.resolvedAt ? new Date(complaint.resolvedAt) : undefined,
            rating: complaint.rating,
            feedback: complaint.feedback,
            updates: complaint.updates || [],
            department: complaint.department?.name || complaint.department,
            departmentId: complaint.department?._id || complaint.department
          }));
          
          setAllComplaints(transformedComplaints);
          console.log('Fetched all complaints:', transformedComplaints.length);
        }
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoadingComplaints(false);
      }
    };

    fetchAllComplaints();
  }, []);

  // Filter complaints based on assignment and other filters
  const filteredComplaints = allComplaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    const matchesEmergency = !showEmergencyOnly || complaint.isEmergency;
    
    // Assignment filter
    let matchesAssignment = true;
    if (assignmentFilter === 'assigned_to_me') {
      matchesAssignment = complaint.assignedTo === user?.id;
    } else if (assignmentFilter === 'unassigned') {
      matchesAssignment = !complaint.assignedTo;
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesEmergency && matchesAssignment;
  });

  // Calculate stats based on all complaints
  const assignedToMe = allComplaints.filter(c => c.assignedTo === user?.id);
  const unassignedComplaints = allComplaints.filter(c => !c.assignedTo);
  const emergencyComplaints = allComplaints.filter(c => c.isEmergency && !['resolved', 'closed'].includes(c.status));

  const handleStatusUpdate = async (complaintId: string, status: ComplaintStatus, message?: string) => {
    try {
      await updateComplaintStatus(complaintId, status, message);
      // Refresh the complaints list
      const updatedComplaints = allComplaints.map(c => 
        c.id === complaintId ? { ...c, status } : c
      );
      setAllComplaints(updatedComplaints);
      setSelectedComplaint(null);
      setUpdateMessage('');
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const handleAddUpdate = async (complaintId: string, message: string) => {
    try {
      await addComplaintUpdate(complaintId, message);
      setSelectedComplaint(null);
      setUpdateMessage('');
    } catch (error) {
      console.error('Error adding update:', error);
    }
  };

  const handleAssignToMe = async (complaintId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user || !user.token) return;

      const response = await fetch(`http://localhost:5000/api/v1/complaints/${complaintId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ assignedTo: user.id })
      });

      if (response.ok) {
        // Update local state
        const updatedComplaints = allComplaints.map(c => 
          c.id === complaintId ? { ...c, assignedTo: user.id, status: 'under_review' as ComplaintStatus } : c
        );
        setAllComplaints(updatedComplaints);
      }
    } catch (error) {
      console.error('Error assigning complaint:', error);
    }
  };

  if (loadingComplaints) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaint Management</h1>
        <p className="text-gray-600 mt-2">View and manage all citizen complaints in the system</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Complaints</p>
              <p className="text-2xl font-semibold text-gray-900">{allComplaints.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Assigned to Me</p>
              <p className="text-2xl font-semibold text-gray-900">{assignedToMe.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Unassigned</p>
              <p className="text-2xl font-semibold text-gray-900">{unassignedComplaints.length}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{emergencyComplaints.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment</label>
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value as 'all' | 'assigned_to_me' | 'unassigned')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Complaints</option>
              <option value="assigned_to_me">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ComplaintCategory | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency</label>
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={showEmergencyOnly}
                onChange={(e) => setShowEmergencyOnly(e.target.checked)}
                className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Emergency Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-6">
        {isLoading || loadingComplaints ? (
          <LoadingSpinner />
        ) : filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                      {complaint.isEmergency && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Emergency
                        </span>
                      )}
                      {complaint.assignedTo === user?.id && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Assigned to You
                        </span>
                      )}
                      {!complaint.assignedTo && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Unassigned
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{complaint.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {complaint.location.address}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        ID: {complaint.id.slice(-8)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <StatusBadge status={complaint.status} />
                    <StatusBadge priority={complaint.priority} />
                    <span className="text-xs text-gray-500 capitalize">
                      {complaint.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>
                      {complaint.status === 'submitted' ? '25%' :
                       complaint.status === 'under_review' ? '50%' :
                       complaint.status === 'in_progress' ? '75%' :
                       complaint.status === 'resolved' ? '100%' : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        complaint.status === 'resolved' ? 'bg-green-600' :
                        complaint.status === 'in_progress' ? 'bg-orange-600' :
                        complaint.status === 'under_review' ? 'bg-blue-600' :
                        'bg-yellow-600'
                      }`}
                      style={{ 
                        width: complaint.status === 'submitted' ? '25%' :
                               complaint.status === 'under_review' ? '50%' :
                               complaint.status === 'in_progress' ? '75%' :
                               complaint.status === 'resolved' ? '100%' : '0%'
                      }}
                    />
                  </div>
                </div>

                {/* Latest Update */}
                {complaint.updates.length > 0 && (
                  <div className="mb-4 bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Latest Update</h4>
                    <p className="text-sm text-gray-700">{complaint.updates[complaint.updates.length - 1].message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(complaint.updates[complaint.updates.length - 1].createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Link
                      to={`/provider/complaint/${complaint.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Link>
                    
                    {!complaint.assignedTo && (
                      <button
                        onClick={() => handleAssignToMe(complaint.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Assign to Me
                      </button>
                    )}
                    
                    {(complaint.assignedTo === user?.id || user?.role === 'admin') && (
                      <button
                        onClick={() => setSelectedComplaint(selectedComplaint === complaint.id ? null : complaint.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Update Status
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date(complaint.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Update Form */}
                {selectedComplaint === complaint.id && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Update Complaint Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="under_review">Under Review</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Update Message</label>
                      <textarea
                        value={updateMessage}
                        onChange={(e) => setUpdateMessage(e.target.value)}
                        placeholder="Provide details about the status update..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(complaint.id, newStatus, updateMessage)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Update Status
                      </button>
                      <button
                        onClick={() => handleAddUpdate(complaint.id, updateMessage)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Add Update Only
                      </button>
                      <button
                        onClick={() => setSelectedComplaint(null)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || showEmergencyOnly || assignmentFilter !== 'all'
                ? "No complaints match your current filters."
                : "No complaints are available in the system."
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{allComplaints.length}</div>
            <div className="text-sm text-gray-600">Total Complaints</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {allComplaints.filter(c => c.status === 'resolved').length}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {allComplaints.filter(c => ['submitted', 'under_review', 'in_progress'].includes(c.status)).length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(((allComplaints.filter(c => c.status === 'resolved').length / allComplaints.length) * 100) || 0)}%
            </div>
            <div className="text-sm text-gray-600">Resolution Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintManagement;