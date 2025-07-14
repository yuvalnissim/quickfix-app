import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    const storedRole = localStorage.getItem('role');
    if (!storedId) {
      navigate('/');
    } else {
      setUserId(storedId);
      setRole(storedRole);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <h1>🎉 ברוך הבא ל-QuickFix!</h1>
      <p>מזהה משתמש: {userId}</p>
      <p>תפקיד: {role === 'provider' ? 'נותן שירות' : 'לקוח'}</p>
      <button onClick={handleLogout}>🚪 התנתק</button>
    </div>
  );
};

export default Dashboard;
