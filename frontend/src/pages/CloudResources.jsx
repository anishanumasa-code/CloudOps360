import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export default function CloudResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // Form/Modal states
  const [modalOpen, setModalOpen] = useState(false); // false | 'add' | 'edit'
  const [currentId, setCurrentId] = useState(null);
  const [name, setName] = useState('');
  const [resourceType, setResourceType] = useState('Server');
  const [provider, setProvider] = useState('AWS');
  const [status, setStatus] = useState('Active');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/resources');
      if (!res.ok) {
        throw new Error('Failed to fetch resources. Make sure you are logged in.');
      }
      const data = await res.json();
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setName('');
    setResourceType('Server');
    setProvider('AWS');
    setStatus('Active');
    setCurrentId(null);
    setModalOpen('add');
    setError('');
  };

  const handleOpenEdit = (res) => {
    setName(res.name);
    setResourceType(res.resource_type);
    setProvider(res.provider);
    setStatus(res.status);
    setCurrentId(res.id);
    setModalOpen('edit');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    const payload = {
      name,
      resource_type: resourceType,
      provider,
      status
    };

    try {
      let res;
      if (modalOpen === 'add') {
        res = await apiFetch('/resources/', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiFetch(`/resources/${currentId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to save resource.');
      }

      setModalOpen(false);
      fetchResources();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to terminate this resource? This cannot be undone.')) {
      return;
    }
    
    setError('');
    try {
      const res = await apiFetch(`/resources/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Failed to delete resource.');
      }
      fetchResources();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredResources = resources.filter(res => 
    res.name.toLowerCase().includes(search.toLowerCase()) ||
    res.resource_type.toLowerCase().includes(search.toLowerCase()) ||
    res.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 text-white min-h-screen bg-[#090A0B] animate-fade-in">
      {/* Header section */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#272A30] pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Cloud Provisioning</h1>
          <p className="text-[#8A8F98]">Provision and manage active virtual nodes and databases across environments</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 font-bold hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.2)] cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Provision Resource
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg font-mono">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resource name, provider, or type..."
            className="w-full bg-[#121417] border border-[#272A30] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-orange-500/60 focus:outline-none glow-input transition-all"
          />
          <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8A8F98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button 
          onClick={fetchResources}
          className="px-4 py-2.5 bg-[#121417] border border-[#272A30] rounded-lg hover:text-orange-500 hover:border-orange-500/30 transition-all text-sm flex items-center gap-2 font-medium cursor-pointer w-full sm:w-auto justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
          </svg>
          Sync Resources
        </button>
      </div>

      {/* Resources Table/Grid */}
      {loading ? (
        <div className="text-center py-20 border border-dashed border-[#272A30] rounded-xl bg-[#121417]/20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
          <span className="text-[#8A8F98] font-mono text-sm">Querying hypervisor API...</span>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#272A30] rounded-xl bg-[#121417]/20">
          <svg className="w-12 h-12 text-[#8A8F98] mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-bold mb-1">No Cloud Resources Found</h3>
          <p className="text-[#8A8F98] max-w-sm mx-auto text-sm mb-6">No systems match your filters or database is empty.</p>
          <button 
            onClick={handleOpenAdd} 
            className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-lg hover:bg-orange-500/20 text-xs font-bold transition-all cursor-pointer"
          >
            Provision First Node
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(res => (
            <div 
              key={res.id} 
              className="glass-panel rounded-xl p-6 border border-[#272A30] shadow-glow-orange hover:shadow-[0_0_25px_rgba(249,115,22,0.1)] transition-all duration-300 relative group"
            >
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenEdit(res)}
                  className="p-1.5 rounded bg-[#1A1D21] border border-[#272A30] hover:border-orange-500/50 text-[#8A8F98] hover:text-white transition-colors cursor-pointer"
                  title="Modify Configuration"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleDelete(res.id)}
                  className="p-1.5 rounded bg-[#1A1D21] border border-[#272A30] hover:border-red-500/50 text-[#8A8F98] hover:text-red-400 transition-colors cursor-pointer"
                  title="Terminate Node"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Resource Specs */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border font-bold text-xs uppercase tracking-wider ${
                  res.resource_type.toLowerCase() === 'database' 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/25' 
                    : res.resource_type.toLowerCase() === 'server'
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/25'
                    : 'bg-purple-500/10 text-purple-400 border-purple-500/25'
                }`}>
                  {res.resource_type.slice(0, 3)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white tracking-tight leading-tight">{res.name}</h3>
                  <span className="text-[#8A8F98] text-[11px] font-mono uppercase tracking-wider">{res.resource_type} • ID: #{res.id}</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs border-t border-[#272A30]/50 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A8F98]">Hypervisor Provider</span>
                  <span className="text-white bg-[#1A1D21] border border-[#272A30] px-2 py-0.5 rounded font-bold">{res.provider}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8A8F98]">Operational State</span>
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      res.status.toLowerCase() === 'active' 
                        ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                        : res.status.toLowerCase() === 'provisioning'
                        ? 'bg-yellow-500 animate-pulse'
                        : res.status.toLowerCase() === 'degraded'
                        ? 'bg-orange-500 animate-pulse'
                        : 'bg-red-500'
                    }`}></span>
                    <span className={
                      res.status.toLowerCase() === 'active' ? 'text-green-400' :
                      res.status.toLowerCase() === 'provisioning' ? 'text-yellow-400' :
                      res.status.toLowerCase() === 'degraded' ? 'text-orange-400' : 'text-red-400'
                    }>{res.status}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Provision / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#090A0B]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#121417] border border-[#272A30] rounded-xl p-8 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {modalOpen === 'add' ? 'Provision Virtual Instance' : 'Re-configure Node'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#8A8F98] hover:text-white cursor-pointer p-1 rounded hover:bg-[#1A1D21]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/35 text-red-400 text-xs rounded-lg font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-sm">
              <div>
                <label className="block text-xs text-[#8A8F98] uppercase mb-1.5 tracking-wider">Node Name</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1A1D21] border border-[#272A30] rounded-lg px-4 py-2.5 text-white focus:border-orange-500/60 focus:outline-none glow-input transition-all"
                  placeholder="production-db-replica"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8A8F98] uppercase mb-1.5 tracking-wider">Resource Type</label>
                <select 
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="w-full bg-[#1A1D21] border border-[#272A30] rounded-lg px-4 py-2.5 text-white focus:border-orange-500/60 focus:outline-none glow-input transition-all"
                >
                  <option value="Server">Virtual Machine (Server)</option>
                  <option value="Database">Relational DB (Database)</option>
                  <option value="Storage">Blob Storage Bucket</option>
                  <option value="Network">Load Balancer (Network)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#8A8F98] uppercase mb-1.5 tracking-wider">Cloud Hypervisor</label>
                <select 
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-[#1A1D21] border border-[#272A30] rounded-lg px-4 py-2.5 text-white focus:border-orange-500/60 focus:outline-none glow-input transition-all"
                >
                  <option value="AWS">Amazon Web Services (AWS)</option>
                  <option value="GCP">Google Cloud Platform (GCP)</option>
                  <option value="Azure">Microsoft Azure</option>
                  <option value="Render">Render</option>
                  <option value="Vercel">Vercel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#8A8F98] uppercase mb-1.5 tracking-wider">Default Operational State</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#1A1D21] border border-[#272A30] rounded-lg px-4 py-2.5 text-white focus:border-orange-500/60 focus:outline-none glow-input transition-all"
                >
                  <option value="Active">Active (Green)</option>
                  <option value="Provisioning">Provisioning (Yellow Pulse)</option>
                  <option value="Degraded">Degraded (Orange Pulse)</option>
                  <option value="Terminated">Terminated (Red)</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={formLoading}
                className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-400 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all text-sm shadow-[0_0_15px_rgba(249,115,22,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                {formLoading ? 'Executing provision script...' : modalOpen === 'add' ? 'Commit Provisioning Plan' : 'Apply Configuration Drift'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
