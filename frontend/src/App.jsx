import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Metrics from './pages/Metrics';
import AiCopilot from './pages/AiCopilot';
import KnowledgeBase from './pages/KnowledgeBase';
import { apiFetch, API_BASE } from './utils/api';
import './App.css';

function Home() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  // Auth Modal States
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | 'forgot' | 'reset-code' | null
  const [identifier, setIdentifier] = useState(''); // email or username
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('operator');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Reset Password States
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // MFA States
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  
  const navigate = useNavigate();

  // Check login state and API health on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }

    fetch(API_BASE)
      .then(response => {
        if (response.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      })
      .catch(() => {
        setApiStatus('offline');
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      // Step 1: Request auth credentials check
      const formData = new URLSearchParams();
      formData.append('username', identifier);
      formData.append('password', password);

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed. Please verify credentials.');
      }

      if (data.mfa_required) {
        setShowMfa(true);
        setError('');
      } else {
        // Fallback in case MFA is bypassed by backend config
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          const mockUser = { username: identifier, role: 'operator' };
          localStorage.setItem('user', JSON.stringify(mockUser));
          setIsLoggedIn(true);
          setUser(mockUser);
          setAuthModal(null);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Step 2: Verify MFA code
      const response = await fetch(`${API_BASE}/auth/verify-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier, code: mfaCode })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid verification code.');
      }

      if (data.access_token) {
        // Save the token first
        localStorage.setItem('token', data.access_token);

        // Fetch the real user profile from the backend using the fresh token
        const profileRes = await fetch(`${API_BASE}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        let userObj;
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          userObj = {
            username: profileData.username,
            email: profileData.email,
            full_name: profileData.full_name,
            role: profileData.role
          };
        } else {
          // Graceful fallback if profile fetch fails
          userObj = { username: identifier, role: 'operator' };
        }

        localStorage.setItem('user', JSON.stringify(userObj));
        setIsLoggedIn(true);
        setUser(userObj);
        setAuthModal(null);
        resetForm();
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      // Validate inputs
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!usernameRegex.test(username)) {
        throw new Error('Username must be 3-20 characters (alphanumeric, underscores, hyphens).');
      }
      if (!passwordRegex.test(password)) {
        throw new Error('Password must be 8+ chars and contain uppercase, lowercase, digit, and special char (@$!%*?&).');
      }

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email: identifier,
          full_name: fullName,
          password,
          role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed.');
      }

      setSuccessMsg('Account registered successfully! You can now log in.');
      setAuthModal('login');
      // Autofill email/username field
      setIdentifier(username);
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to dispatch reset code.');
      }

      setSuccessMsg('Reset code dispatched! Check SRE console logs.');
      setAuthModal('reset-code');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must contain 8+ characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          code: resetCode,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Reset failed.');
      }

      setSuccessMsg('Password changed successfully! You can now log in.');
      setAuthModal('login');
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIdentifier('');
    setPassword('');
    setFullName('');
    setUsername('');
    setRole('operator');
    setError('');
    setSuccessMsg('');
    setShowMfa(false);
    setMfaCode('');
    setShowPassword(false);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
  };

  const openModal = (type) => {
    resetForm();
    setAuthModal(type);
  };

  return (
    <div className="relative min-h-screen bg-[#090A0B] text-[#FAFAFA] font-sans selection:bg-orange-500/30 overflow-x-hidden">
      
      {/* BACKGROUND GRID & GLOWS */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#272A30_1px,transparent_1px),linear-gradient(to_bottom,#272A30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[500px] bg-orange-500/15 blur-[120px] rounded-full pointer-events-none"></div>

      {/* FLOATING BACKGROUND PANELS */}
      <div className="absolute top-[25%] left-[5%] md:left-[10%] p-4 rounded-xl bg-[#121417]/80 backdrop-blur-md border border-[#272A30] w-48 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] group cursor-default z-0 hidden md:block">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[#8A8F98] text-xs font-mono uppercase tracking-wider">Node Alpha</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
        <div className="h-2 w-full bg-[#090A0B] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 w-[78%] group-hover:w-[85%] transition-all duration-1000"></div>
        </div>
        <div className="text-[#8A8F98] text-xs mt-2 text-right">78% CPU</div>
      </div>

      <div className="absolute top-[40%] right-[5%] md:right-[10%] p-4 rounded-xl bg-[#121417]/80 backdrop-blur-md border border-[#272A30] w-56 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] group cursor-default z-0 hidden md:block">
        <div className="text-[#8A8F98] text-xs font-mono uppercase tracking-wider mb-2">Global Latency</div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white group-hover:text-orange-400 transition-colors duration-300">12</span>
          <span className="text-[#8A8F98] text-sm">ms</span>
        </div>
        <div className="mt-3 flex gap-1 h-8 items-end opacity-50 group-hover:opacity-100 transition-opacity duration-300">
          {[40, 70, 45, 90, 65, 30, 85].map((height, i) => (
            <div key={i} className="w-full bg-[#272A30] rounded-t-sm hover:bg-orange-500 transition-colors duration-200" style={{ height: `${height}%` }}></div>
          ))}
        </div>
      </div>

      {/* NAVIGATION WITH DYNAMIC BUTTONS */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#272A30]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-bold tracking-tight hover:scale-105 transition-transform duration-300 cursor-pointer">
          CloudOps<span className="text-orange-500">360</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 mr-4">
            <a href="#" className="text-[#8A8F98] hover:text-[#FAFAFA] transition-all duration-300 text-sm font-medium">Documentation</a>
            <a href="#" className="text-[#8A8F98] hover:text-[#FAFAFA] transition-all duration-300 text-sm font-medium">GitHub</a>
          </div>
          {isLoggedIn ? (
            <>
              <span className="text-sm text-[#8A8F98] hidden sm:inline">Operator: <span className="text-white font-semibold">{user?.username}</span></span>
              <Link to="/dashboard" className="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors">Dashboard</Link>
              <button onClick={handleLogout} className="px-4 py-1.5 rounded-lg border border-[#272A30] text-[#FAFAFA] hover:bg-red-500/10 hover:border-red-500/30 text-sm font-medium transition-all duration-300">Log Out</button>
            </>
          ) : (
            <>
              <button onClick={() => openModal('login')} className="text-[#FAFAFA] hover:text-orange-400 text-sm font-medium transition-colors">Log In</button>
              <button onClick={() => openModal('register')} className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-400 hover:scale-105 active:scale-95 transition-all duration-300 text-sm font-medium shadow-[0_0_15px_rgba(249,115,22,0.2)]">Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {/* MAIN HERO CONTENT */}
      <main className="flex flex-col items-center justify-center pt-32 px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121417]/90 border border-[#272A30] text-[#8A8F98] text-xs font-mono mb-8 hover:bg-[#1a1d21] hover:border-[#3a3f47] transition-colors duration-300 cursor-pointer shadow-lg">
          {apiStatus === 'checking' && <><span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> Checking Connection...</>}
          {apiStatus === 'online' && <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Backend API: <span className="text-[#FAFAFA]">ALL SYSTEMS GO</span></>}
          {apiStatus === 'offline' && <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Backend API: <span className="text-red-400">DISCONNECTED</span></>}
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
          Orchestrate with <br/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 transition-all duration-500 cursor-default">
            Absolute Precision
          </span>
        </h1>
        
        <p className="text-[#8A8F98] max-w-2xl text-lg md:text-xl mb-10 mx-auto leading-relaxed">
          CloudOps360 is your complete command center for modern infrastructure. Seamlessly provision resources, monitor real-time DBMS schemas—including entity types and attributes—and track global performance metrics from a single pane of glass.
        </p>
        
        <div className="flex justify-center gap-5">
          {isLoggedIn ? (
            <Link to="/dashboard" className="px-8 py-3.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-400 hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all duration-300 flex items-center gap-2 group">
              Enter Console
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          ) : (
            <button onClick={() => openModal('register')} className="px-8 py-3.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-400 hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all duration-300 flex items-center gap-2 group cursor-pointer">
              Start Free Trial
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}
          
          <button 
            onClick={() => isLoggedIn ? navigate('/dashboard') : openModal('login')} 
            className="px-8 py-3.5 rounded-lg bg-[#121417] border border-[#272A30] text-[#FAFAFA] hover:bg-[#1a1d24] hover:border-[#3a3f47] hover:scale-105 active:scale-95 transition-all duration-300 font-medium flex items-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8A8F98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Dashboard
          </button>
        </div>
      </main>

      {/* AESTHETIC GLASS AUTH MODAL OVERLAY */}
      {authModal && (
        <div className="fixed inset-0 bg-[#090A0B]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="w-full max-w-md glass-modal rounded-2xl p-8 border border-orange-500/20 shadow-[0_0_50px_rgba(249,115,22,0.15)] relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setAuthModal(null)}
              className="absolute top-4 right-4 text-[#8A8F98] hover:text-[#FAFAFA] transition-colors p-1.5 rounded-lg hover:bg-[#1A1D21] cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2 mb-1">
                <span className="text-orange-500">CloudOps</span>360
              </h2>
              <p className="text-[#8A8F98] text-sm">
                {showMfa ? 'Multi-Factor Verification' : authModal === 'login' ? 'Access your operations console' : 'Register an administrator node'}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg text-center font-mono">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg text-center font-mono animate-fade-in">
                {successMsg}
              </div>
            )}

            {/* STEP 1: INITIAL LOGIN FORM */}
            {authModal === 'login' && !showMfa && (
              <form onSubmit={handleInitialSubmit} className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-mono text-[#8A8F98] uppercase mb-1.5 tracking-wider">Username or Email</label>
                  <input 
                    type="text" 
                    required 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-[#121417] border border-[#272A30] rounded-lg px-4 py-3 text-sm focus:border-orange-500/60 focus:outline-none glow-input text-white transition-all" 
                    placeholder="admin / admin@cloudops.com" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8A8F98] uppercase mb-1.5 tracking-wider">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#121417] border border-[#272A30] rounded-lg pl-4 pr-16 py-3 text-sm focus:border-orange-500/60 focus:outline-none glow-input text-white transition-all" 
                      placeholder="••••••••" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#8A8F98] hover:text-[#FAFAFA] transition-colors cursor-pointer select-none px-2 py-1 hover:bg-[#1A1D21] rounded"
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-400 active:scale-95 transition-all text-sm shadow-[0_0_15px_rgba(249,115,22,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  {isLoading ? 'Verifying Credentials...' : 'Sign In Securely'}
                </button>

                <div className="flex flex-col gap-2 mt-6 text-center">
                  <button 
                    type="button" 
                    onClick={() => { setError(''); setSuccessMsg(''); setAuthModal('register'); }} 
                    className="text-xs font-medium text-[#8A8F98] hover:text-orange-400 transition-colors"
                  >
                    Need a new operator node? Register here.
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setError(''); setSuccessMsg(''); setAuthModal('forgot'); }} 
                    className="text-xs font-medium text-orange-400/80 hover:text-orange-400 transition-colors underline decoration-dotted mt-1.5"
                  >
                    Forgot password or need to reset?
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER FORM */}
            {authModal === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-mono text-[#8A8F98] uppercase mb-1.5 tracking-wider">Username</label>
                  <input 
                    type="text" 
                    required 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#121417] border border-[#272A30] rounded-lg px-4 py-2.5 text-sm focus:border-orange-500/60 focus:outline-none glow-input text-white transition-all" 
                    placeholder="sre_agent" 
                  />
                  <p className="text-[10px] text-[#8A8F98] mt-1 font-mono">Alphanumeric, underscores, 3-20 characters.</p>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8A8F98] uppercase mb-1.5 tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-[#121417] border border-[#272A30] rounded-lg px-4 py-2.5 text-sm focus:border-orange-500/60 focus:outline-none glow-input text-white transition-all" 
                    placeholder="agent@cloudops.com" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8A8F98] uppercase mb-1.5 tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#121417] border border-[#272A30] rounded-lg px-4 py-2.5 text-sm focus:border-orange-500/60 focus:outline-none glow-input text-white transition-all" 
                    placeholder="John Doe" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8A8F98] uppercase mb-1.5 tracking-wider">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#121417] border border-[#272A30] rounded-lg pl-4 pr-16 py-2.5 text-sm focus:border-orange-500/60 focus:outline-none glow-input text-white transition-all" 
                      placeholder="••••••••" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#8A8F98] hover:text-[#FAFAFA] transition-colors cursor-pointer select-none px-2 py-1 hover:bg-[#1A1D21] rounded"
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  <p className="text-[9px] text-[#8A8F98] mt-1 font-mono leading-tight">Must contain 8+ characters, 1 uppercase, 1 lowercase, 1 number, 1 special character (@$!%*?&).</p>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8A8F98] uppercase mb-1.5 tracking-wider">Operator Role</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#121417] border border-[#272A30] rounded-lg px-4 py-2.5 text-sm focus:border-orange-500/60 focus:outline-none glow-input text-white transition-all"
                  >
                    <option value="operator">Operator (Standard)</option>
                    <option value="administrator">Administrator (Privileged)</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-400 active:scale-95 transition-all text-sm shadow-[0_0_15px_rgba(249,115,22,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {isLoading ? 'Creating Node...' : 'Register Operator Node'}
                </button>

                <div className="text-center mt-5">
                  <button 
                    type="button" 
                    onClick={() => { setError(''); setSuccessMsg(''); setAuthModal('login'); }} 
                    className="text-xs font-medium text-[#8A8F98] hover:text-orange-400 transition-colors"
                  >
                    Already registered? Sign in.
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {authModal === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4 animate-fade-in">
                <div className="text-center text-xs text-[#8A8F98] leading-relaxed mb-2 font-mono">
                  Enter your registered email address below. We will generate a 6-digit recovery code.
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8A8F98] uppercase mb-1.5 tracking-wider">Registered Email</label>
                  <input 
                    type="email" 
                    required 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-[#121417] border border-[#272A30] rounded-lg px-4 py-2.5 text-sm focus:border-orange-500/60 focus:outline-none glow-input text-white transition-all" 
                    placeholder="agent@cloudops.com" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-400 active:scale-95 transition-all text-sm shadow-[0_0_15px_rgba(249,115,22,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {isLoading ? 'Generating Code...' : 'Request Recovery Code'}
                </button>
                <div className="text-center mt-5 flex flex-col gap-2">
                  <button 
                    type="button" 
                    onClick={() => { setError(''); setSuccessMsg(''); setAuthModal('login'); }} 
                    className="text-xs font-medium text-[#8A8F98] hover:text-orange-400 transition-colors"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* RESET PASSWORD CODE ENTRY FORM */}
            {authModal === 'reset-code' && (
              <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
                <div className="p-3 bg-[#1A1D21] border border-orange-500/20 rounded-lg text-center text-xs text-[#8A8F98] font-mono leading-relaxed mb-2">
                  ⚠️ <span className="text-white">DEMO MODE:</span> The reset code is printed in your running backend process log, or use the master bypass code <span className="text-emerald-400 font-bold">000000</span> to verify.
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8A8F98] uppercase mb-1.5 tracking-wider">6-Digit Recovery Code</label>
                  <input 
                    type="text" 
                    required 
                    maxLength="6"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full bg-[#121417] border border-[#272A30] rounded-lg px-4 py-2.5 text-center text-lg tracking-widest font-bold focus:border-orange-500/60 focus:outline-none glow-input text-white transition-all" 
                    placeholder="------" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8A8F98] uppercase mb-1.5 tracking-wider">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#121417] border border-[#272A30] rounded-lg pl-4 pr-16 py-2.5 text-sm focus:border-orange-500/60 focus:outline-none glow-input text-white transition-all" 
                      placeholder="••••••••" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#8A8F98] hover:text-[#FAFAFA] transition-colors cursor-pointer select-none px-2 py-1 hover:bg-[#1A1D21] rounded"
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  <p className="text-[9px] text-[#8A8F98] mt-1 font-mono leading-tight">Must contain 8+ characters, 1 uppercase, 1 lowercase, 1 number, 1 special character (@$!%*?&).</p>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-400 active:scale-95 transition-all text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password & Update Credentials'}
                </button>
                <div className="text-center mt-5">
                  <button 
                    type="button" 
                    onClick={() => { setError(''); setSuccessMsg(''); setAuthModal('forgot'); }} 
                    className="text-xs font-medium text-[#8A8F98] hover:text-orange-400 transition-colors"
                  >
                    ← Request new recovery code
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: MFA CODE INPUT */}
            {showMfa && (
              <form onSubmit={handleMfaSubmit} className="space-y-5 animate-fade-in">
                <div className="text-center text-sm text-gray-300 font-medium">
                  Verification code has been dispatched. <br />
                  Check your <span className="font-bold text-orange-400">{identifier}</span> inbox.
                </div>
                <div className="p-3 bg-[#1A1D21] border border-orange-500/20 rounded-lg text-center text-xs text-[#8A8F98] font-mono leading-relaxed">
                  ⚠️ <span className="text-white">DEMO WORKFLOW:</span> The 6-digit MFA code is printed in the terminal console of your running backend process, or use the master bypass code <span className="text-emerald-400 font-bold">000000</span> to verify.
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8A8F98] uppercase mb-1.5 tracking-wider text-center">Enter 6-Digit MFA Code</label>
                  <input 
                    type="text" 
                    required 
                    maxLength="6"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="w-full bg-[#121417] border border-[#272A30] rounded-lg px-4 py-3.5 text-center text-2xl tracking-widest font-bold focus:border-orange-500/60 focus:outline-none glow-input text-white transition-all" 
                    placeholder="------" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-400 active:scale-95 transition-all text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? 'Verifying Authenticator...' : 'Authorize Login & Establish Session'}
                </button>
                <div className="text-center">
                  <button 
                    type="button" 
                    onClick={() => setShowMfa(false)}
                    className="text-xs font-medium text-[#8A8F98] hover:text-orange-400 transition-colors"
                  >
                    ← Back to credentials entry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// MAIN APP ROUTER
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/metrics" element={<Metrics />} />
      <Route path="/AiCopilot" element={<AiCopilot />} />
      <Route path="/KnowledgeBase" element={<KnowledgeBase />} />
      {/* Catch-all redirects user to Homepage */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}