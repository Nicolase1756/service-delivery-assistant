import * as React from 'react';
import { IssueCategory, IssuePriority, User, Role, Department } from './types';

export const WaterDropIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s9.75 11.086 9.75 11.086S21.75 17.385 21.75 12 16.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v5.25a.75.75 0 001.5 0V9z" clipRule="evenodd" />
  </svg>
);

export const RoadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75zm0 3.75a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75z" clipRule="evenodd" />
  </svg>
);

export const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 010 1.06l-1.591 1.59a.75.75 0 11-1.06-1.061l1.59-1.59a.75.75 0 011.06 0zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.803 17.803a.75.75 0 01-1.06 0l-1.59-1.591a.75.75 0 111.06-1.06l1.59 1.59a.75.75 0 010 1.06zM12 21.75a.75.75 0 01-.75-.75v-2.25a.75.75 0 011.5 0V21a.75.75 0 01-.75.75zM6.106 18.894a.75.75 0 011.06 0l1.59 1.59a.75.75 0 01-1.06 1.06l-1.59-1.59a.75.75 0 010-1.06zM3 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3.75A.75.75 0 013 12zM6.197 6.197a.75.75 0 010-1.06l1.59-1.59a.75.75 0 111.061 1.06l-1.59 1.59a.75.75 0 01-1.06 0z" />
  </svg>
);

export const BinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M16.5 4.125a3 3 0 00-3-3h-1.5a3 3 0 00-3 3H3.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-3.75zM9 1.5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 1.5v2.625h-6V1.5z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M4.5 8.25a.75.75 0 00-.75.75v9a3 3 0 003 3h10.5a3 3 0 003-3v-9a.75.75 0 00-.75-.75H4.5zM8.25 10.5a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75zm3.75 0a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75zm3.75 0a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);

export const TrafficSignalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.927 0l-7.5 4.5A.75.75 0 003 7.5v1.18l-1.72.43a.75.75 0 00-.53.7V19.5a.75.75 0 00.75.75h19.5a.75.75 0 00.75-.75v-9.69a.75.75 0 00-.53-.7l-1.72-.43V7.5a.75.75 0 00-.537-.714l-7.5-4.5zM12 6a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0V6.75A.75.75 0 0112 6zm-3 5.25a.75.75 0 00-1.5 0v.01a.75.75 0 001.5 0v-.01zM15 11.25a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm.75 3.75a.75.75 0 00-1.5 0v.01a.75.75 0 001.5 0v-.01z" clipRule="evenodd" />
  </svg>
);

export const SewageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zM21 6.375H3v12h18v-12z" clipRule="evenodd" />
      <path d="M9.452 8.132a.75.75 0 10-1.404-.564l-2.5 6.25a.75.75 0 101.404.564l2.5-6.25zM14.05 13.596a.75.75 0 10-1.404-.564l-2.5 6.25a.75.75 0 101.404.564l2.5-6.25zM18.649 8.132a.75.75 0 10-1.404-.564l-2.5 6.25a.75.75 0 101.404.564l2.5-6.25z" />
  </svg>
);

export const ParkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.927 0l-7.5 4.5A.75.75 0 003 7.5v1.18l-1.72.43a.75.75 0 00-.53.7V19.5a.75.75 0 00.75.75h19.5a.75.75 0 00.75-.75v-9.69a.75.75 0 00-.53-.7l-1.72-.43V7.5a.75.75 0 00-.537-.714l-7.5-4.5zM12 6a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0V6.75A.75.75 0 0112 6zm-3 5.25a.75.75 0 00-1.5 0v.01a.75.75 0 001.5 0v-.01zM15 11.25a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm.75 3.75a.75.75 0 00-1.5 0v.01a.75.75 0 001.5 0v-.01z" clipRule="evenodd" />
  </svg>
);


export const OtherIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.75.75v13.5a.75.75 0 01-1.5 0V5.25A.75.75 0 019 4.5zm6.75 0a.75.75 0 01.75.75v13.5a.75.75 0 01-1.5 0V5.25a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);


