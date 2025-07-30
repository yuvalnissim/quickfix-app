import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ClientProfile.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaBriefcase } from 'react-icons/fa';

const ClientProfile = () => {
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    label: 'בית',
    street: '',
    city: '',
    zip: '',
    floor: '',
    apt: ''
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAddresses();
    fetchRecentRequests();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`/api/auth/addresses/${userId}`);
      setAddresses(res.data);
    } catch (err) {
      toast.error('שגיאה בטעינת כתובות');
    }
  };

  const fetchRecentRequests = async () => {
    try {
      const res = await axios.get(`/api/requests/user/${userId}`);
      const sorted = res.data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentRequests(sorted);
    } catch (err) {
      toast.error('שגיאה בטעינת ההזמנות האחרונות');
    }
  };

  const handleAddOrUpdate = async () => {
    const { label, street, city, zip } = newAddress;
    if (!label || !street || !city || !zip) {
      return toast.error('נא למלא את כל שדות הכתובת');
    }

    try {
      if (editingIndex !== null) {
        await axios.put(`/api/auth/addresses/${userId}/${editingIndex}`, newAddress);
        toast.success('כתובת עודכנה');
      } else {
        await axios.post(`/api/auth/addresses/${userId}`, newAddress);
        toast.success('כתובת נוספה');
      }
      setNewAddress({ label: 'בית', street: '', city: '', zip: '', floor: '', apt: '' });
      setEditingIndex(null);
      fetchAddresses();
    } catch (err) {
      toast.error('שגיאה בשמירת הכתובת');
    }
  };

  const handleEdit = (index) => {
    setNewAddress(addresses[index]);
    setEditingIndex(index);
  };

  const handleDelete = async (index) => {
    try {
      await axios.delete(`/api/auth/addresses/${userId}/${index}`);
      toast.success('כתובת נמחקה');
      fetchAddresses();
    } catch (err) {
      toast.error('שגיאה במחיקת כתובת');
    }
  };

  return (
    <div className="client-profile-container">
      <h2>פרופיל לקוח</h2>

      <div className="address-form">
        <div className="label-buttons">
          <button
            className={newAddress.label === 'בית' ? 'selected' : ''}
            onClick={() => setNewAddress({ ...newAddress, label: 'בית' })}
          >
            <FaHome /> בית
          </button>
          <button
            className={newAddress.label === 'עבודה' ? 'selected' : ''}
            onClick={() => setNewAddress({ ...newAddress, label: 'עבודה', floor: '', apt: '' })}
          >
            <FaBriefcase /> עבודה
          </button>
        </div>

        <input
          placeholder="רחוב ומספר"
          value={newAddress.street}
          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
        />
        <input
          placeholder="עיר"
          value={newAddress.city}
          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
        />
        <input
          placeholder="מיקוד"
          value={newAddress.zip}
          onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
        />

        {newAddress.label === 'בית' && (
          <>
            <input
              placeholder="קומה"
              value={newAddress.floor}
              onChange={(e) => setNewAddress({ ...newAddress, floor: e.target.value })}
            />
            <input
              placeholder="דירה"
              value={newAddress.apt}
              onChange={(e) => setNewAddress({ ...newAddress, apt: e.target.value })}
            />
          </>
        )}

        <button onClick={handleAddOrUpdate}>
          {editingIndex !== null ? 'עדכן כתובת' : 'הוסף כתובת'}
        </button>
      </div>

      <div className="address-list">
        <h3>הכתובות שלך</h3>
        {addresses.map((addr, idx) => (
          <div key={idx} className="address-item">
            <p>
              <strong>{addr.label}:</strong> {addr.street}, {addr.city}, {addr.zip}
              {(addr.floor || addr.apt) && (
                <> ({addr.floor && `קומה ${addr.floor}`} {addr.apt && `דירה ${addr.apt}`})</>
              )}
            </p>
            <button onClick={() => handleEdit(idx)}>ערוך</button>
            <button onClick={() => handleDelete(idx)}>מחק</button>
          </div>
        ))}
      </div>

      <div className="recent-requests">
        <h3>ההזמנות האחרונות שלך</h3>
        {recentRequests.length === 0 ? (
          <p>לא נמצאו הזמנות אחרונות</p>
        ) : (
          <ul className="recent-request-list">
            {recentRequests.map((req) => (
              <li key={req._id} className={`request-card ${req.status}`}>
                <div className="request-header">
                  <strong>{req.serviceType}</strong>
                  <span className="status">
                    {req.status === 'completed'
                      ? '✔️ הושלם'
                      : req.status === 'assigned'
                      ? '📦 בשיבוץ'
                      : '⌛ ממתין'}
                  </span>
                </div>
                <div className="request-body">
                  <p>{req.description}</p>
                  <small>{new Date(req.createdAt).toLocaleString('he-IL')}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="back-button" onClick={() => navigate('/dashboard')}>
        ⬅️ חזרה לדשבורד
      </button>
    </div>
  );
};

export default ClientProfile;
