import * as React from 'react';
import { IssueStatus } from '../types';

interface StatusBadgeProps {
  status: IssueStatus;
}

const statusStyles: Record<IssueStatus, string> = {
  [IssueStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [IssueStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [IssueStatus.RESOLVED]: 'bg-green-100 text-green-800',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;