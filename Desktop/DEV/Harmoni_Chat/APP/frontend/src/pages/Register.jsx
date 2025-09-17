import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RegisterModern.css';

const Register = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://harmoni-chat-6.onrender.com/api/auth/register', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate('/login');
    } catch (err) {
      alert('Registration failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="register-modern-wrapper">
      <div className="register-visual-col">
        <img src="/images/login-illustration2.png" alt="Register Illustration" />
      </div>
      <form className="register-modern-form" onSubmit={handleSubmit} autoComplete="off">
        <h2>Create an account</h2>
        <p className="register-subtext">
          Already have an account?{' '}
          <Link to="/login" className="register-link">Log in</Link>
        </p>
        <label>Username</label>
        <input
          placeholder="Enter your username"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          required
        />
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit" className="register-btn">Create account</button>
      </form>
    </div>
  );
};

export default Register;
