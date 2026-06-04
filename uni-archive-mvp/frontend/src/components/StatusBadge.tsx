import React from 'react';
import { Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export const getStatusDetails = (status: string, is_approved?: boolean, has_duplicates?: boolean) => {
  const normStatus = (status || '').toLowerCase();
  
  if (normStatus === 'approved' || is_approved) {
    return {
      label: 'Approved',
      color: '#059669',
      bgColor: '#ecfdf5',
      icon: <CheckCircle size={14} />,
      borderColor: '#a7f3d0'
    };
  }
  if (normStatus === 'verified') {
    return {
      label: 'Verified',
      color: '#0d9488',
      bgColor: '#f0fdfa',
      icon: <CheckCircle size={14} />,
      borderColor: '#ccfbf1'
    };
  }
  if (normStatus === 'rejected') {
    return {
      label: 'Rejected',
      color: '#dc2626',
      bgColor: '#fef2f2',
      icon: <XCircle size={14} />,
      borderColor: '#fecaca'
    };
  }
  if (normStatus === 'duplicate_warning' || has_duplicates) {
    return {
      label: 'Duplicate Warning',
      color: '#ea580c',
      bgColor: '#fff7ed',
      icon: <AlertTriangle size={14} />,
      borderColor: '#ffedd5'
    };
  }
  
  // Default to Pending Review
  return {
    label: 'Pending Review',
    color: '#d97706',
    bgColor: '#fffbeb',
    icon: <Clock size={14} />,
    borderColor: '#fef3c7'
  };
};

interface StatusBadgeProps {
  status: string;
  is_approved?: boolean;
  has_duplicates?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, is_approved, has_duplicates }) => {
  const details = getStatusDetails(status, is_approved, has_duplicates);
  return (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '6px', 
      backgroundColor: details.bgColor, 
      color: details.color, 
      padding: '4px 10px', 
      borderRadius: '12px', 
      fontSize: '0.75rem', 
      fontWeight: '600',
      border: `1px solid ${details.borderColor}`,
      lineHeight: '1.2'
    }}>
      {details.icon}
      {details.label}
    </span>
  );
};
