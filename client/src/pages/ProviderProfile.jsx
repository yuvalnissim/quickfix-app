import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProviderProfile.css';
import { FaStar, FaWrench, FaMoneyBillWave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const ProviderProfile = () => {
  const navigate = useNavigate();
  const providerId = localStorage.getItem('userId');
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [dateRange, setDateRange] = useState('weekly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/requests/provider/${providerId}`);
        setRequests(res.data);
      } catch (err) {
        console.error('שגיאה בקבלת נתוני ספק:', err);
      }
    };

    if (providerId) fetchData();
  }, [providerId]);

  useEffect(() => {
    const now = new Date();
    let start = new Date(0);
    let end = now;

    if (dateRange === 'weekly') {
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else if (dateRange === 'monthly') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else if (dateRange === 'custom' && customStart && customEnd) {
      start = new Date(customStart);
      start.setHours(0, 0, 0, 0);
      end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
    }

    const filteredRequests = requests.filter((r) => {
      const updated = new Date(r.updatedAt);
      return updated >= start && updated <= end && r.status === 'completed';
    });

    setFiltered(filteredRequests);

    const incomeByDay = {};
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toLocaleDateString('he-IL');
      incomeByDay[key] = 0;
    }

    filteredRequests.forEach((r) => {
      const d = new Date(r.updatedAt).toLocaleDateString('he-IL');
      incomeByDay[d] += r.price || 0;
    });

    const chartArr = Object.keys(incomeByDay).map((date) => ({
      date,
      income: incomeByDay[date],
    }));

    setChartData(chartArr);
  }, [requests, dateRange, customStart, customEnd]);

  const averageRating = () => {
    const rated = filtered.filter((r) => r.rating);
    if (rated.length === 0) return 0;
    return (rated.reduce((sum, r) => sum + r.rating, 0) / rated.length).toFixed(2);
  };

  const renderStars = (value) => {
    const fullStars = Math.floor(value);
    const hasHalf = value - fullStars >= 0.5;
    return (
      <div className="rating-stars">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={i} color="#facc15" />
        ))}
        {hasHalf && (
          <FaStar
            color="#facc15"
            style={{ clipPath: 'inset(0 50% 0 0)', direction: 'ltr' }}
          />
        )}
        {[...Array(5 - fullStars - (hasHalf ? 1 : 0))].map((_, i) => (
          <FaStar key={i + fullStars + 1} color="#e5e7eb" />
        ))}
      </div>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getSummaryLine = () => {
    const now = new Date();
    let start = new Date(0);
    let end = now;

    if (dateRange === 'weekly') {
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else if (dateRange === 'monthly') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else if (dateRange === 'custom' && customStart && customEnd) {
      start = new Date(customStart);
      end = new Date(customEnd);
    }

    return `מציג נתונים בין ${formatDate(start)} ל־${formatDate(end)} (${filtered.length} עבודות)`;
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>פרופיל ספק</h2>
      </div>

      <div className="filter-buttons">
        <button className={dateRange === 'weekly' ? 'active' : ''} onClick={() => setDateRange('weekly')}>
          שבועי (מיום ראשון)
        </button>
        <button className={dateRange === 'monthly' ? 'active' : ''} onClick={() => setDateRange('monthly')}>
          חודשי (מה-1 לחודש)
        </button>
        <button className={dateRange === 'custom' ? 'active' : ''} onClick={() => setDateRange('custom')}>
          טווח מותאם אישית
        </button>
      </div>

      {dateRange === 'custom' && (
        <div className="custom-date-range">
          <div className="date-input">
            <label>מתאריך:</label>
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
          </div>
          <div className="date-input">
            <label>עד תאריך:</label>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </div>
        </div>
      )}

      <div className="summary-line">
        <p>{getSummaryLine()}</p>
      </div>

      <div className="profile-stats">
        <div className="stat-box">
          <h3><FaStar className="stat-icon" /> דירוג ממוצע</h3>
          <p>{averageRating()}</p>
          {renderStars(parseFloat(averageRating()))}
        </div>
        <div className="stat-box">
          <h3><FaWrench className="stat-icon" /> עבודות שבוצעו</h3>
          <p>{filtered.length}</p>
        </div>
        <div className="stat-box">
          <h3><FaMoneyBillWave className="stat-icon" /> סה"כ הכנסות</h3>
          <p>₪{filtered.reduce((sum, r) => sum + (r.price || 0), 0)}</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="chart-container">
          <h3>התפלגות הכנסות לפי יום</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value) => [`₪${value}`, 'הכנסה']} />
              <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="recent-requests">
          <h3>העבודות האחרונות בטווח הנבחר</h3>
          <table>
            <thead>
              <tr>
                <th>שירות</th>
                <th>מחיר</th>
                <th>תאריך</th>
                <th>דירוג</th>
              </tr>
            </thead>
            <tbody>
              {[...filtered].slice(-5).reverse().map((r) => (
                <tr key={r._id}>
                  <td>{r.serviceType}</td>
                  <td>₪{r.price || 0}</td>
                  <td>{new Date(r.updatedAt).toLocaleDateString('he-IL')}</td>
                  <td>
                    {r.rating ? (
                      [...Array(r.rating)].map((_, i) => (
                        <FaStar key={i} size={14} color="#facc15" />
                      ))
                    ) : (
                      <span style={{ color: '#94a3b8' }}>אין</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← חזרה לדשבורד
        </button>
      </div>
    </div>
  );
};

export default ProviderProfile;
