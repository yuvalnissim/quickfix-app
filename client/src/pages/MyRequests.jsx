import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyRequests.css';
import { useNavigate } from 'react-router-dom';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`/api/requests/user/${userId}`);
        setRequests(res.data);
      } catch (err) {
        console.error('❌ שגיאה בשליפת הבקשות:', err);
      }
    };

    if (userId) fetchRequests();
  }, [userId]);

  const translateStatus = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status pending">ממתין</span>;
      case 'assigned':
        return <span className="status assigned">שובץ</span>;
      case 'completed':
        return <span className="status completed">הושלם</span>;
      default:
        return status;
    }
  };

  return (
    <div className="requests-container">
      <h2>הבקשות שלי</h2>

      {requests.length === 0 ? (
        <p>אין בקשות להצגה כרגע.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>שירות</th>
              <th>מחיר</th>
              <th>סטטוס</th>
              <th>תאריך</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id}>
                <td>{req.serviceType}</td>
                <td>₪{req.price}</td>
                <td>{translateStatus(req.status)}</td>
                <td>{new Date(req.createdAt).toLocaleString('he-IL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          חזרה לדשבורד
        </button>
      </div>
    </div>
  );
};

export default MyRequests;
