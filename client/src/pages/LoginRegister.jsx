import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { register, login } from '../services/authService';
import './LoginRegister.css';

const LoginRegister = ({ setUser }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    isProvider: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering) {
      if (!formData.name || !formData.phone || !formData.email || !formData.password) {
        toast.error("יש למלא את כל השדות");
        return;
      }
    } else {
      if (!formData.email || !formData.password) {
        toast.error("יש למלא אימייל וסיסמה");
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
      localStorage.setItem('userId', data.userId); // ✅ שמירת מזהה המשתמש
      setUser(data);

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
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isProvider"
              checked={formData.isProvider}
              onChange={handleChange}
            />
            אני נותן שירות
          </label>
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
