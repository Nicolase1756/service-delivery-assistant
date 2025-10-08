import { Announcement, AnnouncementType, Role } from '../types';

const ANNOUNCEMENTS_STORAGE_KEY = 'service-delivery-announcements';

const generateMockAnnouncements = (): Announcement[] => {
    const now = new Date();
    return [
        {
            id: 'anno-1',
            title: 'Ward 2 Community Meeting',
            content: 'Join Councillor Ben Carter to discuss the upcoming budget allocation for road repairs and park maintenance. All residents of Ward 2 are encouraged to attend and voice their opinions.',
            authorId: 'councillor-2',
            authorName: 'Ben Carter',
            authorRole: Role.WARD_COUNCILLOR,
            createdAt: new Date(now.setDate(now.getDate() - 1)).toISOString(),
            type: AnnouncementType.MEETING,
            ward: 2,
            municipality: 'Mangaung Metropolitan Municipality',
            meetingDetails: {
                date: '2024-08-15',
                time: '18:30',
                location: 'Ward 2 Community Hall',
            }
        },
        {
            id: 'anno-2',
            title: 'Water Supply Interruption Notice',
            content: 'Please be advised that there will be a planned water supply interruption on Friday from 09:00 to 16:00 for essential maintenance on the main pipeline. We apologize for the inconvenience.',
            authorId: 'official-2',
            authorName: 'Jean-Luc Picard',
            authorRole: Role.MUNICIPAL_OFFICIAL,
            createdAt: new Date(now.setDate(now.getDate() - 2)).toISOString(),
            type: AnnouncementType.ALERT,
            ward: 'all',
            municipality: 'Mangaung Metropolitan Municipality',
        },
    ];
}

export const getAnnouncements = (): Announcement[] => {
  try {
    const announcementsJson = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    if (!announcementsJson) {
      const mockAnnouncements = generateMockAnnouncements();
      localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(mockAnnouncements));
      return mockAnnouncements;
    }
    return JSON.parse(announcementsJson).sort((a: Announcement, b: Announcement) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Failed to parse announcements from localStorage", error);
    return [];
  }
};

export const saveAnnouncements = (announcements: Announcement[]): void => {
  try {
    const announcementsJson = JSON.stringify(announcements);
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, announcementsJson);
  } catch (error) {
    console.error("Failed to save announcements to localStorage", error);
  }
};

export const addAnnouncement = (data: Omit<Announcement, 'id' | 'createdAt'>): Announcement => {
    const allAnnouncements = getAnnouncements();
    const newAnnouncement: Announcement = {
        ...data,
        id: `anno-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    const updatedAnnouncements = [newAnnouncement, ...allAnnouncements];
    saveAnnouncements(updatedAnnouncements);
    return newAnnouncement;
};

export const removeAnnouncement = (announcementId: string): void => {
    const allAnnouncements = getAnnouncements();
    const updatedAnnouncements = allAnnouncements.filter(a => a.id !== announcementId);
    saveAnnouncements(updatedAnnouncements);
}