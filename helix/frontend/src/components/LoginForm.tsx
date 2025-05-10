import React, { useState } from 'react';
import axios from 'axios';

interface Props {
  onLogin: (userId: string) => void;
}

const LoginForm: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      onLogin(res.data.user_id);
    } catch (err) {
      alert('Login failed!');
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl mb-4 font-bold">Login</h2>
      <form onSubmit={handleSubmit}>
        <input className="w-full mb-2 p-2 border rounded" placeholder="Email"
          type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
        <input className="w-full mb-2 p-2 border rounded" placeholder="Password" type="password"
          value={password} onChange={(e) => setPassword(e.target.value)} required/>
        <button className="w-full bg-blue-500 text-white p-2 rounded" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
