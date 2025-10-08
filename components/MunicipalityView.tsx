import * as React from 'react';
import { ReportedIssue, IssueStatus, IssuePriority, User, Role, Announcement } from '../types';
import IssueCard from './IssueCard';
import { useIssueStats } from '../services/useIssueStats';
import KPICard, { formatDuration } from './KPICard';
import { useOfficialStats } from '../services/useOfficialStats';
import WorkerPerformanceCard from './WorkerPerformanceCard';
import { MOCKED_USERS } from '../constants';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

interface MunicipalityViewProps {
  issues: ReportedIssue[];
  onSelectIssue: (issue: ReportedIssue) => void;
  currentUser: User;
  onAddAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt'>) => void;
  activeTab: string;
}

// Helper for sorting
const priorityOrder: Record<IssuePriority, number> = {
  [IssuePriority.HIGH]: 1,
  [IssuePriority.MEDIUM]: 2,
  [IssuePriority.LOW]: 3,
};

const PRIORITY_COLORS = { [IssuePriority.HIGH]: '#DE3831', [IssuePriority.MEDIUM]: '#FFB612', [IssuePriority.LOW]: '#007A4D' };


const MunicipalityView: React.FC<MunicipalityViewProps> = ({ issues, onSelectIssue, currentUser, onAddAnnouncement, activeTab }) => {
  type SortOption = 'date-asc' | 'date-desc' | 'priority-asc' | 'category-asc' | 'category-desc';

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = React.useState(false);
  const [triageSort, setTriageSort] = React.useState<SortOption>('priority-asc');
  const [activeSort, setActiveSort] = React.useState<SortOption>('date-asc');

  if (!currentUser.department || !currentUser.municipality) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-red-700">Configuration Error</h2>
        <p className="text-gray-600 mt-2">This user account is missing required department or municipality information.</p>
      </div>
    );
  }

  const departmentIssues = issues.filter(issue => 
    issue.department === currentUser.department && 
    issue.municipality === currentUser.municipality
  );

  const { 
    highPriorityPending,
    pendingIssues,
    inProgressIssues,
    avgResolutionTimeMs
  } = useIssueStats(departmentIssues);

  const { workerPerformance, pendingByPriority, historicalPerformance } = useOfficialStats(issues, MOCKED_USERS, currentUser.department, currentUser.municipality);

  const unassignedIssues = departmentIssues
    .filter(issue => !issue.assignedTo && issue.status === IssueStatus.PENDING);
    
  const sortedUnassignedIssues = React.useMemo(() => {
    const [key, direction] = triageSort.split('-');
    const dir = direction === 'asc' ? 1 : -1;

    return [...unassignedIssues].sort((a, b) => {
        if (key === 'priority') {
            const priorityA = priorityOrder[a.priority];
            const priorityB = priorityOrder[b.priority];
            if (priorityA !== priorityB) {
                 return (priorityA - priorityB) * dir;
            }
            return new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime();
        }
        if (key === 'date') {
            const dateA = new Date(a.reportedAt).getTime();
            const dateB = new Date(b.reportedAt).getTime();
            return (dateA - dateB) * dir;
        }
        if (key === 'category') {
            const categoryComparison = a.category.localeCompare(b.category);
            if (categoryComparison !== 0) {
                return categoryComparison * dir;
            }
            const priorityA = priorityOrder[a.priority];
            const priorityB = priorityOrder[b.priority];
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            return new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime();
        }
        return 0;
    });
  }, [unassignedIssues, triageSort]);

  const activeIssues = departmentIssues
    .filter(issue => issue.status !== IssueStatus.RESOLVED && issue.assignedTo);

  const sortedActiveIssues = React.useMemo(() => {
    const [key, direction] = activeSort.split('-');
    const dir = direction === 'asc' ? 1 : -1;

    return [...activeIssues].sort((a, b) => {
        if (key === 'priority') {
            const priorityA = priorityOrder[a.priority];
            const priorityB = priorityOrder[b.priority];
             if (priorityA !== priorityB) {
                 return (priorityA - priorityB) * dir;
            }
            return new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime();
        }
        if (key === 'date') {
            const dateA = new Date(a.reportedAt).getTime();
            const dateB = new Date(b.reportedAt).getTime();
            return (dateA - dateB) * dir;
        }
        if (key === 'category') {
            const categoryComparison = a.category.localeCompare(b.category);
             if (categoryComparison !== 0) {
                return categoryComparison * dir;
            }
            const priorityA = priorityOrder[a.priority];
            const priorityB = priorityOrder[b.priority];
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            return new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime();
        }
        return 0;
    });
  }, [activeIssues, activeSort]);

  const isNew = (issue: ReportedIssue) => {
    const twentyFourHoursAgo = Date.now() - 24 * 3600 * 1000;
    return new Date(issue.reportedAt).getTime() > twentyFourHoursAgo;
  };

  const renderContent = () => {
    switch(activeTab) {
        case 'dashboard':
          return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">Department Performance (Last 30 Days)</h2>
                      <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={historicalPerformance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" tick={{fontSize: 12}} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="Reported" stroke="#FFB612" strokeWidth={2} />
                              <Line type="monotone" dataKey="Resolved" stroke="#007A4D" strokeWidth={2} />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Pending Priorities</h2>
                      <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                              <Pie data={pendingByPriority} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" label={({ name, count }) => `${name}: ${count}`}>
                                  {pendingByPriority.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as IssuePriority]} />
                                  ))}
                              </Pie>
                              <Tooltip />
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          )
      case 'triage':
          return (
              <div className="p-2 md:p-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Triage Queue</h3>
                        <div className="flex items-center gap-2">
                          <label htmlFor="triage-sort" className="text-sm font-medium text-gray-700 flex-shrink-0">Sort by:</label>
                          <select
                            id="triage-sort"
                            value={triageSort}
                            onChange={(e) => setTriageSort(e.target.value as SortOption)}
                            className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-sa-green focus:border-sa-green sm:text-sm rounded-md"
                          >
                            <option value="priority-asc">Priority (High to Low)</option>
                            <option value="date-asc">Date (Oldest First)</option>
                            <option value="date-desc">Date (Newest First)</option>
                            <option value="category-asc">Category (A-Z)</option>
                            <option value="category-desc">Category (Z-A)</option>
                          </select>
                        </div>
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {sortedUnassignedIssues.length > 0 ? (
                          sortedUnassignedIssues.map((issue) => (
                              <IssueCard key={issue.id} issue={issue} onClick={() => onSelectIssue(issue)} isNew={isNew(issue)} />
                          ))
                      ) : (
                          <div className="text-center py-10">
                              <h3 className="text-lg font-semibold text-gray-700">No unassigned issues.</h3>
                              <p className="text-gray-500 mt-1">The queue is clear!</p>
                          </div>
                      )}
                    </div>
                  </div>
              </div>
          )
      case 'active':
          return (
              <div className="p-2 md:p-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Active Issues</h3>
                        <div className="flex items-center gap-2">
                          <label htmlFor="active-sort" className="text-sm font-medium text-gray-700 flex-shrink-0">Sort by:</label>
                          <select
                            id="active-sort"
                            value={activeSort}
                            onChange={(e) => setActiveSort(e.target.value as SortOption)}
                            className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-sa-green focus:border-sa-green sm:text-sm rounded-md"
                          >
                            <option value="date-asc">Date (Oldest First)</option>
                            <option value="date-desc">Date (Newest First)</option>
                            <option value="priority-asc">Priority (High to Low)</option>
                            <option value="category-asc">Category (A-Z)</option>
                            <option value="category-desc">Category (Z-A)</option>
                          </select>
                        </div>
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {sortedActiveIssues.length > 0 ? (
                          sortedActiveIssues.map((issue) => (
                              <IssueCard key={issue.id} issue={issue} onClick={() => onSelectIssue(issue)} />
                          ))
                      ) : (
                          <div className="text-center py-10">
                              <h3 className="text-lg font-semibold text-gray-700">No active issues being worked on.</h3>
                          </div>
                      )}
                    </div>
                  </div>
              </div>
          )
      case 'team':
           return (
              <div className="p-2 md:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {workerPerformance.length > 0 ? (
                          workerPerformance.map(stats => (
                              <WorkerPerformanceCard key={stats.id} workerStats={stats} />
                          ))
                      ) : (
                          <div className="col-span-full text-center py-10 bg-white rounded-lg shadow">
                              <h3 className="text-lg font-semibold text-gray-700">No workers found.</h3>
                              <p className="text-gray-500 mt-1">Add workers to this department to see their stats.</p>
                          </div>
                      )}
                  </div>
              </div>
          )
      default:
          return null;
    }
}


  return (
    <div className="p-4 md:p-8">
       {isAnnouncementModalOpen && (
        <CreateAnnouncementModal 
          onClose={() => setIsAnnouncementModalOpen(false)}
          onAddAnnouncement={onAddAnnouncement}
          currentUser={currentUser}
        />
      )}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Department Command Center</h1>
            <p className="text-lg text-gray-600">{currentUser.municipality}</p>
            <p className="text-md text-gray-500">Welcome, {currentUser.name} - <span className="font-semibold">{currentUser.department}</span></p>
        </div>
         <button 
            onClick={() => setIsAnnouncementModalOpen(true)}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sa-green hover:bg-sa-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sa-green">
            📢 Post Announcement
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard title="High Priority Pending" value={highPriorityPending} color="text-red-600" />
        <KPICard title="Total Pending" value={pendingIssues} color="text-yellow-600" />
        <KPICard title="In Progress" value={inProgressIssues} color="text-blue-600" />
        <KPICard title="Avg. Resolution Time" value={formatDuration(avgResolutionTimeMs)} color="text-green-600" />
      </div>
      
      <div className="bg-gray-50 rounded-lg shadow-sm">
        {renderContent()}
      </div>
    </div>
  );
};

export default MunicipalityView;
