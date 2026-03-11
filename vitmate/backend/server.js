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

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
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
const activeUsers = new Map(); // socketId -> { userId, groupId, name }

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join group
  socket.on('joinGroup', ({ groupId, userId, name }) => {
    socket.join(groupId);

    activeUsers.set(socket.id, { userId, groupId, name });

    // Send full online list to new user
    const onlineUsers = Array.from(activeUsers.values())
      .filter(user => user.groupId === groupId)
      .map(user => user.userId);

    socket.emit('onlineUsers', onlineUsers);

    // Notify others user is online
    socket.to(groupId).emit('userOnline', { userId, name });

    console.log(`🟢 ${name} joined group ${groupId}`);
  });

  // Leave group
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

  // Send message
  socket.on('sendMessage', ({ groupId, message }) => {
    io.to(groupId).emit('newMessage', message);
  });

  // Typing indicator
  socket.on('typing', ({ groupId, name }) => {
    socket.to(groupId).emit('userTyping', { name });
  });

  socket.on('stopTyping', ({ groupId }) => {
    socket.to(groupId).emit('userStopTyping');
  });

  // Group updated (member join/leave)
  socket.on('groupUpdated', ({ groupId }) => {
    io.to(groupId).emit('refreshGroup', { groupId });
  });

  // Disconnect
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