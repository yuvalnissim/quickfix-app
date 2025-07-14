import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './LoginPage.css'; // ניצור אותו בהמשך
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const BASE_URL = 'http://localhost:3001/api/auth';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("🛑 נא למלא את כל השדות");
      return;
    }

    const endpoint = isRegistering ? 'register' : 'login';

    try {
      const res = await axios.post(`${BASE_URL}/${endpoint}`, {
        username,
        password
      });

      toast.success(res.data.message || (isRegistering ? '🎉 נרשמת בהצלחה' : '✅ התחברת!'));

      // שמירת הטוקן וההפניה לדשבורד
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('role', res.data.role);

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || '❌ שגיאה לא צפויה');
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? "הרשמה" : "התחברות"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="👤 שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="🔒 סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isRegistering ? "הרשמה" : "התחברות"}</button>
      </form>
      <p>
        {isRegistering ? "כבר יש לך חשבון?" : "אין לך חשבון?"}
        <button onClick={() => setIsRegistering(!isRegistering)} className="switch-btn">
          {isRegistering ? "התחברות" : "הרשמה"}
        </button>
      </p>
    </div>
  );
};

export default LoginPage;
