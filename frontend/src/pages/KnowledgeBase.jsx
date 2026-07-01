import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiFetch } from '../utils/api';

export default function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all articles when the page loads
  useEffect(() => {
    fetchArticles('');
  }, []);

  const fetchArticles = async (query) => {
    setLoading(true);
    try {
      // Hits your search endpoint. An empty query returns everything.
      const res = await apiFetch(`/knowledge/search?query=${query}`);
      if (!res.ok) {
        throw new Error('Failed to load runbooks.');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setArticles(data);
        if (data.length > 0) {
          setSelectedDoc(data[0]); // Auto-select the first one
        } else {
          setSelectedDoc(null);
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles(searchQuery);
  };

  return (
    <div className="flex h-[calc(100vh-69px)] bg-[#090A0B] text-[#FAFAFA] animate-fade-in font-sans">
      
      {/* Left Sidebar: Search & List */}
      <div className="w-80 border-r border-[#272A30] bg-[#121417] flex flex-col">
        <div className="p-4 border-b border-[#272A30]">
          <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            SRE Runbooks
          </h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incidents..." 
              className="w-full bg-[#1A1D21] border border-[#272A30] text-xs rounded px-3 py-2 focus:outline-none focus:border-orange-500 text-white"
            />
            <button type="submit" className="bg-orange-500 text-white px-3.5 py-2 rounded text-xs hover:bg-orange-600 font-bold cursor-pointer">Search</button>
          </form>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="text-[#8A8F98] text-xs text-center mt-8">Loading index...</div>
          ) : articles.length === 0 ? (
            <div className="text-[#8A8F98] text-xs text-center mt-8">No runbooks indexed.</div>
          ) : (
            articles.map(article => (
              <button
                key={article.id}
                onClick={() => setSelectedDoc(article)}
                className={`w-full text-left p-3.5 rounded-lg transition-colors border ${
                  selectedDoc?.id === article.id 
                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 font-bold' 
                    : 'bg-transparent border-transparent text-[#8A8F98] hover:bg-[#1A1D21] hover:text-white'
                }`}
              >
                <div className="text-xs font-mono uppercase tracking-wider mb-1 opacity-60">ID: #{article.id}</div>
                <div className="text-sm font-semibold leading-snug">{article.title}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Area: Markdown Renderer */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#090A0B] custom-scrollbar">
        {selectedDoc ? (
          <div className="max-w-3xl animate-fade-in">
            <div className="flex items-center justify-between mb-4 border-b border-[#272A30] pb-4">
              <h1 className="text-3xl font-bold tracking-tight text-white">{selectedDoc.title}</h1>
              <span className="text-xs font-mono text-[#8A8F98]">Index Key: RUNBOOK_{selectedDoc.id}</span>
            </div>
            
            <div className="mb-8 p-5 bg-[#121417] border border-[#272A30] rounded-xl shadow-inner">
              <h3 className="text-orange-500 font-mono font-bold text-xs uppercase tracking-wider mb-2">Original Anomaly Profile</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{selectedDoc.issue_description}</p>
            </div>
            
            <div>
              <h3 className="text-emerald-500 font-mono font-bold text-xs uppercase tracking-wider mb-3">Proven Resolution Playbook</h3>
              <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed border-t border-[#272A30]/50 pt-4 whitespace-pre-wrap">
                <ReactMarkdown>{selectedDoc.resolution}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[#8A8F98] flex flex-col items-center justify-center h-full gap-2">
            <svg className="w-12 h-12 text-[#272A30] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="font-mono text-xs">Runbook repository is empty.</span>
            <span className="text-xs text-[#5B606a] max-w-xs text-center">Use the Incident Management panel to file a ticket and generate AI solutions to build your runbook catalog.</span>
          </div>
        )}
      </div>
    </div>
  );
}