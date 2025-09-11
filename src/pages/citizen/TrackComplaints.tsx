import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Star,
  AlertTriangle,
  Search,
  Eye,
  X,
  Clock,
  CheckCircle,
  User,
  Camera,
  MessageSquare,
  Navigation,
  Flag,
  Share2
} from 'lucide-react';
import { useComplaints } from '../../contexts/ComplaintContext';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { ComplaintStatus, ComplaintCategory, Complaint } from '../../types';

const TrackComplaints: React.FC = () => {
  const { myComplaints, rateComplaint } = useComplaints();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'all'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false); // No need to fetch here, so loading is false
  
  // Remove useEffect that fetches complaints here

  // Use myComplaints directly
  const userComplaints = myComplaints;
  
  const filteredComplaints = userComplaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusProgress = (status: ComplaintStatus) => {
    const steps = ['submitted', 'under_review', 'in_progress', 'resolved'];
    const currentIndex = steps.indexOf(status);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const getStatusSteps = (status: ComplaintStatus) => {
    const steps = [
      { key: 'submitted', label: 'Submitted', icon: FileText },
      { key: 'under_review', label: 'Under Review', icon: Eye },
      { key: 'in_progress', label: 'In Progress', icon: Clock },
      { key: 'resolved', label: 'Resolved', icon: CheckCircle }
    ];
    
    const currentIndex = steps.findIndex(step => step.key === status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  const handleRateComplaint = () => {
    if (selectedComplaint && rating > 0) {
      rateComplaint(selectedComplaint.id, rating, feedback);
      setShowRatingModal(false);
      setSelectedComplaint(null);
      setRating(0);
      setFeedback('');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getTimeSince = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Track Your Complaints</h1>
        <p className="text-gray-600 mt-2">Monitor the progress of your submitted issues</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{userComplaints.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userComplaints.filter(c => ['submitted', 'under_review', 'in_progress'].includes(c.status)).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userComplaints.filter(c => c.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userComplaints.filter(c => c.rating).length > 0 
                  ? (userComplaints.reduce((sum, c) => sum + (c.rating || 0), 0) / userComplaints.filter(c => c.rating).length).toFixed(1)
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-6">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                      {complaint.isEmergency && (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
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
                      <span className="capitalize">{complaint.category.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <StatusBadge status={complaint.status} />
                    <StatusBadge priority={complaint.priority} />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(getStatusProgress(complaint.status))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getStatusProgress(complaint.status)}%` }}
                    />
                  </div>
                </div>

                {/* Updates */}
                {complaint.updates.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Latest Update</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{complaint.updates[complaint.updates.length - 1].message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(complaint.updates[complaint.updates.length - 1].createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Rating */}
                {complaint.status === 'resolved' && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Your Rating</h4>
                    {renderRating(complaint.rating)}
                    {complaint.feedback && (
                      <p className="text-sm text-gray-600 mt-1">{complaint.feedback}</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">
                    ID: {complaint.id}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                    {complaint.status === 'resolved' && !complaint.rating && (
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setShowRatingModal(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Rate Service
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? "No complaints match your current filters."
                : "You haven't submitted any complaints yet."
              }
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <Link
                to="/citizen/submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Submit Your First Complaint
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && !showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Complaint Details</h2>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{selectedComplaint.title}</h1>
                      {selectedComplaint.isEmergency && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Emergency
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed mb-4">{selectedComplaint.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Submitted:</span>
                          <span className="ml-2 font-medium">{formatDate(selectedComplaint.createdAt)}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Location:</span>
                          <span className="ml-2 font-medium">{selectedComplaint.location.address}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <FileText className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Category:</span>
                          <span className="ml-2 font-medium capitalize">{selectedComplaint.category.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Flag className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Priority:</span>
                          <StatusBadge priority={selectedComplaint.priority} className="ml-2" />
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Status:</span>
                          <StatusBadge status={selectedComplaint.status} className="ml-2" />
                        </div>
                        <div className="flex items-center text-sm">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Complaint ID:</span>
                          <span className="ml-2 font-medium font-mono">{selectedComplaint.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  {selectedComplaint.status === 'resolved' && !selectedComplaint.rating && (
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Rate Service
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Timeline</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    {getStatusSteps(selectedComplaint.status).map((step) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.key} className="relative flex items-center">
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed 
                              ? 'bg-blue-600 text-white' 
                              : step.current
                              ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium ${
                              step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {step.label}
                            </div>
                            {step.completed && (
                              <div className="text-xs text-gray-500">
                                {step.key === 'submitted' && formatDate(selectedComplaint.createdAt)}
                                {step.key === 'resolved' && selectedComplaint.resolvedAt && formatDate(selectedComplaint.resolvedAt)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Updates & Communication */}
              {selectedComplaint.updates.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Updates & Communication</h3>
                  <div className="space-y-4">
                    {selectedComplaint.updates.map((update) => (
                      <div key={update.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {update.type === 'status_change' ? 'Status Update' : 'Progress Update'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{getTimeSince(update.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{update.message}</p>
                        {update.attachments && update.attachments.length > 0 && (
                          <div className="mt-3 flex space-x-2">
                            {update.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center space-x-1 text-xs text-blue-600">
                                <Camera className="w-3 h-3" />
                                <span>{attachment.filename}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedComplaint.attachments.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedComplaint.attachments.map((attachment) => (
                      <div key={attachment.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        {attachment.type === 'image' ? (
                          <img
                            src={attachment.url}
                            alt={attachment.filename}
                            className="w-full h-24 object-cover rounded mb-2"
                          />
                        ) : (
                          <div className="w-full h-24 bg-gray-100 rounded mb-2 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <p className="text-xs text-gray-600 truncate">{attachment.filename}</p>
                        <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating & Feedback */}
              {selectedComplaint.status === 'resolved' && selectedComplaint.rating && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Rating & Feedback</h3>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= selectedComplaint.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedComplaint.rating}/5 Stars
                      </span>
                    </div>
                    {selectedComplaint.feedback && (
                      <p className="text-gray-700 leading-relaxed">{selectedComplaint.feedback}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Location Details */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">{selectedComplaint.location.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-medium text-gray-900">{selectedComplaint.location.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Region</p>
                      <p className="font-medium text-gray-900">{selectedComplaint.location.region}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Coordinates</p>
                      <p className="font-medium text-gray-900 font-mono text-xs">
                        {selectedComplaint.location.coordinates[1].toFixed(6)}, {selectedComplaint.location.coordinates[0].toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Rate This Service</h3>
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setRating(0);
                    setFeedback('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  How satisfied are you with the resolution of "{selectedComplaint.title}"?
                </p>
                
                <div className="flex justify-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-colors"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                
                <div className="text-center text-sm text-gray-600 mb-4">
                  {rating === 0 && "Click to rate"}
                  {rating === 1 && "Very Poor"}
                  {rating === 2 && "Poor"}
                  {rating === 3 && "Average"}
                  {rating === 4 && "Good"}
                  {rating === 5 && "Excellent"}
                </div>

                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your experience and feedback (optional)"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setRating(0);
                    setFeedback('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRateComplaint}
                  disabled={rating === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackComplaints;