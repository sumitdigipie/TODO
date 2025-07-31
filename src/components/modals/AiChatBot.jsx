import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Copy, Plus, Send } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessageToBot } from '../../store/slices/chatBotSlice';
import { addTodo, fetchTodos } from '../../store/slices/todoSlice';
import { fetchSections } from '../../store/slices/sectionsSlice';

const AiChatBot = ({ setIsChatBotOpen, isChatBotOpen }) => {
  const [text, setText] = useState('');
  const [selectedModel, setSelectedModel] = useState('chatgpt');

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectAssignTaskTo, setSelectAssignTaskTo] = useState("");

  const lastMessageRef = useRef(null);
  const textareaRef = useRef(null);
  const dispatch = useDispatch();

  const { messages, isLoading } = useSelector((state) => state.chat);
  const sections = useSelector((state) => state.sections);
  const { userList } = useSelector((state) => state.users)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText) {
      dispatch({
        type: 'chat/addUserMessage',
        payload: {
          text: trimmedText,
          from: 'user',
        },
      });

      dispatch(sendMessageToBot(trimmedText)).unwrap().then((res) => {
        if (res) {
          dispatch(fetchTodos())
        }
      });
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (user) => {
    const name = `${user.firstName} ${user.lastName}`;
    const triggerIndex = text.lastIndexOf('@', cursorPosition);
    const before = text.slice(0, triggerIndex + 1);
    const after = text.slice(cursorPosition);
    const newText = before + name + ' ' + after;
    setSelectAssignTaskTo(name)
    setText(newText);
    setShowSuggestions(false);

    setTimeout(() => {
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = (before + name + ' ').length;
      textareaRef.current.focus();
    }, 0);
  };

  useEffect(() => {
    dispatch(fetchSections())
  }, [sections.sections.length, isChatBotOpen])

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages]);

  const assignTaskUserInfo = userList?.find((item) => `${item.firstName} ${item.lastName}` === selectAssignTaskTo);
  console.log('assignTaskUserInfo :>> ', assignTaskUserInfo);
  return (
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      <header className="bg-white border-b px-6 py-4 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          AI Assistant
        </h1>
        <button
          onClick={() => setIsChatBotOpen(false)}
          className="text-gray-500 hover:text-gray-700 transition"
          aria-label="Close chatbot"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </header>
      <main className="flex-1 overflow-y-auto p-4 bg-[#F9FAFB]">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-gray-600 py-12 space-y-6 animate-fade-in">
              <div className="text-[4rem] animate-pulse select-none">🤖</div>
              <div className="space-y-1 max-w-md">
                <h2 className="text-2xl font-bold text-gray-900">Welcome to your AI Assistant</h2>
                <p className="text-sm text-gray-500">
                  Ask anything — from drafting tickets to solving technical problems.
                </p>
              </div>
              <p className="text-xs text-gray-400 italic select-none">
                Press <span className="font-medium text-gray-500">Enter</span> to send 💬
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => {
                const isLast = index === messages.length - 1;
                return (
                  <div
                    key={index}
                    ref={isLast ? lastMessageRef : null}
                    className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    {msg.from !== 'user' && (
                      <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold select-none">
                        AI
                      </div>
                    )}
                    <div
                      className={`relative px-4 py-2 rounded-xl text-sm max-w-[75%] shadow-md whitespace-pre-wrap break-words ${msg.from === 'user'
                        ? 'bg-[#4B5563] text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                    >
                      {typeof msg.result === 'object' && msg.result !== null ? (
                        <>
                          {msg.result.title && (
                            <div className="font-semibold text-gray-800 mb-1 pr-8">
                              {msg.result.title}
                            </div>
                          )}
                          {msg.result.description && (
                            <div className="text-gray-700 pr-8">
                              {msg.result.description}
                            </div>
                          )}

                        </>
                      ) : (
                        msg.text
                      )}
                    </div>
                    {msg.from === 'user' && (
                      <div className="w-9 h-9 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-semibold sele">
                        You
                      </div>
                    )}
                  </div>
                )
              })}
              {isLoading && (
                <div className="flex items-center gap-2 mt-4 animate-fade-in">
                  <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold select-none">
                    AI
                  </div>
                  <div className="px-4 py-2 rounded-xl text-sm max-w-[75%] flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
                    <span className='text-gray-400'>Thinking...</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative border border-gray-300 rounded-lg shadow-sm bg-[#FAFAFA] flex flex-col overflow-visible">
            <div className="px-4 pt-4 pb-20 sm:pb-16 relative">
              {showSuggestions && (
                <ul
                  className="absolute bottom-full mb-2 left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg text-sm max-h-60 overflow-y-auto z-50"
                >
                  {suggestions.map((user) => (
                    <li
                      key={user.uid}
                      className="px-4 py-2 hover:bg-blue-50 text-gray-800 cursor-pointer transition-colors"
                      onClick={() => handleSuggestionClick(user)}
                    >
                      <span className="text-blue-600 font-medium">@</span>{user.firstName} {user.lastName}
                    </li>
                  ))}
                </ul>
              )}

              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                  const value = e.target.value;
                  setText(value);
                  setCursorPosition(e.target.selectionStart);

                  const triggerIndex = value.lastIndexOf('@', e.target.selectionStart);
                  if (triggerIndex >= 0) {
                    const query = value.slice(triggerIndex + 1, e.target.selectionStart);
                    setSelectAssignTaskTo(query)
                    const filtered = userList?.filter((user) =>
                      `${user.firstName} ${user.lastName}`.toLowerCase().startsWith(query.toLowerCase())
                    );
                    setSuggestions(filtered);
                    setShowSuggestions(filtered.length > 0);
                  } else {
                    setShowSuggestions(false);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className="w-full resize-none bg-transparent text-sm text-gray-800 placeholder-gray-500 focus:outline-none border-none"
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
                  <option value="chatgpt">ChatGPT</option>
                  <option value="gemini">Gemini</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-500"
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
                <Send className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default AiChatBot;
