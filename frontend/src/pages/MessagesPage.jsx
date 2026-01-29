import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiSend, FiPlus, FiPaperclip, FiMoreVertical, FiInfo, FiMessageSquare } from 'react-icons/fi';
import Header from '../components/HeaderTapro';
import Footer from '../components/Footer';

// Sample data - in a real app this would come from an API or state management
const initialMessages = [
  {
    id: 1,
    name: 'Vladimir Putin',
    role: 'Managing Director | Ruler',
    avatar: '/assets/putin.jpeg',
    lastMessage: 'Putin: Sure, I can make time. What sector are you in?',
    date: '23 Jan',
    unread: true,
    online: true,
    chat: [
      {
        id: 101,
        sender: 'Suyash',
        isSelf: true,
        message: 'Hey!! I saw your profile and I\'m impressed with your investment portfolio.',
        avatar: '/assets/user.jpeg',
        time: '10:45 AM',
      },
      {
        id: 102,
        sender: 'Vladimir Putin',
        isSelf: false,
        message: 'Hello, thank you for reaching out. I\'m always looking for promising opportunities.',
        avatar: '/assets/putin.jpeg',
        time: '10:46 AM',
      },
      {
        id: 103,
        sender: 'Suyash',
        isSelf: true,
        message: 'Great! I\'d love to tell you about my startup. Do you have time for a quick chat this week?',
        avatar: '/assets/user.jpeg',
        time: '10:48 AM',
      },
      {
        id: 104,
        sender: 'Vladimir Putin',
        isSelf: false,
        message: 'Sure, I can make time. What sector are you in?',
        avatar: '/assets/putin.jpeg',
        time: '10:51 AM',
      }
    ]
  },
  {
    id: 2,
    name: 'Discord',
    role: 'AI Workflow Automation',
    avatar: '/assets/discord.svg',
    lastMessage: 'You: Looking for Investment?',
    date: '23 Jan',
    unread: false,
    online: false,
    chat: [
      {
        id: 201,
        sender: 'Suyash',
        isSelf: true,
        message: 'Looking for Investment?',
        avatar: '/assets/user.jpeg',
        time: '2:25 PM',
      }
    ]
  },
  {
    id: 3,
    name: 'Warren Buffett',
    role: 'Managing Partner at Tech Ventures Capital',
    avatar: '/assets/Warren_Buffett.jpg',
    lastMessage: 'Warren: Hey!!',
    date: '23 Jan',
    unread: true,
    online: true,
    chat: [
      {
        id: 301,
        sender: 'Warren Buffett',
        isSelf: false,
        message: 'Hey!! Thanks for connecting. I saw your startup profile - very interesting work you\'re doing.',
        avatar: '/assets/Warren_Buffett.jpg',
        time: '9:12 AM',
      }
    ]
  },
];

const MessagesPage = () => {
  const [messagesList, setMessagesList] = useState(initialMessages);
  const [activeChat, setActiveChat] = useState(messagesList[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const chatBodyRef = useRef(null);
  const messageInputRef = useRef(null);

  // Filter messages based on search term
  const filteredMessages = messagesList.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [activeChat]);

  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [activeChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: 'Suyash',
      isSelf: true,
      message: newMessage,
      avatar: '/assets/user.jpeg',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessagesList = messagesList.map(chat => {
      if (chat.id === activeChat.id) {
        return {
          ...chat,
          chat: [...chat.chat, message],
          lastMessage: `You: ${newMessage.substring(0, 30)}${newMessage.length > 30 ? '...' : ''}`,
          date: 'Now',
        };
      }
      return chat;
    });

    setMessagesList(updatedMessagesList);
    setActiveChat(updatedMessagesList.find(chat => chat.id === activeChat.id));
    setNewMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5EE] w-full">
      <Header active="Message" />

      <main className="flex-grow flex mx-auto py-4 px-4 w-full max-w-[1400px]">
        {/* Fixed width sidebar - won't change with content */}
        <aside className="w-[320px] flex-shrink-0 flex-grow-0 bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-120px)] overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Messages</h2>
          
          </div>

          {/* Search */}
          <div className="px-4 py-2">
            <div className="relative">
              <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {filteredMessages.length === 0 ? (
              <div className="text-center p-4 text-gray-500">No conversations found</div>
            ) : (
              filteredMessages.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 border-b relative ${
                    chat.id === activeChat.id ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-sm truncate max-w-[150px]">{chat.name}</p>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{chat.date}</span>
                    </div>
                    <p className={`text-xs truncate max-w-[200px] ${chat.unread ? 'font-bold text-black' : 'text-gray-500'}`}>
                      {chat.lastMessage}
                    </p>
                  </div>

                  {chat.unread && (
                    <span className="absolute right-4 top-4 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Fixed width chat window - won't change with content */}
        <section className="flex-1 bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-120px)] ml-4">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="border-b px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={activeChat.avatar}
                      alt={activeChat.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    {activeChat.online && (
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div className="min-w-0 max-w-[200px]">
                    <h3 className="font-semibold text-base truncate">{activeChat.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{activeChat.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100" title="Info">
                    <FiInfo size={18} />
                  </button>
                  <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100" title="More">
                    <FiMoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                {activeChat.chat.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex items-start gap-3 ${msg.isSelf ? 'ml-auto flex-row-reverse' : ''}`}
                    style={{ maxWidth: '70%' }}
                  >
                    <img 
                      src={msg.avatar} 
                      alt={msg.sender} 
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0" 
                    />
                    <div className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          msg.isSelf ? 'bg-black text-white rounded-tr-none' : 'bg-white rounded-tl-none'
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                      </div>
                      <span className="text-xs text-gray-400 mt-1">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="border-t bg-white px-4 py-3 flex items-center gap-3">
                <button 
                  type="button" 
                  className="p-2 text-gray-500 rounded-full hover:bg-gray-100 flex-shrink-0" 
                  title="Add attachment"
                >
                  <FiPaperclip size={18} />
                </button>

                <input
                  ref={messageInputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />

                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-2 text-white bg-black rounded-full flex-shrink-0 ${
                    !newMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                  }`}
                  title="Send message"
                >
                  <FiSend size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <div className="mb-4 p-6 bg-gray-100 rounded-full">
                <FiMessageSquare size={48} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="mt-2">Choose from your existing conversations or start a new one</p>
              
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MessagesPage;