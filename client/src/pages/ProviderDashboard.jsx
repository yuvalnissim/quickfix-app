import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProviderDashboard.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ProviderDashboard = () => {
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const providerId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchAssigned = async () => {
    try {
      const res = await axios.get(`/api/requests/provider/${providerId}`);
      setAssignedRequests(res.data);
      const requestIds = res.data.map((r) => r._id);
      localStorage.setItem('assignedRequests', JSON.stringify(requestIds));
    } catch (err) {
      console.error('❌ שגיאה בשליפת בקשות שהוקצו:', err);
      toast.error('שגיאה בשליפת בקשות שהוקצו');
    }
  };

  const fetchAvailable = async () => {
    try {
      const res = await axios.get(`/api/requests/available/${providerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableRequests(res.data);
    } catch (err) {
      console.error('❌ שגיאה בשליפת בקשות זמינות:', err);
      toast.error(err.response?.data?.error || 'שגיאה בשליפת בקשות זמינות');
    }
  };

  const fetchOnlineStatus = async () => {
    try {
      const res = await axios.get(`/api/auth/users/${providerId}`);
      setIsOnline(res.data.isOnline);
    } catch (err) {
      console.error('❌ שגיאה בשליפת סטטוס אונליין:', err);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      await axios.post(
        '/api/provider/set-online',
        { isOnline: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsOnline(newStatus);
      toast.success(`הסטטוס עודכן: ${newStatus ? '🟢 Online' : '⚫ Offline'}`);
      if (newStatus) fetchAvailable(); // שלוף זמינות רק אם עבר לאונליין
      else setAvailableRequests([]);   // נקה רשימת בקשות אם ירד לאופליין
    } catch (err) {
      console.error('❌ שגיאה בעדכון אונליין:', err);
      toast.error('שגיאה בעדכון סטטוס');
    }
  };

  useEffect(() => {
    if (!providerId) return;

    fetchAssigned();
    fetchOnlineStatus();
  }, [providerId]);

  useEffect(() => {
    if (!isOnline || !providerId) return;

    fetchAvailable();
    const interval = setInterval(fetchAvailable, 5000);
    return () => clearInterval(interval);
  }, [isOnline, providerId]);

  const handleAccept = async (id) => {
    try {
      await axios.put(`/api/requests/${id}/assign`, {
        providerId: providerId,
      });
      toast.success('הבקשה שוייכה אליך ✅');
      fetchAssigned();
      fetchAvailable();
    } catch (err) {
      console.error('❌ שגיאה בשיוך בקשה:', err);
      toast.error('שגיאה בשיוך בקשה');
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`/api/requests/${id}/status`, { status: 'completed' });
      setAssignedRequests((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, status: 'completed' } : req
        )
      );
      toast.success('הבקשה סומנה כהושלמה ✅');
    } catch (err) {
      console.error('❌ שגיאה בעדכון סטטוס:', err);
      toast.error('שגיאה בעדכון סטטוס');
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'ממתין';
      case 'assigned':
        return 'שובץ';
      case 'completed':
        return 'הושלם';
      default:
        return status;
    }
  };

  const renderAddress = (addr) => {
    if (!addr || typeof addr !== 'object') return addr || 'לא צוינה כתובת';

    const { label, street, city, zip, floor, apt } = addr;
    let extra = [];
    if (floor) extra.push(`קומה ${floor}`);
    if (apt) extra.push(`דירה ${apt}`);
    return `${label}: ${street}, ${city}, ${zip}${extra.length ? ` (${extra.join(', ')})` : ''}`;
  };

  return (
    <div className="provider-dashboard">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={toggleOnlineStatus}
          style={{
            backgroundColor: isOnline ? '#16a34a' : '#6b7280',
            color: '#fff',
            padding: '10px 16px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          {isOnline ? '🟢 אתה מחובר – לחץ להתנתק' : '⚫ אתה מנותק – לחץ להתחבר'}
        </button>
      </div>

      <h2>בקשות זמינות לשיוך</h2>

      {availableRequests.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b', marginTop: '24px', fontSize: '16px' }}>
          אין כרגע בקשות פתוחות שמתאימות לך.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>שירות</th>
              <th>מחיר</th>
              <th>כתובת</th>
              <th>נוצר בתאריך</th>
              <th>פעולה</th>
            </tr>
          </thead>
          <tbody>
            {availableRequests.map((req) => (
              <tr key={req._id}>
                <td>{req.serviceType}</td>
                <td>₪{req.price}</td>
                <td>{renderAddress(req.address)}</td>
                <td>{new Date(req.createdAt).toLocaleString('he-IL')}</td>
                <td>
                  <button
                    onClick={() => handleAccept(req._id)}
                    aria-label="שיוך בקשה זו אליי"
                  >
                    קבל בקשה
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: '40px' }}>בקשות שהוקצו לך</h2>

      {assignedRequests.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b', marginTop: '24px', fontSize: '16px' }}>
          אין בקשות משוייכות אליך כרגע.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>שירות</th>
              <th>מחיר</th>
              <th>סטטוס</th>
              <th>כתובת</th>
              <th>נוצר בתאריך</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {assignedRequests.map((req) => (
              <tr key={req._id}>
                <td>{req.serviceType}</td>
                <td>₪{req.price}</td>
                <td>{translateStatus(req.status)}</td>
                <td>{renderAddress(req.address)}</td>
                <td>{new Date(req.createdAt).toLocaleString('he-IL')}</td>
                <td>
                  {req.status === 'assigned' && (
                    <button
                      onClick={() =>
                        navigate(`/chat/${req._id}`, {
                          state: {
                            requestId: req._id,
                            myUserId: providerId,
                            myUserName: userName,
                            receiverId: req.userId?._id || req.userId,
                            receiverName: req.userId?.name || 'לקוח',
                          },
                        })
                      }
                      aria-label="מעבר לצ׳אט עם הלקוח"
                    >
                      🗨️ צ׳אט
                    </button>
                  )}
                  {req.status !== 'completed' && (
                    <button
                      onClick={() => handleComplete(req._id)}
                      aria-label="סמן בקשה זו כהושלמה"
                    >
                      ✔️ הושלם
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
          onClick={() => navigate('/provider-profile')}
        >
          👤 צפה בפרופיל שלי
        </button>
      </div>
    </div>
  );
};

export default ProviderDashboard;
