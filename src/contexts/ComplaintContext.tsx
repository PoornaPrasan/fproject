import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Complaint, ComplaintCategory, ComplaintStatus, Analytics } from '../types';

interface ComplaintContextType {
  complaints: Complaint[];
  myComplaints: Complaint[];
  analytics: Analytics;
  isLoading: boolean;
  error: string | null;
  submitComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'updates'>) => Promise<void>;
  updateComplaintStatus: (id: string, status: ComplaintStatus, message?: string) => Promise<void>;
  addComplaintUpdate: (id: string, message: string, attachments?: File[]) => Promise<void>;
  getComplaintsByUser: (userId: string) => Complaint[];
  getComplaintsByCategory: (category: ComplaintCategory) => Complaint[];
  rateComplaint: (id: string, rating: number, feedback?: string) => Promise<void>;
  refetchComplaints: () => Promise<void>;
}

// Explicitly type ComplaintContext as React.Context<ComplaintContextType | null>
const ComplaintContext = createContext<ComplaintContextType | null>(null);

export const useComplaints = (): ComplaintContextType => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};

export const ComplaintProvider = ({ children }: { children: React.ReactNode }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalComplaints: 0,
    resolvedComplaints: 0,
    averageResolutionTime: 0,
    complaintsByCategory: {} as Record<ComplaintCategory, number>,
    complaintsByStatus: {} as Record<ComplaintStatus, number>,
    monthlyTrends: []
  });

  const fetchComplaints = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Fetching complaints for user:', { role: user?.role, department: user?.department });
      
      if (!user || !user.token) {
        console.log('No authenticated user found');
        setComplaints([]);
        setError('No authenticated user found');
        return;
      }
      
      const baseUrl = 'http://localhost:5000/api/v1/complaints';
      let apiUrl = baseUrl;
      // Corrected syntax for appending department filter to URL
      if (user.role === 'provider' && user.departmentId) {
        apiUrl += `?department=${user.departmentId}`;
        console.log('Fetching complaints with department filter:', user.departmentId); // Log department filter
      } else if (user.role === 'provider' && user.department) {
        // Fallback to department name if departmentId is not available
        apiUrl += `?department=${encodeURIComponent(user.department)}`;
      }
      
      console.log('Fetching complaints from:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Failed to fetch complaints: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      if (!Array.isArray(data.complaints || data.data?.complaints)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      const complaintsArray = data.complaints || data.data?.complaints;
      console.log('Setting complaints:', complaintsArray.length, 'items');
      setComplaints(complaintsArray);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch complaints');
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyComplaints = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user || !user.token) return;

      const response = await fetch('http://localhost:5000/api/v1/complaints/my', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user complaints');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data?.complaints)) {
        setMyComplaints(data.data.complaints);
      }
    } catch (error) {
      console.error('Error fetching user complaints:', error);
    }
  }, []);

  const submitComplaint = async (complaintData: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'updates'>) => {
    setError(null);
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('http://localhost:5000/api/v1/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(complaintData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit complaint');
      }

      await Promise.all([fetchComplaints(), fetchMyComplaints()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit complaint');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateComplaintStatus = async (id: string, status: ComplaintStatus, message?: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`http://localhost:5000/api/v1/complaints/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ status, message })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update complaint status');
      }

      await fetchComplaints();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update complaint status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Suppressed unused variable warnings for unimplemented functions
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const addComplaintUpdate = async (id: string, message: string, attachments?: File[]) => {
    throw new Error('Not implemented');
  };

  const rateComplaint = async (id: string, rating: number, feedback?: string) => {
    throw new Error('Not implemented');
  };
  /* eslint-enable @typescript-eslint/no-unused-vars */

  const getComplaintsByUser = useCallback((userId: string) => {
    return complaints.filter(c => c.submittedBy === userId);
  }, [complaints]);

  const getComplaintsByCategory = useCallback((category: ComplaintCategory) => {
    return complaints.filter(c => c.category === category);
  }, [complaints]);

  // Update analytics when complaints change
  useEffect(() => {
    const complaintsByCategory = complaints.reduce<Record<ComplaintCategory, number>>((acc, complaint) => {
      acc[complaint.category] = (acc[complaint.category] || 0) + 1;
      return acc;
    }, {} as Record<ComplaintCategory, number>);

    const complaintsByStatus = complaints.reduce<Record<ComplaintStatus, number>>((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {} as Record<ComplaintStatus, number>);

    const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
    const avgTime = resolvedComplaints.length > 0 
      ? resolvedComplaints.reduce((sum, c) => {
          const created = new Date(c.createdAt).getTime();
          const resolved = new Date(c.resolvedAt!).getTime();
          return sum + (resolved - created) / (1000 * 60 * 60 * 24);
        }, 0) / resolvedComplaints.length
      : 0;

    setAnalytics({
      totalComplaints: complaints.length,
      resolvedComplaints: resolvedComplaints.length,
      averageResolutionTime: avgTime,
      complaintsByCategory,
      complaintsByStatus,
      monthlyTrends: [] // To be implemented
    });
  }, [complaints]);

  // Initial data fetch
  useEffect(() => {
    fetchComplaints();
    fetchMyComplaints();
  }, [fetchComplaints, fetchMyComplaints]);

  const value = {
    complaints,
    myComplaints,
    analytics,
    isLoading,
    error,
    submitComplaint,
    updateComplaintStatus,
    addComplaintUpdate,
    getComplaintsByUser,
    getComplaintsByCategory,
    rateComplaint,
    refetchComplaints: fetchComplaints
  };

  return (
    <ComplaintContext.Provider value={value}>
      {children}
    </ComplaintContext.Provider>
  );
};

export default ComplaintProvider;