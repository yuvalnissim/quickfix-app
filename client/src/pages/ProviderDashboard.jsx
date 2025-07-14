import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProviderDashboard.css';
import { toast } from 'react-toastify';

const ProviderDashboard = () => {
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const providerId = localStorage.getItem('userId');

  // ✅ טוען את הבקשות שהוקצו לו
  const fetchAssigned = async () => {
    try {
      const res = await axios.get(`/api/requests/provider/${providerId}`);
      setAssignedRequests(res.data);
    } catch (err) {
      console.error('❌ שגיאה בשליפת בקשות שהוקצו:', err);
      toast.error('שגיאה בשליפת בקשות שהוקצו');
    }
  };

  // ✅ טוען את הבקשות שעדיין לא הוקצו ומותאמות לנותן השירות
  const fetchAvailable = async () => {
    try {
      const res = await axios.get(`/api/requests/available/${providerId}`);
      setAvailableRequests(res.data);
    } catch (err) {
      console.error('❌ שגיאה בשליפת בקשות זמינות:', err);
    }
  };

  // 🔁 Polling כל 5 שניות
  useEffect(() => {
    if (!providerId) return;
    fetchAssigned();
    fetchAvailable();
    const interval = setInterval(() => {
      fetchAvailable();
    }, 5000);
    return () => clearInterval(interval);
  }, [providerId]);

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
      setAssignedRequests(prev =>
        prev.map(req =>
          req._id === id ? { ...req, status: 'completed' } : req
        )
      );
      toast.success('הבקשה סומנה כהושלמה ✅');
    } catch (err) {
      console.error('❌ שגיאה בעדכון סטטוס:', err);
      toast.error('שגיאה בעדכון סטטוס');
    }
  };

  return (
    <div className="provider-dashboard">
      <h2>בקשות זמינות לשיוך</h2>
      {availableRequests.length === 0 ? (
        <p>אין כרגע בקשות פתוחות שמתאימות לך.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>שירות</th>
              <th>מחיר</th>
              <th>נוצר בתאריך</th>
              <th>פעולה</th>
            </tr>
          </thead>
          <tbody>
            {availableRequests.map((req) => (
              <tr key={req._id}>
                <td>{req.serviceType}</td>
                <td>₪{req.price}</td>
                <td>{new Date(req.createdAt).toLocaleString('he-IL')}</td>
                <td>
                  <button onClick={() => handleAccept(req._id)}>קבל בקשה</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: '40px' }}>בקשות שהוקצו לך</h2>
      {assignedRequests.length === 0 ? (
        <p>אין בקשות משוייכות אליך כרגע.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>שירות</th>
              <th>מחיר</th>
              <th>סטטוס</th>
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
                <td>{new Date(req.createdAt).toLocaleString('he-IL')}</td>
                <td>
                  {req.status !== 'completed' && (
                    <button onClick={() => handleComplete(req._id)}>
                      סמן כהושלמה
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
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

export default ProviderDashboard;
