import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiSearch, FiSend, FiPlus, FiMoreVertical, FiMessageSquare } from 'react-icons/fi';
import Header from '../components/HeaderTapro';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, apiRequest } from '../config/api';

const MessagesPage = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.conversations);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async () => {
    if (!selectedConversation) return;

    try {
      const response = await apiRequest(
        API_ENDPOINTS.conversationMessages(selectedConversation.id)
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [selectedConversation]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      // Poll for new messages every 3 seconds
      pollingRef.current = setInterval(fetchMessages, 3000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [selectedConversation, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    try {
      const response = await apiRequest(
        API_ENDPOINTS.conversationMessages(selectedConversation.id),
        {
          method: 'POST',
          body: JSON.stringify({ content: newMessage.trim() }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        // Update conversation list
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5EE]">
        <Header active="Message" />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">Loading conversations...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5EE]">
      <Header active="Message" />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm h-[calc(100vh-200px)] flex overflow-hidden">
          {/* Sidebar - Conversation List */}
          <div className="w-80 border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Messages</h2>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <FiPlus className="text-gray-600" />
                </button>
              </div>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <FiMessageSquare className="mx-auto text-4xl mb-2" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                      selectedConversation?.id === conv.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={conv.otherUser?.profileImage || '/assets/default.jpg'}
                          alt={conv.otherUser?.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">
                            {conv.otherUser?.fullName || 'Unknown'}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {conv.lastMessage?.createdAt
                              ? formatDate(conv.lastMessage.createdAt)
                              : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      {conv.unreadCount?.[currentUser?.id] > 0 && (
                        <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                          {conv.unreadCount[currentUser?.id]}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedConversation.otherUser?.profileImage || '/assets/default.jpg'}
                      alt={selectedConversation.otherUser?.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">
                        {selectedConversation.otherUser?.fullName || 'Unknown'}
                      </h3>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <FiMoreVertical className="text-gray-600" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isSelf = msg.senderId === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isSelf
                              ? 'bg-black text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isSelf ? 'text-gray-300' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      className="p-3 bg-black text-white rounded-full hover:bg-gray-800 transition disabled:opacity-50"
                      disabled={!newMessage.trim() || sendingMessage}
                    >
                      <FiSend />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FiMessageSquare className="mx-auto text-6xl mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MessagesPage;
