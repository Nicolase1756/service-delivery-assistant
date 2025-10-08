import * as React from 'react';
import { ReportedIssue, IssueStatus } from '../types';
import { FREE_STATE_MUNICIPALITIES, MOCKED_COUNCILLORS } from '../constants';

// --- Helper Components & Icons ---

const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM10.5 16.5h-1.5a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5z" />
    </svg>
);

const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.683c.65-.935 1-2.056 1-3.228a6.375 6.375 0 01-12.75 0H3a6.375 6.375 0 0111.964 4.683z" />
    </svg>
);

const SecurityBadge: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
    </svg>
);


const StatCounter: React.FC<{ target: number; label: string; suffix?: string; decimals?: number; speed?: number; }> = ({ target, label, suffix = '', decimals = 0, speed = 40 }) => {
    const [count, setCount] = React.useState(0);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        let isMounted = true;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                let start = 0;
                const end = target;
                if (start === end) return;
                const duration = Math.abs(end - start) * speed;
                const startTime = Date.now();

                const timer = () => {
                    const elapsedTime = Date.now() - startTime;
                    const progress = Math.min(elapsedTime / duration, 1);
                    const current = start + (end - start) * progress;
                    if(isMounted) {
                        setCount(current);
                    }
                    if (progress < 1) {
                        requestAnimationFrame(timer);
                    }
                };
                requestAnimationFrame(timer);
                observer.disconnect();
            }
        }, { threshold: 0.5 });

        if (ref.current) observer.observe(ref.current);
        return () => { isMounted = false; observer.disconnect(); };
    }, [target, speed]);

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-ZA', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(num);
    };

    return (
        <div ref={ref} className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-sa-green tracking-tighter">
                {formatNumber(count)}{suffix}
            </p>
            <p className="mt-2 text-sm md:text-base text-gray-600">{label}</p>
        </div>
    );
};

interface WardLocatorProps {
    issues: ReportedIssue[];
}

