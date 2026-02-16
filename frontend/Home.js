import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Home({ socket }) {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = '/login';

    axios.get('https://backend-cua-ban.onrender.com/stories', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setStories(res.data));

    socket.on('viewUpdate', ({ id, views }) => {
      setStories(prev => prev.map(story => story.id === id ? { ...story, views } : story));
    });

    return () => socket.off('viewUpdate');
  }, [socket]);

  return (
    <div>
      <h1>Trang Chủ</h1>
      {stories.map(story => (
        <div key={story.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/story/${story.id}`}>
          <img src={story.thumbnail} alt={story.title} width="100" />
          <h2>{story.title}</h2>
          <p>Views: {story.views}</p>
        </div>
      ))}
    </div>
  );
}

export default Home;