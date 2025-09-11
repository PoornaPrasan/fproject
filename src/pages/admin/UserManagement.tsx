import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  //Filter,
  Plus,
  Edit,
  Trash2,
  Shield,
  User,
  FileText,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  X,
  Save,
  //Upload,
  Camera
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'provider' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: Date;
  lastLogin: Date;
  complaintsCount?: number;
  resolvedCount?: number;
  rating?: number;
  department?: string;
  phone?: string;
  avatar?: string;
}

interface AddUserFormData {
  name: string;
  email: string;
  phone: string;
  role: 'citizen' | 'provider' | 'admin';
  department?: string;
  avatar?: string;
}

interface EditUserFormData {
  name: string;
  email: string;
  phone: string;
  role: 'citizen' | 'provider' | 'admin';
  department?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'citizen' | 'provider' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add User Form State
  const [addUserForm, setAddUserForm] = useState<AddUserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'citizen',
    department: '',
    avatar: ''
  });

  // Edit User Form State
  const [editUserForm, setEditUserForm] = useState<EditUserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'citizen',
    department: '',
    avatar: '',
    status: 'active'
  });

  // State for users fetched from backend
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        // Fetch both citizens and providers
        const [citizensRes, providersRes] = await Promise.all([
          fetch('http://localhost:5000/api/v1/users?role=citizen', {
            headers: { 'Authorization': `Bearer ${user.token || ''}` }
          }),
          fetch('http://localhost:5000/api/v1/users?role=provider', {
            headers: { 'Authorization': `Bearer ${user.token || ''}` }
          })
        ]);
        const citizensData = await citizensRes.json();
        const providersData = await providersRes.json();
        
        // Map backend data to frontend format
        const mapUserData = (backendUser: any): UserData => ({
          id: backendUser._id,
          name: backendUser.name,
          email: backendUser.email,
          role: backendUser.role,
          status: backendUser.isActive ? 'active' : 'inactive',
          joinDate: new Date(backendUser.createdAt),
          lastLogin: backendUser.lastLogin ? new Date(backendUser.lastLogin) : new Date(),
          complaintsCount: backendUser.complaintsCount || 0,
          resolvedCount: backendUser.resolvedCount || 0,
          rating: backendUser.rating || 0,
          department: backendUser.department || '',
          phone: backendUser.phone || '',
          avatar: backendUser.avatar || ''
        });

        // Combine and map both arrays
        const allUsers = [
          ...(citizensData.data || []).map(mapUserData),
          ...(providersData.data || []).map(mapUserData)
        ];
        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  
  const filteredUsers = users.filter(userData => {
    const matchesSearch = userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userData.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || userData.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || userData.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'suspended': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleUserAction = (userId: string, action: string) => {
    console.log(`Performing ${action} on user ${userId}`);
    setSelectedUser(null);
  };

  const handleAddUserFormChange = (field: keyof AddUserFormData, value: string) => {
    setAddUserForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditUserFormChange = (field: keyof EditUserFormData, value: string) => {
    setEditUserForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (isEdit) {
          setEditUserForm(prev => ({ ...prev, avatar: e.target?.result as string }));
        } else {
          setAddUserForm(prev => ({ ...prev, avatar: e.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Adding new user:', addUserForm);
      
      // Reset form and close modal
      setAddUserForm({
        name: '',
        email: '',
        phone: '',
        role: 'citizen',
        department: '',
        avatar: ''
      });
      setShowAddUser(false);
      
      // Show success message (in real app, would refresh user list)
      alert('User added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Updating user:', showEditUser, editUserForm);
      
      // Close modal
      setShowEditUser(null);
      
      // Show success message (in real app, would refresh user list)
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (userData: UserData) => {
    setEditUserForm({
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role,
      department: userData.department || '',
      avatar: userData.avatar || '',
      status: userData.status
    });
    setShowEditUser(userData.id);
    setSelectedUser(null);
  };

  const userStats = {
    total: users.length,
    citizens: users.filter(u => u.role === 'citizen').length,
    providers: users.filter(u => u.role === 'provider').length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.status === 'active').length
  };

  const departments = [
    'Water Services',
    'Electricity',
    'Roads & Transportation',
    'Sanitation',
    'Street Lighting',
    'Environmental Services',
    'Emergency Services'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage citizen, provider, and admin accounts</p>
          </div>
          <button
            onClick={() => setShowAddUser(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{userStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Citizens</p>
              <p className="text-2xl font-semibold text-gray-900">{userStats.citizens}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Providers</p>
              <p className="text-2xl font-semibold text-gray-900">{userStats.providers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-semibold text-gray-900">{userStats.admins}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-semibold text-gray-900">{userStats.active}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'citizen' | 'provider' | 'admin')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="citizen">Citizens</option>
              <option value="provider">Providers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'suspended')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userData) => {
                  const RoleIcon = getRoleIcon(userData.role);
                  return (
                    <tr key={userData.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                            <div className="text-sm text-gray-500">{userData.email}</div>
                            {userData.phone && (
                              <div className="text-xs text-gray-400">{userData.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userData.role)}`}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {userData.role}
                          </span>
                        </div>
                        {userData.department && (
                          <div className="text-xs text-gray-500 mt-1">{userData.department}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userData.status)}`}>
                          {userData.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userData.role === 'citizen' && userData.complaintsCount !== undefined && (
                          <div>
                            <div className="text-sm font-medium">{userData.complaintsCount} complaints</div>
                          </div>
                        )}
                        {userData.role === 'provider' && (
                          <div>
                            <div className="text-sm font-medium">{userData.resolvedCount} resolved</div>
                            {userData.rating && (
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500">Rating: {userData.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {userData.role === 'admin' && (
                          <div className="text-sm text-gray-500">System Admin</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userData.lastLogin.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => setSelectedUser(selectedUser === userData.id ? null : userData.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {selectedUser === userData.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setShowUserProfile(userData.id);
                                    setSelectedUser(null);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Profile
                                </button>
                                <button
                                  onClick={() => openEditModal(userData)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit User
                                </button>
                                {userData.status === 'active' ? (
                                  <button
                                    onClick={() => handleUserAction(userData.id, 'suspend')}
                                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Suspend User
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUserAction(userData.id, 'activate')}
                                    className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Activate User
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUserAction(userData.id, 'delete')}
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filteredUsers.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? "No users match your current filters."
              : "No users have been registered yet."
            }
          </p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleAddUser}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      {addUserForm.avatar ? (
                        <img
                          src={addUserForm.avatar}
                          alt="User avatar"
                          className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-100"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center ring-4 ring-blue-100">
                          <User className="w-10 h-10 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                      <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Camera className="w-4 h-4 mr-2" />
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAvatarUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={addUserForm.name}
                        onChange={(e) => handleAddUserFormChange('name', e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={addUserForm.email}
                        onChange={(e) => handleAddUserFormChange('email', e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={addUserForm.phone}
                        onChange={(e) => handleAddUserFormChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                      <select
                        required
                        value={addUserForm.role}
                        onChange={(e) => handleAddUserFormChange('role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="provider">Service Provider</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>

                  {/* Department (for providers only) */}
                  {addUserForm.role === 'provider' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select
                        value={addUserForm.department}
                        onChange={(e) => handleAddUserFormChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Role Description */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Role Permissions</h4>
                    <div className="text-sm text-gray-600">
                      {addUserForm.role === 'citizen' && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Submit and track complaints</li>
                          <li>Rate and review services</li>
                          <li>View community activity</li>
                          <li>Manage personal profile</li>
                        </ul>
                      )}
                      {addUserForm.role === 'provider' && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Manage assigned complaints</li>
                          <li>Update complaint status</li>
                          <li>View performance analytics</li>
                          <li>Manage field tasks and routes</li>
                        </ul>
                      )}
                      {addUserForm.role === 'admin' && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Full system administration</li>
                          <li>Manage users and departments</li>
                          <li>View system analytics</li>
                          <li>Configure system settings</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !addUserForm.name || !addUserForm.email}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleEditUser}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Edit User Details</h3>
                  <button
                    type="button"
                    onClick={() => setShowEditUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      {editUserForm.avatar ? (
                        <img
                          src={editUserForm.avatar}
                          alt="User avatar"
                          className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-100"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center ring-4 ring-blue-100">
                          <User className="w-10 h-10 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                      <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAvatarUpload(e, true)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={editUserForm.name}
                        onChange={(e) => handleEditUserFormChange('name', e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={editUserForm.email}
                        onChange={(e) => handleEditUserFormChange('email', e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={editUserForm.phone}
                        onChange={(e) => handleEditUserFormChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                      <select
                        required
                        value={editUserForm.role}
                        onChange={(e) => handleEditUserFormChange('role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="provider">Service Provider</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                      <select
                        required
                        value={editUserForm.status}
                        onChange={(e) => handleEditUserFormChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  {/* Department (for providers only) */}
                  {editUserForm.role === 'provider' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select
                        value={editUserForm.department}
                        onChange={(e) => handleEditUserFormChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Status Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Account Status Information</h4>
                    <div className="text-sm text-gray-600">
                      {editUserForm.status === 'active' && (
                        <p className="text-green-700">✓ User has full access to all features and can use the system normally.</p>
                      )}
                      {editUserForm.status === 'inactive' && (
                        <p className="text-gray-700">⚪ User account is inactive but can be reactivated at any time.</p>
                      )}
                      {editUserForm.status === 'suspended' && (
                        <p className="text-red-700">⚠️ User access is temporarily suspended. They cannot log in or use the system.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditUser(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !editUserForm.name || !editUserForm.email}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update User
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">User Profile</h3>
                <button
                  onClick={() => setShowUserProfile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User Profile Content */}
              {(() => {
                const selectedUserData = users.find(u => u.id === showUserProfile);
                if (!selectedUserData) return null;

                return (
                  <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center ring-4 ring-blue-100">
                          <User className="w-12 h-12 text-gray-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedUserData.name}</h2>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{selectedUserData.email}</span>
                        </div>
                        {selectedUserData.phone && (
                          <div className="flex items-center space-x-2 mt-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{selectedUserData.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Member since {selectedUserData.joinDate.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 mt-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUserData.role)}`}>
                            {getRoleIcon(selectedUserData.role)({ className: "w-4 h-4 mr-1" })}
                            {selectedUserData.role.charAt(0).toUpperCase()}{selectedUserData.role.slice(1)}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUserData.status)}`}>
                            {selectedUserData.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openEditModal(selectedUserData)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit Profile
                        </button>
                      </div>
                    </div>

                    {/* Profile Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Account Information</h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">User ID:</span>
                              <span className="text-sm font-medium text-gray-900">{selectedUserData.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Last Login:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {selectedUserData.lastLogin.toLocaleDateString()}
                              </span>
                            </div>
                            {selectedUserData.department && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Department:</span>
                                <span className="text-sm font-medium text-gray-900">{selectedUserData.department}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Metrics</h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            {selectedUserData.role === 'citizen' && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Complaints Submitted:</span>
                                  <span className="text-sm font-medium text-gray-900">{selectedUserData.complaintsCount || 0}</span>
                                </div>
                              </>
                            )}
                            {selectedUserData.role === 'provider' && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Complaints Resolved:</span>
                                  <span className="text-sm font-medium text-gray-900">{selectedUserData.resolvedCount || 0}</span>
                                </div>
                                {selectedUserData.rating && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Average Rating:</span>
                                    <span className="text-sm font-medium text-gray-900">{selectedUserData.rating.toFixed(1)}/5</span>
                                  </div>
                                )}
                              </>
                            )}
                            {selectedUserData.role === 'admin' && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Role:</span>
                                <span className="text-sm font-medium text-gray-900">System Administrator</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => setShowUserProfile(null)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Close
                      </button>
                      <button 
                        onClick={() => openEditModal(selectedUserData)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit User
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;