const WardLocator: React.FC<WardLocatorProps> = ({ issues }) => {
    const [selectedMunicipality, setSelectedMunicipality] = React.useState<string>("");
    const [availableWards, setAvailableWards] = React.useState<number[]>([]);
    const [selectedWard, setSelectedWard] = React.useState<number | "">("");

    const [wardInfo, setWardInfo] = React.useState<{
        councillor: string;
        contact: string;
        stats: { "Open Issues": number; "Resolution Rate": string };
        issues: string[];
    } | null>(null);

    React.useEffect(() => {
        if (selectedMunicipality && FREE_STATE_MUNICIPALITIES[selectedMunicipality]) {
            setAvailableWards(FREE_STATE_MUNICIPALITIES[selectedMunicipality]);
            setSelectedWard(""); 
            setWardInfo(null);
        } else {
            setAvailableWards([]);
            setSelectedWard("");
            setWardInfo(null);
        }
    }, [selectedMunicipality]);

    React.useEffect(() => {
        if (selectedMunicipality && selectedWard) {
            const wardIssues = issues.filter(issue =>
                issue.municipality === selectedMunicipality && issue.ward === selectedWard
            );

            const totalIssues = wardIssues.length;
            const openIssues = wardIssues.filter(i => i.status !== IssueStatus.RESOLVED).length;
            const resolvedIssues = totalIssues - openIssues;
            const resolutionRate = totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(0) + "%" : "N/A";

            const councillor = MOCKED_COUNCILLORS[selectedWard as number] || `Councillor for Ward ${selectedWard}`;
            const contactEmail = `${councillor.split(' ').join('.').toLowerCase()}.w${selectedWard}@servicedelivery.za`;

            const recentIssues = wardIssues.slice(0, 3).map(i => i.description);

            setWardInfo({
                councillor,
                contact: contactEmail,
                stats: { "Open Issues": openIssues, "Resolution Rate": resolutionRate },
                issues: recentIssues
            });
        } else {
            setWardInfo(null);
        }
    }, [selectedMunicipality, selectedWard, issues]);


    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Find Your Ward Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <select 
                    value={selectedMunicipality} 
                    onChange={(e) => setSelectedMunicipality(e.target.value)} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sa-green focus:outline-none"
                    aria-label="Select Municipality"
                >
                    <option value="">Select a Municipality...</option>
                    {Object.keys(FREE_STATE_MUNICIPALITIES).sort().map(muni => <option key={muni} value={muni}>{muni}</option>)}
                </select>
                <select 
                    value={selectedWard} 
                    onChange={(e) => setSelectedWard(Number(e.target.value))} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sa-green focus:outline-none disabled:bg-gray-100"
                    disabled={!selectedMunicipality}
                    aria-label="Select Ward"
                >
                    <option value="">Select a Ward...</option>
                    {availableWards.map(ward => <option key={ward} value={ward}>Ward {ward}</option>)}
                </select>
            </div>

            {wardInfo && (
                <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-sa-green">Ward Councillor</h4>
                        <p className="text-lg text-gray-900">{wardInfo.councillor}</p>
                        <p className="text-sm text-gray-600 truncate">{wardInfo.contact}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-sa-green">Ward Statistics</h4>
                        <div className="flex justify-around mt-2">
                            {Object.entries(wardInfo.stats).map(([key, value]) => (
                                <div key={key} className="text-center">
                                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                                    <p className="text-xs text-gray-500">{key}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                        <h4 className="font-bold text-sa-green">Recent Issues</h4>
                        {wardInfo.issues.length > 0 ? (
                            <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                                {wardInfo.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                            </ul>
                        ) : (
                            <p className="mt-2 text-sm text-gray-500">No recent issues found for this ward.</p>
                        )}
                    </div>
                </div>
            )}
             {!wardInfo && selectedMunicipality && !selectedWard && (
                <div className="text-center p-4 text-gray-500">
                    Please select a ward to see details.
                </div>
            )}
        </div>
    );
};
// --- Main Landing Page Component ---

interface LandingPageProps {
    onLoginClick: () => void;
    onSignUpClick: () => void;
    issues: ReportedIssue[];
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignUpClick, issues }) => {
    return (
        <div className="bg-white text-gray-800 font-sans">
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>

            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="text-lg font-bold text-sa-black">
                            <span className="text-sa-green">REPUBLIC</span> OF <span className="text-sa-green">SOUTH AFRICA</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-2 text-sm">
                            <span className="font-semibold text-gray-600">eThekwini Municipality</span>
                            <span className="text-gray-400">|</span>
                            <span className="font-semibold text-gray-600">City of Johannesburg</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <button onClick={onLoginClick} className="px-4 py-2 text-sm font-semibold text-sa-green border border-sa-green rounded-lg hover:bg-sa-green/10 transition-colors">Log In</button>
                            <button onClick={onSignUpClick} className="px-4 py-2 text-sm font-semibold text-white bg-sa-green rounded-lg hover:bg-sa-green-dark transition-colors">Sign Up</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative text-white py-20 md:py-32 bg-gradient-to-b from-sa-green to-sa-green-dark overflow-hidden">
                <div className="absolute inset-0 bg-repeat opacity-5" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                        Building Better Communities Together
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-sa-gold font-semibold">
                        Official Municipal Service Delivery Platform
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button onClick={onSignUpClick} className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-sa-green bg-sa-gold rounded-lg shadow-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300">
                            Report Service Issue
                        </button>
                        <button onClick={onLoginClick} className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-sa-green transition-colors duration-300">
                            Track Existing Report
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">A Modern Approach to Service Delivery</h2>
                        <p className="mt-4 text-lg text-gray-600">Empowering citizens and municipalities with transparent tools.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-sa-green text-center transition-transform hover:-translate-y-2">
                            <div className="inline-block p-4 bg-sa-gold/10 rounded-full mb-4">
                                <ClipboardIcon className="w-8 h-8 text-sa-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Easy Reporting</h3>
                            <p className="mt-2 text-gray-600">Submit service delivery issues like potholes or water leaks in minutes through our simple, guided form.</p>
                        </div>
                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-sa-green text-center transition-transform hover:-translate-y-2">
                            <div className="inline-block p-4 bg-sa-gold/10 rounded-full mb-4">
                                <ChartBarIcon className="w-8 h-8 text-sa-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Live Tracking</h3>
                            <p className="mt-2 text-gray-600">Receive real-time status updates and monitor the progress of your report from submission to resolution.</p>
                        </div>
                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-sa-green text-center transition-transform hover:-translate-y-2">
                            <div className="inline-block p-4 bg-sa-gold/10 rounded-full mb-4">
                                <UsersIcon className="w-8 h-8 text-sa-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Community Power</h3>
                            <p className="mt-2 text-gray-600">See issues reported by others in your area, highlighting the collective impact of citizen participation.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Live Dashboard Preview */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Live National Dashboard</h2>
                        <p className="mt-4 text-lg text-gray-600">A real-time overview of service delivery performance.</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                        <StatCounter target={1247} label="Issues Resolved This Month" />
                        <StatCounter target={2.3} label="Average Response Time" suffix=" Days" decimals={1} speed={100} />
                        <StatCounter target={92} label="Community Satisfaction" suffix="%" speed={30} />
                        <StatCounter target={156} label="Active Reports" />
                    </div>
                    <div className="max-w-3xl mx-auto space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-base font-medium text-sa-blue">Water & Sanitation</span>
                                <span className="text-sm font-medium text-sa-blue">95% Resolved</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-sa-blue h-2.5 rounded-full" style={{width: '95%'}}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-base font-medium text-sa-red">Roads & Transport</span>
                                <span className="text-sm font-medium text-sa-red">78% Resolved</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-sa-red h-2.5 rounded-full" style={{width: '78%'}}></div></div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* How It Works Section */}
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple & Transparent Process</h2>
                    </div>
                    <div className="relative max-w-2xl mx-auto">
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block"></div>
                        <div className="space-y-12">
                             {/* Step 1 */}
                             <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="z-10 w-12 h-12 flex items-center justify-center bg-sa-green text-white font-bold text-xl rounded-full">1</div>
                                <div className="bg-white p-6 rounded-lg shadow-md flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold">Report</h3>
                                    <p className="mt-1 text-gray-600">Quickly describe your issue, add a photo, and pinpoint the location using our simple form.</p>
                                </div>
                            </div>
                             {/* Step 2 */}
                             <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                                <div className="z-10 w-12 h-12 flex items-center justify-center bg-sa-green text-white font-bold text-xl rounded-full">2</div>
                                <div className="bg-white p-6 rounded-lg shadow-md flex-1 text-center md:text-right">
                                    <h3 className="text-xl font-bold">Track</h3>
                                    <p className="mt-1 text-gray-600">Monitor your report's status in real-time as it's assigned and worked on by the municipality.</p>
                                </div>
                            </div>
                             {/* Step 3 */}
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="z-10 w-12 h-12 flex items-center justify-center bg-sa-green text-white font-bold text-xl rounded-full">3</div>
                                <div className="bg-white p-6 rounded-lg shadow-md flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold">Verify</h3>
                                    <p className="mt-1 text-gray-600">Once the work is done, you'll be notified. Confirm the issue is resolved to your satisfaction.</p>
                                </div>
                            </div>
                             {/* Step 4 */}
                             <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                                <div className="z-10 w-12 h-12 flex items-center justify-center bg-sa-green text-white font-bold text-xl rounded-full">4</div>
                                <div className="bg-white p-6 rounded-lg shadow-md flex-1 text-center md:text-right">
                                    <h3 className="text-xl font-bold">Improve</h3>
                                    <p className="mt-1 text-gray-600">Your feedback helps improve service delivery standards for your entire community.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
             {/* Ward Locator Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                     <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Local Information At Your Fingertips</h2>
                         <p className="mt-4 text-lg text-gray-600">Select your ward to see your councillor, local stats, and recent activity.</p>
                    </div>
                    <WardLocator issues={issues} />
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-sa-black text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                        <div>
                            <h4 className="font-bold text-lg text-sa-gold">Official Platform</h4>
                            <p className="mt-2 text-sm text-gray-300">This platform is an official channel for reporting municipal service delivery issues in the Republic of South Africa.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-sa-gold">Contact</h4>
                            <ul className="mt-2 space-y-1 text-sm text-gray-300">
                                <li>Email: contact@servicedelivery.gov.za</li>
                                <li>Hotline: 0800 123 4567</li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold text-lg text-sa-gold">Trust & Security</h4>
                             <div className="mt-2 flex items-center justify-center md:justify-start gap-2 text-sm text-gray-300">
                                <SecurityBadge className="w-5 h-5" />
                                <span>POPIA Compliant</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
                        <p>&copy; {new Date().getFullYear()} Republic of South Africa. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;