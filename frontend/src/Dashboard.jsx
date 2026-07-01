import { useState } from 'react';
import { Link } from 'react-router-dom';
import Metrics from './pages/Metrics.jsx';
import KnowledgeBase from './pages/KnowledgeBase.jsx';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('metrics');

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

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#272A30] p-6 space-y-2 bg-[#121417]">
          <button 
            onClick={() => setActiveTab('metrics')} 
            className={`w-full text-left px-4 py-2 rounded transition-colors ${activeTab === 'metrics' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'hover:bg-[#1A1D21] text-[#8A8F98]'}`}
          >
            Performance Metrics
          </button>
          <button 
            onClick={() => setActiveTab('knowledge')} 
            className={`w-full text-left px-4 py-2 rounded transition-colors ${activeTab === 'knowledge' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'hover:bg-[#1A1D21] text-[#8A8F98]'}`}
          >
            Knowledge Base
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#090A0B]">
          {activeTab === 'metrics' ? (
            <Metrics />
          ) : activeTab === 'knowledge' ? (
            <KnowledgeBase />
          ) : (
            <div className="p-12 text-[#8A8F98] text-center">
              Select a module from the sidebar.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}