import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface LoginSignupPageProps {
  onLogin: (userId: string) => void;
}

const LoginSignupPage: React.FC<LoginSignupPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          return;
        }
      }

      const endpoint = isLogin ? '/api/login' : '/api/signup';

      if (isLogin) {
        const response = await axios.post(endpoint, {
          email: formData.email,
          password: formData.password
        });
        
        if (response.data.user_id) {
          onLogin(response.data.user_id);
        }
      } else {
        const signupResponse = await axios.post(endpoint, {
          email: formData.email,
          password: formData.password
        });

        if (signupResponse.data.message === "Signup successful.") {
          const loginResponse = await axios.post('/api/login', {
            email: formData.email,
            password: formData.password
          });

          if (loginResponse.data.user_id) {
            onLogin(loginResponse.data.user_id);
          }
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err.response?.data || err.message);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        `Failed to ${isLogin ? 'log in' : 'sign up'}. Please try again.`
      );
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Welcome to Helix</h1>
        <h2>{isLogin ? 'Login to Your Account' : 'Create Your Account'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email</label>
            <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange}
              className="auth-input" required/>
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input type="password" name="password" placeholder={isLogin ? "Enter your password" : "Create a password"}
              value={formData.password} onChange={handleChange} className="auth-input" required minLength={isLogin ? undefined : 8} />
          </div>
          {!isLogin && (
            <div className="auth-field">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" placeholder="Confirm your password"
                value={formData.confirmPassword} onChange={handleChange} className="auth-input"
                required minLength={8}/>
            </div>
          )}
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-button">
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
          <div className="auth-link">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button  type="button" 
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: '', password: '', confirmPassword: '' });
                setError('');}}>
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginSignupPage;
