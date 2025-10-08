import * as React from 'react';
import { User, Role, ReportedIssue, Announcement, Jobseeker } from '../types';
import KPICard from './KPICard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdminDashboardProps {
    users: User[];
    issues: ReportedIssue[];
    announcements: Announcement[];
    jobseekers: Jobseeker[];
    currentUser: User;
    onDeleteAnnouncement: (announcementId: string) => void;
    activeTab: string;
}

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}m ago`;
    return `just now`;
};

const ROLE_COLORS = ['#007A4D', '#FFB612', '#DE3831', '#000000', '#4a148c', '#0d47a1'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, issues, announcements, jobseekers, currentUser, onDeleteAnnouncement, activeTab }) => {
    const [userFilter, setUserFilter] = React.useState<Role | 'All'>('All');

    const filteredUsers = React.useMemo(() => {
        if (userFilter === 'All') return users;
        return users.filter(user => user.role === userFilter);
    }, [users, userFilter]);

    const usersByRole = React.useMemo(() => {
        // FIX: The accumulator in `reduce` was not typed, causing downstream type errors.
        // I've provided a generic argument to `reduce` to correctly type the accumulator.
        const counts = users.reduce<Record<Role, number>>((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }, [users]);
    
     const issuesByMunicipality = React.useMemo(() => {
        // FIX: The accumulator in `reduce` was not typed. Adding a generic argument to `reduce` correctly types the accumulator, which in turn ensures `count` is inferred as a number and resolves the arithmetic error in the `.sort()` method.
        const counts = issues.reduce<Record<string, number>>((acc, issue) => {
            if (issue.municipality) {
                 acc[issue.municipality] = (acc[issue.municipality] || 0) + 1;
            }
            return acc;
        }, {});
        return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    }, [issues]);

    const handleSimulatedAction = (action: string, userName: string) => {
        alert(`Simulated Action: '${action}' for user '${userName}'. In a real app, this would trigger a backend process.`);
    }

    const handleDelete = (announcementId: string) => {
        if (window.confirm("Are you sure you want to retract this announcement? This action cannot be undone.")) {
            onDeleteAnnouncement(announcementId);
        }
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="p-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">System Health Overview</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-center text-gray-700">Users by Role</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie data={usersByRole} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                                {usersByRole.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-center text-gray-700">Issues by Municipality</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={issuesByMunicipality} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                            <XAxis dataKey="name" tick={{fontSize: 10}} angle={-25} textAnchor="end" height={60} />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#007A4D" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 'users':
                return (
                     <div className="p-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">User Management</h2>
                            <div className="flex flex-wrap gap-2 mb-4 border-b pb-4">
                                <button onClick={() => setUserFilter('All')} className={`px-3 py-1 text-sm rounded-full ${userFilter === 'All' ? 'bg-sa-green text-white' : 'bg-gray-200 text-gray-700'}`}>All Users</button>
                                {Object.values(Role).map(role => (
                                    <button key={role} onClick={() => setUserFilter(role)} className={`px-3 py-1 text-sm rounded-full ${userFilter === role ? 'bg-sa-green text-white' : 'bg-gray-200 text-gray-700'}`}>{role}</button>
                                ))}
                            </div>
                            <div className="overflow-x-auto max-h-[600px]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Municipality</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.municipality || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.ward ? `Ward ${user.ward}` : user.department ? user.department : user.title || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <button onClick={() => handleSimulatedAction('Reset Password', user.name)} className="text-blue-600 hover:text-blue-800 text-xs">Reset Password</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'content':
                return (
                    <div className="p-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                             <h2 className="text-xl font-bold text-gray-800 mb-4">Content Oversight</h2>
                             <div className="bg-gray-50 p-4 rounded-lg shadow-inner space-y-3 max-h-[720px] overflow-y-auto">
                                <h3 className="font-semibold text-gray-700">All Announcements ({announcements.length})</h3>
                                {announcements.map(ann => (
                                    <div key={ann.id} className="bg-white p-3 rounded-md shadow-sm border">
                                        <p className="font-bold text-sm text-gray-800 truncate">{ann.title}</p>
                                        <p className="text-xs text-gray-500">by {ann.authorName} ({ann.authorRole}) - {timeAgo(ann.createdAt)}</p>
                                        <div className="mt-2 text-right">
                                            <button onClick={() => handleDelete(ann.id)} className="text-xs text-red-600 hover:text-red-800 font-semibold">Retract</button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                );
            case 'data':
                 return (
                    <div className="p-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Jobseeker Registry</h2>
                             <div className="overflow-x-auto max-h-[600px]">
                                <table className="min-w-full divide-y divide-gray-200">
                                     <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {jobseekers.map((j) => (
                                            <tr key={j.residentId}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{j.residentName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ward {j.ward}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{j.contactInfo}</td>
                                                <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-500 max-w-sm">{j.skills}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    </div>
                );
        }
    }


    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">App Builder Command Center</h1>
                <p className="text-lg text-gray-600">Welcome, {currentUser.name}. You have full system oversight.</p>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KPICard title="Total Users" value={users.length} color="text-blue-600" />
                <KPICard title="Total Issues Reported" value={issues.length} color="text-yellow-600" />
                <KPICard title="Total Announcements" value={announcements.length} color="text-green-600" />
                <KPICard title="Registered Jobseekers" value={jobseekers.length} color="text-purple-600" />
            </div>
            
            <div className="bg-gray-50 rounded-lg shadow-sm">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;