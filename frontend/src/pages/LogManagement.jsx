import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export default function LogManagement() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [logLevel, setLogLevel] = useState('');
  const [source, setSource] = useState('');

  // Insert Mock Log Form State
  const [mockSource, setMockSource] = useState('system');
  const [mockLevel, setMockLevel] = useState('INFO');
  const [mockMessage, setMockMessage] = useState('');
  const [insertLoading, setInsertLoading] = useState(false);
  const [insertSuccess, setInsertSuccess] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    
    // Build query params
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (logLevel) params.append('log_level', logLevel);
    if (source) params.append('source', source);

    try {
      const res = await apiFetch(`/logs?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load system logs.');
      }
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInsertLog = async (e) => {
    e.preventDefault();
    if (!mockMessage.trim()) return;
    
    setInsertLoading(true);
    setError('');
    setInsertSuccess('');

    try {
      const res = await apiFetch('/logs/', {
        method: 'POST',
        body: JSON.stringify({
          source: mockSource,
          log_level: mockLevel,
          message: mockMessage
        })
      });

      if (!res.ok) {
        throw new Error('Failed to insert log entry.');
      }

      setInsertSuccess('Log entry dispatched to database successfully!');
      setMockMessage('');
      
      // Auto close success message after 3 seconds
      setTimeout(() => setInsertSuccess(''), 3000);

      // Re-fetch logs
      fetchLogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setInsertLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleClearFilters = () => {
    setSearch('');
    setLogLevel('');
    setSource('');
    // Need to trigger fetch with blank params
    setTimeout(() => {
      setLogs([]);
      setLoading(true);
      apiFetch('/logs')
        .then(res => res.json())
        .then(data => setLogs(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, 0);
  };

  return (
    <div className="p-8 text-white min-h-screen bg-[#090A0B] animate-fade-in font-mono text-sm">
      {/* Header section */}
      <div className="mb-8 border-b border-[#272A30] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-sans">Syslog Management</h1>
          <p className="text-[#8A8F98] font-sans">Consolidated stream of events, security actions, and infrastructure status logs</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="px-4 py-2 bg-[#121417] border border-[#272A30] rounded-lg hover:text-orange-500 hover:border-orange-500/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
          </svg>
          Sync Log Buffer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Filters and Log Seeder */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Filters card */}
          <div className="glass-panel p-5 rounded-xl border border-[#272A30] bg-[#121417]/50">
            <h3 className="font-bold text-base mb-4 font-sans text-orange-500">Filter Streams</h3>
            <form onSubmit={handleFilterSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#8A8F98] uppercase mb-1 tracking-wider">Search Term</label>
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Query term..."
                  className="w-full bg-[#090A0B] border border-[#272A30] rounded px-3 py-2 text-xs text-white focus:border-orange-500/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#8A8F98] uppercase mb-1 tracking-wider">Severity Level</label>
                <select 
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value)}
                  className="w-full bg-[#090A0B] border border-[#272A30] rounded px-3 py-2 text-xs text-white focus:border-orange-500/60 focus:outline-none"
                >
                  <option value="">All Levels</option>
                  <option value="INFO">INFO (Green)</option>
                  <option value="WARNING">WARNING (Yellow)</option>
                  <option value="ERROR">ERROR (Red)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#8A8F98] uppercase mb-1 tracking-wider">Source Module</label>
                <input 
                  type="text" 
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. auth, api"
                  className="w-full bg-[#090A0B] border border-[#272A30] rounded px-3 py-2 text-xs text-white focus:border-orange-500/60 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-500 font-bold rounded hover:bg-orange-500/20 text-xs transition-colors cursor-pointer"
                >
                  Apply
                </button>
                <button 
                  type="button" 
                  onClick={handleClearFilters}
                  className="px-3 py-2 bg-[#1A1D21] border border-[#272A30] rounded text-[#8A8F98] hover:text-white text-xs transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* Log Seeder card */}
          <div className="glass-panel p-5 rounded-xl border border-[#272A30] bg-[#121417]/50">
            <h3 className="font-bold text-base mb-4 font-sans text-emerald-500">Inject Log Event</h3>
            
            {insertSuccess && (
              <div className="mb-3 p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] rounded text-center">
                {insertSuccess}
              </div>
            )}

            <form onSubmit={handleInsertLog} className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#8A8F98] uppercase mb-1 tracking-wider">Source</label>
                <select
                  value={mockSource}
                  onChange={(e) => setMockSource(e.target.value)}
                  className="w-full bg-[#090A0B] border border-[#272A30] rounded px-3 py-2 text-xs text-white focus:border-orange-500/60 focus:outline-none"
                >
                  <option value="system">system (System Core)</option>
                  <option value="auth">auth (Authentication)</option>
                  <option value="api">api (Endpoints Gateway)</option>
                  <option value="database">database (DBMS Agent)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#8A8F98] uppercase mb-1 tracking-wider">Severity</label>
                <select
                  value={mockLevel}
                  onChange={(e) => setMockLevel(e.target.value)}
                  className="w-full bg-[#090A0B] border border-[#272A30] rounded px-3 py-2 text-xs text-white focus:border-orange-500/60 focus:outline-none"
                >
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#8A8F98] uppercase mb-1 tracking-wider">Log Message</label>
                <textarea 
                  value={mockMessage}
                  onChange={(e) => setMockMessage(e.target.value)}
                  required
                  rows="3"
                  placeholder="Event description..."
                  className="w-full bg-[#090A0B] border border-[#272A30] rounded px-3 py-2 text-xs text-white focus:border-orange-500/60 focus:outline-none resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={insertLoading}
                className="w-full py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold rounded hover:bg-emerald-500/20 text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {insertLoading ? 'Transmitting event...' : 'Dispatch Syslog Event'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Console View */}
        <div className="lg:col-span-3 flex flex-col h-[calc(100vh-230px)]">
          <div className="flex-1 bg-[#090A0B] border border-[#272A30] rounded-xl flex flex-col overflow-hidden shadow-inner">
            
            {/* Console Header bar */}
            <div className="bg-[#121417] px-5 py-3 border-b border-[#272A30] flex justify-between items-center text-xs text-[#8A8F98]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500/20 border border-orange-500 animate-pulse"></span>
                LIVE SYSLOG STREAMS (BUFFERED: {logs.length} ACTIONS)
              </span>
              <span>UTC TIMESTAMPS</span>
            </div>

            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2.5 custom-scrollbar bg-[#050607]/80">
              {loading ? (
                <div className="text-center py-20 flex flex-col items-center gap-2 text-[#8A8F98]">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Syncing log databases...</span>
                </div>
              ) : error ? (
                <div className="text-center py-10 text-red-400 font-bold">
                  {error}
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-20 text-[#8A8F98] text-xs border border-dashed border-[#272A30]/50 rounded-lg">
                  No log matches in this buffer. Use the seeder on the left to inject log records!
                </div>
              ) : (
                logs.map(log => (
                  <div 
                    key={log.id} 
                    className="flex flex-col md:flex-row gap-2 md:gap-4 p-3 bg-[#121417]/25 hover:bg-[#121417]/70 border border-[#272A30]/40 rounded hover:border-orange-500/20 transition-all font-mono text-[12px] leading-relaxed"
                  >
                    {/* Timestamp */}
                    <span className="text-[#5B606a] select-none whitespace-nowrap">
                      [{new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}]
                    </span>
                    
                    {/* Severity Badge */}
                    <span className={`font-bold uppercase tracking-wider select-none w-16 text-center rounded px-1.5 py-0.5 ${
                      log.log_level === 'ERROR' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/25' 
                        : log.log_level === 'WARNING'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25'
                        : 'bg-green-500/10 text-green-400 border border-green-500/25'
                    }`}>
                      {log.log_level}
                    </span>

                    {/* Source */}
                    <span className="text-orange-400 font-bold select-none min-w-16">
                      [{log.source}]
                    </span>

                    {/* Message */}
                    <span className="text-gray-300 flex-1 break-all">
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
