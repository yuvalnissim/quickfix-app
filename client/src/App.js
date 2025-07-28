// ✅ App.jsx (מעודכן למניעת טואסט כפול)
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
import ProviderProfile from './pages/ProviderProfile';

const socket = io('http://localhost:3001'); // שנה לכתובת פרודקשן אם צריך

const App = () => {
  const location = useLocation();
  const initializedRef = useRef(false);
  const shownMessagesRef = useRef(new Set()); // ✅ למניעת כפילויות

  const [userId, setUserId] = useState(null);
  const [isProvider, setIsProvider] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      const storedUserId = localStorage.getItem('userId');
      const storedIsProvider = localStorage.getItem('isProvider') === 'true';

      setUserId(storedUserId);
      setIsProvider(storedIsProvider);

      if (!storedUserId || initializedRef.current) return;

      console.log('📨 emitting joinRoom with userId:', storedUserId);
      socket.emit('joinRoom', storedUserId);

      if (storedIsProvider) {
        const assigned = JSON.parse(localStorage.getItem('assignedRequests') || '[]');
        assigned.forEach((reqId) => {
          socket.emit('joinRoom', reqId);
        });
      } else {
        axios.get(`/api/requests/user/${storedUserId}`)
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

      initializedRef.current = true;
    });

    // ✅ האזנה להודעות – כולל חסימת כפילויות
    socket.on('receiveMessage', (msg) => {
      const currentPath = window.location.pathname;
      const isChatOpen = currentPath.includes(`/chat/${msg.requestId}`);
      const myUserId = localStorage.getItem('userId');
      const isMine = String(msg.receiverId) === String(myUserId);

      // יצירת מזהה ייחודי להודעה כדי לחסום כפילויות
      const messageKey = `${msg.senderId}_${msg.timestamp}_${msg.text}`;
      if (shownMessagesRef.current.has(messageKey)) return; // ❌ כבר הוצג
      shownMessagesRef.current.add(messageKey); // ✅ מסומן כטופל

      console.log('📩 Message received:', msg);
      console.log('📌 currentPath:', currentPath);
      console.log('📌 msg.requestId:', msg.requestId);
      console.log('📌 isChatOpen:', isChatOpen);
      console.log('📌 myUserId:', myUserId);
      console.log('📌 msg.receiverId:', msg.receiverId);
      console.log('📌 isMine:', isMine);

      if (!isChatOpen && isMine) {
        toast.info(`💬 הודעה חדשה מ־${msg.senderName || 'משתמש'}: ${msg.text}`, {
          position: 'bottom-left',
        });
      }
    });

    return () => {
      socket.off('connect');
      socket.off('receiveMessage');
    };
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat/:requestId" element={<ChatRoom />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/provider-profile" element={<ProviderProfile />} />
      </Routes>
      <ToastContainer />
    </>
  );
};

export default App;
