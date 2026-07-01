import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all articles when the page loads
  useEffect(() => {
    fetchArticles('');
  }, []);

  const fetchArticles = (query) => {
    // Hits your search endpoint. An empty query returns everything.
    fetch(`https://cloudops360.onrender.com/knowledge/search?query=${query}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setArticles(data);
          if (data.length > 0) setSelectedDoc(data[0]); // Auto-select the first one
        }
      })
      .catch(err => console.error("Fetch error:", err));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles(searchQuery);
  };

  return (
    <div className="flex h-screen bg-[#090A0B] text-[#FAFAFA]">
      
      {/* Left Sidebar: Search & List */}
      <div className="w-80 border-r border-[#272A30] bg-[#121417] flex flex-col">
        <div className="p-4 border-b border-[#272A30]">
          <h1 className="text-xl font-bold mb-4">Runbooks</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incidents..." 
              className="w-full bg-[#1A1D21] border border-[#272A30] text-sm rounded px-3 py-2 focus:outline-none focus:border-orange-500"
            />
            <button type="submit" className="bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600">Search</button>
          </form>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {articles.length === 0 ? (
            <div className="text-[#8A8F98] text-sm text-center mt-4">No records found.</div>
          ) : (
            articles.map(article => (
              <button
                key={article.id}
                onClick={() => setSelectedDoc(article)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedDoc?.id === article.id 
                    ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400' 
                    : 'bg-transparent text-[#8A8F98] hover:bg-[#1A1D21] hover:text-white'
                }`}
              >
                <div className="text-sm font-medium">{article.title}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Area: Markdown Renderer */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#090A0B]">
        {selectedDoc ? (
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-white mb-6">{selectedDoc.title}</h1>
            <div className="mb-6 p-4 bg-[#1A1D21] border border-[#272A30] rounded-lg">
              <h3 className="text-orange-500 font-bold mb-2">Issue Description</h3>
              <p className="text-gray-300">{selectedDoc.issue_description}</p>
            </div>
            <div>
              <h3 className="text-emerald-500 font-bold mb-2">Resolution Steps</h3>
              <div className="prose prose-invert max-w-none text-gray-300">
                <ReactMarkdown>{selectedDoc.resolution}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[#8A8F98] flex items-center justify-center h-full">
            Create an incident in the backend to see it here.
          </div>
        )}
      </div>
    </div>
  );
}