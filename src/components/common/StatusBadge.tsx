import React from 'react';
import { ComplaintStatus, Priority } from '../../types';

interface StatusBadgeProps {
  status?: ComplaintStatus;
  priority?: Priority;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, priority, className = '' }) => {
  if (status) {
    const statusConfig = {
      submitted: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Submitted' },
      under_review: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Under Review' },
      in_progress: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'In Progress' },
      resolved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Resolved' },
      closed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Closed' },
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}>
        {config.label}
      </span>
    );
  }

  if (priority) {
    const priorityConfig = {
      low: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Low' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
      critical: { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical' },
    };

    const config = priorityConfig[priority];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}>
        {config.label}
      </span>
    );
  }

  return null;
};

export default StatusBadge;