import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export default function Metrics() {
  const [metrics, setMetrics] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Fetches the array of SystemMetricResponse from your FastAPI backend
      const res = await apiFetch('/metrics');
      if (!res.ok) {
        throw new Error('Failed to load metrics.');
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setMetrics(data);
        setLatest(data[0]); // Grab the most recent hardware pull
      } else {
        setMetrics([]);
        setLatest(null);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedMetrics = async () => {
    setSeeding(true);
    try {
      // Seeds the telemetry pool by running a psutil pull on the backend host
      const res = await apiFetch('/metrics/', {
        method: 'POST'
      });
      if (!res.ok) {
        throw new Error('Failed to execute psutil seeder.');
      }
      // Re-fetch the list
      await fetchMetrics();
    } catch (err) {
      console.error("Seeding error:", err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-8 text-white min-h-screen bg-[#090A0B] animate-fade-in font-sans">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#272A30] pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Live Telemetry</h1>
          <p className="text-[#8A8F98]">Real-time hardware utilization polled via system-level psutil calls</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={handleSeedMetrics} 
            disabled={seeding}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg hover:scale-105 active:scale-95 transition-all text-sm font-bold shadow-[0_0_15px_rgba(249,115,22,0.15)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {seeding ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Polling host OS...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Trigger Polling Cycle
              </>
            )}
          </button>
          <button 
            onClick={fetchMetrics} 
            className="px-4 py-2.5 bg-[#121417] border border-[#272A30] rounded-lg hover:text-orange-500 hover:border-orange-500/30 transition-all text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {loading && metrics.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#272A30] rounded-xl bg-[#121417]/20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
          <span className="text-[#8A8F98] font-mono text-sm">Synchronizing stats...</span>
        </div>
      ) : !latest ? (
        <div className="text-center py-16 border border-dashed border-[#272A30] rounded-xl bg-[#121417]/20">
          <svg className="w-12 h-12 text-[#8A8F98] mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-bold mb-1">No Host Telemetry Buffered</h3>
          <p className="text-[#8A8F98] max-w-sm mx-auto text-sm mb-6">Database telemetry queue is currently empty. Run a polling cycle to gather hardware metrics.</p>
          <button 
            onClick={handleSeedMetrics} 
            className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-400 font-bold active:scale-95 transition-all text-xs cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.2)]"
          >
            Gather First Metrics Pack
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CPU Card */}
            <div className="glass-panel p-6 rounded-xl border border-[#272A30] shadow-glow-orange hover:shadow-[0_0_25px_rgba(249,115,22,0.1)] transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#8A8F98] text-xs font-mono uppercase tracking-wider">CPU Usage</h3>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              </div>
              <div className="text-5xl font-bold text-white mb-4 tracking-tight">{latest.cpu_usage}%</div>
              <div className="w-full bg-[#1A1D21] rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${latest.cpu_usage}%` }}></div>
              </div>
            </div>

            {/* RAM Card */}
            <div className="glass-panel p-6 rounded-xl border border-[#272A30] shadow-glow-orange hover:shadow-[0_0_25px_rgba(249,115,22,0.1)] transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#8A8F98] text-xs font-mono uppercase tracking-wider">Memory (RAM)</h3>
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              </div>
              <div className="text-5xl font-bold text-white mb-4 tracking-tight">{latest.ram_usage}%</div>
              <div className="w-full bg-[#1A1D21] rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${latest.ram_usage}%` }}></div>
              </div>
            </div>

            {/* Disk Card */}
            <div className="glass-panel p-6 rounded-xl border border-[#272A30] shadow-glow-orange hover:shadow-[0_0_25px_rgba(249,115,22,0.1)] transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#8A8F98] text-xs font-mono uppercase tracking-wider">Disk Utilization</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="text-5xl font-bold text-white mb-4 tracking-tight">{latest.disk_usage}%</div>
              <div className="w-full bg-[#1A1D21] rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${latest.disk_usage}%` }}></div>
              </div>
            </div>

          </div>

          {/* Network details card */}
          <div className="glass-panel p-6 rounded-xl border border-[#272A30]">
            <h3 className="text-base font-bold mb-4 font-mono text-orange-500">I/O Network Throughput</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono">
              <div className="p-4 bg-[#121417]/40 rounded-lg border border-[#272A30]/50 flex justify-between items-center">
                <span className="text-[#8A8F98]">Total Data Sent</span>
                <span className="text-white font-bold text-lg">{latest.network_sent ? latest.network_sent.toFixed(2) : '0.00'} MB</span>
              </div>
              <div className="p-4 bg-[#121417]/40 rounded-lg border border-[#272A30]/50 flex justify-between items-center">
                <span className="text-[#8A8F98]">Total Data Received</span>
                <span className="text-white font-bold text-lg">{latest.network_recv ? latest.network_recv.toFixed(2) : '0.00'} MB</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8A8F98] font-mono mt-4 text-right">
              Polled at SRE timestamp: {new Date(latest.timestamp).toLocaleString()}
            </div>
          </div>

          {/* Historic stream list */}
          {metrics.length > 1 && (
            <div className="glass-panel p-6 rounded-xl border border-[#272A30] overflow-hidden">
              <h3 className="text-base font-bold mb-4 font-mono text-[#8A8F98] uppercase tracking-wider">Buffered Metric History</h3>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#272A30] text-[#8A8F98]">
                      <th className="pb-3 pr-4">Timestamp</th>
                      <th className="pb-3 px-4">CPU Usage</th>
                      <th className="pb-3 px-4">RAM Usage</th>
                      <th className="pb-3 px-4">Disk Usage</th>
                      <th className="pb-3 px-4">Tx Out</th>
                      <th className="pb-3 pl-4">Rx In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#272A30]/40">
                    {metrics.slice(1, 10).map((m) => (
                      <tr key={m.id} className="hover:bg-[#121417]/20 transition-colors">
                        <td className="py-2.5 pr-4 text-[#5B606a]">{new Date(m.timestamp).toLocaleString()}</td>
                        <td className="py-2.5 px-4 font-bold text-blue-400">{m.cpu_usage}%</td>
                        <td className="py-2.5 px-4 font-bold text-orange-400">{m.ram_usage}%</td>
                        <td className="py-2.5 px-4 font-bold text-emerald-400">{m.disk_usage}%</td>
                        <td className="py-2.5 px-4 text-gray-300">{m.network_sent ? m.network_sent.toFixed(2) : '0.00'} MB</td>
                        <td className="py-2.5 pl-4 text-gray-300">{m.network_recv ? m.network_recv.toFixed(2) : '0.00'} MB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}