import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'provider' | 'admin'>('citizen');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      // Get the user from localStorage (set by AuthContext)
      const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
      const redirectPath = loggedInUser.role === 'citizen' ? '/citizen' : 
                          loggedInUser.role === 'provider' ? '/provider' : '/admin';
      navigate(redirectPath);
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: 'citizen',
      label: 'Citizen',
      description: 'Submit and track complaints',
      icon: User,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      id: 'provider',
      label: 'Service Provider',
      description: 'Manage and resolve complaints',
      icon: FileText,
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      id: 'admin',
      label: 'Administrator',
      description: 'System administration',
      icon: Shield,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Welcome to PublicCare
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your public service complaint management system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="text-base font-medium text-gray-900">Select your role</label>
              <p className="text-sm leading-5 text-gray-600">Choose how you want to access the system</p>
              <fieldset className="mt-4">
                <div className="space-y-3">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <div
                        key={role.id}
                        className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                          selectedRole === role.id
                            ? role.color
                            : 'border-gray-300 bg-white'
                        }`}
                        onClick={() => setSelectedRole(role.id as 'citizen' | 'provider' | 'admin')}
                      >
                        <div className="flex h-5 items-center">
                          <input
                            type="radio"
                            name="role"
                            value={role.id}
                            checked={selectedRole === role.id}
                            onChange={() => setSelectedRole(role.id as 'citizen' | 'provider' | 'admin')}
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

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
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
                  'Sign in'
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
                <span className="px-2 bg-white text-gray-500">Demo credentials</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-600 space-y-1">
              <p><strong>Citizen:</strong> citizen@demo.com / password</p>
              <p><strong>Provider:</strong> provider@demo.com / password</p>
              <p><strong>Admin:</strong> admin@demo.com / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;