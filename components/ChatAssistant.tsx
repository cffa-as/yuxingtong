import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, CloudRain } from 'lucide-react';
import { chatWithAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: '你好！我是雨行助手(RainGuard)。外面雨很大，你要去哪里？我可以帮你规划一条不淋雨的路线。' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const responseText = await chatWithAssistant(history, userMsg.text);

    setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
    }]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-emerald-600'}`}>
                {msg.role === 'user' ? <User size={14} /> : <CloudRain size={16} />}
              </div>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-br-none shadow-indigo-200'
                    : 'bg-white/80 backdrop-blur-md text-slate-700 rounded-bl-none border border-white/50 shadow-slate-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start w-full px-11">
               <div className="bg-white/60 backdrop-blur px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-3 shadow-sm border border-white/40">
                   <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                   <span className="text-xs text-slate-500 font-medium">智能规划中...</span>
               </div>
           </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/40 backdrop-blur-md border-t border-white/30">
         {messages.length < 3 && (
             <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                 {['帮我找最近的避雨点', '前面路段有积水吗？', '去市中心怎么走？'].map(hint => (
                     <button
                        key={hint}
                        onClick={() => { setInput(hint); }}
                        className="whitespace-nowrap px-4 py-2 bg-white/70 hover:bg-white rounded-full text-xs text-indigo-600 font-medium border border-indigo-100 shadow-sm transition-all flex items-center gap-1.5"
                     >
                        <Sparkles size={12} className="text-amber-400" />
                        {hint}
                     </button>
                 ))}
             </div>
         )}
        <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-full border border-white/50 focus-within:ring-2 ring-indigo-200 transition-all shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="询问雨天出行建议..."
            className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 outline-none text-sm px-4 py-2"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;