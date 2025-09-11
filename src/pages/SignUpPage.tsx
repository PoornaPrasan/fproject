import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, User, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'citizen' as 'citizen' | 'provider' | 'admin',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState<{_id: string, name: string}[]>([]);
  const [department, setDepartment] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (formData.role === 'provider') {
      fetch('http://localhost:5000/api/v1/departments')
        .then(res => res.json())
        .then(data => {
          console.log('Raw API response:', data); // Log entire response
          if (data.success && data.data) {
            const deptArray = Array.isArray(data.data) ? data.data : 
                            Array.isArray(data.data.departments) ? data.data.departments : [];
            console.log('Department array before mapping:', deptArray);
            const mappedDepts = deptArray.map((d: { _id: string; name: string }) => {
              console.log('Processing department:', d);
              return {
                _id: d._id,
                name: d.name
              };
            });
            console.log('Final mapped departments:', mappedDepts);
            setDepartments(mappedDepts);
          }
        })
        .catch(err => {
          console.error('Error loading departments:', err);
          setDepartments([]);
        });
    }
  }, [formData.role]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (formData.role === 'provider' && !department) {
      setError('Please select a department');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Prepare registration data
      const registrationData: {
        name: string;
        email: string;
        password: string;
        phone: string;
        role: 'citizen' | 'provider' | 'admin';
        departmentId?: string;
      } = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      };

      // Add department ID for providers
      if (formData.role === 'provider') {
        if (!department) {
          setError('Please select a department');
          setIsLoading(false);
          return;
        }

        // Validate department ID
        const selectedDept = departments.find(d => d._id === department);
        if (!selectedDept) {
          setError('Invalid department selection');
          setIsLoading(false);
          return;
        }

        if (!selectedDept._id || typeof selectedDept._id !== 'string' || selectedDept._id.length !== 24) {
          setError('Invalid department ID format');
          setIsLoading(false);
          return;
        }

        registrationData.departmentId = selectedDept._id;
      }
      
      console.log('Sending registration data:', registrationData);

      const response = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setTimeout(async () => {
          try {
            await login(formData.email, formData.password);
            // Get the user from localStorage (set by AuthContext)
            const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (loggedInUser.role === 'citizen') navigate('/citizen');
            else if (loggedInUser.role === 'provider') navigate('/provider');
            else if (loggedInUser.role === 'admin') navigate('/admin');
          } catch {
            setError('Automatic login failed. Please try logging in manually.');
            setSuccess(false);
          }
        }, 2000);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: 'citizen',
      label: 'Citizen',
      description: 'Report and track public service issues',
      icon: User,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      id: 'provider',
      label: 'Service Provider',
      description: 'Resolve complaints and manage services',
      icon: FileText,
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      id: 'admin',
      label: 'Administrator',
      description: 'System administration and oversight',
      icon: Shield,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    }
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to PublicCare!</h2>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. You're being redirected to your dashboard...
            </p>
            <div className="flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join thousands of citizens making a difference
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="text-base font-medium text-gray-900">Account Type</label>
              <p className="text-sm leading-5 text-gray-600">Choose your role in the system</p>
              <fieldset className="mt-4">
                <div className="space-y-3">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <div
                        key={role.id}
                        className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                          formData.role === role.id
                            ? role.color
                            : 'border-gray-300 bg-white'
                        }`}
                        onClick={() => handleInputChange('role', role.id)}
                      >
                        <div className="flex h-5 items-center">
                          <input
                            type="radio"
                            name="role"
                            value={role.id}
                            checked={formData.role === role.id}
                            onChange={() => handleInputChange('role', role.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 flex items-center">
                          <Icon className="w-5 h-5 mr-2" />
                          <div>
                            <label className="block text-sm font-medium cursor-pointer">
                              {role.label}
                            </label>
                            <p className="text-xs text-gray-500">{role.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            {formData.role === 'provider' && (
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department *
                </label>
                <div className="mt-1">
                  <select
                    id="department"
                    name="department"
                    required
                    value={department}
                    onChange={e => {
                      const selectedValue = e.target.value;
                      console.log('Raw selected value:', selectedValue);
                      console.log('All departments:', departments);
                      const selectedDept = departments.find(d => {
                        console.log('Comparing', d._id, 'with', selectedValue);
                        return d._id === selectedValue;
                      });
                      console.log('Found department object:', selectedDept);
                      setDepartment(selectedValue);
                    }}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select a department</option>
                    {departments.map(dep => {
                      console.log('Rendering department option:', dep);
                      return (
                        <option key={dep._id} value={dep._id}>{dep.name}</option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
