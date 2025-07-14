import React from 'react';
import ServiceRequest from './ServiceRequest';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>דשבורד לקוח</h2>
      
      {/* טופס הזמנת שירות */}
      <ServiceRequest />

      {/* כפתור למעבר לעמוד הבקשות שלי */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button onClick={() => navigate('/my-requests')}>
          הצג את הבקשות שלי
        </button>
      </div>
    </div>
  );
};

export default ClientDashboard;
