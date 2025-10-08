import * as React from 'react';
import { ReportedIssue, User, Jobseeker, Announcement } from '../types';
import IssueCard from './IssueCard';
import { useCouncillorStats } from '../services/useCouncillorStats';
import KPICard, { formatDuration } from './KPICard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector, BarChart, Bar } from 'recharts';
import { generateCouncillorBriefing } from '../services/geminiService';
import CreateAnnouncementModal from './CreateAnnouncementModal';


interface CouncillorDashboardProps {
  issues: ReportedIssue[];
  onSelectIssue: (issue: ReportedIssue) => void;
  councillor: User;
  jobseekers: Jobseeker[];
  onAddAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt'>) => void;
  activeTab: string;
}

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize={24} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
       <text x={cx} y={cy} dy={28} textAnchor="middle" fill="#333" fontSize={14}>
        Positive
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

const PerformanceMetric: React.FC<{label: string; wardValue: string; cityValue: string; isBetter: boolean | null}> = ({ label, wardValue, cityValue, isBetter }) => (
    <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <div className="flex items-baseline justify-between mt-1">
            <p className="text-xl font-bold text-sa-green">{wardValue}</p>
            {isBetter !== null && (
                <span className={`text-xs font-semibold flex items-center ${isBetter ? 'text-green-600' : 'text-red-600'}`}>
                    {isBetter ? '▲ Better' : '▼ Worse'}
                </span>
            )}
        </div>
        <p className="text-xs text-gray-500">Municipality Avg: {cityValue}</p>
    </div>
);


const CouncillorDashboard: React.FC<CouncillorDashboardProps> = ({ issues, onSelectIssue, councillor, jobseekers, onAddAnnouncement, activeTab }) => {
  const [aiBriefing, setAiBriefing] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState(true);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = React.useState(false);

  if (!councillor.ward || !councillor.municipality) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-red-700">Configuration Error</h2>
        <p className="text-gray-600 mt-2">This user account is missing required ward or municipality information.</p>
      </div>
    );
  }
  
  const stats = useCouncillorStats(issues, councillor.ward, councillor.municipality, councillor.name);
  const wardJobseekers = jobseekers.filter(j => j.ward === councillor.ward);
  const wardIssues = issues.filter(i => i.ward === councillor.ward && i.municipality === councillor.municipality);

  React.useEffect(() => {
    const fetchBriefing = async () => {
      if (stats) {
        setIsGenerating(true);
        const briefing = await generateCouncillorBriefing(stats);
        setAiBriefing(briefing);
        setIsGenerating(false);
      }
    };
    fetchBriefing();
  }, [stats]);


  if (!stats) {
    return (
       <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-700">Could not load councillor data.</h2>
      </div>
    )
  }

  const sentimentData = [
    { name: 'Satisfied', value: stats.sentiment.satisfied },
    { name: 'Unsatisfied', value: stats.sentiment.unsatisfied },
  ];
  
  const sentimentColors = ['#007A4D', '#DE3831'];
  
  const isWardRateBetter = stats.cityResolutionRate !== undefined ? stats.resolutionRate > stats.cityResolutionRate : null;
  const isWardTimeBetter = stats.avgResolutionTimeMs !== null && stats.avgCityResolutionTimeMs !== null ? stats.avgResolutionTimeMs < stats.avgCityResolutionTimeMs : null;
  
  const renderContent = () => {
    switch (activeTab) {
        case 'dashboard':
            return (
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                           <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">✨ AI Weekly Briefing</h2>
                                {isGenerating ? (
                                     <div className="flex items-center justify-center h-48">
                                        <svg className="animate-spin h-8 w-8 text-sa-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="ml-3 text-gray-600">Generating insights...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: aiBriefing.replace(/\n/g, '<br />') }} />
                                )}
                            </div>
                           <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Issue Trends (Last 30 Days)</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={stats.issuesOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                        </div>
                        <div className="space-y-8">
                             <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Key Metrics</h3>
                                <div className="space-y-4">
                                    <PerformanceMetric 
                                        label="Resolution Rate"
                                        wardValue={`${stats.resolutionRate.toFixed(1)}%`}
                                        cityValue={`${stats.cityResolutionRate?.toFixed(1)}%`}
                                        isBetter={isWardRateBetter}
                                    />
                                     <PerformanceMetric 
                                        label="Avg. Resolution Time"
                                        wardValue={formatDuration(stats.avgResolutionTimeMs)}
                                        cityValue={formatDuration(stats.avgCityResolutionTimeMs)}
                                        isBetter={isWardTimeBetter}
                                    />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Community Sentiment</h2>
                                {stats.sentiment.satisfied + stats.sentiment.unsatisfied > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie 
                                                data={sentimentData} 
                                                cx="50%" 
                                                cy="50%" 
                                                labelLine={false}
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                activeIndex={0}
                                                activeShape={renderActiveShape}
                                            >
                                                {sentimentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={sentimentColors[index % sentimentColors.length]} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500">
                                        <p>No resident feedback submitted yet for resolved issues in this ward.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'issues':
            return (
                <div className="p-6">
                    {wardIssues.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wardIssues.map((issue) => (
                                <IssueCard key={issue.id} issue={issue} onClick={() => onSelectIssue(issue)} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <h2 className="text-xl font-semibold text-gray-700">No issues reported in this ward.</h2>
                        </div>
                    )}
                </div>
            );
        case 'jobseekers':
             return (
                <div className="p-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        {wardJobseekers.length > 0 ? (
                            <div className="space-y-4">
                                {wardJobseekers.sort((a,b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()).map(j => (
                                    <div key={j.residentId} className="p-4 border rounded-md hover:bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-gray-800">{j.residentName}</p>
                                            <p className="text-sm text-gray-500">Contact: {j.contactInfo}</p>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{j.skills}</p>
                                        <p className="mt-2 text-right text-xs text-gray-400">Registered on {new Date(j.registeredAt).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <h2 className="text-xl font-semibold text-gray-700">No residents have registered in the jobseeker registry.</h2>
                                <p className="text-gray-500 mt-2">Encourage residents in your ward to register their skills.</p>
                            </div>
                        )}
                    </div>
                </div>
            );
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
          currentUser={councillor}
        />
      )}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Councillor Command Center</h1>
          <p className="text-lg text-gray-600">{councillor.municipality}</p>
          <p className="text-md text-gray-500">Ward {councillor.ward} Dashboard for Cllr. {councillor.name}</p>
        </div>
        <button 
            onClick={() => setIsAnnouncementModalOpen(true)}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sa-green hover:bg-sa-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sa-green">
            📢 Post Announcement
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard title="Total Issues in Ward" value={stats.totalIssues} color="text-sa-black" />
        <KPICard title="Jobseekers Registered" value={wardJobseekers.length} color="text-sa-blue" />
        <KPICard title="Resolution Rate" value={`${stats.resolutionRate.toFixed(1)}%`} color="text-green-600" />
        <KPICard title="Avg. Resolution Time" value={formatDuration(stats.avgResolutionTimeMs)} color="text-blue-600" />
      </div>
      
      <div className="bg-gray-50 rounded-lg shadow-sm">
        {renderContent()}
      </div>
    </div>
  );
};

export default CouncillorDashboard;
