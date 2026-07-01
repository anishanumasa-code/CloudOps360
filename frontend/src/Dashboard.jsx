import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [backendData, setBackendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Pinging your FastAPI backend
    fetch('http://localhost:8000/')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setBackendData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#090A0B] text-[#FAFAFA] font-sans p-6 md:p-12 selection:bg-orange-500/30">
      
      {/* Top Navigation */}
      <nav className="flex justify-between items-center mb-12 border-b border-[#272A30] pb-6">
        <div className="text-xl font-bold tracking-tight">
          CloudOps<span className="text-orange-500">360</span> <span className="text-[#8A8F98] font-normal">/ Dashboard</span>
        </div>
        <Link to="/" className="text-[#8A8F98] hover:text-white hover:-translate-x-1 transition-all flex items-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </nav>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Stats Cards */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-[#121417] border border-[#272A30] shadow-xl">
            <h3 className="text-[#8A8F98] text-xs font-mono uppercase tracking-wider mb-2">System Status</h3>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : loading ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
              <span className="text-xl font-semibold">{error ? 'Disconnected' : loading ? 'Connecting...' : 'Online & Syncing'}</span>
            </div>
          </div>
          
          <div className="p-6 rounded-xl bg-[#121417] border border-[#272A30] shadow-xl">
            <h3 className="text-[#8A8F98] text-xs font-mono uppercase tracking-wider mb-2">Active Database</h3>
            <div className="text-lg font-mono text-orange-400">sqlite:///./cloudops.db</div>
          </div>
        </div>

        {/* Right Side: Terminal / JSON Output */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-[#121417] border border-[#272A30] shadow-xl overflow-hidden flex flex-col h-full min-h-[400px]">
            {/* Terminal Header */}
            <div className="bg-[#1a1d24] px-4 py-3 border-b border-[#272A30] flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="ml-4 text-xs font-mono text-[#8A8F98]">GET http://localhost:8000/</span>
            </div>
            
            {/* Terminal Body */}
            <div className="p-6 overflow-x-auto flex-grow">
              {loading ? (
                <div className="flex flex-col gap-2 text-[#8A8F98] font-mono text-sm animate-pulse">
                  <span>&gt; Initializing connection to backend...</span>
                  <span>&gt; Awaiting response...</span>
                </div>
              ) : error ? (
                <div className="text-red-400 font-mono text-sm">
                  <span>&gt; Error: {error}</span>
                  <br/>
                  <span className="text-[#8A8F98] mt-4 block">Did you remember to add CORSMiddleware to your FastAPI main.py?</span>
                </div>
              ) : (
                <pre className="text-green-400 font-mono text-sm">
                  {JSON.stringify(backendData, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}