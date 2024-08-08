import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:8082/api/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      });
  
      console.log('Sign up successful:', response.data);
      setError(null);
      navigate('/login');
    } catch (err) {
      if (err.response) {
        console.error('Error signing up:', err.response.data);
        setError(err.response.data.message || 'Error signing up. Please try again later.');
      } else if (err.request) {
        console.error('Error signing up:', err.request);
        setError('No response from server. Please try again later.');
      } else {
        console.error('Error signing up:', err.message);
        setError('Unexpected error. Please try again later.');
      }
    }
  };

  return (
    <div className="form-container">
      <h3>Signup</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          required
        />
        <div className="form-group">
          <label>Select Role:</label>
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="intern">Intern</option>
            <option value="employee">Employee</option>
          </select>
        </div>
        <button type="submit">Sign Up</button>
      </form>

      <p>Already have an account? <Link to="/login">Login here</Link>.</p>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Signup;
