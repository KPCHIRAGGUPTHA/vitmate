const express = require('express');
const cors = require('cors');

const app = express();

// ✅ IMPORT ROUTES
const groupRoutes = require('./routes/groups');
const messageRoutes = require('./routes/messages');

// (optional if you add later)
// const authRoutes = require('./routes/auth');

// ✅ CORS
app.use(cors({
  origin: [
    'https://vitmate-alpha.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));

// ✅ MIDDLEWARE
app.use(express.json());

// ✅ TEST ROUTE
app.get('/', (req, res) => {
  res.send('Server is running ✅');
});

// ✅ CONNECT ROUTES (🔥 MOST IMPORTANT)
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);

// OPTIONAL (if you build auth properly)
// app.use('/api/auth', authRoutes);

// ✅ PORT
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});