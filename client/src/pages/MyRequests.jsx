import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyRequests.css';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      try {
        const res = await axios.get(`/api/requests/user/${userId}`);
        setRequests(res.data);
      } catch (err) {
        console.error('שגיאה בקבלת הבקשות:', err);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="my-requests-container">
      <h2>הבקשות שלי</h2>
      {requests.length === 0 ? (
        <p>לא נמצאו בקשות.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>שירות</th>
              <th>מחיר</th>
              <th>סטטוס</th>
              <th>נוצר בתאריך</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>{r.serviceType}</td>
                <td>₪{r.price}</td>
                <td>{r.status}</td>
                <td>{new Date(r.createdAt).toLocaleString('he-IL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyRequests;
