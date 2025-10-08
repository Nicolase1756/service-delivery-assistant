import * as React from 'react';
import { ReportedIssue, User, Jobseeker, Announcement } from '../types';
import IssueCard from './IssueCard';
import { useResidentStats } from '../services/useResidentStats';
import { generateWardHealthSummary } from '../services/geminiService';
import MapPin from './MapPin';
import ResidentJobseekerModule from './ResidentJobseekerModule';
import AnnouncementCard from './AnnouncementCard';

interface DashboardProps {
  issues: ReportedIssue[];
  announcements: Announcement[];
  onSelectIssue: (issue: ReportedIssue) => void;
  currentUser: User;
  jobseekers: Jobseeker[];
  onRegisterJobseeker: (data: Omit<Jobseeker, 'registeredAt'>) => void;
  onDeregisterJobseeker: (residentId: string) => void;
  onReportIssueClick: () => void;
}

// Simple hash function to get a stable "random" position for a given string.
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const getPinPosition = (issue: ReportedIssue) => {
    const hashX = simpleHash(issue.location);
    const hashY = simpleHash(issue.id);
    const x = Math.abs(hashX % 90) + 5;
    const y = Math.abs(hashY % 90) + 5;
    return { top: `${y}%`, left: `${x}%` };
};

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}m ago`;
    return `just now`;
};

const formatDuration = (ms: number | null): string => {
    if (ms === null || ms < 0) return 'N/A';
    const seconds = ms / 1000;
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor((seconds % 3600) / 60);
    if (minutes > 0) return `${minutes}m`;
    const secs = Math.floor(seconds % 60);
    return `${secs}s`;
};

const StatItem: React.FC<{label: string; value: string | number | null; color?: string;}> = ({ label, value, color = "text-gray-900" }) => (
    <div className="text-center">
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value ?? 'N/A'}</p>
    </div>
);

const PerformanceMetric: React.FC<{label: string; wardValue: string; cityValue: string; isBetter: boolean | null}> = ({ label, wardValue, cityValue, isBetter }) => (
    <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <div className="flex items-baseline justify-between mt-1">
            <p className="text-xl font-bold text-sa-green">{wardValue}</p>
            {isBetter !== null && (
                <span className={`text-xs font-semibold flex items-center ${isBetter ? 'text-green-600' : 'text-red-600'}`}>
                    {isBetter ? '▲' : '▼'}
                </span>
            )}
        </div>
        <p className="text-xs text-gray-500">City Avg: {cityValue}</p>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ issues, announcements, onSelectIssue, currentUser, jobseekers, onRegisterJobseeker, onDeregisterJobseeker, onReportIssueClick }) => {
  const [viewMode, setViewMode] = React.useState<'list' | 'map'>('list');
  const [aiWardSummary, setAiWardSummary] = React.useState<string>('');
  const [isSummaryLoading, setIsSummaryLoading] = React.useState<boolean>(true);
  
  const wardIssues = issues.filter(issue => issue.ward === currentUser.ward && issue.municipality === currentUser.municipality);
  const currentUserJobseeker = jobseekers.find(j => j.residentId === currentUser.id);

  const stats = useResidentStats(issues, currentUser);
  
  React.useEffect(() => {
    const fetchSummary = async () => {
        if (currentUser.ward && stats) {
            setIsSummaryLoading(true);
            const summary = await generateWardHealthSummary(
                currentUser.ward,
                stats.wardResolutionRate,
                stats.cityResolutionRate,
                stats.avgWardResolutionTimeMs,
                stats.avgCityResolutionTimeMs
            );
            setAiWardSummary(summary);
            setIsSummaryLoading(false);
        }
    };
    fetchSummary();
  }, [stats, currentUser.ward]);

  const isNew = (issue: ReportedIssue) => {
    const twentyFourHoursAgo = Date.now() - 24 * 3600 * 1000;
    return new Date(issue.reportedAt).getTime() > twentyFourHoursAgo;
  };

  const wardAnnouncements = announcements.filter(a => a.ward === currentUser.ward || a.ward === 'all');

  const activityFeed = React.useMemo(() => {
    const issueActivities = wardIssues.slice(0, 5).map(i => ({
        type: 'issue',
        timestamp: new Date(i.reportedAt),
        data: i,
    }));

    const announcementActivities = wardAnnouncements.map(a => ({
        type: 'announcement',
        timestamp: new Date(a.createdAt),
        data: a,
    }));

    return [...issueActivities, ...announcementActivities]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10); // Limit to latest 10 activities overall
  }, [wardIssues, wardAnnouncements]);
  
  const isWardRateBetter = stats.wardResolutionRate > stats.cityResolutionRate;
  const isWardTimeBetter = stats.avgWardResolutionTimeMs !== null && stats.avgCityResolutionTimeMs !== null ? stats.avgWardResolutionTimeMs < stats.avgCityResolutionTimeMs : null;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {currentUser.name.split(' ')[0]}</h1>
         <button 
            onClick={onReportIssueClick}
            className="px-6 py-3 bg-sa-green text-white font-semibold rounded-lg shadow-md hover:bg-sa-green-dark transition-all duration-200 flex items-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Report a New Issue
        </button>
      </div>

      {/* KPI Section */}
       <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Personal Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatItem label="Total Issues Reported" value={stats.myTotalIssues} color="text-sa-black" />
                <StatItem label="Issues Currently Open" value={stats.myOpenIssues} color="text-yellow-600" />
                <StatItem label="Issues Resolved" value={stats.myResolvedIssuesCount} color="text-green-600" />
                <StatItem label="My Satisfaction Rate" value={stats.mySatisfactionRate !== null ? `${stats.mySatisfactionRate.toFixed(0)}%` : null} color="text-blue-600" />
            </div>
        </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Issues */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-md flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800">Community Issues in Ward {currentUser.ward}</h2>
                <div className="flex items-center space-x-2 rounded-full bg-gray-200 p-1">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-1 text-sm font-semibold rounded-full ${viewMode === 'list' ? 'bg-sa-green text-white shadow' : 'text-gray-600'}`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`px-4 py-1 text-sm font-semibold rounded-full ${viewMode === 'map' ? 'bg-sa-green text-white shadow' : 'text-gray-600'}`}
                    >
                        Map
                    </button>
                </div>
            </div>

            {wardIssues.length > 0 ? (
                <div className="flex-grow min-h-0">
                  {viewMode === 'list' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto p-1">
                      {wardIssues.map((issue) => (
                        <IssueCard key={issue.id} issue={issue} onClick={() => onSelectIssue(issue)} isNew={isNew(issue)} />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg relative overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-30" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>
                        {wardIssues.map(issue => (
                            <MapPin
                                key={issue.id}
                                issue={issue}
                                style={getPinPosition(issue)}
                                onClick={() => onSelectIssue(issue)}
                            />
                        ))}
                    </div>
                  )}
                </div>
            ) : (
                <div className="text-center py-12 flex-grow flex flex-col justify-center items-center">
                    <h2 className="text-xl font-semibold text-gray-700">No issues reported in your ward yet.</h2>
                    <p className="text-gray-500 mt-2">Be the first to report an issue in your community!</p>
                </div>
            )}
        </div>
        {/* Sidebar */}
        <aside className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Ward Performance Snapshot</h3>
                <div className="space-y-4">
                    <PerformanceMetric 
                        label="Resolution Rate"
                        wardValue={`${stats.wardResolutionRate.toFixed(1)}%`}
                        cityValue={`${stats.cityResolutionRate.toFixed(1)}%`}
                        isBetter={isWardRateBetter}
                    />
                     <PerformanceMetric 
                        label="Avg. Resolution Time"
                        wardValue={formatDuration(stats.avgWardResolutionTimeMs)}
                        cityValue={formatDuration(stats.avgCityResolutionTimeMs)}
                        isBetter={isWardTimeBetter}
                    />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                     <h4 className="text-sm font-semibold text-gray-600 mb-2">✨ AI Ward Health Summary</h4>
                      {isSummaryLoading ? (
                        <p className="text-sm text-gray-500 italic">Analyzing...</p>
                    ) : (
                        <p className="text-sm text-gray-700">{aiWardSummary}</p>
                    )}
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Live Ward Activity</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {activityFeed.length > 0 ? activityFeed.map(item => (
                        item.type === 'announcement'
                            ? <AnnouncementCard key={(item.data as Announcement).id} announcement={item.data as Announcement} />
                            : (
                                <div key={(item.data as ReportedIssue).id} className="p-3 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => onSelectIssue(item.data as ReportedIssue)}>
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-sm text-gray-800">New Issue: {item.data.category}</p>
                                        <p className="text-xs text-gray-500">{timeAgo(item.data.reportedAt)}</p>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{item.data.description}</p>
                                </div>
                            )
                    )) : <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>}
                </div>
            </div>

            <ResidentJobseekerModule 
                currentUser={currentUser}
                jobseeker={currentUserJobseeker}
                onRegister={onRegisterJobseeker}
                onDeregister={onDeregisterJobseeker}
            />
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;