import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import './ChatRoom.css';
import { toast } from 'react-toastify';

const socket = io('http://localhost:3001'); // בפרודקשן לשים URL אמיתי

const ChatRoom = () => {
  const { requestId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { userId: otherUserId, userName } = location.state || {};
  const myUserId = localStorage.getItem('userId'); // המשתמש המחובר

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const loadMessages = async () => {
    try {
      const res = await axios.get(`/api/messages/${requestId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('❌ Error loading messages:', err);
      toast.error('שגיאה בטעינת הודעות');
    }
  };

  useEffect(() => {
    if (!myUserId || !userName || !requestId) {
      toast.error('חסרים נתונים לצ׳אט');
      navigate('/dashboard');
      return;
    }

    socket.emit('joinRoom', requestId);
    loadMessages();

    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const msgData = {
      requestId,
      senderId: myUserId,
      senderName: localStorage.getItem('userName'),
      text: input,
      timestamp: new Date().toISOString(),
    };

    socket.emit('sendMessage', {
      roomId: requestId,
      message: msgData,
    });

    try {
      await axios.post('/api/messages', msgData);
    } catch (err) {
      console.error('❌ Error saving message:', err);
    }

    setMessages((prev) => [...prev, msgData]);
    setInput('');
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <span>צ׳אט עם {userName}</span>
        <button className="back-button" onClick={() => navigate(-1)}>
          חזרה
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => {
          const isOwn = String(msg.senderId) === String(myUserId);
          return (
            <div key={idx} className={`message ${isOwn ? 'own' : 'other'}`}>
              {msg.text}
              <div className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString('he-IL', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="כתוב הודעה..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>שלח</button>
      </div>
    </div>
  );
};

export default ChatRoom;
