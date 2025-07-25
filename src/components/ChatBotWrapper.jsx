import React, { useState } from 'react';
import AiChatBot from './modals/AiChatBot';
import { ChevronUp } from 'lucide-react';

const ChatBotWrapper = () => {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

  return (
    <>
      {isChatBotOpen && (
        <div
          className="fixed inset-x-4 bottom-4 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-full sm:max-w-md h-[90dvh] sm:h-[80vh] bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden transition-all duration-300"
          aria-label="AI Chat Window"
        >
          <AiChatBot setIsChatBotOpen={setIsChatBotOpen} isChatBotOpen={isChatBotOpen} />
        </div>
      )}

      {!isChatBotOpen && (
        <div
          onClick={() => setIsChatBotOpen(true)}
          className="fixed bottom-4 right-4 sm:right-8 z-40 cursor-pointer w-[90vw] sm:w-[360px] bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-gray-800 border border-gray-200 shadow-lg rounded-t-xl px-5 py-3 flex items-center justify-between transition-all duration-200 group"
          aria-label="Open AI Chat Assistant"
        >
          <div className="flex items-center gap-2">
            <span className="text-base font-medium">💬 AI Assistant</span>
            <span className="text-xs text-gray-500 hidden sm:inline">Ask anything</span>
          </div>
          <ChevronUp color="#000000" className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition" />
        </div>
      )}
    </>
  );
};

export default ChatBotWrapper;
