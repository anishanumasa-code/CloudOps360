import { useState, useEffect } from 'react';

export default function Metrics() {
  const [metrics, setMetrics] = useState([]);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    // Fetches the array of SystemMetricResponse from your FastAPI backend
    fetch('https://cloudops360.onrender.com/metrics')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMetrics(data);
          setLatest(data[0]); // Grab the most recent hardware pull
        }
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);

  return (
    <div className="p-8 text-white min-h-screen bg-[#090A0B]">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Live Telemetry</h1>
          <p className="text-[#8A8F98]">Real-time hardware utilization via psutil</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-[#1A1D21] border border-[#272A30] rounded hover:text-orange-500 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {!latest ? (
        <div className="text-center p-12 border border-dashed border-[#272A30] rounded-lg text-[#8A8F98]">
          No metrics found. Use your FastAPI Swagger UI (POST /metrics) to seed data!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CPU Card */}
          <div className="bg-[#121417] border border-[#272A30] p-6 rounded-xl">
            <h3 className="text-[#8A8F98] text-sm font-mono uppercase mb-4">CPU Usage</h3>
            <div className="text-4xl font-bold text-white mb-2">{latest.cpu_usage}%</div>
            <div className="w-full bg-[#1A1D21] rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${latest.cpu_usage}%` }}></div>
            </div>
          </div>

          {/* RAM Card */}
          <div className="bg-[#121417] border border-[#272A30] p-6 rounded-xl">
            <h3 className="text-[#8A8F98] text-sm font-mono uppercase mb-4">Memory (RAM)</h3>
            <div className="text-4xl font-bold text-white mb-2">{latest.ram_usage}%</div>
            <div className="w-full bg-[#1A1D21] rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${latest.ram_usage}%` }}></div>
            </div>
          </div>

          {/* Disk Card */}
          <div className="bg-[#121417] border border-[#272A30] p-6 rounded-xl">
            <h3 className="text-[#8A8F98] text-sm font-mono uppercase mb-4">Disk Space</h3>
            <div className="text-4xl font-bold text-white mb-2">{latest.disk_usage}%</div>
            <div className="w-full bg-[#1A1D21] rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${latest.disk_usage}%` }}></div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}