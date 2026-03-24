const express = require('express');
const cors = require('cors');

const app = express();

// =======================
// 📦 IMPORT ROUTES
// =======================
const groupRoutes = require('./routes/groups');
const messageRoutes = require('./routes/messages');
const authRoutes = require('./routes/auth');

// =======================
// 🌐 CORS CONFIG
// =======================
app.use(cors({
  origin: [
    'https://vitmate-alpha.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// =======================
// 🧠 MIDDLEWARE
// =======================
app.use(express.json());

// =======================
// 🧪 TEST ROUTE
// =======================
app.get('/', (req, res) => {
  res.send('Server is running ✅');
});

// =======================
// 🔐 AUTH ROUTES
// =======================
app.use('/api/auth', authRoutes);

// =======================
// 👥 GROUP ROUTES
// =======================
app.use('/api/groups', groupRoutes);

// =======================
// 💬 MESSAGE ROUTES
// =======================
app.use('/api/messages', messageRoutes);

// =======================
// ❌ 404 HANDLER (OPTIONAL)
// =======================
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// =======================
// 🚀 START SERVER
// =======================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});