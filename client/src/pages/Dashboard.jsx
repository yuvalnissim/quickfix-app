// client/src/pages/Dashboard.jsx
import React from 'react';
import ClientDashboard from './ClientDashboard';
import ProviderDashboard from './ProviderDashboard';

const Dashboard = () => {
  const role = localStorage.getItem('role');

  return (
    <>
      {role === 'provider' ? <ProviderDashboard /> : <ClientDashboard />}
    </>
  );
};

export default Dashboard;
