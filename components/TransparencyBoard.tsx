import * as React from 'react';
import { ReportedIssue } from '../types';
import { useIssueStats } from '../services/useIssueStats';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import CouncillorScorecard from './CouncillorScorecard';
import { generateAccountabilityReport } from '../services/geminiService';
import KPICard, { formatDuration } from './KPICard';

const COLORS = ['#007A4D', '#FFB612', '#DE3831', '#000000', '#8884d8'];
const STATUS_COLORS = {'Pending': '#FFB612', 'In Progress': '#00A8E0', 'Resolved': '#007A4D'};

const simpleMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return '';
    
    const lines = markdown.split('\n');
    let html = '';
    let inList = false;

    for (const line of lines) {
        let processedLine = line.trim();
        if (!processedLine) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            continue; 
        }

        // Inline formatting first
        processedLine = processedLine
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Block formatting
        if (processedLine.startsWith('### ')) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<h3 class="text-base font-bold mt-3 mb-1">${processedLine.substring(4)}</h3>`;
        } else if (processedLine.startsWith('- ')) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li class="ml-4" style="list-style-type: disc;">${processedLine.substring(2)}</li>`;
        } else {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<p class="text-sm mb-2">${processedLine}</p>`;
        }
    }

    if (inList) {
        html += '</ul>'; // Close any open list at the end
    }

    return html;
};


const TransparencyBoard: React.FC<{ issues: ReportedIssue[] }> = ({ issues }) => {
    const { 
        issuesByStatus, 
        categoryChartData, 
        councillorStats,
        totalIssues,
        resolvedIssues,
        avgResolutionTimeMs,
        overallSentiment,
        issuesOverTime,
    } = useIssueStats(issues);

    const [aiReport, setAiReport] = React.useState<string>('');
    const [isGenerating, setIsGenerating] = React.useState<boolean>(true);

    React.useEffect(() => {
        const handleGenerateReport = async () => {
            if(!issues || issues.length === 0) return;
            setIsGenerating(true);
            const report = await generateAccountabilityReport(issues, overallSentiment, avgResolutionTimeMs);
            const formattedReport = simpleMarkdownToHtml(report);
            setAiReport(formattedReport);
            setIsGenerating(false);
        };
        handleGenerateReport();
    }, [issues, overallSentiment, avgResolutionTimeMs]);

    const overallResolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transparency Dashboard</h1>
            <p className="text-lg text-gray-600 mb-6">An open view into our municipality's performance.</p>

            {/* KPI Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KPICard title="Total Issues" value={totalIssues} color="text-sa-black" />
                <KPICard title="Resolution Rate" value={`${overallResolutionRate.toFixed(1)}%`} color={overallResolutionRate > 75 ? "text-green-600" : "text-yellow-600"}/>
                <KPICard title="Avg. Resolution Time" value={formatDuration(avgResolutionTimeMs)} color="text-blue-600" />
                <KPICard title="Positive Sentiment" value={`${overallSentiment.positivePercentage.toFixed(1)}%`} color="text-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-8">
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Issue Trends (Last 30 Days)</h2>
                        <ResponsiveContainer width="100%" height={250}>
                             <LineChart data={issuesOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{fontSize: 12}} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Reported" stroke="#FFB612" strokeWidth={2} name="Reported Issues"/>
                                <Line type="monotone" dataKey="Resolved" stroke="#007A4D" strokeWidth={2} name="Resolved Issues"/>
                            </LineChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Issues by Status</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={issuesByStatus} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} fill="#8884d8" label={({ name, count }) => `${name}: ${count}`}>
                                        {issuesByStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Top 5 Categories</h2>
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categoryChartData.slice(0,5)} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                                    <Tooltip />
                                    <Bar dataKey="count" name="Issues" fill="#007A4D" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                     </div>
                </div>
                 <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md flex flex-col">
                     <h2 className="text-xl font-bold text-gray-800 mb-4">✨ AI Accountability Report</h2>
                     {isGenerating ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                             <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating analysis...</span>
                        </div>
                     ) : (
                         <div className="prose prose-sm max-w-none text-sm flex-grow overflow-auto" dangerouslySetInnerHTML={{ __html: aiReport }} />
                     )}
                </div>
            </div>

            {/* Councillor Scorecards */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Councillor Performance Scorecards</h2>
                {councillorStats.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {councillorStats.map((stats, index) => (
                            <CouncillorScorecard key={stats.councillor} stats={stats} rank={index + 1} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No councillor data available.</p>
                )}
            </div>

        </div>
    );
};

export default TransparencyBoard;