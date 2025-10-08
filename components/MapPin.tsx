import * as React from 'react';
import { ReportedIssue, IssueStatus, IssueCategory } from '../types';
import Icon from './Icon';

interface MapPinProps {
  issue: ReportedIssue;
  style: React.CSSProperties;
  onClick: () => void;
}

const STATUS_COLORS: Record<IssueStatus, { bg: string; icon: string }> = {
  [IssueStatus.PENDING]: { bg: 'bg-yellow-400', icon: 'text-yellow-900' },
  [IssueStatus.IN_PROGRESS]: { bg: 'bg-blue-400', icon: 'text-blue-900' },
  [IssueStatus.RESOLVED]: { bg: 'bg-green-400', icon: 'text-green-900' },
};

const MapPin: React.FC<MapPinProps> = ({ issue, style, onClick }) => {
  const { bg, icon } = STATUS_COLORS[issue.status];

  return (
    <div
      className="absolute group"
      style={style}
      onClick={onClick}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transform transition-transform duration-200 group-hover:scale-125 shadow-lg ${bg}`}>
        <Icon category={issue.category} className={`w-5 h-5 ${icon}`} />
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none transform -translate-x-1/2 left-1/2">
        <p className="font-bold">{issue.category}</p>
        <p className="truncate">{issue.description}</p>
        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 transform rotate-45"></div>
      </div>
    </div>
  );
};

export default MapPin;