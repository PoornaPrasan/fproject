import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  //Filter,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Eye,
  Edit,
  //MessageSquare,
  //Camera,
  //Upload
} from 'lucide-react';
import { useComplaints } from '../../contexts/ComplaintContext';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { ComplaintStatus, ComplaintCategory, Priority, Complaint } from '../../types';
import axios from 'axios';
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const ComplaintManagement: React.FC = () => {
  console.log('Rendering ComplaintManagement component'); // Debug log
  const { complaints = [], updateComplaintStatus, addComplaintUpdate, isLoading, refetchComplaints } = useComplaints();
  const { user } = useAuth();
  
  // Debug logs
  console.log('Complaints from context:', complaints);
  console.log('Current user:', user);

  useEffect(() => {
    console.log('ComplaintManagement component mounted');
    console.log('User role:', user?.role);

    if (!user) {
      console.log('No user found, redirecting to login');
      return;
    }

    refetchComplaints()
      .then(() => console.log('Complaints refetched successfully'))
      .catch((error) => console.error('Error refetching complaints:', error));
  }, [user, refetchComplaints]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('under_review');
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);

  // Fetch all complaints from the new backend endpoint
  useEffect(() => {
    const fetchAllComplaints = async () => {
      try {
        console.log('Fetching all complaints...');
        const response = await axios.get('/api/complaints/all');
        console.log('API response:', response.data);
        setAllComplaints(response.data.data || []);
      } catch (error) {
        console.error('Error fetching all complaints:', error);
      }
    };

    fetchAllComplaints();
  }, []);

  useEffect(() => {
    console.log('All complaints fetched:', allComplaints);
  }, [allComplaints]);

  // Filter complaints assigned to this provider
  const assignedComplaints = complaints.filter(c => c.assignedTo === user?.id || !c.assignedTo);
  
  const filteredComplaints = assignedComplaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    const matchesEmergency = !showEmergencyOnly || complaint.isEmergency;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesEmergency;
  });

  useEffect(() => {
    if (filteredComplaints.length > 0) {
      console.log('Complaints successfully fetched and displayed in Complaint Management tab');
    }
  }, [filteredComplaints.length]);

  const handleStatusUpdate = (complaintId: string, status: ComplaintStatus, message?: string) => {
    updateComplaintStatus(complaintId, status, message);
    setSelectedComplaint(null);
    setUpdateMessage('');
  };

  const handleAddUpdate = async (complaintId: string, message: string) => {
    try {
      await addComplaintUpdate(complaintId, message);
    setSelectedComplaint(null);
    setUpdateMessage('');
    } catch (error) {
      console.error('Error adding update:', error);
      // You might want to show an error message to the user here
    }
  };

  // Safe check for allComplaints
  if (!Array.isArray(allComplaints)) {
    console.error('allComplaints is not an array:', allComplaints);
    return <p>Error: Unable to load complaints.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaint Management</h1>
        <p className="text-gray-600 mt-2">Manage and resolve assigned complaints</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Assigned</p>
              <p className="text-2xl font-semibold text-gray-900">{assignedComplaints.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {assignedComplaints.filter(c => ['submitted', 'under_review', 'in_progress'].includes(c.status)).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {assignedComplaints.filter(c => c.status === 'resolved').length}
              </p>
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
                {assignedComplaints.filter(c => c.isEmergency).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <label className="flex items-center">
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
        {isLoading ? (
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
                        ID: {complaint.id}
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
                    <button
                      onClick={() => setSelectedComplaint(selectedComplaint === complaint.id ? null : complaint.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Update Status
                    </button>
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
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || showEmergencyOnly
                ? "No complaints match your current filters."
                : "No complaints have been assigned to you yet."
              }
            </p>
          </div>
        )}
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Complaints</h2>
        {allComplaints.length === 0 ? (
          <p className="text-gray-600">No complaints available.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allComplaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ComplaintManagement;