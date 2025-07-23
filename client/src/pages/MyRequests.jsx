import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyRequests.css';
import { useNavigate } from 'react-router-dom';
import { FaComments } from 'react-icons/fa';

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

    if (userId) {
      fetchRequests();
      const interval = setInterval(fetchRequests, 5000);
      return () => clearInterval(interval);
    }
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
        <p style={{ textAlign: 'center', color: '#64748b', marginTop: '40px', fontSize: '18px' }}>
          אין בקשות להצגה כרגע.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>שירות</th>
              <th>מחיר</th>
              <th>סטטוס</th>
              <th>תאריך</th>
              <th>צ׳אט</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id}>
                <td data-label="שירות">{req.serviceType}</td>
                <td data-label="מחיר">₪{req.price}</td>
                <td data-label="סטטוס">{translateStatus(req.status)}</td>
                <td data-label="תאריך">
                  {new Date(req.createdAt).toLocaleString('he-IL')}
                </td>
                <td data-label="צ׳אט">
                  {req.status === 'assigned' && req.assignedProvider && (
                    <button
                      onClick={() =>
                        navigate(`/chat/${req._id}`, {
                          state: {
                            requestId: req._id,
                            myUserId: userId,
                            myUserName: localStorage.getItem('userName'),
                            receiverId: req.assignedProvider,
                            receiverName: 'נותן שירות',
                          },
                        })
                      }
                      aria-label="מעבר לצ׳אט עם נותן השירות"
                    >
                      <FaComments style={{ marginLeft: '6px' }} />
                      צ׳אט
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
  
      <div className="back-button-container">
        <button
          className="back-button"
          onClick={() => navigate('/dashboard')}
          aria-label="חזרה לדשבורד"
        >
          חזרה לדשבורד
        </button>
      </div>
    </div>
  );
  
};

export default MyRequests;
