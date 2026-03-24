const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ DEFINE ALLOWED ORIGINS
const allowedOrigins = [
  'http://localhost:5173',
  'https://vitmate-szmpdp18k-p-chirag-gupthas-projects.vercel.app'
];

// ✅ SOCKET.IO FIX
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ✅ EXPRESS CORS FIX (IMPORTANT)
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/messages', require('./routes/messages'));

// Health check
app.get('/', (req, res) => {
  res.json({ status: '✅ VITmate API Running', version: '1.0.0' });
});

// ── SOCKET.IO REAL-TIME CHAT ──────────────────────────────
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on('joinGroup', ({ groupId, userId, name }) => {
    socket.join(groupId);

    activeUsers.set(socket.id, { userId, groupId, name });

    const onlineUsers = Array.from(activeUsers.values())
      .filter(user => user.groupId === groupId)
      .map(user => user.userId);

    socket.emit('onlineUsers', onlineUsers);

    socket.to(groupId).emit('userOnline', { userId, name });

    console.log(`🟢 ${name} joined group ${groupId}`);
  });

  socket.on('leaveGroup', ({ groupId }) => {
    socket.leave(groupId);

    const user = activeUsers.get(socket.id);

    if (user) {
      socket.to(groupId).emit('userOffline', {
        userId: user.userId,
        name: user.name
      });

      activeUsers.delete(socket.id);
    }
  });

  socket.on('sendMessage', ({ groupId, message }) => {
    io.to(groupId).emit('newMessage', message);
  });

  socket.on('typing', ({ groupId, name }) => {
    socket.to(groupId).emit('userTyping', { name });
  });

  socket.on('stopTyping', ({ groupId }) => {
    socket.to(groupId).emit('userStopTyping');
  });

  socket.on('groupUpdated', ({ groupId }) => {
    io.to(groupId).emit('refreshGroup', { groupId });
  });

  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);

    if (user) {
      socket.to(user.groupId).emit('userOffline', {
        userId: user.userId,
        name: user.name
      });

      activeUsers.delete(socket.id);

      console.log(`⚪ ${user.name} disconnected`);
    }

    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 VITmate Server running on port ${PORT}`);
  console.log(`📡 Socket.io enabled`);
});