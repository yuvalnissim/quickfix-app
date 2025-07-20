import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { register, login } from '../services/authService';
import './LoginRegister.css';

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

const LoginRegister = ({ setUser }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    isProvider: false,
    servicesProvided: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleService = (serviceName) => {
    setFormData(prev => {
      const selected = new Set(prev.servicesProvided);
      if (selected.has(serviceName)) selected.delete(serviceName);
      else selected.add(serviceName);
      return { ...prev, servicesProvided: Array.from(selected) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering) {
      if (!formData.name || !formData.phone || !formData.email || !formData.password) {
        toast.error("יש למלא את כל שדות ההרשמה");
        return;
      }
      if (formData.isProvider && formData.servicesProvided.length === 0) {
        toast.error("אנא בחר לפחות שירות אחד שאתה מספק");
        return;
      }
    } else {
      if (!formData.email || !formData.password) {
        toast.error("אימייל וסיסמה הם חובה להתחברות");
        return;
      }
    }

    try {
      const data = isRegistering
        ? await register(formData)
        : await login(formData);

      toast.success(data.message || 'הפעולה הצליחה 🎉');
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('isProvider', data.isProvider);
      //setUser(data);

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (err) {
      console.error('❌ Auth error:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'שגיאה בלתי צפויה 😬');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegistering ? 'הרשמה' : 'התחברות'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <>
            <input
              type="text"
              name="name"
              placeholder="שם מלא"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type="text"
              name="phone"
              placeholder="טלפון"
              value={formData.phone}
              onChange={handleChange}
            />
          </>
        )}
        <input
          type="email"
          name="email"
          placeholder="אימייל"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="סיסמה"
          value={formData.password}
          onChange={handleChange}
        />
        {isRegistering && (
          <>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isProvider"
                checked={formData.isProvider}
                onChange={handleChange}
              />
              אני נותן שירות
            </label>

            {formData.isProvider && (
              <div className="services-selection">
                <h4>בחר את השירותים שאתה מספק:</h4>
                {Object.entries(serviceCatalog).map(([cat, services]) => (
                  <div key={cat} className="category-block">
                    <strong>{cat}</strong>
                    {Object.keys(services).map(service => (
                      <label key={service} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.servicesProvided.includes(service)}
                          onChange={() => toggleService(service)}
                        />
                        {service}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <button type="submit">{isRegistering ? 'הרשמה' : 'התחברות'}</button>
      </form>
      <p>
        {isRegistering ? 'כבר יש לך חשבון?' : 'אין לך חשבון?'}{' '}
        <button className="switch-button" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'התחבר' : 'הרשם'}
        </button>
      </p>
    </div>
  );
};

export default LoginRegister;
