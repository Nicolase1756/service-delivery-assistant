import * as React from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ReportIssue from './components/ReportIssue';
import MyReports from './components/MyReports';
import MunicipalityView from './components/MunicipalityView';
import TransparencyBoard from './components/TransparencyBoard';
import IssueDetailModal from './components/IssueDetailModal';
import AuthModal from './components/AuthModal';
import CouncillorDashboard from './components/CouncillorDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import ProtectionAgreement from './components/ProtectionAgreement';
import ProtectionShield from './components/ProtectionShield';

import { Page, ReportedIssue, IssueStatus, ResidentRating, User, Role, Jobseeker, Announcement } from './types';
import { getIssues, saveIssues, addIssue as addIssueService, updateIssueStatus as updateIssueStatusService, addComment as addCommentService, updateIssueRating as updateIssueRatingService, assignIssueToWorker as assignIssueToWorkerService, addWorkPhoto as addWorkPhotoService } from './services/issueService';
import { getJobseekers, addJobseeker as addJobseekerService, removeJobseeker as removeJobseekerService } from './services/jobseekerService';
import { getAnnouncements, addAnnouncement as addAnnouncementService, removeAnnouncement as removeAnnouncementService } from './services/announcementService';
import { MOCKED_USERS } from './constants';

const REMEMBER_ME_KEY = 'service-delivery-remember-me';
const AGREEMENT_KEY = 'service-delivery-agreement-agreed';

