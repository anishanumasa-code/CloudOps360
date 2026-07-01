import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export default function AiCopilot() {
  // Initialize chat with a welcome message
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your CloudOps Gemini Co-Pilot. How can I help you analyze metrics, query DBMS schemas, or troubleshoot infrastructure issues today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to UI immediately
    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Use apiFetch to call the dynamic AI chat endpoint
      const response = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt: userMsg.content }),
      });

      if (!response.ok) {
        throw new Error('AI Engine returned an error response.');
      }

      const data = await response.json();
      
      // Add AI response to UI
      const aiMsg = { role: 'ai', content: data.reply || "No response received from Gemini." };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      setMessages((prev) => [...prev, { 
        role: 'ai', 
        content: 'Error connecting to the AI backend. Verify that the backend server is running and has a valid Gemini API key configured.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-69px)] bg-[#090A0B] text-[#FAFAFA] p-6 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <svg className="w-6 h-6 text-orange-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Gemini Co-Pilot
        </h1>
        <p className="text-xs text-[#8A8F98]">AI-Assisted Cloud Operations & SRE Diagnostics</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-[#121417] border border-[#272A30] rounded-xl overflow-hidden shadow-2xl">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#090A0B]/40">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[80%] p-4 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-orange-500/10 border border-orange-500/35 text-orange-50 rounded-br-none shadow-[0_0_15px_rgba(249,115,22,0.05)]' 
                  : 'bg-[#1A1D21] border border-[#272A30] text-gray-200 rounded-bl-none'
              }`}>
                {msg.role === 'ai' && (
                  <div className="text-[10px] font-mono text-orange-500 uppercase tracking-widest mb-1.5 font-bold">
                    Gemini.SRE
                  </div>
                )}
                {msg.role === 'user' && (
                  <div className="text-[10px] font-mono text-[#8A8F98] uppercase tracking-widest mb-1.5 text-right font-bold">
                    Operator
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-[#1A1D21] border border-[#272A30] p-4 rounded-xl rounded-bl-none flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-orange-500/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2.5 h-2.5 bg-orange-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2.5 h-2.5 bg-orange-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#090A0B] border-t border-[#272A30]">
          <form onSubmit={handleSend} className="flex gap-3 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Gemini to check cpu usage, verify PostgreSQL schemas, or guide you through an outage..."
              className="flex-1 bg-[#121417] border border-[#272A30] text-sm rounded-lg px-4 py-3.5 focus:outline-none focus:border-orange-500/60 transition-all placeholder-[#8A8F98] glow-input text-white"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-orange-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.15)] cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}