import * as React from 'react';
import { IssuePriority } from '../types';

interface PriorityBadgeProps {
  priority: IssuePriority;
}

const priorityStyles: Record<IssuePriority, string> = {
  [IssuePriority.HIGH]: 'bg-red-100 text-red-800',
  [IssuePriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [IssuePriority.LOW]: 'bg-blue-100 text-blue-800',
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityStyles[priority]}`}
    >
      {priority}
    </span>
  );
};

export default PriorityBadge;