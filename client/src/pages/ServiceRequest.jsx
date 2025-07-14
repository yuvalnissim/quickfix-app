import React, { useState } from 'react';
import './ServiceRequest.css';
import { toast } from 'react-toastify';
import axios from 'axios';

const serviceCatalog = {
  חשמל: {
    'התקנת שקע': 250,
    'תיקון תקע שרוף': 200,
    'הרחבת נקודת חשמל': 300,
  },
  אינסטלציה: {
    'פתיחת סתימה': 220,
    'החלפת ברז': 180,
    'החלפת צנרת פשוטה': 240,
  },
  גבאי: {
    'יציאה + טיפול כללי': 300,
    'התקנת מדף/מודול': 250,
    'תליית טלוויזיה': 280,
  },
  מחשבים: {
    'פירמוט + התקנה': 220,
    'התקנת תוכנה/דרייברים': 180,
    'חיבור מדפסת ותיקון רשת': 200,
  },
};

const ServiceRequest = () => {
  const [cat, setCat] = useState('');
  const [subCat, setSubCat] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  const price = serviceCatalog[cat][subCat];
  const userId = localStorage.getItem('userId'); // ✅ ניקח את userId מהלוקאל סטורג'

  try {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        serviceType: subCat,
        description: message,
        price,
        status: 'pending',
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'שגיאה בשליחת ההזמנה');

    toast.success(`✅ ההזמנה לשירות "${subCat}" נשלחה בהצלחה!`);

    // איפוס טופס
    setCat('');
    setSubCat('');
    setMessage('');
  } catch (err) {
    console.error('❌ Error sending request:', err);
    toast.error(err.message || 'שגיאה בשליחת הבקשה');
  }
};

  return (
    <div className="service-container">
      <h2>הזמנת שירות</h2>
      <form onSubmit={handleSubmit}>
        <label>קטגוריה:</label>
        <select value={cat} onChange={(e) => { setCat(e.target.value); setSubCat(''); }}>
          <option value="">בחר קטגוריה</option>
          {Object.keys(serviceCatalog).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {cat && (
          <>
            <label>שירות:</label>
            <select value={subCat} onChange={(e) => setSubCat(e.target.value)}>
              <option value="">בחר שירות</option>
              {Object.entries(serviceCatalog[cat]).map(([name, price]) => (
                <option key={name} value={name}>
                  {name} — ₪{price}
                </option>
              ))}
            </select>
          </>
        )}

        {subCat && (
          <>
            <p className="price">מחיר השירות: ₪{serviceCatalog[cat][subCat]}</p>
            <label>הערה למבצע:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="כתובת מדויקת, זמן מועדף, שאלה נוספת…"
            />
          </>
        )}

        <button type="submit" disabled={!subCat}>
          הזמן עכשיו
        </button>
      </form>
    </div>
  );
};

export default ServiceRequest;
