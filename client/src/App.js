// ✅ App.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import ChatRoom from './pages/ChatRoom';
import LoginRegister from './pages/LoginRegister';
import MyRequests from './pages/MyRequests';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3001');

const App = () => {
  const location = useLocation();
  const initializedRef = useRef(false);
  const [userId, setUserId] = useState(null);
  const [isProvider, setIsProvider] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedIsProvider = localStorage.getItem('isProvider') === 'true';
    setUserId(storedUserId);
    setIsProvider(storedIsProvider);
  }, []);

  useEffect(() => {
    if (!userId || initializedRef.current) return;

    socket.emit('joinRoom', userId); // הצטרפות לחדר אישי

    if (isProvider) {
      const assigned = JSON.parse(localStorage.getItem('assignedRequests') || '[]');
      assigned.forEach((reqId) => {
        socket.emit('joinRoom', reqId);
      });
    } else {
      axios.get(`/api/requests/user/${userId}`)
        .then((res) => {
          const assignedRequests = res.data.filter((r) => r.status === 'assigned');
          assignedRequests.forEach((req) => {
            socket.emit('joinRoom', req._id);
          });
        })
        .catch((err) => {
          console.error('❌ שגיאה בטעינת בקשות הלקוח:', err);
        });
    }

    socket.on('receiveMessage', (msg) => {
      const currentPath = window.location.pathname;
      const isChatOpen = currentPath.includes(`/chat/${msg.requestId}`);
      const isMine = String(msg.receiverId) === String(userId);

      if (!isChatOpen && isMine) {
        toast.info(`💬 הודעה חדשה מ־${msg.senderName}: ${msg.text}`, {
          position: 'bottom-left',
        });
      }
    });

    initializedRef.current = true;

    return () => {
      socket.off('receiveMessage');
    };
  }, [userId, isProvider]);

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat/:requestId" element={<ChatRoom />} />
        <Route path="/my-requests" element={<MyRequests />} />
      </Routes>
      <ToastContainer />
    </>
  );
};

export default App;