function App() {
  const [issues, setIssues] = React.useState<ReportedIssue[]>([]);
  const [jobseekers, setJobseekers] = React.useState<Jobseeker[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [users, setUsers] = React.useState<User[]>(MOCKED_USERS);
  
  const [currentPage, setCurrentPage] = React.useState<Page>(Page.HOME);
  const [activeDashboardTab, setActiveDashboardTab] = React.useState<string>('dashboard');
  const [selectedIssue, setSelectedIssue] = React.useState<ReportedIssue | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState<boolean>(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login');
  
  const [notification, setNotification] = React.useState<string | null>(null);

  const [hasAgreed, setHasAgreed] = React.useState<boolean>(() => {
    return sessionStorage.getItem(AGREEMENT_KEY) === 'true';
  });

  React.useEffect(() => {
    // Check for a remembered user on initial load
    const rememberedEmail = localStorage.getItem(REMEMBER_ME_KEY);
    if (rememberedEmail) {
        // NOTE: In a real app, you'd validate a token. Here we simulate by finding the user.
        const user = MOCKED_USERS.find(u => u.email.toLowerCase() === rememberedEmail.toLowerCase());
        if (user) {
            setCurrentUser(user);
        }
    }

    setIssues(getIssues().sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()));
    setJobseekers(getJobseekers());
    setAnnouncements(getAnnouncements());
  }, []);
  
  const handleAgreement = () => {
    sessionStorage.setItem(AGREEMENT_KEY, 'true');
    setHasAgreed(true);
  };

  const refreshIssues = (updatedIssue: ReportedIssue | undefined) => {
    if (!updatedIssue) return;
    const newIssues = issues.map(issue => issue.id === updatedIssue.id ? updatedIssue : issue);
    saveIssues(newIssues); // Persist
    setIssues(newIssues); // Update state
    if (selectedIssue && selectedIssue.id === updatedIssue.id) {
        setSelectedIssue(updatedIssue);
    }
  }

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleAddIssue = React.useCallback((newIssueData: Omit<ReportedIssue, 'id' | 'reportedAt' | 'status' | 'councillor' | 'history' | 'rating' | 'assignedTo' | 'department' | 'beforeWorkPhotoBase64' | 'afterWorkPhotoBase64'>) => {
    const newIssue = addIssueService(newIssueData);
    setIssues(prevIssues => [newIssue, ...prevIssues]);
    showNotification('Issue reported successfully!');
  }, []);

  const handleReportSuccess = React.useCallback(() => {
    setCurrentPage(Page.MY_REPORTS);
  }, []);
  
  const handleUpdateStatus = React.useCallback((id: string, status: IssueStatus) => {
    if(!currentUser) return;
    const updatedIssue = updateIssueStatusService(id, status, currentUser.name);
    refreshIssues(updatedIssue);
    showNotification(`Issue status updated to "${status}".`);
  }, [issues, selectedIssue, currentUser]);

  const handleAddComment = React.useCallback((id: string, comment: string) => {
     if(!currentUser) return;
    const userRole = currentUser.role === Role.RESIDENT ? 'Resident' : 'Municipality';
    const updatedIssue = addCommentService(id, comment, userRole);
    refreshIssues(updatedIssue);
    showNotification(`Comment added.`);
  }, [issues, selectedIssue, currentUser]);

  const handleUpdateRating = React.useCallback((id: string, rating: ResidentRating) => {
    const updatedIssue = updateIssueRatingService(id, rating);
    refreshIssues(updatedIssue);
    showNotification(`Thank you for your feedback!`);
  }, [issues, selectedIssue]);
  
  const handleAssignIssue = React.useCallback((id: string) => {
    if(!currentUser) return;
    const updatedIssue = assignIssueToWorkerService(id, currentUser.id, currentUser.name);
    refreshIssues(updatedIssue);
    showNotification(`Issue assigned to you.`);
  }, [issues, selectedIssue, currentUser]);

  const handleAssignIssueByOfficial = React.useCallback((issueId: string, workerId: string, workerName: string) => {
    const updatedIssue = assignIssueToWorkerService(issueId, workerId, workerName);
    refreshIssues(updatedIssue);
    showNotification(`Issue assigned to ${workerName}.`);
  }, [issues, selectedIssue]);
  
  const handleAddWorkPhoto = React.useCallback((issueId: string, photoBase64: string, type: 'before' | 'after') => {
      if(!currentUser) return;
      const updatedIssue = addWorkPhotoService(issueId, photoBase64, type, currentUser.name);
      refreshIssues(updatedIssue);
      showNotification(`${type === 'before' ? 'Before' : 'After'} work photo added.`);
  }, [issues, selectedIssue, currentUser]);

  const handleRegisterJobseeker = React.useCallback((data: Omit<Jobseeker, 'registeredAt'>) => {
      addJobseekerService(data);
      setJobseekers(getJobseekers());
      showNotification('Successfully registered your skills!');
  }, []);

  const handleDeregisterJobseeker = React.useCallback((residentId: string) => {
      removeJobseekerService(residentId);
      setJobseekers(getJobseekers());
      showNotification('You have been removed from the registry.');
  }, []);

  const handleAddAnnouncement = React.useCallback((data: Omit<Announcement, 'id' | 'createdAt'>) => {
      const newAnnouncement = addAnnouncementService(data);
      setAnnouncements(prev => [newAnnouncement, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      showNotification('Announcement posted successfully!');
  }, []);

  const handleDeleteAnnouncement = React.useCallback((announcementId: string) => {
      removeAnnouncementService(announcementId);
      setAnnouncements(getAnnouncements());
      showNotification('Announcement has been retracted.');
  }, []);

  // --- Auth Handlers ---
  const handleLogin = (email: string, pass: string, rememberMe: boolean): User | null => {
    // 1. Sanitize inputs for robust matching.
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 2. Find the user by email first, being robust to stored data with spaces.
    const user = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

    // 3. If a user is found, explicitly verify their password.
    if (user && user.password === cleanPass) {
        // Login success
        if (rememberMe) {
            localStorage.setItem(REMEMBER_ME_KEY, user.email);
        } else {
            localStorage.removeItem(REMEMBER_ME_KEY);
        }
        setCurrentUser(user);
        setCurrentPage(Page.HOME);
        if (user.role === Role.MUNICIPAL_WORKER) {
            setActiveDashboardTab('queue');
        } else {
            setActiveDashboardTab('dashboard');
        }
        showNotification(`Welcome back, ${user.name}!`);
        return user;
    }

    // 4. If user not found or password doesn't match, return null.
    return null;
  };

  const handleDemoLogin = (user: User) => {
    setCurrentUser(user);
    // No "remember me" for demo sessions
    localStorage.removeItem(REMEMBER_ME_KEY);
    setCurrentPage(Page.HOME);
    if (user.role === Role.MUNICIPAL_WORKER) {
        setActiveDashboardTab('queue');
    } else {
        setActiveDashboardTab('dashboard');
    }
    showNotification(`Welcome, ${user.name}! You are now logged in.`);
    setIsAuthModalOpen(false);
  };

  const handleSignUp = (name: string, email: string, pass: string, municipality: string, ward: number): User | null => {
      const cleanEmail = email.trim().toLowerCase();
      
      // Check for existing users using the cleaned email
      if (users.some(u => u.email.trim().toLowerCase() === cleanEmail)) {
          return null; // Email already exists
      }

      // Create the new user object with clean data
      const newUser: User = {
          id: `user-${Date.now()}`,
          name: name.trim(),
          email: email.trim(), // Store the trimmed version, but preserve original casing
          password: pass.trim(),
          role: Role.RESIDENT,
          municipality,
          ward
      };
      
      // A simple validation
      if (!newUser.name || !newUser.email || !newUser.password) {
          return null;
      }

      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setCurrentPage(Page.HOME);
      showNotification(`Welcome, ${name}! Your account has been created.`);
      return newUser;
  };

  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem(REMEMBER_ME_KEY);
      showNotification("You have been logged out.");
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
      setAuthMode(mode);
      setIsAuthModalOpen(true);
  };


  const renderPage = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case Role.ADMIN:
        return <AdminDashboard 
                    users={users} 
                    issues={issues}
                    announcements={announcements}
                    jobseekers={jobseekers}
                    currentUser={currentUser} 
                    onDeleteAnnouncement={handleDeleteAnnouncement}
                    activeTab={activeDashboardTab}
                />;
      case Role.EXECUTIVE:
        return <ExecutiveDashboard issues={issues} onSelectIssue={setSelectedIssue} currentUser={currentUser} onAddAnnouncement={handleAddAnnouncement} announcements={announcements} activeTab={activeDashboardTab} />;
      case Role.MUNICIPAL_OFFICIAL:
        return <MunicipalityView issues={issues} onSelectIssue={setSelectedIssue} currentUser={currentUser} onAddAnnouncement={handleAddAnnouncement} activeTab={activeDashboardTab} />;
      case Role.WARD_COUNCILLOR:
        return <CouncillorDashboard issues={issues} onSelectIssue={setSelectedIssue} councillor={currentUser} jobseekers={jobseekers} onAddAnnouncement={handleAddAnnouncement} activeTab={activeDashboardTab} />;
      case Role.MUNICIPAL_WORKER:
        return <WorkerDashboard issues={issues} onSelectIssue={setSelectedIssue} worker={currentUser} activeTab={activeDashboardTab} />;
      case Role.RESIDENT:
        switch (currentPage) {
          case Page.HOME:
            return <Dashboard 
                        issues={issues}
                        announcements={announcements} 
                        onSelectIssue={setSelectedIssue} 
                        currentUser={currentUser}
                        jobseekers={jobseekers}
                        onRegisterJobseeker={handleRegisterJobseeker}
                        onDeregisterJobseeker={handleDeregisterJobseeker}
                        onReportIssueClick={() => setCurrentPage(Page.REPORT_ISSUE)}
                    />;
          case Page.REPORT_ISSUE:
            return <ReportIssue addIssue={handleAddIssue} onReportSuccess={handleReportSuccess} currentUser={currentUser}/>;
          case Page.MY_REPORTS:
            return <MyReports issues={issues} onSelectIssue={setSelectedIssue} residentId={currentUser.id} />;
          case Page.TRANSPARENCY_BOARD:
            return <TransparencyBoard issues={issues.filter(i => i.municipality === currentUser.municipality)} />;
          default:
            return <Dashboard 
                        issues={issues}
                        announcements={announcements} 
                        onSelectIssue={setSelectedIssue} 
                        currentUser={currentUser}
                        jobseekers={jobseekers}
                        onRegisterJobseeker={handleRegisterJobseeker}
                        onDeregisterJobseeker={handleDeregisterJobseeker}
                        onReportIssueClick={() => setCurrentPage(Page.REPORT_ISSUE)}
                    />;
        }
      default:
        console.error("Unknown user role:", currentUser.role);
        return <div className="p-8 text-center text-red-500">Error: User role not recognized. Please log out and try again.</div>;
    }
  };
  
  if (!hasAgreed) {
    return <ProtectionAgreement onAgree={handleAgreement} />;
  }

  if (!currentUser) {
    return (
        <>
            <ProtectionShield />
            <LandingPage onLoginClick={() => openAuthModal('login')} onSignUpClick={() => openAuthModal('signup')} issues={issues} />
            {isAuthModalOpen && <AuthModal 
                onClose={() => setIsAuthModalOpen(false)} 
                onLogin={handleLogin} 
                onSignUp={handleSignUp} 
                initialMode={authMode} 
                users={users}
                onDemoLogin={handleDemoLogin}
            />}
        </>
    )
  }


  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <ProtectionShield />
      <Header 
        activePage={currentPage} 
        setPage={setCurrentPage} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        activeDashboardTab={activeDashboardTab}
        setActiveDashboardTab={setActiveDashboardTab}
       />
      <main>
        {renderPage()}
      </main>
      <IssueDetailModal 
        issue={selectedIssue} 
        onClose={() => setSelectedIssue(null)}
        currentUser={currentUser}
        allUsers={users}
        onStatusChange={handleUpdateStatus}
        onAddComment={handleAddComment}
        onRateIssue={handleUpdateRating}
        onAssignIssue={handleAssignIssue}
        onAssignIssueByOfficial={handleAssignIssueByOfficial}
        onAddWorkPhoto={handleAddWorkPhoto}
      />
      {notification && (
        <div className="fixed bottom-5 right-5 bg-sa-black text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out z-50">
          {notification}
        </div>
      )}
      <style>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(10px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .shadow-text {
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}

export default App;