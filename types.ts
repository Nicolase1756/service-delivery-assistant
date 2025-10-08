export enum Page {
  HOME = 'Home',
  REPORT_ISSUE = 'Report Issue',
  MY_REPORTS = 'My Reports',
  MUNICIPALITY_LOGIN = 'Municipality Login',
  TRANSPARENCY_BOARD = 'Transparency Board',
}

export enum IssueStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
}

export enum IssueCategory {
  WATER = 'Water Leak',
  POTHOLE = 'Pothole',
  ELECTRICITY = 'Electricity Fault',
  WASTE = 'Waste Removal',
  TRAFFIC_SIGNAL = 'Traffic Signal Fault',
  ILLEGAL_DUMPING = 'Illegal Dumping',
  PARKS_AND_REC = 'Parks Maintenance',
  SEWAGE = 'Sewage Problem',
  OTHER = 'Other',
}

export enum IssuePriority {
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
}

export enum HistoryEventType {
    CREATED = 'created',
    STATUS_CHANGED = 'status_changed',
    COMMENT = 'comment',
    RATED = 'rated',
    ASSIGNED = 'assigned',
    PHOTO_ADDED = 'photo_added',
}

export enum ResidentRating {
    SATISFIED = 'Satisfied',
    UNSATISFIED = 'Unsatisfied',
}

export enum Role {
    RESIDENT = 'Resident',
    WARD_COUNCILLOR = 'Ward Councillor',
    MUNICIPAL_OFFICIAL = 'Municipal Official',
    MUNICIPAL_WORKER = 'Municipal Worker',
    EXECUTIVE = 'Executive',
    ADMIN = 'Admin',
}

export enum Department {
    WATER_AND_SANITATION = 'Water & Sanitation',
    ROADS_AND_TRANSPORT = 'Roads & Transport',
    ENERGY_AND_ELECTRICITY = 'Energy & Electricity',
    WASTE_MANAGEMENT = 'Waste Management',
    PUBLIC_WORKS = 'Public Works',
}

export enum AnnouncementType {
    MEETING = 'Meeting',
    NEWS = 'News',
    ALERT = 'Alert',
}

export type User = {
    id: string;
    name: string;
    email: string; // Added for login
    password?: string; // NOTE: For simulation only. NEVER store plaintext passwords in a real app.
    role: Role;
    municipality?: string; // For all users except system-wide Admin
    title?: string; // For executives
    ward?: number; // For councillors and residents
    department?: Department; // For officials and workers
}


export type HistoryEvent = {
    id: string;
    timestamp: string;
    type: HistoryEventType;
    user: 'Resident' | 'Municipality' | 'System';
    details: string;
};


export interface ReportedIssue {
  id: string;
  category: IssueCategory;
  description: string;
  location: string;
  photoBase64: string | null;
  beforeWorkPhotoBase64: string | null;
  afterWorkPhotoBase64: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  reportedAt: string; // ISO string
  resolvedAt?: string; // ISO string
  residentId: string;
  municipality: string;
  ward: number;
  councillor: string;
  history: HistoryEvent[];
  rating: ResidentRating | null;
  assignedTo: string | null; // Worker's user ID
  department: Department;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    authorRole: Role;
    createdAt: string; // ISO string
    type: AnnouncementType;
    ward: number | 'all';
    municipality: string;
    meetingDetails?: {
        date: string; // YYYY-MM-DD
        time: string; // HH:MM
        location: string;
    };
}

export interface TrendDataPoint {
    date: string;
    Reported: number;
    Resolved: number;
}

export interface SentimentData {
    satisfied: number;
    unsatisfied: number;
    positivePercentage: number;
}

export interface CouncillorStats {
  councillor: string;
  ward: number;
  totalIssues: number;
  resolvedIssues: number;
  resolutionRate: number; // percentage
  avgResolutionTimeMs: number | null;
  issuesOverTime: TrendDataPoint[];
  sentiment: SentimentData;
  categoryBreakdown: { name: string; count: number }[];
  cityResolutionRate?: number;
  avgCityResolutionTimeMs?: number | null;
}

export interface Jobseeker {
    residentId: string;
    residentName: string;
    ward: number;
    contactInfo: string;
    skills: string;
    registeredAt: string; // ISO String
}

export interface WardPerformance {
    ward: number;
    councillor: string;
    resolutionRate: number;
    totalIssues: number;
}

export interface DepartmentTrendDataPoint {
    date: string;
    Reported: number;
    Resolved: number;
}