import * as React from 'react';
import { WorkerStats } from '../services/useOfficialStats';

interface WorkerPerformanceCardProps {
  workerStats: WorkerStats;
}

const WorkerPerformanceCard: React.FC<WorkerPerformanceCardProps> = ({ workerStats }) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      <p className="font-semibold text-gray-800 truncate">{workerStats.name}</p>
      <div className="mt-2 flex justify-between items-center text-sm text-gray-600">
        <span>Active Tasks:</span>
        <span className="font-bold text-blue-600">{workerStats.activeIssuesCount}</span>
      </div>
       <div className="mt-1 flex justify-between items-center text-sm text-gray-600">
        <span>Resolved (7d):</span>
        <span className="font-bold text-green-600">{workerStats.resolvedLast7DaysCount}</span>
      </div>
    </div>
  );
};

export default WorkerPerformanceCard;