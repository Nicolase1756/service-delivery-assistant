import * as React from 'react';
import { ReportedIssue, User, IssueStatus, IssuePriority } from '../types';
import IssueCard from './IssueCard';
import KPICard, { formatDuration } from './KPICard';
import { useWorkerStats } from '../services/useWorkerStats';

interface WorkerDashboardProps {
  issues: ReportedIssue[];
  onSelectIssue: (issue: ReportedIssue) => void;
  worker: User;
  activeTab: string;
}

// Helper for sorting
const priorityOrder: Record<IssuePriority, number> = {
  [IssuePriority.HIGH]: 1,
  [IssuePriority.MEDIUM]: 2,
  [IssuePriority.LOW]: 3,
};

const statusOrder: Record<IssueStatus, number> = {
    [IssueStatus.IN_PROGRESS]: 1,
    [IssueStatus.PENDING]: 2,
    [IssueStatus.RESOLVED]: 3,
};

const PerformanceComparison: React.FC<{label: string, myValue: string, deptValue: string}> = ({label, myValue, deptValue}) => (
     <div className="text-center bg-white p-4 rounded-lg shadow">
        <p className="text-sm text-gray-500">{label}</p>
        <div className="flex justify-center items-baseline gap-4 mt-2">
            <div>
                <p className="text-xs text-sa-green">My Avg</p>
                <p className="text-2xl font-bold text-sa-green">{myValue}</p>
            </div>
            <div className="border-l h-10"></div>
             <div>
                <p className="text-xs text-gray-500">Dept. Avg</p>
                <p className="text-2xl font-bold text-gray-600">{deptValue}</p>
            </div>
        </div>
    </div>
)

const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ issues, onSelectIssue, worker, activeTab }) => {
  if (!worker.department || !worker.municipality) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-red-700">Configuration Error</h2>
        <p className="text-gray-600 mt-2">This user account is missing required department or municipality information.</p>
      </div>
    );
  }
  
  const { 
    activeTaskCount, 
    resolvedThisWeekCount, 
    avgResolutionTimeMs, 
    departmentAvgResolutionTimeMs,
  } = useWorkerStats(issues, worker.id, worker.department, worker.municipality);

  const myWorkQueue = issues
    .filter(issue => issue.assignedTo === worker.id && issue.status !== IssueStatus.RESOLVED)
    .sort((a, b) => {
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime(); // oldest first
    });

  const unassignedIssues = issues
    .filter(issue => !issue.assignedTo && issue.status === IssueStatus.PENDING && issue.department === worker.department && issue.municipality === worker.municipality)
    .sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime(); // oldest first
    });
    
  const myRecentlyResolved = issues
    .filter(issue => issue.assignedTo === worker.id && issue.status === IssueStatus.RESOLVED)
    .sort((a, b) => new Date(b.resolvedAt!).getTime() - new Date(a.resolvedAt!).getTime())
    .slice(0, 10);
    
    // An issue is urgent if it's high priority and older than 2 days
  const isUrgent = (issue: ReportedIssue) => {
      const twoDaysAgo = Date.now() - 2 * 86400000;
      return issue.priority === IssuePriority.HIGH && new Date(issue.reportedAt).getTime() < twoDaysAgo;
  }

  const renderContent = () => {
    switch (activeTab) {
        case 'queue':
            return (
                <div className="p-4">
                    <div className="bg-white p-4 rounded-lg shadow space-y-4 max-h-[60vh] overflow-y-auto">
                        {myWorkQueue.length > 0 ? (
                            myWorkQueue.map((issue) => (
                              <IssueCard key={issue.id} issue={issue} onClick={() => onSelectIssue(issue)} isUrgent={isUrgent(issue)} />
                            ))
                        ) : (
                          <div className="text-center py-12">
                            <h3 className="text-xl font-semibold text-gray-700">Your queue is clear!</h3>
                            <p className="text-gray-500 mt-2">Check the available issues to pick up a new task.</p>
                          </div>
                        )}
                    </div>
                </div>
            );
        case 'available':
            return (
                <div className="p-4">
                     <div className="bg-white p-4 rounded-lg shadow space-y-4 max-h-[60vh] overflow-y-auto">
                        {unassignedIssues.length > 0 ? (
                            unassignedIssues.map((issue) => (
                              <IssueCard key={issue.id} issue={issue} onClick={() => onSelectIssue(issue)} />
                            ))
                        ) : (
                          <div className="text-center py-12">
                            <h3 className="text-xl font-semibold text-gray-700">No unassigned issues in your department.</h3>
                            <p className="text-gray-500 mt-2">Great job, the public queue is empty!</p>
                          </div>
                        )}
                      </div>
                </div>
            );
        case 'resolved':
            return (
                <div className="p-4">
                    {myRecentlyResolved.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {myRecentlyResolved.map((issue) => (
                          <IssueCard key={issue.id} issue={issue} onClick={() => onSelectIssue(issue)} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white rounded-lg shadow">
                        <h3 className="text-xl font-semibold text-gray-700">No recently resolved issues.</h3>
                        <p className="text-gray-500 mt-2">Complete a task to see it here.</p>
                      </div>
                    )}
                </div>
            );
    }
  }


  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Worker Dashboard</h1>
      <p className="text-lg text-gray-600">{worker.municipality}</p>
      <p className="text-md text-gray-500 mb-6">Welcome back, {worker.name.split(' ')[0]}! - <span className="font-semibold">{worker.department} Dept.</span></p>

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard title="My Active Tasks" value={activeTaskCount} color="text-blue-600" />
        <KPICard title="Resolved This Week" value={resolvedThisWeekCount} color="text-green-600" />
        <KPICard title="Available in My Dept." value={unassignedIssues.length} color="text-yellow-600" />
        <PerformanceComparison
            label="Resolution Time"
            myValue={formatDuration(avgResolutionTimeMs)}
            deptValue={formatDuration(departmentAvgResolutionTimeMs)}
        />
      </div>
      
      <div className="bg-gray-50 rounded-lg shadow-sm">
        {renderContent()}
      </div>
    </div>
  );
};

export default WorkerDashboard;
