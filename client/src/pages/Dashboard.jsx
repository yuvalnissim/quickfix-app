// client/src/pages/Dashboard.jsx
import React, { useEffect } from 'react';
import ClientDashboard from './ClientDashboard';
import ProviderDashboard from './ProviderDashboard';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

const socket = io('http://localhost:3001'); // בפרודקשן תחליף לכתובת שלך

const Dashboard = () => {
  const role = localStorage.getItem('role');
  const myUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (!myUserId) return;

    socket.emit('joinRoom', myUserId); // הצטרפות לחדר אישי לפי userId

    socket.on('receiveMessage', (message) => {
      const currentPath = window.location.pathname;
      const isInChatRoom = currentPath.includes(`/chat/${message.requestId}`);

      if (!isInChatRoom && String(message.senderId) !== String(myUserId)) {
        toast.info(`הודעה חדשה מ־${message.senderName}: ${message.text}`, {
          position: 'bottom-right',
          autoClose: 5000,
        });
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [myUserId]);

  return (
    <>
      {role === 'provider' ? <ProviderDashboard /> : <ClientDashboard />}
    </>
  );
};

export default Dashboard;
