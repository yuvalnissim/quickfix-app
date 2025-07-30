import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyRequests.css';
import { useNavigate } from 'react-router-dom';
import { FaComments, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';


const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [ratingRequest, setRatingRequest] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`/api/requests/user/${userId}`);
      setRequests(res.data);

      const unrated = res.data.find(
        (r) => r.status === 'completed' && (r.rating === null || r.rating === undefined)
      );
      if (unrated) {
        setRatingRequest(unrated);
      } else {
        setRatingRequest(null);
      }
    } catch (err) {
      console.error('❌ שגיאה בשליפת הבקשות:', err);
    }
  };

  useEffect(() => {
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

  const handleRatingSubmit = async () => {
    if (!selectedRating || !ratingRequest) return;
  
    try {
      console.log('📤 שליחת דירוג:', selectedRating);
  
      await axios.put(`/api/requests/${ratingRequest._id}/rating`, {
        rating: selectedRating
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      toast.success('הדירוג נשלח בהצלחה');
      setSelectedRating(0);
      setHoveredStar(0);
      setRatingRequest(null);
      fetchRequests();
    } catch (err) {
      console.error('❌ שגיאה בשליחת דירוג:', err?.response?.data || err);
      toast.error('שגיאה בשליחת הדירוג');
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
        <div className="top-buttons">
          <button
            className="profile-button"
            onClick={() => navigate('/client-profile')}
            aria-label="מעבר לפרופיל"
          >
            👤 הפרופיל שלי
          </button>
        </div>
      </div>

      {/* דירוג */}
      {ratingRequest && (
        <div className="rating-modal">
          <div className="rating-box">
            <h3>דרג את נותן השירות</h3>
            <p>שירות: {ratingRequest.serviceType}</p>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((num) => (
                <FaStar
                  key={num}
                  size={28}
                  onClick={() => setSelectedRating(num)}
                  onMouseEnter={() => setHoveredStar(num)}
                  onMouseLeave={() => setHoveredStar(0)}
                  color={
                    num <= (hoveredStar || selectedRating)
                      ? '#facc15'
                      : '#e5e7eb'
                  }
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
            <button
              className="submit-rating-button"
              onClick={handleRatingSubmit}
              disabled={!selectedRating}
            >
              שלח דירוג
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
