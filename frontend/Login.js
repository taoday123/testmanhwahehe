import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async () => {
    try {
      const endpoint = isRegister ? '/register' : '/login';
      const res = await axios.post(`https://backend-cua-ban.onrender.com${endpoint}`, { username, password });
      if (!isRegister) {
        localStorage.setItem('token', res.data.token);
        window.location.href = '/';
      } else {
        alert('Registered! Now login.');
        setIsRegister(false);
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data || 'Unknown'));
    }
  };

  return (
    <div>
      <h1>{isRegister ? 'Register' : 'Login'}</h1>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleSubmit}>{isRegister ? 'Register' : 'Login'}</button>
      <button onClick={() => setIsRegister(!isRegister)}>Switch to {isRegister ? 'Login' : 'Register'}</button>
    </div>
  );
}

export default Login;