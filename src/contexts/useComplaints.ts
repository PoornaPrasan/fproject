import { useContext } from 'react';
import ComplaintContext from './ComplaintContext';
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

export const useComplaints = (): ComplaintContextType => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};
