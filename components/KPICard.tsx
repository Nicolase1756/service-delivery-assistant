import * as React from 'react';

export const formatDuration = (ms: number | null): string => {
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


const KPICard: React.FC<{ title: string; value: string | number | null | undefined; color?: string }> = ({ title, value, color = 'text-sa-black' }) => (
    <div className="bg-white p-4 rounded-lg shadow transition-shadow hover:shadow-md">
        <p className="text-sm text-gray-500 truncate">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{value ?? 'N/A'}</p>
    </div>
);

export default KPICard;