import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('health');
  const [endpointData, setEndpointData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Your Catalogue of Endpoints
  const panels = [
    { id: 'health', name: 'System Health', path: '/', method: 'GET', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'dbms', name: 'DBMS Schema Diagnostics', path: '/api/db-schema', method: 'GET', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
    { id: 'metrics', name: 'Performance Metrics', path: '/api/metrics', method: 'GET', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
    { id: 'provisioning', name: 'Resource Provisioning', path: '/api/provision', method: 'POST', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
  ];

  // Function to ping your specific backend endpoints
  const fetchEndpoint = (panel) => {
    setLoading(true);
    setError(null);
    setEndpointData(null);
    
    // Switch the active UI tab immediately
    setActiveTab(panel.id);

    fetch(`https://cloudops360.onrender.com${panel.path}`, {
      method: panel.method,
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return response.json();
      })
      .then(data => {
        setEndpointData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Run the default endpoint (Health) on first load
  useEffect(() => {
    fetchEndpoint(panels[0]);
  }, []);

  const currentPanel = panels.find(p => p.id === activeTab);

  return (
    <div className="min-h-screen bg-[#090A0B] text-[#FAFAFA] font-sans flex flex-col selection:bg-orange-500/30">
      
      {/* Top Navigation */}
      <nav className="flex justify-between items-center p-6 border-b border-[#272A30] bg-[#121417]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center border border-orange-500/50">
            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </div>
          CloudOps<span className="text-orange-500">360</span>
        </div>
        <Link to="/" className="px-4 py-2 rounded-md bg-[#272A30] hover:bg-[#3a3f47] text-sm font-medium transition-colors flex items-center gap-2">
          Exit Terminal
        </Link>
      </nav>

      {/* Main Layout: Sidebar + Data Panel */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Catalogue */}
        <aside className="w-72 border-r border-[#272A30] bg-[#090A0B] p-4 hidden md:flex flex-col gap-2 overflow-y-auto">
          <div className="text-xs font-mono text-[#8A8F98] uppercase tracking-wider mb-2 px-2">Control Panels</div>
          
          {panels.map((panel) => (
            <button
              key={panel.id}
              onClick={() => fetchEndpoint(panel)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 ${
                activeTab === panel.id 
                  ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400' 
                  : 'bg-transparent border border-transparent text-[#8A8F98] hover:bg-[#121417] hover:text-[#FAFAFA]'
              }`}
            >
              <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={panel.icon} />
              </svg>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{panel.name}</span>
                <span className="text-[10px] font-mono opacity-50">{panel.method} {panel.path}</span>
              </div>
            </button>
          ))}
        </aside>

        {/* Main Data Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-[#090A0B] to-[#121417]">
          
          {/* Action Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{currentPanel.name}</h1>
              <p className="text-[#8A8F98] text-sm font-mono flex items-center gap-2">
                Targeting: <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">{currentPanel.path}</span>
              </p>
            </div>
            <button 
              onClick={() => fetchEndpoint(currentPanel)}
              className="px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium transition-colors shadow-[0_0_15px_rgba(249,115,22,0.2)] flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Execute Request
            </button>
          </div>

          {/* Terminal Output Window */}
          <div className="rounded-xl bg-[#0d0f12] border border-[#272A30] shadow-2xl overflow-hidden min-h-[450px] flex flex-col">
            <div className="bg-[#1a1d24] px-4 py-3 border-b border-[#272A30] flex justify-between items-center">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
              </div>
              <span className="text-xs font-mono text-[#8A8F98]">bash - root@cloudops-360</span>
            </div>
            
            <div className="p-6 font-mono text-sm overflow-x-auto flex-grow">
              <div className="text-[#8A8F98] mb-4">
                $ curl -X {currentPanel.method} https://cloudops-backend.onrender.com{currentPanel.path}
              </div>

              {loading ? (
                <div className="text-yellow-400 animate-pulse flex flex-col gap-1">
                  <span>&gt; Establishing secure connection...</span>
                  <span>&gt; Resolving host parameters...</span>
                  <span>&gt; Awaiting server response...</span>
                </div>
              ) : error ? (
                <div className="text-red-400">
                  <span className="font-bold">Error:</span> {error}
                  <div className="mt-4 text-[#8A8F98] text-xs">
                    * Make sure this exact path ({currentPanel.path}) is mapped in your FastAPI main.py file.
                  </div>
                </div>
              ) : (
                <pre className="text-green-400">
                  {JSON.stringify(endpointData, null, 2)}
                </pre>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}