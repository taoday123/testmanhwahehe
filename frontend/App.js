import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import Home from './Home';
import StoryDetail from './StoryDetail';
import Login from './Login';

const socket = io('https://backend-cua-ban.onrender.com'); // Thay bằng URL backend deploy của bạn

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home socket={socket} />} />
        <Route path="/story/:id" element={<StoryDetail socket={socket} />} />
      </Routes>
    </Router>
  );
}

export default App;