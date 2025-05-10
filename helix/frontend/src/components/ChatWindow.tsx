import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const scrollbarStyles = `
  .chat-messages::-webkit-scrollbar {
    width: 12px;
    height: 12px;
    display: block;
    background-color: #F3F4F6;
  }
  
  .chat-messages::-webkit-scrollbar-track {
    background: #F3F4F6;
    border-radius: 0;
  }
  
  .chat-messages::-webkit-scrollbar-thumb {
    background-color: #6B7280;
    border-radius: 6px;
    border: 2px solid #F3F4F6;
    min-height: 40px;
  }
  
  .chat-messages::-webkit-scrollbar-thumb:hover {
    background-color: #4B5563;
  }
  
  .chat-messages {
    scrollbar-width: thin;
    scrollbar-color: #6B7280 #F3F4F6;
  }
`;

interface ChatMessage {
  sender: 'user' | 'ai';
  content: string;
  userName?: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatWindowProps {
  userId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ userId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string>('User');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await axios.get(`/api/user/profile?user_id=${userId}`);
        setUserName(response.data.name || 'User');
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };
    fetchUserName();
  }, [userId]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim()) return;
  
    try {
      setLoading(true);
      const sentMessage = input;
  
      setMessages(prev => [...prev, {
        sender: 'user',
        content: sentMessage,
        userName: userName,
        timestamp: new Date()
      }]);
      setInput('');
  
      setMessages(prev => [...prev, {
        sender: 'ai',
        content: 'Thinking...',
        userName: 'Helix Assistant',
        timestamp: new Date(),
        isLoading: true
      }]);
  
      const conversationContext = messages
        .slice(-5)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      
      const lowerMsg = sentMessage.toLowerCase();
      if (lowerMsg.includes("sequence") || 
          lowerMsg.includes("generate") || 
          lowerMsg.includes("create") || 
          lowerMsg.includes("make") || 
          lowerMsg.includes("new")) {
        window.dispatchEvent(new CustomEvent('sequenceGenerationStarted'));
      }
  
      const response = await axios.post('/api/chat', {
        user_id: userId,
        message: sentMessage,
        conversation_context: conversationContext
      });
  
      setMessages(prev => prev.filter(msg => !msg.isLoading));
  
      if (response.data.sequence) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          content: "I've created a sequence based on our discussion. Check it out in the workspace! Let me know if you'd like any changes.",
          userName: 'Helix Assistant',
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          sender: 'ai',
          content: response.data.message,
          userName: 'Helix Assistant',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error in handleSend:', error);
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      setMessages(prev => [...prev, {
        sender: 'ai',
        content: "Something went wrong. Please try again.",
        userName: 'Helix Assistant',
        timestamp: new Date()
      }]);
      
      window.dispatchEvent(new CustomEvent('refreshSequences'));
    } finally {
      setLoading(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full relative" style={{ height: "calc(100vh - 64px)" }}>
      <style>{scrollbarStyles}</style>
      <div className="section-header">Chat</div>
      <div className="chat-messages scrollbar-visible" 
        style={{ 
          overflowY: 'scroll', 
          height: "calc(100% - 120px)",
          maxHeight: "calc(100% - 120px)",
          minHeight: "300px",
          display: "block",
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--text-tertiary) transparent',
          border: "1px solid var(--border)",
          padding: "1.5rem",
          paddingBottom: "6rem"
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}
            style={{
              marginBottom: "1rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}
          >
            <div className="message-header">
              <span className="message-sender">{msg.userName}</span>
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            </div>
            <div className="message-content">
              {msg.isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="loading-spinner"></div>
                  <span>{msg.content}</span>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input">
          <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading} rows={1} className="chat-textarea"
          />
          <button onClick={handleSend} disabled={loading} type="button" className="send-button">
            {loading ? (
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
