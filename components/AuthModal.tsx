import * as React from 'react';
import { User, Role } from '../types';
import { FREE_STATE_MUNICIPALITIES } from '../constants';

// --- SVG Icon Components ---
const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
);
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);
const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
);

interface AuthModalProps {
  onClose: () => void;
  onLogin: (email: string, pass: string, rememberMe: boolean) => User | null;
  onSignUp: (name: string, email: string, pass: string, municipality: string, ward: number) => User | null;
  initialMode?: 'login' | 'signup';
  users: User[];
  onDemoLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSignUp, initialMode = 'login', users, onDemoLogin }) => {
  const [mode, setMode] = React.useState<'login' | 'signup'>(initialMode);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Sign up state
  const [signUpName, setSignUpName] = React.useState('');
  const [signUpEmail, setSignUpEmail] = React.useState('');
  const [signUpPassword, setSignUpPassword] = React.useState('');
  const [showSignUpPassword, setShowSignUpPassword] = React.useState(false);
  const [signUpMunicipality, setSignUpMunicipality] = React.useState<string>('');
  const [signUpWard, setSignUpWard] = React.useState<number>(1);
  const [availableWards, setAvailableWards] = React.useState<number[]>([]);
  
  // Group users by role for display
  const usersByRole = React.useMemo(() => users.reduce((acc, user) => {
    (acc[user.role] = acc[user.role] || []).push(user);
    return acc;
  }, {} as Record<Role, User[]>), [users]);
  
  const roleOrder: Role[] = [
    Role.RESIDENT,
    Role.MUNICIPAL_WORKER,
    Role.MUNICIPAL_OFFICIAL,
    Role.WARD_COUNCILLOR,
    Role.EXECUTIVE,
    Role.ADMIN,
  ];

  const orderedUsersByRole = roleOrder
    .map(role => ({ role, users: usersByRole[role] }))
    .filter(group => group.users && group.users.length > 0);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);
  
  React.useEffect(() => {
    if (signUpMunicipality && FREE_STATE_MUNICIPALITIES[signUpMunicipality]) {
      setAvailableWards(FREE_STATE_MUNICIPALITIES[signUpMunicipality]);
      setSignUpWard(1);
    } else {
      setAvailableWards([]);
    }
  }, [signUpMunicipality]);

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!signUpName.trim()) { setError('Full Name is required.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(signUpEmail)) { setError('Please enter a valid email address.'); return; }
    if (signUpPassword.length < 6) { setError('Password must be at least 6 characters long.'); return; }
    if (!signUpMunicipality) { setError('Please select your municipality.'); return; }

    setIsLoading(true);
    setTimeout(() => {
        const newUser = onSignUp(signUpName, signUpEmail, signUpPassword, signUpMunicipality, signUpWard);
        setIsLoading(false);
        if (!newUser) {
          setError('An account with this email already exists.');
        } else {
            onClose();
        }
    }, 500);
  };

  const switchMode = (newMode: 'login' | 'signup') => {
      setMode(newMode);
      setError('');
      setSignUpEmail('');
      setSignUpName('');
      setSignUpPassword('');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="text-center p-6 border-b bg-gray-50">
          <h2 className="text-2xl font-bold text-sa-green">ServiceDelivery ZA</h2>
          <p className="text-sm text-gray-500 mt-1">{mode === 'login' ? 'Select a demo user to log in' : 'Create your resident account'}</p>
        </div>

        <div className="p-8">
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
            <div className="font-bold text-yellow-800">🔒 CONFIDENTIAL DEMO</div>
            <div className="text-yellow-700">
              This platform contains protected intellectual property. By accessing, you agree not to copy, share, or reproduce any concepts or code.
            </div>
          </div>
          {mode === 'login' ? (
             <div className="animate-fade-in">
              <div className="max-h-[50vh] overflow-y-auto pr-2 -mr-2">
                {orderedUsersByRole.map(({ role, users }) => (
                  <div key={role} className="mb-4">
                    <h3 className="font-bold text-gray-700 sticky top-0 bg-white py-1">{role}</h3>
                    <div className="mt-2 space-y-2">
                        {users.map(user => (
                            <button
                                key={user.id}
                                onClick={() => onDemoLogin(user)}
                                className="w-full text-left p-3 border rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sa-green transition-all duration-200"
                            >
                                <p className="font-semibold text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-3 animate-fade-in max-h-[50vh] overflow-y-auto pr-4">
               <div>
                <label htmlFor="signup-name" className="sr-only">Full Name</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon /></div>
                    <input type="text" id="signup-name" value={signUpName} onChange={e => setSignUpName(e.target.value)} required className="pl-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Full Name"/>
                 </div>
              </div>
              <div>
                <label htmlFor="signup-email" className="sr-only">Email</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><EmailIcon /></div>
                    <input type="email" id="signup-email" value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} required className="pl-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Email Address"/>
                 </div>
              </div>
              <div>
                <label htmlFor="signup-password" className="sr-only">Password</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockIcon /></div>
                    <input type={showSignUpPassword ? 'text' : 'password'} id="signup-password" value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} required className="pl-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Password (min. 6 characters)"/>
                    <button type="button" onClick={() => setShowSignUpPassword(!showSignUpPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                      {showSignUpPassword ? <EyeOffIcon/> : <EyeIcon/>}
                    </button>
                 </div>
              </div>
              <div>
                <label htmlFor="municipality" className="block text-xs font-medium text-gray-700 mb-1">Your Municipality</label>
                <select id="municipality" value={signUpMunicipality} onChange={(e) => setSignUpMunicipality(e.target.value)} required className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sa-green focus:border-sa-green sm:text-sm rounded-md">
                    <option value="">Select a Municipality...</option>
                    {Object.keys(FREE_STATE_MUNICIPALITIES).map(muni => <option key={muni} value={muni}>{muni}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="ward" className="block text-xs font-medium text-gray-700 mb-1">Your Ward</label>
                <select id="ward" value={signUpWard} onChange={(e) => setSignUpWard(Number(e.target.value))} disabled={!signUpMunicipality} required className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sa-green focus:border-sa-green sm:text-sm rounded-md disabled:bg-gray-200">
                    {availableWards.length > 0 ? (
                      availableWards.map(w => <option key={w} value={w}>Ward {w}</option>)
                    ) : (
                      <option>Please select a municipality first</option>
                    )}
                </select>
              </div>
              {error && <p className="text-sm text-red-600 text-center" role="alert">{error}</p>}
              <button type="submit" disabled={isLoading} className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sa-green hover:bg-sa-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sa-green disabled:bg-gray-400 flex justify-center items-center">
                 {isLoading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Create Account'}
              </button>
            </form>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 border-t text-center text-sm">
          {mode === 'login' ? (
            <p className="text-gray-600">Don't have an account? <button onClick={() => switchMode('signup')} className="font-semibold text-sa-green hover:underline">Sign up</button></p>
          ) : (
            <p className="text-gray-600">Already have an account? <button onClick={() => switchMode('login')} className="font-semibold text-sa-green hover:underline">Log in</button></p>
          )}
        </div>

        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-sa-green">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default AuthModal;