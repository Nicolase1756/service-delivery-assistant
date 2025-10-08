import * as React from 'react';
import { Page, User, Role } from '../types';

interface HeaderProps {
  activePage: Page;
  setPage: (page: Page) => void;
  currentUser: User;
  onLogout: () => void;
  activeDashboardTab: string;
  setActiveDashboardTab: (tab: string) => void;
}

const NavButton: React.FC<{
  page: Page;
  activePage: Page;
  setPage: (page: Page) => void;
  children: React.ReactNode;
  isMobile?: boolean;
  onClick?: () => void;
}> = ({ page, activePage, setPage, children, isMobile = false, onClick }) => {
  const isActive = activePage === page;
  const baseClasses = isMobile 
    ? 'block px-3 py-2 rounded-md text-base font-medium w-full text-left'
    : 'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200';
  const activeClasses = isMobile ? 'bg-sa-gold text-sa-black' : 'bg-sa-gold text-sa-black shadow-lg';
  const inactiveClasses = isMobile ? 'text-gray-300 hover:bg-white/20 hover:text-white' : 'bg-sa-green-dark/50 text-white hover:bg-sa-green-dark/70';

  const handleClick = () => {
    setPage(page);
    if (onClick) onClick();
  };
  
  return (
    <button onClick={handleClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {children}
    </button>
  );
};

const TabButton: React.FC<{
  tabName: string;
  activeTab: string;
  setTab: (tab: string) => void;
  children: React.ReactNode;
  isMobile?: boolean;
}> = ({ tabName, activeTab, setTab, children, isMobile = false }) => {
  const isActive = activeTab === tabName;
  const baseClasses = isMobile 
    ? 'block px-3 py-2 rounded-md text-base font-medium w-full text-left'
    : 'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200';
  const activeClasses = isMobile ? 'bg-sa-gold text-sa-black' : 'bg-sa-gold text-sa-black shadow-lg';
  const inactiveClasses = isMobile ? 'text-gray-300 hover:bg-white/20 hover:text-white' : 'bg-sa-green-dark/50 text-white hover:bg-sa-green-dark/70';

  return (
    <button onClick={() => setTab(tabName)} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {children}
    </button>
  );
};


const Header: React.FC<HeaderProps> = ({ activePage, setPage, currentUser, onLogout, activeDashboardTab, setActiveDashboardTab }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const headerImageUrl = 'https://images.unsplash.com/photo-1519757912456-51e6f671c263?q=80&w=2670&auto=format&fit=crop';

  const renderNavLinks = (isMobile = false) => {
    if (currentUser.role === Role.RESIDENT) {
      return (
        <>
          <NavButton page={Page.HOME} activePage={activePage} setPage={setPage} isMobile={isMobile} onClick={() => setIsMenuOpen(false)}>Dashboard</NavButton>
          <NavButton page={Page.REPORT_ISSUE} activePage={activePage} setPage={setPage} isMobile={isMobile} onClick={() => setIsMenuOpen(false)}>Report Issue</NavButton>
          <NavButton page={Page.MY_REPORTS} activePage={activePage} setPage={setPage} isMobile={isMobile} onClick={() => setIsMenuOpen(false)}>My Reports</NavButton>
          <NavButton page={Page.TRANSPARENCY_BOARD} activePage={activePage} setPage={setPage} isMobile={isMobile} onClick={() => setIsMenuOpen(false)}>Transparency Board</NavButton>
        </>
      );
    }
    
    // Dashboard Tab Navigation for other roles
    const tabs: { [key in Role]?: { name: string; label: string }[] } = {
      [Role.MUNICIPAL_WORKER]: [
        { name: 'queue', label: 'My Work Queue' },
        { name: 'available', label: 'Available' },
        { name: 'resolved', label: 'Resolved' },
      ],
      [Role.MUNICIPAL_OFFICIAL]: [
        { name: 'dashboard', label: 'Dashboard' },
        { name: 'triage', label: 'Triage Queue' },
        { name: 'active', label: 'Active Issues' },
        { name: 'team', label: 'Team Performance' },
      ],
      [Role.WARD_COUNCILLOR]: [
        { name: 'dashboard', label: 'Dashboard' },
        { name: 'issues', label: 'Ward Issues' },
        { name: 'jobseekers', label: 'Jobseekers' },
      ],
      [Role.EXECUTIVE]: [
        { name: 'dashboard', label: 'Dashboard' },
        { name: 'departments', label: 'Departments' },
        { name: 'wards', label: 'Wards' },
        { name: 'critical', label: 'Critical' },
        { name: 'announcements', label: 'Announcements'},
      ],
      [Role.ADMIN]: [
        { name: 'dashboard', label: 'Dashboard' },
        { name: 'users', label: 'Users' },
        { name: 'content', label: 'Content' },
        { name: 'data', label: 'Data' },
      ],
    };

    const currentTabs = tabs[currentUser.role] || [];

    return (
      <>
        {currentTabs.map(tab => (
          <TabButton key={tab.name} tabName={tab.name} activeTab={activeDashboardTab} setTab={setActiveDashboardTab} isMobile={isMobile}>{tab.label}</TabButton>
        ))}
      </>
    );
  };


  return (
    <nav 
        className="relative shadow-lg text-white bg-cover bg-center"
        style={{ backgroundImage: `url(${headerImageUrl})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-sa-black/60"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold shadow-text">ServiceDelivery ZA</span>
            </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {renderNavLinks(false)}
                </div>
              </div>
          </div>
          <div className="flex items-center">
             {/* Desktop and Non-Resident Mobile view user info */}
            <div className="hidden md:flex items-center">
              <div className="text-right mr-4">
                <p className="text-sm font-medium text-white shadow-text">{currentUser.name}</p>
                <p className="text-xs text-gray-200 shadow-text">{currentUser.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-white/20 text-white hover:bg-white/30 shadow-md"
              >
                Log Out
              </button>
            </div>
            
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="bg-white/10 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sa-green-dark focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-sa-green-dark/90 backdrop-blur-sm">
            {renderNavLinks(true)}
          </div>
           <div className="pt-4 pb-3 border-t border-sa-green bg-sa-green-dark/90 backdrop-blur-sm">
              <div className="flex items-center px-5">
                  <div className="text-left">
                      <div className="text-base font-medium leading-none text-white">{currentUser.name}</div>
                      <div className="text-sm font-medium leading-none text-gray-300 mt-1">{currentUser.email}</div>
                  </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                  <button
                      onClick={() => { onLogout(); setIsMenuOpen(false); }}
                      className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/20"
                  >
                      Log Out
                  </button>
              </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;