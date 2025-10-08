import * as React from 'react';
import { ReportedIssue, User, Announcement, WardPerformance, ResidentRating } from '../types';
import { useExecutiveStats } from '../services/useExecutiveStats';
import KPICard, { formatDuration } from './KPICard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import IssueCard from './IssueCard';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import { generateExecutiveSummary } from '../services/geminiService';
import AnnouncementCard from './AnnouncementCard';

interface ExecutiveDashboardProps {
  issues: ReportedIssue[];
  onSelectIssue: (issue: ReportedIssue) => void;
  currentUser: User;
  onAddAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt'>) => void;
  announcements: Announcement[];
  activeTab: string;
}

const COLORS = ['#007A4D', '#FFB612', '#00A8E0', '#DE3831', '#6A4D9A'];
const SENTIMENT_COLORS = ['#007A4D', '#DE3831'];

const WardLeaderboard: React.FC<{data: WardPerformance[]}> = ({data}) => {
    if (!data || data.length === 0) {
        return <p className="text-sm text-gray-500 text-center">No ward data available.</p>
    }
    return (
        <div className="space-y-2">
            {data.slice(0, 5).map((ward, index) => (
                <div key={ward.ward} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-100">
                    <div className="flex items-center">
                        <span className="font-bold text-gray-600 w-6">{index + 1}.</span>
                        <div>
                            <p className="font-semibold text-gray-800">Ward {ward.ward}</p>
                            <p className="text-xs text-gray-500">{ward.councillor}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg text-sa-green">{ward.resolutionRate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">{ward.totalIssues} issues</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ issues, onSelectIssue, currentUser, onAddAnnouncement, announcements, activeTab }) => {
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = React.useState(false);
    
    const {
        overallResolutionRate,
        overallAvgResolutionTimeMs,
        openIssuesCount,
        criticalIssues,
        departmentalPerformance,
        overallSentiment,
        wardPerformance,
    } = useExecutiveStats(issues, currentUser.municipality!);
    
    const [aiSummary, setAiSummary] = React.useState('');
    const [isGenerating, setIsGenerating] = React.useState(true);
    
    const sentimentData = [
        { name: ResidentRating.SATISFIED, value: overallSentiment.satisfied },
        { name: ResidentRating.UNSATISFIED, value: overallSentiment.unsatisfied },
    ].filter(d => d.value > 0);

    React.useEffect(() => {
        const fetchSummary = async () => {
            setIsGenerating(true);
            const summary = await generateExecutiveSummary(
                overallResolutionRate,
                openIssuesCount,
                departmentalPerformance,
                criticalIssues.length
            );
            setAiSummary(summary);
            setIsGenerating(false);
        };
        if(currentUser.municipality) {
            fetchSummary();
        }
    }, [issues, currentUser.municipality, overallResolutionRate, openIssuesCount, departmentalPerformance, criticalIssues.length]); 

    if(!currentUser.municipality){
        return <div className="p-8">Executive user is not assigned to a municipality.</div>
    }

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">✨ AI Executive Summary</h2>
                            {isGenerating ? (
                                <div className="flex items-center justify-center h-48">
                                    <svg className="animate-spin h-8 w-8 text-sa-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            ) : (
                                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br />') }} />
                            )}
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Community Sentiment</h2>
                            {sentimentData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                                            {sentimentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-10">No resident feedback has been submitted yet.</p>
                            )}
                        </div>
                    </div>
                )
            case 'departments':
                return (
                    <div className="p-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Department Performance (by Resolution Rate)</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={departmentalPerformance} layout="vertical" margin={{ left: 100 }}>
                                    <XAxis type="number" unit="%" domain={[0, 100]} />
                                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                                    <Bar dataKey="resolutionRate" fill="#007A4D" background={{ fill: '#eee' }}>
                                        {departmentalPerformance.map((entry, index) => (
                                            <Cell cursor="pointer" fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )
            case 'wards':
                 return (
                    <div className="p-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Ward Performance Leaderboard</h2>
                            <WardLeaderboard data={wardPerformance} />
                        </div>
                    </div>
                )
            case 'critical':
                return (
                     <div className="p-6">
                        <div className="bg-white p-4 rounded-lg shadow space-y-4 max-h-[60vh] overflow-y-auto">
                            {criticalIssues.length > 0 ? (
                                criticalIssues.map((issue) => (
                                    <IssueCard key={issue.id} issue={issue} onClick={() => onSelectIssue(issue)} />
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <h3 className="text-lg font-semibold text-gray-700">No critical issues.</h3>
                                    <p className="text-gray-500 mt-1">There are no high-priority issues older than 3 days.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            case 'announcements':
                const municipalAnnouncements = announcements.filter(a => a.municipality?.trim() === currentUser.municipality?.trim());
                return (
                    <div className="p-6">
                        <div className="bg-white p-4 rounded-lg shadow space-y-4 max-h-[60vh] overflow-y-auto">
                            {municipalAnnouncements.length > 0 ? (
                                municipalAnnouncements.map((ann) => (
                                    <AnnouncementCard key={ann.id} announcement={ann} />
                                ))
                            ) : (
                                <div className="text-center py-12">
                                <h3 className="text-xl font-semibold text-gray-700">No announcements found for {currentUser.municipality}.</h3>
                                <p className="text-gray-500 mt-2">Use the "Post Announcement" button to create one.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Executive Command Center</h1>
                    <p className="text-lg text-gray-600">{currentUser.municipality}</p>
                    <p className="text-md text-gray-500">Welcome, {currentUser.name} - <span className="font-semibold">{currentUser.title}</span></p>
                </div>
                <button 
                    onClick={() => setIsAnnouncementModalOpen(true)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sa-green hover:bg-sa-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sa-green">
                    📢 Post Municipality-Wide Announcement
                </button>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <KPICard title="Overall Resolution Rate" value={`${overallResolutionRate.toFixed(1)}%`} color="text-green-600" />
                <KPICard title="Total Open Issues" value={openIssuesCount} color="text-yellow-600" />
                <KPICard title="Avg. Resolution Time" value={formatDuration(overallAvgResolutionTimeMs)} color="text-blue-600" />
                <KPICard title="Critical Issues" value={criticalIssues.length} color="text-red-600" />
                <KPICard title="Positive Sentiment" value={`${overallSentiment.positivePercentage.toFixed(1)}%`} color="text-purple-600" />
            </div>

            <div className="bg-gray-50 rounded-lg shadow-sm">
                {renderContent()}
            </div>
        </div>
    );
};

export default ExecutiveDashboard;