// FIX: Corrected and completed the CATEGORY_ICONS object which had a typo and was incomplete.
export const CATEGORY_ICONS: Record<IssueCategory, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  [IssueCategory.WATER]: WaterDropIcon,
  [IssueCategory.POTHOLE]: RoadIcon,
  [IssueCategory.ELECTRICITY]: LightbulbIcon,
  [IssueCategory.WASTE]: BinIcon,
  [IssueCategory.TRAFFIC_SIGNAL]: TrafficSignalIcon,
  [IssueCategory.ILLEGAL_DUMPING]: BinIcon,
  [IssueCategory.PARKS_AND_REC]: ParkIcon,
  [IssueCategory.SEWAGE]: SewageIcon,
  [IssueCategory.OTHER]: OtherIcon,
};

// FIX: Added all missing constants that were causing import errors in multiple files.
export const MOCKED_COUNCILLORS: Record<number, string> = {
  1: 'Eleanor Vance',
  2: 'Ben Carter',
  3: 'Priya Singh',
  4: 'Omar Al-Jamil',
};

export const CATEGORY_DEPARTMENT_MAP: Record<IssueCategory, Department> = {
    [IssueCategory.WATER]: Department.WATER_AND_SANITATION,
    [IssueCategory.SEWAGE]: Department.WATER_AND_SANITATION,
    [IssueCategory.POTHOLE]: Department.ROADS_AND_TRANSPORT,
    [IssueCategory.TRAFFIC_SIGNAL]: Department.ROADS_AND_TRANSPORT,
    [IssueCategory.ELECTRICITY]: Department.ENERGY_AND_ELECTRICITY,
    [IssueCategory.WASTE]: Department.WASTE_MANAGEMENT,
    [IssueCategory.ILLEGAL_DUMPING]: Department.WASTE_MANAGEMENT,
    [IssueCategory.PARKS_AND_REC]: Department.PUBLIC_WORKS,
    [IssueCategory.OTHER]: Department.PUBLIC_WORKS,
};

export const CATEGORY_PRIORITY_MAP: Record<IssueCategory, IssuePriority> = {
    [IssueCategory.WATER]: IssuePriority.HIGH,
    [IssueCategory.SEWAGE]: IssuePriority.HIGH,
    [IssueCategory.POTHOLE]: IssuePriority.MEDIUM,
    [IssueCategory.TRAFFIC_SIGNAL]: IssuePriority.HIGH,
    [IssueCategory.ELECTRICITY]: IssuePriority.HIGH,
    [IssueCategory.WASTE]: IssuePriority.LOW,
    [IssueCategory.ILLEGAL_DUMPING]: IssuePriority.MEDIUM,
    [IssueCategory.PARKS_AND_REC]: IssuePriority.LOW,
    [IssueCategory.OTHER]: IssuePriority.LOW,
};

export const FREE_STATE_MUNICIPALITIES: Record<string, number[]> = {
    "Mangaung Metropolitan Municipality": Array.from({ length: 51 }, (_, i) => i + 1),
    "Masilonyana Local Municipality": Array.from({ length: 15 }, (_, i) => i + 1),
    "Tokologo Local Municipality": Array.from({ length: 7 }, (_, i) => i + 1),
    "Tswelopele Local Municipality": Array.from({ length: 9 }, (_, i) => i + 1),
    "Matjhabeng Local Municipality": Array.from({ length: 45 }, (_, i) => i + 1),
    "Nala Local Municipality": Array.from({ length: 11 }, (_, i) => i + 1),
    "Setsoto Local Municipality": Array.from({ length: 18 }, (_, i) => i + 1),
    "Dihlabeng Local Municipality": Array.from({ length: 20 }, (_, i) => i + 1),
    "Nketoana Local Municipality": Array.from({ length: 13 }, (_, i) => i + 1),
    "Maluti-a-Phofung Local Municipality": Array.from({ length: 36 }, (_, i) => i + 1),
};


