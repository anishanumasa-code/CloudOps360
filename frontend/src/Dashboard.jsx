import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('health');
  const [endpointData, setEndpointData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Your Catalogue of Endpoints
const panels = [
    { id: 'health', name: 'System Health', path: '/health', method: 'GET', icon: '...' },
    // Ensure this path exactly matches your backend router!
    { id: 'metrics', name: 'Performance Metrics', path: '/metrics', method: 'GET', icon: '...' },
    // ...
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
          
          {/* --- EXISTING DASHBOARD PANELS (API FETCHERS) --- */}
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

          {/* --- NEW PLATFORM PAGES (ROUTER LINKS) --- */}
          <div className="text-xs font-mono text-[#8A8F98] uppercase tracking-wider mb-2 mt-6 px-2">Platform Features</div>
          
          <Link to="/metrics" className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 bg-transparent border border-transparent text-[#8A8F98] hover:bg-[#121417] hover:text-[#FAFAFA]">
            <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {/* Chart Icon */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Advanced Metrics</span>
              <span className="text-[10px] font-mono opacity-50">Grafana Dashboard</span>
            </div>
          </Link>

          <Link to="/ai-copilot" className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 bg-transparent border border-transparent text-[#8A8F98] hover:bg-[#121417] hover:text-[#FAFAFA]">
            <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {/* Sparkles/AI Icon */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Gemini Co-Pilot</span>
              <span className="text-[10px] font-mono opacity-50">AI Assistant</span>
            </div>
          </Link>

          <Link to="/knowledge-base" className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 bg-transparent border border-transparent text-[#8A8F98] hover:bg-[#121417] hover:text-[#FAFAFA]">
            <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {/* Book/Docs Icon */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Knowledge Base</span>
              <span className="text-[10px] font-mono opacity-50">Markdown Docs</span>
            </div>
          </Link>

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