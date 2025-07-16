import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import MyRequests from './pages/MyRequests'; // ✅ חדש
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatRoom from './pages/ChatRoom';

function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginRegister setUser={setUser} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-requests" element={<MyRequests />} /> {/* ✅ נוספה */}
        <Route path="/chat/:requestId" element={<ChatRoom />} />
      </Routes>
      <ToastContainer position="top-center" />
    </>
  );
}

export default App;
