import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const Login = ({ setAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showSkeleton, setShowSkeleton] = useState(!navigator.onLine);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setShowSkeleton(true);  

    try {
      const response = await fetch('http://localhost:8082/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const responseData = await response.json();
      console.log('Login response:', responseData);
      setAuthenticated(true);
      localStorage.setItem('role', responseData.role);
      navigate('/project-titles');
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Enter a Email and Password');
    } finally {
      setShowSkeleton(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => setShowSkeleton(false);
    const handleOffline = () => setShowSkeleton(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="form-container">
      <h3>Login</h3>
      {showSkeleton ? (
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={40} sx={{ backgroundColor: '#f0f0f0' }} />
          <Skeleton variant="rectangular" height={40} sx={{ backgroundColor: '#e0e0e0' }} />
          <Skeleton variant="rectangular" height={40} sx={{ backgroundColor: '#d0d0d0' }} />
          <Skeleton variant="rectangular" height={40} width={100} sx={{ backgroundColor: '#c0c0c0' }} />
        </Stack>
      ) : (
        <form onSubmit={handleLogin}>
          <Stack spacing={2}>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </Stack>
        </form>
      )}
      {!showSkeleton && (
        <>
          <p>You don't have an account? <Link to="/signup">Signup here</Link>.</p>
          {error && <p className="error">{error}</p>}
        </>
      )}
    </div>
  );
};

export default Login;
