import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getValidSession } from '../components/ProtectedRoute';

const Profile = () => {
  const navigate = useNavigate();
  const userInfo = getValidSession();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate, userInfo]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  if (!userInfo) return null;

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      {/* Top Navigation Bar */}
      <nav style={{ backgroundColor: '#ffffff', padding: '16px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#111827', fontWeight: 700 }}>
            <span style={{ color: '#3b82f6' }}>10P</span> Notes
          </h1>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/dashboard" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: 600 }}>
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: '600px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          
          <div style={{ width: '80px', height: '80px', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, margin: '0 auto 20px auto' }}>
            {userInfo.name.charAt(0).toUpperCase()}
          </div>
          
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', color: '#111827' }}>{userInfo.name}</h2>
          <p style={{ margin: '0 0 30px 0', color: '#6b7280', fontSize: '1.1rem' }}>{userInfo.email}</p>
          
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
              <span style={{ color: '#4b5563', fontWeight: 600 }}>Account ID</span>
              <span style={{ color: '#9ca3af', fontFamily: 'monospace' }}>{userInfo._id}</span>
            </div>

            <button 
              onClick={handleLogout} 
              style={{ width: '100%', padding: '12px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', transition: 'all 0.2s', marginTop: '10px' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
            >
              Sign Out Securely
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;