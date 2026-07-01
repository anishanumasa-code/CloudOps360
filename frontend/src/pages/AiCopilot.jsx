import { useState, useRef, useEffect } from 'react';

export default function AiCopilot() {
  // 1. Initialize chat with a welcome message
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your CloudOps Gemini Co-Pilot. How can I help you analyze metrics or manage your infrastructure today?' }
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
      // NOTE: You will need to update this URL path to match your actual FastAPI AI router endpoint
      const response = await fetch('https://cloudops360.onrender.com/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.content }),
      });

      const data = await response.json();
      
      // Add AI response to UI (adjust data.reply based on your backend's JSON structure)
      const aiMsg = { role: 'ai', content: data.reply || "No response received." };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Error connecting to the AI backend. Is the server running?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#090A0B] text-[#FAFAFA] p-6">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Gemini Co-Pilot
        </h1>
        <p className="text-sm text-[#8A8F98]">AI-Assisted Cloud Operations</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-[#121417] border border-[#272A30] rounded-xl overflow-hidden">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-orange-500/10 border border-orange-500/30 text-orange-50 rounded-br-none' 
                  : 'bg-[#1A1D21] border border-[#272A30] text-[#FAFAFA] rounded-bl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1A1D21] border border-[#272A30] p-3 rounded-lg rounded-bl-none flex gap-1">
                <div className="w-2 h-2 bg-[#8A8F98] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#8A8F98] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#8A8F98] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#090A0B] border-t border-[#272A30]">
          <form onSubmit={handleSend} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Gemini to analyze metrics or query the database schema..."
              className="flex-1 bg-[#121417] border border-[#272A30] text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500/50 transition-colors placeholder-[#8A8F98]"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-orange-500/10 text-orange-500 border border-orange-500/30 px-4 py-2 rounded-lg hover:bg-orange-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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