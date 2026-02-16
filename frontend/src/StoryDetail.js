import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function StoryDetail({ socket }) {
  const { id } = useParams();
  const [story, setStory] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = '/login';

    axios.get(`https://backend-cua-ban.onrender.com/stories/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setStory(res.data));

    // Tăng view
    axios.post(`https://backend-cua-ban.onrender.com/stories/${id}/view`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }, [id, socket]);

  if (!story) return <div>Loading...</div>;

  return (
    <div>
      <img src={story.thumbnail} alt={story.title} />
      <h1>{story.title}</h1>
      <p>{story.description}</p>
      <p>Tags: {story.tags.join(', ')}</p>
      <p>Views: {story.views}</p>
    </div>
  );
}

export default StoryDetail;