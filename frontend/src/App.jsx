import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';

function Home() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    fetch('https://cloudops360.onrender.com')
      .then(response => {
        if (response.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      })
      .catch(error => {
        setApiStatus('offline');
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#090A0B] text-[#FAFAFA] font-sans selection:bg-orange-500/30 overflow-hidden">
      
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

      {/* NAVIGATION WITH LOGIN & REGISTRATION */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#272A30]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-bold tracking-tight hover:scale-105 transition-transform duration-300 cursor-pointer">
          CloudOps<span className="text-orange-500">360</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 mr-4">
            <a href="#" className="text-[#8A8F98] hover:text-[#FAFAFA] transition-all duration-300 text-sm font-medium">Documentation</a>
            <a href="#" className="text-[#8A8F98] hover:text-[#FAFAFA] transition-all duration-300 text-sm font-medium">GitHub</a>
          </div>
          <Link to="/login" className="text-[#FAFAFA] hover:text-orange-400 text-sm font-medium transition-colors">Log In</Link>
          <Link to="/register" className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-400 hover:scale-105 active:scale-95 transition-all duration-300 text-sm font-medium shadow-[0_0_15px_rgba(249,115,22,0.2)]">Sign Up</Link>
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
        
        {/* NEW ENHANCED DESCRIPTION */}
        <p className="text-[#8A8F98] max-w-2xl text-lg md:text-xl mb-10 mx-auto leading-relaxed">
          CloudOps360 is your complete command center for modern infrastructure. Seamlessly provision resources, monitor real-time DBMS schemas—including entity types and attributes—and track global performance metrics from a single pane of glass.
        </p>
        
        <div className="flex justify-center gap-5">
          <Link to="/register" className="px-8 py-3.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-400 hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all duration-300 flex items-center gap-2 group">
            Start Free Trial
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          
          <Link to="/dashboard" className="px-8 py-3.5 rounded-lg bg-[#121417] border border-[#272A30] text-[#FAFAFA] hover:bg-[#1a1d24] hover:border-[#3a3f47] hover:scale-105 active:scale-95 transition-all duration-300 font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8A8F98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

// TEMPORARY PLACEHOLDERS FOR YOUR NEW ROUTES
function LoginPlaceholder() {
  return (
    <div className="min-h-screen bg-[#090A0B] text-white flex flex-col items-center justify-center font-sans">
      <h2 className="text-3xl font-bold mb-4">Log In</h2>
      <p className="text-[#8A8F98] mb-8">Authentication endpoint integration pending...</p>
      <Link to="/" className="text-orange-500 hover:text-orange-400 transition-colors">← Back to Home</Link>
    </div>
  );
}

function RegisterPlaceholder() {
  return (
    <div className="min-h-screen bg-[#090A0B] text-white flex flex-col items-center justify-center font-sans">
      <h2 className="text-3xl font-bold mb-4">Create an Account</h2>
      <p className="text-[#8A8F98] mb-8">Registration endpoint integration pending...</p>
      <Link to="/" className="text-orange-500 hover:text-orange-400 transition-colors">← Back to Home</Link>
    </div>
  );
}

// MAIN APP ROUTER
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<LoginPlaceholder />} />
      <Route path="/register" element={<RegisterPlaceholder />} />
    </Routes>
  );
}