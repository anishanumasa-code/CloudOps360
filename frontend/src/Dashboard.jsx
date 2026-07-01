import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Metrics from './pages/Metrics.jsx';
import KnowledgeBase from './pages/KnowledgeBase.jsx';
import CloudResources from './pages/CloudResources.jsx';
import LogManagement from './pages/LogManagement.jsx';
import IncidentManagement from './pages/IncidentManagement.jsx';
import AiCopilot from './pages/AiCopilot.jsx';
import { apiFetch } from './utils/api';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('metrics');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Profile modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileUsername, setProfileUsername] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileFullName, setProfileFullName] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Route security guard: Redirect to homepage if unauthorized
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      navigate('/');
    } else {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        navigate('/');
      }
    }
  }, [navigate]);

  const handleExit = () => {
    // Return to landing page, keep the session
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleOpenProfileModal = async () => {
    setProfileError('');
    setProfileSuccess('');
    setProfilePassword('');
    setShowProfilePassword(false);
    setProfileLoading(true);
    setProfileModalOpen(true);
    
    try {
      const res = await apiFetch('/auth/profile');
      if (!res.ok) {
        throw new Error('Failed to load profile details.');
      }
      const data = await res.json();
      setProfileUsername(data.username || '');
      setProfileEmail(data.email || '');
      setProfileFullName(data.full_name || '');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!usernameRegex.test(profileUsername)) {
      setProfileError('Username must be 3-20 characters (alphanumeric, underscores, hyphens).');
      setProfileLoading(false);
      return;
    }

    if (profilePassword && !passwordRegex.test(profilePassword)) {
      setProfileError('New password must be 8+ chars and contain uppercase, lowercase, digit, and special char (@$!%*?&).');
      setProfileLoading(false);
      return;
    }

    const payload = {
      username: profileUsername,
      email: profileEmail,
      full_name: profileFullName,
    };

    if (profilePassword) {
      payload.password = profilePassword;
    }

    try {
      const res = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to update credentials.');
      }

      setProfileSuccess('Operator profile updated successfully!');
      
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentUser(data.user);
      }
      
      setProfilePassword('');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRetractCredentials = async () => {
    const confirmMessage = "Are you absolutely sure you want to retract your operator credentials?\n" +
      "This will permanently delete your account node from the database, invalidate all tokens, and log you out immediately.\n\n" +
      "Type 'RETRACT' to confirm this deletion:";
      
    const confirmation = window.prompt(confirmMessage);
    if (confirmation !== 'RETRACT') {
      alert("Action aborted. Operator credentials remain active.");
      return;
    }

    setProfileLoading(true);
    setProfileError('');
    
    try {
      const res = await apiFetch('/auth/profile', {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Failed to retract credentials.');
      }
      
      alert("Operator credentials retracted successfully. Terminating session...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      setProfileError(err.message);
      setProfileLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#090A0B] text-[#FAFAFA] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
          <span>Establishing secure terminal connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A0B] text-[#FAFAFA] font-sans flex flex-col selection:bg-orange-500/30 overflow-hidden">
      
      {/* Top Navigation */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[#272A30] bg-[#121417]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center border border-orange-500/50">
            <svg className="w-5 h-5 text-orange-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </div>
          CloudOps<span className="text-orange-500">360</span>
        </div>

        {/* User Info & Quick Controls */}
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[#8A8F98] text-xs font-mono">SECURE CONSOLE /</span>
            <span className="text-white text-xs font-mono font-semibold">{currentUser.username}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
              currentUser.role === 'administrator' 
                ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
            }`}>
              {currentUser.role}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleOpenProfileModal} 
              className="px-3.5 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/25 border border-orange-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              Manage Profile
            </button>
            <button 
              onClick={handleExit} 
              className="px-3.5 py-1.5 rounded-lg bg-[#272A30] hover:bg-[#3a3f47] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Exit Console
            </button>
            <button 
              onClick={handleLogout} 
              className="px-3.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-69px)]">
        
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-[#272A30] p-5 space-y-1.5 bg-[#121417] flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-[#8A8F98] uppercase tracking-widest px-3 mb-3">System Modules</div>
            
            <button 
              onClick={() => setActiveTab('metrics')} 
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'metrics' 
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold shadow-[0_0_15px_rgba(249,115,22,0.05)]' 
                  : 'hover:bg-[#1A1D21] text-[#8A8F98] border border-transparent'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Live Telemetry
            </button>

            <button 
              onClick={() => setActiveTab('resources')} 
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'resources' 
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold shadow-[0_0_15px_rgba(249,115,22,0.05)]' 
                  : 'hover:bg-[#1A1D21] text-[#8A8F98] border border-transparent'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              Cloud Resources
            </button>

            <button 
              onClick={() => setActiveTab('logs')} 
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'logs' 
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold shadow-[0_0_15px_rgba(249,115,22,0.05)]' 
                  : 'hover:bg-[#1A1D21] text-[#8A8F98] border border-transparent'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Log Management
            </button>

            <button 
              onClick={() => setActiveTab('incidents')} 
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'incidents' 
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold shadow-[0_0_15px_rgba(249,115,22,0.05)]' 
                  : 'hover:bg-[#1A1D21] text-[#8A8F98] border border-transparent'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Incident Management
            </button>

            <button 
              onClick={() => setActiveTab('knowledge')} 
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'knowledge' 
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold shadow-[0_0_15px_rgba(249,115,22,0.05)]' 
                  : 'hover:bg-[#1A1D21] text-[#8A8F98] border border-transparent'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Knowledge Base
            </button>

            <button 
              onClick={() => setActiveTab('copilot')} 
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'copilot' 
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold shadow-[0_0_15px_rgba(249,115,22,0.05)]' 
                  : 'hover:bg-[#1A1D21] text-[#8A8F98] border border-transparent'
              }`}
            >
              <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Gemini SRE Copilot
            </button>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 bg-[#1A1D21]/30 rounded-lg border border-[#272A30]/50 text-[10px] font-mono text-[#8A8F98]">
            <div className="flex justify-between mb-1">
              <span>Status</span>
              <span className="text-green-500 font-bold">ONLINE</span>
            </div>
            <div>Secure JWT verification active. Sessions expire hourly.</div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#090A0B] custom-scrollbar">
          {activeTab === 'metrics' && <Metrics />}
          {activeTab === 'resources' && <CloudResources />}
          {activeTab === 'logs' && <LogManagement />}
          {activeTab === 'incidents' && <IncidentManagement />}
          {activeTab === 'knowledge' && <KnowledgeBase />}
          {activeTab === 'copilot' && <AiCopilot />}
        </main>
      </div>

      {/* Profile Settings and Retraction Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-[#090A0B]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in font-mono text-sm">
          <div className="w-full max-w-lg bg-[#121417] border border-orange-500/20 rounded-xl p-8 shadow-[0_0_50px_rgba(249,115,22,0.15)] animate-scale-up relative">
            <button 
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-4 right-4 text-[#8A8F98] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-[#1A1D21] cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6 border-b border-[#272A30] pb-4">
              <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                <span className="text-orange-500">Operator</span> Node Settings
              </h2>
              <p className="text-[#8A8F98] text-xs mt-1">Configure active terminal profile or retract keys</p>
            </div>

            {profileError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg text-center">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg text-center animate-fade-in">
                {profileSuccess}
              </div>
            )}

            {profileLoading && !profileUsername && !profileError ? (
              <div className="text-center py-10 flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-[#8A8F98]">Syncing operator profile...</span>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-[#8A8F98] uppercase mb-1 tracking-wider">Username</label>
                  <input 
                    type="text" 
                    required 
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value)}
                    className="w-full bg-[#1A1D21] border border-[#272A30] rounded px-3.5 py-2 text-white focus:border-orange-500/60 focus:outline-none text-xs" 
                    placeholder="operator_name"
                  />
                  <p className="text-[9px] text-[#8A8F98] mt-1 font-sans">Alphanumeric, underscores, hyphens, 3-20 characters.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[#8A8F98] uppercase mb-1 tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-[#1A1D21] border border-[#272A30] rounded px-3.5 py-2 text-white focus:border-orange-500/60 focus:outline-none text-xs" 
                      placeholder="operator@cloudops.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8A8F98] uppercase mb-1 tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={profileFullName}
                      onChange={(e) => setProfileFullName(e.target.value)}
                      className="w-full bg-[#1A1D21] border border-[#272A30] rounded px-3.5 py-2 text-white focus:border-orange-500/60 focus:outline-none text-xs" 
                      placeholder="Operator Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[#8A8F98] uppercase mb-1 tracking-wider">New Password (Leave blank to keep current)</label>
                  <div className="relative">
                    <input 
                      type={showProfilePassword ? "text" : "password"} 
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      className="w-full bg-[#1A1D21] border border-[#272A30] rounded pl-3.5 pr-16 py-2 text-white focus:border-orange-500/60 focus:outline-none text-xs" 
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProfilePassword(!showProfilePassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#8A8F98] hover:text-white cursor-pointer select-none px-2 py-0.5 hover:bg-[#090A0B] rounded"
                    >
                      {showProfilePassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  <p className="text-[8px] text-[#8A8F98] mt-1 font-sans leading-tight">Must contain 8+ characters, 1 uppercase, 1 lowercase, 1 number, 1 special character (@$!%*?&).</p>
                </div>

                <div className="flex gap-4 pt-2 border-t border-[#272A30]/50 mt-6">
                  <button 
                    type="submit" 
                    disabled={profileLoading}
                    className="flex-1 py-2.5 rounded bg-orange-500 hover:bg-orange-400 text-white font-bold transition-all text-xs cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.15)] disabled:opacity-50"
                  >
                    {profileLoading ? 'Updating credentials...' : 'Update Operator Profile'}
                  </button>
                </div>

                {/* Retraction danger zone */}
                <div className="border border-red-500/25 bg-red-500/5 rounded-lg p-4 mt-6">
                  <div className="text-red-400 font-bold text-xs mb-1.5 flex items-center gap-1.5 font-sans">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    DANGER ZONE: RETRACT CREDENTIALS
                  </div>
                  <p className="text-[10px] text-gray-400 mb-3.5 leading-relaxed font-sans">
                    Retracting credentials permanently deletes your operator node. You will be logged out immediately and this session will be permanently terminated.
                  </p>
                  <button 
                    type="button" 
                    onClick={handleRetractCredentials}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/40 text-red-400 hover:text-white rounded text-xs font-bold transition-colors cursor-pointer"
                  >
                    Retract Credentials (Delete Account)
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