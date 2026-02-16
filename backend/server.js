const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

const SECRET_KEY = 'your_secret_key'; // Thay bằng key bí mật của bạn

// In-memory data (không DB ngoài)
let users = []; // [{ username, hashedPassword }]
let stories = [
  {
    id: '1',
    title: 'Truyện 1: Naruto',
    description: 'Mô tả về Naruto...',
    tags: ['action', 'adventure'],
    thumbnail: 'https://example.com/naruto.jpg', // Thay URL thật
    views: 0
  },
  {
    id: '2',
    title: 'Truyện 2: One Piece',
    description: 'Mô tả về One Piece...',
    tags: ['pirate', 'adventure'],
    thumbnail: 'https://example.com/onepiece.jpg', // Thay URL thật
    views: 0
  }
  // Thêm truyện khác ở đây
];

// API Register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = users.find(u => u.username === username);
  if (existingUser) return res.status(400).send('User exists');
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, hashedPassword });
  res.send('User registered');
});

// API Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !await bcrypt.compare(password, user.hashedPassword)) {
    return res.status(401).send('Invalid credentials');
  }
  const token = jwt.sign({ username }, SECRET_KEY);
  res.json({ token });
});

// Middleware auth
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Unauthorized');
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send('Invalid token');
  }
};

// API lấy list stories (trang chủ)
app.get('/stories', authMiddleware, (req, res) => {
  res.json(stories);
});

// API chi tiết story
app.get('/stories/:id', authMiddleware, (req, res) => {
  const story = stories.find(s => s.id === req.params.id);
  if (!story) return res.status(404).send('Not found');
  res.json(story);
});

// API tăng view
app.post('/stories/:id/view', authMiddleware, (req, res) => {
  const storyIndex = stories.findIndex(s => s.id === req.params.id);
  if (storyIndex === -1) return res.status(404).send('Not found');
  stories[storyIndex].views += 1;
  io.emit('viewUpdate', { id: stories[storyIndex].id, views: stories[storyIndex].views });
  res.json(stories[storyIndex]);
});

// Socket.io cho realtime
io.on('connection', (socket) => {
  console.log('User connected');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));