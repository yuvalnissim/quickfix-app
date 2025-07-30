import React from 'react';
import ServiceRequest from './ServiceRequest';
import { useNavigate } from 'react-router-dom';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="client-dashboard">
      <h2 className="dashboard-title">ברוך הבא ל־QuickFix 👋</h2>

      <div className="request-form-wrapper">
        <ServiceRequest />
      </div>

      <div className="my-requests-button-container">
        <button
          className="my-requests-button"
          onClick={() => navigate('/my-requests')}
          aria-label="מעבר לבקשות שלי"
        >
          📋 הצג את הבקשות שלי
        </button>

        <div className="profile-button-container">
          <button
            className="profile-button"
            onClick={() => navigate('/client-profile')}
            aria-label="מעבר לפרופיל"
          >
            👤 הפרופיל שלי
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClientDashboard;