export const MOCKED_USERS: User[] = [
  // Admin
  { id: 'admin-1', name: 'Admin User', email: 'admin@servicedelivery.za', password: 'admin', role: Role.ADMIN },
  // Executives
  { id: 'exec-1', name: 'Regina Mills', email: 'mayor@servicedelivery.za', password: 'password', role: Role.EXECUTIVE, title: 'Mayor', municipality: 'Mangaung Metropolitan Municipality' },
  { id: 'exec-2', name: 'David Nolan', email: 'speaker@servicedelivery.za', password: 'password', role: Role.EXECUTIVE, title: 'Speaker', municipality: 'Mangaung Metropolitan Municipality' },
  { id: 'exec-3', name: 'Emma Swan', email: 'manager@servicedelivery.za', password: 'password', role: Role.EXECUTIVE, title: 'Municipal Manager', municipality: 'Mangaung Metropolitan Municipality' },
  { id: 'exec-4', name: 'Mary Margaret', email: 'cfo@servicedelivery.za', password: 'password', role: Role.EXECUTIVE, title: 'Chief Financial Officer', municipality: 'Mangaung Metropolitan Municipality' },
  { id: 'exec-5', name: 'Henry Mills', email: 'coo@servicedelivery.za', password: 'password', role: Role.EXECUTIVE, title: 'Chief Operations Officer', municipality: 'Mangaung Metropolitan Municipality' },
  // Residents
  { id: 'user-1', name: 'Alice Johnson', email: 'alice@email.com', password: 'password', role: Role.RESIDENT, municipality: 'Mangaung Metropolitan Municipality', ward: 1 },
  { id: 'user-2', name: 'David Chen', email: 'david@email.com', password: 'password', role: Role.RESIDENT, municipality: 'Mangaung Metropolitan Municipality', ward: 2 },
  { id: 'user-3', name: 'Maria Garcia', email: 'maria@email.com', password: 'password', role: Role.RESIDENT, municipality: 'Dihlabeng Local Municipality', ward: 3 },
  { id: 'user-4', name: 'Samuel Jones', email: 'samuel@email.com', password: 'password', role: Role.RESIDENT, municipality: 'Dihlabeng Local Municipality', ward: 4 },
  // Ward Councillors
  { id: 'councillor-1', name: 'Eleanor Vance', email: 'cllr.vance@servicedelivery.za', password: 'password', role: Role.WARD_COUNCILLOR, municipality: 'Mangaung Metropolitan Municipality', ward: 1 },
  { id: 'councillor-2', name: 'Ben Carter', email: 'cllr.carter@servicedelivery.za', password: 'password', role: Role.WARD_COUNCILLOR, municipality: 'Mangaung Metropolitan Municipality', ward: 2 },
  { id: 'councillor-3', name: 'Priya Singh', email: 'cllr.singh@servicedelivery.za', password: 'password', role: Role.WARD_COUNCILLOR, municipality: 'Dihlabeng Local Municipality', ward: 3 },
  { id: 'councillor-4', name: 'Omar Al-Jamil', email: 'cllr.aljamil@servicedelivery.za', password: 'password', role: Role.WARD_COUNCILLOR, municipality: 'Dihlabeng Local Municipality', ward: 4 },
  // Municipal Officials
  { id: 'official-1', name: 'James Kirk', email: 'kirk.j@servicedelivery.za', password: 'password', role: Role.MUNICIPAL_OFFICIAL, municipality: 'Mangaung Metropolitan Municipality', department: Department.ROADS_AND_TRANSPORT },
  { id: 'official-2', name: 'Jean-Luc Picard', email: 'picard.jl@servicedelivery.za', password: 'password', role: Role.MUNICIPAL_OFFICIAL, municipality: 'Mangaung Metropolitan Municipality', department: Department.WATER_AND_SANITATION },
  { id: 'official-3', name: 'Kathryn Janeway', email: 'janeway.k@servicedelivery.za', password: 'password', role: Role.MUNICIPAL_OFFICIAL, municipality: 'Dihlabeng Local Municipality', department: Department.ENERGY_AND_ELECTRICITY },
  // Municipal Workers
  { id: 'worker-1', name: 'Miles O\'Brien', email: 'obrien.m@servicedelivery.za', password: 'password', role: Role.MUNICIPAL_WORKER, municipality: 'Mangaung Metropolitan Municipality', department: Department.WATER_AND_SANITATION },
  { id: 'worker-2', name: 'Geordi La Forge', email: 'laforge.g@servicedelivery.za', password: 'password', role: Role.MUNICIPAL_WORKER, municipality: 'Mangaung Metropolitan Municipality', department: Department.ROADS_AND_TRANSPORT },
  { id: 'worker-3', name: 'B\'Elanna Torres', email: 'torres.b@servicedelivery.za', password: 'password', role: Role.MUNICIPAL_WORKER, municipality: 'Dihlabeng Local Municipality', department: Department.PUBLIC_WORKS },
];