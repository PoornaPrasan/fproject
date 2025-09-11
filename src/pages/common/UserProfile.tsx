import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  //MapPin, 
  Shield, 
  Edit, 
  Save, 
  X, 
  Camera, 
  //Bell, 
  Lock, 
  Settings, 
  FileText, 
  Star, 
  //Award, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useComplaints } from '../../contexts/ComplaintContext';
import LocationPicker from '../../components/common/LocationPicker';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings' | 'security'>('overview');

  // Get user-specific data
  const userComplaints = complaints.filter(c => c.submittedBy === user?.id);
  const assignedComplaints = complaints.filter(c => c.assignedTo === user?.id);

  const handleSave = () => {
    // In a real app, this would update the user profile via API
    console.log('Saving user profile:', editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedUser(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'citizen': return User;
      case 'provider': return FileText;
      case 'admin': return Shield;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'citizen': return 'text-blue-600 bg-blue-50';
      case 'provider': return 'text-green-600 bg-green-50';
      case 'admin': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getUserStats = () => {
    if (user?.role === 'citizen') {
      return {
        total: userComplaints.length,
        resolved: userComplaints.filter(c => c.status === 'resolved').length,
        pending: userComplaints.filter(c => ['submitted', 'under_review', 'in_progress'].includes(c.status)).length,
        avgRating: userComplaints.filter(c => c.rating).length > 0
          ? userComplaints.reduce((sum, c) => sum + (c.rating || 0), 0) / userComplaints.filter(c => c.rating).length
          : 0
      };
    } else if (user?.role === 'provider') {
      return {
        total: assignedComplaints.length,
        resolved: assignedComplaints.filter(c => c.status === 'resolved').length,
        pending: assignedComplaints.filter(c => ['submitted', 'under_review', 'in_progress'].includes(c.status)).length,
        avgRating: assignedComplaints.filter(c => c.rating).length > 0
          ? assignedComplaints.reduce((sum, c) => sum + (c.rating || 0), 0) / assignedComplaints.filter(c => c.rating).length
          : 0
      };
    }
    return { total: 0, resolved: 0, pending: 0, avgRating: 0 };
  };

  const stats = getUserStats();
  const RoleIcon = getRoleIcon(user?.role || '');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: Lock }
  ];

  // Assume you have access to the current user's ID, e.g., from context or props
  const userId = user?.id;

  const handleLocationSelect = async (coords: [number, number]) => {
    if (!userId) {
      alert('User ID not available.');
      return;
    }
    try {
      const res = await fetch(`/api/v1/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: { latitude: coords[0], longitude: coords[1] } }),
        credentials: 'include',
      });
      if (res.ok) {
        alert('Location saved!');
      } else {
        alert('Failed to save location');
      }
    } catch {
      alert('Error saving location');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {editedUser.avatar ? (
                <img
                  src={editedUser.avatar}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center ring-4 ring-blue-100">
                  <User className="w-12 h-12 text-gray-500" />
                </div>
              )}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 bg-transparent focus:outline-none"
                  />
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                    className="text-gray-600 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="tel"
                    value={editedUser.phone}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="text-gray-600 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role || '')}`}>
              <RoleIcon className="w-4 h-4 mr-1" />
              {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
            </span>
            
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">
                {user?.role === 'citizen' ? 'Complaints Submitted' : 
                 user?.role === 'provider' ? 'Tasks Assigned' : 'Total Oversight'}
              </p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'activity' | 'settings' | 'security')}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-medium text-gray-900">{user?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-medium text-gray-900">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Account Type</p>
                        <p className="font-medium text-gray-900 capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-medium text-gray-900">
                          {new Date(user?.createdAt || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {(user?.role === 'citizen' ? userComplaints : assignedComplaints)
                    .slice(0, 3)
                    .map((complaint) => (
                      <div key={complaint.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {complaint.isEmergency ? (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(complaint.createdAt).toLocaleDateString()} • {complaint.status}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h3>
              <div className="space-y-4">
                {(user?.role === 'citizen' ? userComplaints : assignedComplaints).map((complaint) => (
                  <div key={complaint.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{complaint.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{complaint.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                          <span className="capitalize">{complaint.category.replace('_', ' ')}</span>
                          <span>{complaint.location.address}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        complaint.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                        complaint.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                    <span className="ml-2 text-sm text-gray-700">Email notifications for status updates</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                    <span className="ml-2 text-sm text-gray-700">SMS notifications for urgent issues</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                    <span className="ml-2 text-sm text-gray-700">Weekly summary reports</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                    <span className="ml-2 text-sm text-gray-700">Make my profile visible to other users</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                    <span className="ml-2 text-sm text-gray-700">Allow location tracking for better service</span>
                  </label>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Your Current Location</h3>
              <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Security</h3>
                <div className="space-y-4">
                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Change Password</p>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      </div>
                      <Shield className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                <div className="space-y-4">
                  <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">Delete Account</p>
                        <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                      </div>
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;