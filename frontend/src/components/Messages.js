import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function Messages() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // For demo, fetch all users except current user
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users');
        setUsers(res.data.filter(u => u._id !== user.id));
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, [user.id]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
      socket.emit('joinRoom', getRoomId(user.id, selectedUser._id));
    }
  }, [selectedUser]);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      if (
        (message.sender === user.id && message.receiver === selectedUser?._id) ||
        (message.sender === selectedUser?._id && message.receiver === user.id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });
    return () => {
      socket.off('receiveMessage');
    };
  }, [selectedUser, user.id]);

  const fetchMessages = async (receiverId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/${user.id}/${receiverId}`);
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const getRoomId = (id1, id2) => {
    return [id1, id2].sort().join('_');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;
    const message = {
      sender: user.id,
      receiver: selectedUser._id,
      content: newMessage.trim(),
      room: getRoomId(user.id, selectedUser._id),
    };
    socket.emit('sendMessage', message);
    setMessages((prev) => [...prev, message]);
    setNewMessage('');
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex h-screen">
      <div className="w-1/4 border-r border-gray-300 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Friends</h2>
        {users.length === 0 && <p>No friends found.</p>}
        <ul>
          {users.map((u) => (
            <li
              key={u._id}
              className={`p-2 cursor-pointer hover:bg-gray-200 ${
                selectedUser?._id === u._id ? 'bg-gray-300' : ''
              }`}
              onClick={() => setSelectedUser(u)}
            >
              {u.username}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4 flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 bg-white rounded shadow">
          {selectedUser ? (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 max-w-xs p-2 rounded ${
                  msg.sender === user.id ? 'bg-blue-200 self-end' : 'bg-gray-200 self-start'
                }`}
              >
                {msg.content}
              </div>
            ))
          ) : (
            <p>Select a friend to start chatting</p>
          )}
          <div ref={messagesEndRef} />
        </div>
        {selectedUser && (
          <div className="p-4 bg-gray-100 flex">
            <input
              type="text"
              className="flex-grow p-2 border border-gray-300 rounded mr-2"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
