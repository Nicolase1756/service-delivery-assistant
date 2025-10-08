import * as React from 'react';
import { CouncillorStats } from '../types';

interface CouncillorScorecardProps {
  stats: CouncillorStats;
  rank: number;
}

const formatDuration = (ms: number | null) => {
    if (ms === null) return 'N/A';
    const seconds = ms / 1000;
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${minutes}m`;
};

const getPerformanceRating = (rate: number): { text: string; color: string; } => {
    if (rate >= 80) return { text: 'Excellent', color: 'text-green-600' };
    if (rate >= 60) return { text: 'Good', color: 'text-blue-600' };
    if (rate >= 40) return { text: 'Needs Improvement', color: 'text-yellow-600' };
    return { text: 'Poor', color: 'text-red-600' };
}

const CouncillorScorecard: React.FC<CouncillorScorecardProps> = ({ stats, rank }) => {
    const rating = getPerformanceRating(stats.resolutionRate);
    
    const rankColor = rank === 1 ? 'bg-sa-gold text-sa-black' : rank === 2 ? 'bg-gray-400 text-white' : rank === 3 ? 'bg-yellow-700 text-white' : 'bg-gray-200 text-gray-700';

    const isBetter = stats.cityResolutionRate !== undefined && stats.resolutionRate > stats.cityResolutionRate;
    const difference = stats.cityResolutionRate !== undefined ? Math.abs(stats.resolutionRate - stats.cityResolutionRate) : 0;


    return (
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg text-gray-800">{stats.councillor}</p>
                        <p className="text-sm text-gray-500">Ward {stats.ward}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${rankColor}`}>
                        #{rank}
                    </div>
                </div>
                <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-600">Total Issues</span>
                        <span className="font-semibold text-gray-800">{stats.totalIssues}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-600">Resolved</span>
                         <span className="font-semibold text-gray-800">{stats.resolvedIssues} / {stats.totalIssues}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Avg. Fix Time</span>
                        <span className="font-semibold text-gray-800">{formatDuration(stats.avgResolutionTimeMs)}</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 bg-gray-50 rounded-md p-3 text-center">
                 <p className="text-gray-600 text-sm">Resolution Rate</p>
                 <p className="font-bold text-2xl" style={{color: rating.color}}>{stats.resolutionRate}%</p>
                 <p className={`font-semibold text-xs ${rating.color}`}>({rating.text})</p>
                 {stats.cityResolutionRate !== undefined && (
                    <div className={`mt-2 text-xs flex items-center justify-center gap-1 ${isBetter ? 'text-green-600' : 'text-red-600'}`}>
                        {isBetter ? '▲' : '▼'}
                        <span>{difference.toFixed(1)}% {isBetter ? 'above' : 'below'} city average</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouncillorScorecard;