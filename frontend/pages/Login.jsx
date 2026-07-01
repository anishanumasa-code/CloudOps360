import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // NEW MFA STATES
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const identifierRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$|^[a-zA-Z0-9_]{3,20}$/;
    const passwordRegex = /^.{6,}$/;

    if (!identifierRegex.test(identifier)) {
      setError('Invalid format: Enter a valid email or a username (3-20 characters).');
      return; 
    }
    if (!passwordRegex.test(password)) {
      setError('Security alert: Password must be at least 6 characters long.');
      return;
    }

    // Passwords match Regex -> Trigger the Email!
    setIsLoading(true);
    try {
      await fetch('https://cloudops360.onrender.com/api/mfa/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier })
      });
      setShowMfa(true); // Switch to the code input screen
    } catch (err) {
      setError("Failed to reach auth server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://cloudops360.onrender.com/api/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, code: mfaCode })
      });
      const data = await response.json();

      if (data.status === 'success') {
        navigate('/dashboard'); // Success! Go to dashboard.
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (err) {
      setError("Failed to verify code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090A0B] text-white p-4">
      <div className="w-full max-w-md bg-[#121417] border border-[#272A30] rounded-xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-orange-500 mb-2">CloudOps 360</h1>
          <p className="text-[#8A8F98] text-sm">
            {showMfa ? 'Multi-Factor Authentication' : (isLogin ? 'Sign in to access your dashboard' : 'Register a new administrator account')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        {/* STEP 1: LOGIN FORM */}
        {!showMfa ? (
          <form onSubmit={handleInitialSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs text-[#8A8F98] uppercase mb-1">Full Name</label>
                <input type="text" required className="w-full bg-[#1A1D21] border border-[#272A30] rounded-lg px-4 py-2 focus:border-orange-500 focus:outline-none" placeholder="John Doe" />
              </div>
            )}
            <div>
              <label className="block text-xs text-[#8A8F98] uppercase mb-1">Email (For MFA)</label>
              <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full bg-[#1A1D21] border border-[#272A30] rounded-lg px-4 py-2 focus:border-orange-500 focus:outline-none" placeholder="admin@cloudops.com" />
            </div>
            <div>
              <label className="block text-xs text-[#8A8F98] uppercase mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#1A1D21] border border-[#272A30] rounded-lg px-4 py-2 focus:border-orange-500 focus:outline-none" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors mt-6 disabled:opacity-50">
              {isLoading ? 'Connecting...' : (isLogin ? 'Authenticate securely' : 'Create Account')}
            </button>
            <div className="mt-6 text-center">
              <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-[#8A8F98] hover:text-white transition-colors">
                {isLogin ? "Don't have an account? Register here." : "Already have an account? Sign in."}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: MFA CODE ENTRY */
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="text-center text-sm text-gray-300 mb-6">
              We just sent a 6-digit code to <span className="font-bold text-white">{identifier}</span>.
            </div>
            <div>
              <label className="block text-xs text-[#8A8F98] uppercase mb-1 text-center">Enter 6-Digit Code</label>
              <input type="text" required value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} maxLength="6" className="w-full bg-[#1A1D21] border border-[#272A30] rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:border-orange-500 focus:outline-none" placeholder="------" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition-colors mt-6 disabled:opacity-50">
              {isLoading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}