import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import './ChatRoom.css';
import { toast } from 'react-toastify';

const socket = io('http://localhost:3001'); // החלף לכתובת בפרודקשן

const ChatRoom = () => {
  const { requestId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    receiverId,
    receiverName,
    myUserId: stateMyUserId,
    myUserName: stateMyUserName
  } = location.state || {};

  const myUserId = stateMyUserId || localStorage.getItem('userId');
  const myUserName = stateMyUserName || localStorage.getItem('userName');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  const formatDate = (isoString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(isoString).toLocaleDateString('he-IL', options);
  };

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
    if (!myUserId || !receiverId || !receiverName || !requestId) {
      toast.error('חסרים נתונים לצ׳אט');
      navigate('/dashboard');
      return;
    }

    socket.emit('joinRoom', requestId);
    loadMessages();

    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => {
        const alreadyExists = prev.some(
          (m) =>
            m.text === msg.text &&
            m.senderId === msg.senderId &&
            m.timestamp === msg.timestamp
        );
        if (!alreadyExists) {
          return [...prev, msg];
        }
        return prev;
      });
    });

    socket.on('userTyping', ({ senderId }) => {
      if (String(senderId) !== String(myUserId)) {
        setOtherTyping(true);
      }
    });

    socket.on('userStopTyping', ({ senderId }) => {
      if (String(senderId) !== String(myUserId)) {
        setOtherTyping(false);
      }
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('userTyping');
      socket.off('userStopTyping');
    };
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit('typing', { roomId: requestId, senderId: myUserId });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stopTyping', { roomId: requestId, senderId: myUserId });
    }, 2000);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const msgData = {
      requestId,
      senderId: myUserId,
      senderName: myUserName,
      receiverId: receiverId,
      text: input,
      timestamp: new Date().toISOString(),
    };

    console.log('📤 Sending message:');
    console.log('📥 senderId:', myUserId);
    console.log('📥 senderName:', myUserName);
    console.log('📥 receiverId:', receiverId);
    console.log('📥 requestId:', requestId);
    console.log('📥 text:', input);

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
    socket.emit('stopTyping', { roomId: requestId, senderId: myUserId });
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate(-1)} aria-label="חזרה אחורה">
          ←
        </button>
        <span>צ׳אט עם {receiverName}</span>
      </div>
  
      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="no-messages">אין הודעות עדיין</p>
        ) : (
          messages.reduce((acc, msg, idx) => {
            const isOwn = String(msg.senderId) === String(myUserId);
            const messageDate = formatDate(msg.timestamp);
            const prevMsg = messages[idx - 1];
            const prevDate = prevMsg ? formatDate(prevMsg.timestamp) : null;
            const showDateHeader = messageDate !== prevDate;
  
            acc.push(
              <React.Fragment key={idx}>
                {showDateHeader && (
                  <div className="date-header">{messageDate}</div>
                )}
                <div className={`message ${isOwn ? 'own' : 'other'}`}>
                  {msg.text}
                  <div className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </React.Fragment>
            );
            return acc;
          }, [])
        )}
        {otherTyping && <div className="typing-indicator">הצד השני מקליד...</div>}
        <div ref={messagesEndRef} />
      </div>
  
      <div className="chat-input">
        <input
          type="text"
          placeholder="כתוב הודעה..."
          value={input}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          aria-label="הקלד הודעה"
        />
        <button onClick={sendMessage} aria-label="שלח הודעה">
          📤
        </button>
      </div>
    </div>
  );
  
};

export default ChatRoom;
