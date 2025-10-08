import * as React from 'react';
import { Announcement, AnnouncementType, Role, User } from '../types';

interface CreateAnnouncementModalProps {
    onClose: () => void;
    onAddAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt'>) => void;
    currentUser: User;
}

const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({ onClose, onAddAnnouncement, currentUser }) => {
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
    const [type, setType] = React.useState<AnnouncementType>(AnnouncementType.NEWS);
    
    // Meeting specific state
    const [meetingDate, setMeetingDate] = React.useState('');
    const [meetingTime, setMeetingTime] = React.useState('');
    const [meetingLocation, setMeetingLocation] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) {
            alert('Please fill in a title and content.');
            return;
        }

        const announcementData: Omit<Announcement, 'id' | 'createdAt'> = {
            title,
            content,
            type,
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorRole: currentUser.role,
            ward: currentUser.role === Role.WARD_COUNCILLOR ? currentUser.ward! : 'all',
            municipality: currentUser.municipality!,
        };

        if (type === AnnouncementType.MEETING) {
            if (!meetingDate || !meetingTime || !meetingLocation) {
                alert('Please provide all meeting details.');
                return;
            }
            announcementData.meetingDetails = {
                date: meetingDate,
                time: meetingTime,
                location: meetingLocation,
            };
        }

        onAddAnnouncement(announcementData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900">Post a New Announcement</h2>
                        <p className="text-sm text-gray-500 mt-1">This will be visible to residents.</p>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type of Announcement</label>
                            <select
                                id="type"
                                value={type}
                                onChange={e => setType(e.target.value as AnnouncementType)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sa-green focus:border-sa-green sm:text-sm rounded-md"
                            >
                                {Object.values(AnnouncementType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sa-green focus:border-sa-green"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                            <textarea
                                id="content"
                                rows={5}
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sa-green focus:border-sa-green"
                                required
                            />
                        </div>

                        {type === AnnouncementType.MEETING && (
                            <div className="p-4 bg-gray-50 rounded-lg space-y-3 border">
                                <h4 className="font-semibold text-gray-800">Meeting Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label htmlFor="meetingDate" className="block text-sm font-medium text-gray-700">Date</label>
                                        <input type="date" id="meetingDate" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" required />
                                    </div>
                                    <div>
                                        <label htmlFor="meetingTime" className="block text-sm font-medium text-gray-700">Time</label>
                                        <input type="time" id="meetingTime" value={meetingTime} onChange={e => setMeetingTime(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" required />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="meetingLocation" className="block text-sm font-medium text-gray-700">Location</label>
                                    <input type="text" id="meetingLocation" value={meetingLocation} onChange={e => setMeetingLocation(e.target.value)} placeholder="e.g., Community Hall" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" required />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 border border-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sa-green hover:bg-sa-green/90">
                            Post Announcement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAnnouncementModal;