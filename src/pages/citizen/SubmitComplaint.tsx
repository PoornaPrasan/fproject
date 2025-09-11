import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Camera, 
  AlertTriangle, 
  Upload,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ComplaintCategory, Priority, Location, ComplaintStatus } from '../../types';
import { useComplaints } from '../../contexts/ComplaintContext';

const SubmitComplaint: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitComplaint } = useComplaints();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'electricity' as ComplaintCategory,
    priority: 'medium' as Priority,
    isEmergency: false,
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '',
      city: '',
      region: ''
    } as Location
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  const categories = [
    { value: 'electricity', label: 'Electricity', icon: '⚡' },
    { value: 'water', label: 'Water Supply', icon: '💧' },
    { value: 'roads', label: 'Roads', icon: '🛣️' },
    { value: 'sanitation', label: 'Sanitation', icon: '🗑️' },
    { value: 'street_lights', label: 'Street Lights', icon: '💡' },
    { value: 'drainage', label: 'Drainage', icon: '🌊' },
    { value: 'public_transport', label: 'Public Transport', icon: '🚌' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith('location.')) {
      const locationField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value as string
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      return isValidSize && isValidType;
    });
    
    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    // Clear any previous error
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        }));
        setLocationError(''); // Clear error on success
      },
      (error) => {
        console.error('Error getting location:', error);
        
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access was denied. Please enable location permissions in your browser settings to use this feature.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please enter your address manually.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or enter your address manually.';
            break;
          default:
            errorMessage = 'An error occurred while retrieving your location. Please enter your address manually.';
            break;
        }
        
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      // First, upload all attachments to get real URLs
      const uploadedAttachments = [];
      
      for (const file of attachments) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadResponse = await fetch('http://localhost:5000/api/v1/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${user.token || ''}`
            },
            body: formData
          });
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => null);
            throw new Error(errorData?.error || `Failed to upload file: ${file.name}`);
          }
          
          const uploadData = await uploadResponse.json();
          uploadedAttachments.push({
            id: `attachment-${Date.now()}-${uploadedAttachments.length}`,
        type: file.type.startsWith('image/') ? 'image' as const : 'video' as const,
            url: uploadData.data.url,
        filename: file.name,
        size: file.size
          });
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${(uploadError as Error).message}`);
        }
      }

      const location = {
        type: 'Point' as const,
        coordinates: [
          (formData.location as { longitude: number; latitude: number }).longitude,
          (formData.location as { longitude: number; latitude: number }).latitude
        ] as [number, number],
        address: formData.location.address,
        city: formData.location.city,
        region: formData.location.region
      };
      
      const complaintData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        isEmergency: formData.isEmergency,
        location,
        attachments: uploadedAttachments,
        status: 'submitted' as ComplaintStatus,
        submittedBy: user.id
      };
      
      // Use context submitComplaint to ensure refresh
      await submitComplaint(complaintData);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/citizen/track');
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      setShowSuccess(false);
      setLocationError((error as Error).message || 'Failed to submit complaint');
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your complaint has been received and assigned a tracking number. 
            You will receive updates as we work to resolve your issue.
          </p>
          <button
            onClick={() => navigate('/citizen/track')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Track Your Complaints
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit a Complaint</h1>
        <p className="text-gray-600 mt-2">Report issues with public services in your area</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Complaint Details</h2>
          
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complaint Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief description of the issue"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleInputChange('category', category.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    formData.category === category.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xl mb-1">{category.icon}</div>
                  <div className="text-sm font-medium">{category.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <div className="flex flex-wrap gap-3">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleInputChange('priority', priority.value)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    formData.priority === priority.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`font-medium ${priority.color}`}>
                    {priority.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Flag */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isEmergency}
                onChange={(e) => handleInputChange('isEmergency', e.target.checked)}
                className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                This is an emergency requiring immediate attention
              </span>
            </label>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide detailed information about the issue, when it started, and how it affects you..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Location Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={formData.location.address}
                onChange={(e) => handleInputChange('location.address', e.target.value)}
                placeholder="Street address where the issue is located"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.location.city}
                onChange={(e) => handleInputChange('location.city', e.target.value)}
                placeholder="City"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region/State
              </label>
              <input
                type="text"
                value={formData.location.region}
                onChange={(e) => handleInputChange('location.region', e.target.value)}
                placeholder="Region or State"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Use Current Location
              </button>
            </div>
          </div>

          {/* Location Error Message */}
          {locationError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{locationError}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Attachments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Attachments</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photos or Videos (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, MP4 up to 10MB each (max 5 files)
                </p>
              </div>
            </div>
          </div>

          {/* Attachment Preview */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {attachments.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 truncate">{file.name}</p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/citizen')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Complaint'
            )}
          </button>
          </div>
        </form>
      </div>
    );
  };

export default SubmitComplaint;