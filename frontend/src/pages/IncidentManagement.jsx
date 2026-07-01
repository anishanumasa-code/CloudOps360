import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form inputs for reporting a new incident
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [description, setDescription] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // AI Assistant Overlay
  const [aiReport, setAiReport] = useState(null); // { incident, content, loading, error, saving, saved }
  
  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/incidents');
      if (!res.ok) {
        throw new Error('Failed to load active incidents list.');
      }
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReportIncident = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitLoading(true);
    setError('');
    try {
      const res = await apiFetch('/incidents/', {
        method: 'POST',
        body: JSON.stringify({
          title,
          severity,
          description
        })
      });

      if (!res.ok) {
        throw new Error('Could not submit incident ticket.');
      }

      setTitle('');
      setDescription('');
      setSeverity('Medium');
      setModalOpen(false);
      fetchIncidents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateStatus = async (id, currentSeverity, newStatus) => {
    setError('');
    try {
      const res = await apiFetch(`/incidents/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          severity: currentSeverity
        })
      });

      if (!res.ok) {
        throw new Error('Failed to transition incident state.');
      }
      fetchIncidents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRunAiAnalysis = async (incident) => {
    setAiReport({
      incident,
      content: '',
      loading: true,
      error: '',
      saving: false,
      saved: false
    });

    const prompt = `Analyze the following cloud incident and provide a professional SRE explanation and recommended resolution steps:
    Title: ${incident.title}
    Severity: ${incident.severity}
    Details: ${incident.description}
    Format the response nicely using clear sections.`;

    try {
      const res = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) {
        throw new Error('AI gateway timeout. Make sure the Gemini API key is configured.');
      }

      const data = await res.json();
      
      setAiReport(prev => ({
        ...prev,
        loading: false,
        content: data.reply || 'AI generated response was empty.'
      }));
    } catch (err) {
      setAiReport(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
    }
  };

  const handleSaveToKb = async () => {
    if (!aiReport || !aiReport.content) return;
    
    setAiReport(prev => ({ ...prev, saving: true }));
    
    try {
      const res = await apiFetch('/knowledge/', {
        method: 'POST',
        body: JSON.stringify({
          title: `Runbook: Resolved ${aiReport.incident.title}`,
          issue_description: aiReport.incident.description,
          resolution: aiReport.content
        })
      });

      if (!res.ok) {
        throw new Error('Failed to archive analysis to Knowledge Base.');
      }

      // Automatically mark the incident as Resolved too!
      await handleUpdateStatus(aiReport.incident.id, aiReport.incident.severity, 'Resolved');

      setAiReport(prev => ({
        ...prev,
        saving: false,
        saved: true
      }));
    } catch (err) {
      alert(err.message);
      setAiReport(prev => ({ ...prev, saving: false }));
    }
  };

  return (
    <div className="p-8 text-white min-h-screen bg-[#090A0B] animate-fade-in font-sans">
      {/* Header section */}
      <div className="mb-8 border-b border-[#272A30] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Incident Management</h1>
          <p className="text-[#8A8F98]">Track site reliability events and leverage Gemini AI to diagnose issues on the fly</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 font-bold hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.2)] cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Report Incident
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg font-mono">
          {error}
        </div>
      )}

      {/* Incident List */}
      {loading ? (
        <div className="text-center py-20 border border-dashed border-[#272A30] rounded-xl bg-[#121417]/20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
          <span className="text-[#8A8F98] font-mono text-sm">Querying database...</span>
        </div>
      ) : incidents.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#272A30] rounded-xl bg-[#121417]/20">
          <svg className="w-12 h-12 text-[#8A8F98] mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-bold mb-1">Infrastructure Fully Operational</h3>
          <p className="text-[#8A8F98] max-w-sm mx-auto text-sm">No unresolved incidents reported in the database buffer.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map(incident => (
            <div 
              key={incident.id}
              className="glass-panel rounded-xl p-6 border border-[#272A30] hover:border-orange-500/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    incident.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                    incident.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                    incident.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  }`}>
                    {incident.severity}
                  </span>
                  
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    incident.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                    incident.status === 'Investigating' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                    'bg-[#1A1D21] text-[#8A8F98] border border-[#272A30]'
                  }`}>
                    {incident.status}
                  </span>

                  <span className="text-[#8A8F98] text-xs font-mono">Reported {new Date(incident.created_at).toLocaleString()}</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{incident.title}</h3>
                <p className="text-gray-300 text-sm max-w-3xl leading-relaxed">{incident.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3.5 self-end md:self-center">
                {incident.status !== 'Resolved' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(incident.id, incident.severity, incident.status === 'Open' ? 'Investigating' : 'Resolved')}
                      className="px-3.5 py-2 rounded-lg bg-[#272A30] hover:bg-[#3a3f47] text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      {incident.status === 'Open' ? 'Investigate' : 'Resolve'}
                    </button>
                    <button 
                      onClick={() => handleRunAiAnalysis(incident)}
                      className="px-3.5 py-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-500 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.05)]"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI Assist
                    </button>
                  </>
                )}
                {incident.status === 'Resolved' && (
                  <span className="text-[#8A8F98] text-xs font-semibold font-mono flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    Archived
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#090A0B]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#121417] border border-[#272A30] rounded-xl p-8 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold tracking-tight text-white">Create SRE Incident Ticket</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#8A8F98] hover:text-white cursor-pointer p-1 rounded hover:bg-[#1A1D21]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleReportIncident} className="space-y-4 font-mono text-sm">
              <div>
                <label className="block text-xs text-[#8A8F98] uppercase mb-1.5 tracking-wider">Incident Title</label>
                <input 
                  type="text" 
                  required 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#1A1D21] border border-[#272A30] rounded-lg px-4 py-2.5 text-white focus:border-orange-500/60 focus:outline-none glow-input transition-all font-sans text-sm"
                  placeholder="e.g. Server Alpha CPU Spike 99%"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8A8F98] uppercase mb-1.5 tracking-wider">Severity Level</label>
                <select 
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-[#1A1D21] border border-[#272A30] rounded-lg px-4 py-2.5 text-white focus:border-orange-500/60 focus:outline-none glow-input transition-all"
                >
                  <option value="Critical">Critical (P1)</option>
                  <option value="High">High (P2)</option>
                  <option value="Medium">Medium (P3)</option>
                  <option value="Low">Low (P4)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#8A8F98] uppercase mb-1.5 tracking-wider">Incident Details</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows="4"
                  placeholder="Describe the anomalies, system behaviors, or errors..."
                  className="w-full bg-[#1A1D21] border border-[#272A30] rounded-lg px-4 py-2.5 text-white focus:border-orange-500/60 focus:outline-none glow-input transition-all font-sans text-sm"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitLoading}
                className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-400 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all text-sm shadow-[0_0_15px_rgba(249,115,22,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                {submitLoading ? 'Filing ticket...' : 'Dispatch Alert'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Explanation Drawer/Overlay */}
      {aiReport && (
        <div className="fixed inset-0 bg-[#090A0B]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-[#121417] border border-orange-500/30 rounded-xl p-8 shadow-[0_0_50px_rgba(249,115,22,0.15)] animate-scale-up flex flex-col max-h-[85vh]">
            
            <div className="flex justify-between items-center mb-6 border-b border-[#272A30] pb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 className="text-xl font-bold tracking-tight text-white">Gemini SRE Incident Diagnosis</h2>
              </div>
              <button 
                onClick={() => setAiReport(null)} 
                className="text-[#8A8F98] hover:text-white cursor-pointer p-1 rounded hover:bg-[#1A1D21]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Diagnosis Content */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
              {aiReport.loading ? (
                <div className="text-center py-20 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
                  <span className="text-[#8A8F98] font-mono text-sm">Retrieving heuristics & reasoning logs...</span>
                </div>
              ) : aiReport.error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg font-mono">
                  Error diagnosing incident: {aiReport.error}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-[#1A1D21] border border-[#272A30] rounded-lg">
                    <h4 className="text-xs text-[#8A8F98] font-mono uppercase mb-1">Target Ticket</h4>
                    <div className="font-bold text-white text-base">{aiReport.incident.title}</div>
                  </div>
                  <div className="prose prose-invert max-w-none text-gray-300 font-sans text-sm leading-relaxed border-t border-[#272A30]/50 pt-4 whitespace-pre-wrap">
                    {aiReport.content}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            {!aiReport.loading && !aiReport.error && (
              <div className="border-t border-[#272A30] pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-[11px] font-mono text-[#8A8F98]">
                  {aiReport.saved ? '✓ Archived in database runbooks' : 'Save this solution path to prevent future outages'}
                </span>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setAiReport(null)}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-[#272A30] hover:bg-[#3a3f47] rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Close Report
                  </button>
                  <button 
                    onClick={handleSaveToKb}
                    disabled={aiReport.saving || aiReport.saved}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 text-xs font-bold active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    {aiReport.saving ? 'Archiving...' : aiReport.saved ? 'Saved Successfully' : 'Save & Resolve Incident'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
