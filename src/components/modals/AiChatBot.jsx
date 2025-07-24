import { PanelRightClose, Send } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

const AiChatBot = ({ setIsChatBotOpen }) => {
  const [text, setText] = useState('');
  const [selectedModel, setSelectedModel] = useState('chatgpt');
  const [messages, setMessages] = useState([]);

  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const handleSend = () => {
    const trimmedText = text.trim()
    if (trimmedText) {
      const newMessage = { text: trimmedText, sender: 'Ai', model: selectedModel };
      setMessages((prev) => [...prev, newMessage]);
      console.log(`Send message to ${selectedModel}:`, text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] md:h-[calc(100vh-0px)] bg-[#F5F5F5]">
      <header className="bg-gradient-to-r from-[#E0F2FE] to-[#CCFBF1] shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-50 w-full rounded-br-md rounded-bl-md">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
          AI Assistant
        </h1>
        <button
          className="text-gray-600 hover:text-gray-800 transition-colors"
          onClick={() => setIsChatBotOpen(false)}
          aria-label="Close chatbot"
        >
          <PanelRightClose className="w-6 h-6" />
        </button>
      </header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F9FAFB]">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-600 py-16 px-4 space-y-6 animate-fade-in">
              <div className="text-[4.5rem] sm:text-[6rem] animate-pulse">🤖</div>

              <div className="space-y-1 sm:space-y-2 max-w-md">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Welcome to your AI Assistant
                </h2>
                <p className="text-sm sm:text-base text-gray-500">
                  Ask anything — from drafting messages to solving problems. I'm here to help.
                </p>
              </div>

              <div className="text-xs sm:text-sm text-gray-400 italic">
                Type a message below and press <span className="font-medium text-gray-500">Enter</span> to begin 💬
              </div>
              <div className="hidden sm:flex flex-wrap justify-center gap-2 text-xs sm:text-sm text-gray-500 mt-4">
                <span className="bg-gray-100 px-3 py-1 rounded-full">“Summarize this article…”</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">“Write a reply to this email…”</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">“Help me brainstorm ideas…”</span>
              </div>
            </div>

          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 animate-fade-in ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                {msg.sender !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center text-sm font-semibold">
                    AI
                  </div>
                )}

                <div
                  className={`px-4 py-2 rounded-lg text-sm shadow-md max-w-[80%] whitespace-pre-wrap ${msg.sender === 'user'
                    ? 'bg-[#5d708f] text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <footer className="px-4 sm:px-6 lg:px-8 py-6 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="relative border border-gray-300 rounded-lg shadow-sm bg-[#FAFAFA] flex flex-col overflow-hidden">
            <div className="px-4 pt-4 pb-20 sm:pb-16">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className="w-full resize-none bg-transparent text-sm sm:text-base text-gray-800 placeholder-gray-500 focus:outline-none overflow-auto"
                style={{ minHeight: '36px', maxHeight: '200px' }}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3 flex items-center justify-between gap-4">
              <div className="relative w-28">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="h-9 w-full px-3 pr-8 text-sm border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none appearance-none"
                >
                  <option value="chatgpt">ChatGpt</option>
                  <option value="gemini">Gemini</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <button
                onClick={handleSend}
                className="p-2 rounded-md hover:bg-gray-100 transition"
                aria-label="Send message"
              >
                <Send className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </footer>


    </div>
  );
};

export default AiChatBot;
