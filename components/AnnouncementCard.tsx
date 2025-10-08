import * as React from 'react';
import { Announcement, AnnouncementType } from '../types';

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    if (interval < 1) {
        interval = seconds / 3600;
        if(interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if(interval > 1) return Math.floor(interval) + " minutes ago";
    }
    return "just now";
}

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const AnnouncementCard: React.FC<{ announcement: Announcement }> = ({ announcement }) => {
    const typeStyles: Record<AnnouncementType, { icon: string; border: string; bg: string }> = {
        [AnnouncementType.MEETING]: { icon: '📅', border: 'border-blue-500', bg: 'bg-blue-50' },
        [AnnouncementType.NEWS]: { icon: '📰', border: 'border-gray-400', bg: 'bg-gray-50' },
        [AnnouncementType.ALERT]: { icon: '⚠️', border: 'border-red-500', bg: 'bg-red-50' },
    };

    const { icon, border, bg } = typeStyles[announcement.type];

    return (
        <div className={`p-4 rounded-lg border-l-4 ${border} ${bg}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-gray-800">{icon} {announcement.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Posted by {announcement.authorName} ({announcement.authorRole})
                    </p>
                </div>
                <p className="text-xs text-gray-500 flex-shrink-0 ml-2">{timeAgo(announcement.createdAt)}</p>
            </div>
            <p className="mt-2 text-sm text-gray-700">{announcement.content}</p>

            {announcement.type === AnnouncementType.MEETING && announcement.meetingDetails && (
                <div className="mt-3 pt-3 border-t border-blue-200 text-sm text-gray-800 space-y-1">
                    <p><strong>Date:</strong> {formatDate(announcement.meetingDetails.date)}</p>
                    <p><strong>Time:</strong> {announcement.meetingDetails.time}</p>
                    <p><strong>Location:</strong> {announcement.meetingDetails.location}</p>
                </div>
            )}
        </div>
    );
};

export default AnnouncementCard;