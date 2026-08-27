import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
// --- UPDATED: Importing ApiErrorResponse ---
import { AuthResponse, ApiErrorResponse } from './Login'; 

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await axios.post<AuthResponse>('/api/auth/register', {
        name,
        email,
        password,
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err: unknown) {
      // --- UPDATED: Using typed ApiErrorResponse ---
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        setError(err.response?.data?.message || 'Error occurred during registration');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", "Segoe UI", sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px', border: '1px solid #e5e7eb' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#111827', fontWeight: 700 }}>
            <span style={{ color: '#3b82f6' }}>10P</span> Notes
          </h1>
          <h2 style={{ margin: 0, color: '#4b5563', fontSize: '1.1rem', fontWeight: 500 }}>Create an account</h2>
        </div>
        
        {error && <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '0.9rem', fontWeight: 600 }}>Full Name</label>
            <input 
              type="text" placeholder="Muhammad Ali" value={name} onChange={(e) => setName(e.target.value)} required
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
            <input 
              type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '0.9rem', fontWeight: 600 }}>Password</label>
            <input 
              type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none' }}
            />
          </div>
          
          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', backgroundColor: isLoading ? '#10b981' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '1rem', marginTop: '10px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: '#6b7280' }}>
          Already have an account? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Login Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;