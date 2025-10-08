import * as React from 'react';
import { ReportedIssue } from '../types';
import Icon from './Icon';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface IssueCardProps {
  issue: ReportedIssue;
  onClick: () => void;
  isUrgent?: boolean;
  isNew?: boolean;
}

const PhotoStatusIcon: React.FC<{ hasPhoto: boolean }> = ({ hasPhoto }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" 
        className={`h-4 w-4 ${hasPhoto ? 'text-green-500' : 'text-gray-300'}`}>
        <path fillRule="evenodd" d="M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" clipRule="evenodd" />
    </svg>
);


const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick, isUrgent = false, isNew = false }) => {
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  }

  const urgentStyles = isUrgent 
    ? 'border-red-500/50 shadow-red-100' 
    : 'border-transparent';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer p-4 flex flex-col justify-between border-2 ${urgentStyles}`}
    >
      <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-sa-green/10 text-sa-green flex items-center justify-center">
            <Icon category={issue.category} className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-sa-green truncate">{issue.category}</p>
                  {isNew && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">New</span>}
               </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <PriorityBadge priority={issue.priority} />
                <StatusBadge status={issue.status} />
              </div>
            </div>
            <p className="mt-1 text-lg font-semibold text-gray-900 truncate">{issue.description}</p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.978.572.536.536 0 00.28.14l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
              </svg>
              <p className="truncate">{issue.location}</p>
            </div>
          </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
        <p className="text-xs text-gray-400">Reported {timeAgo(issue.reportedAt)}</p>
         {issue.assignedTo && (
            <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1" title="Before-work photo status">
                    <PhotoStatusIcon hasPhoto={!!issue.beforeWorkPhotoBase64} />
                    <span>Before</span>
                </div>
                 <div className="flex items-center gap-1" title="After-work photo status">
                    <PhotoStatusIcon hasPhoto={!!issue.afterWorkPhotoBase64} />
                    <span>After</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;