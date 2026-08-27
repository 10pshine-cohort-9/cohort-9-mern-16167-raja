import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard Page Component
 */
const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Remove the user data from browser storage
    localStorage.removeItem('userInfo');
    // 2. Redirect back to login
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>My Notes Dashboard</h2>
      <p>Protected notes will be displayed here.</p>
      
      <button 
        onClick={handleLogout} 
        style={{ marginTop: '20px', padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;