import * as React from 'react';
import { Jobseeker, User } from '../types';

interface ResidentJobseekerModuleProps {
    currentUser: User;
    jobseeker: Jobseeker | undefined;
    onRegister: (data: Omit<Jobseeker, 'registeredAt'>) => void;
    onDeregister: (residentId: string) => void;
}

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    return "today";
}


const ResidentJobseekerModule: React.FC<ResidentJobseekerModuleProps> = ({ currentUser, jobseeker, onRegister, onDeregister }) => {
    const [contactInfo, setContactInfo] = React.useState('');
    const [skills, setSkills] = React.useState('');
    const [consent, setConsent] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactInfo || !skills) {
            setError('Please fill in both your contact info and skills.');
            return;
        }
        if (!consent) {
            setError('You must consent to sharing your information.');
            return;
        }
        setError('');
        onRegister({
            residentId: currentUser.id,
            residentName: currentUser.name,
            ward: currentUser.ward!,
            contactInfo,
            skills,
        });
        setContactInfo('');
        setSkills('');
        setConsent(false);
    }

    if (jobseeker) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Community Skills Registry</h3>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex-grow">
                    <p className="font-semibold text-green-800">You are registered!</p>
                    <p className="text-sm text-green-700 mt-1">Your details have been shared with your ward councillor.</p>
                    <div className="mt-4 text-sm space-y-2">
                        <div>
                            <p className="font-bold text-gray-600">Contact:</p>
                            <p className="text-gray-800">{jobseeker.contactInfo}</p>
                        </div>
                         <div>
                            <p className="font-bold text-gray-600">Skills:</p>
                            <p className="text-gray-800 whitespace-pre-wrap">{jobseeker.skills}</p>
                        </div>
                    </div>
                     <p className="text-xs text-gray-500 mt-4">Registered {timeAgo(jobseeker.registeredAt)}</p>
                </div>
                <button 
                    onClick={() => onDeregister(currentUser.id)}
                    className="mt-4 w-full text-center text-sm text-red-600 hover:text-red-800"
                >
                    Remove my registration
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Join the Community Skills Registry</h3>
            <p className="text-sm text-gray-600 mb-4">
                Voluntarily share your skills with your ward councillor to be considered for local work opportunities.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">Contact Info (Phone or Email)</label>
                    <input 
                        type="text" 
                        id="contactInfo"
                        value={contactInfo}
                        onChange={e => setContactInfo(e.target.value)}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sa-green focus:border-sa-green"
                        placeholder="081 234 5678"
                    />
                </div>
                <div>
                     <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills & Experience</label>
                    <textarea 
                        id="skills"
                        rows={4}
                        value={skills}
                        onChange={e => setSkills(e.target.value)}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sa-green focus:border-sa-green"
                        placeholder="e.g., General plumbing, qualified electrician, 5 years of administrative work..."
                    />
                </div>
                <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="consent"
                            type="checkbox"
                            checked={consent}
                            onChange={e => setConsent(e.target.checked)}
                            className="focus:ring-sa-green h-4 w-4 text-sa-green border-gray-300 rounded"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="consent" className="font-medium text-gray-700">Consent</label>
                        <p className="text-gray-500">I agree to share this information with my Ward Councillor for employment purposes.</p>
                    </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div>
                    <button
                        type="submit"
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sa-green hover:bg-sa-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sa-green"
                    >
                        Register My Skills
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResidentJobseekerModule;