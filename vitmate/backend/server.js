const express = require('express');
const cors = require('cors');

const app = express();

// ✅ CORS FIX (MOST IMPORTANT)
app.use(cors({
  origin: [
    'https://vitmate-alpha.vercel.app', // your frontend
    'http://localhost:3000'             // for local testing
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// ✅ MIDDLEWARE
app.use(express.json());

// ✅ TEST ROUTE (check if backend works)
app.get('/', (req, res) => {
  res.send('Server is running ✅');
});

// ✅ REGISTER ROUTE
app.post('/register', (req, res) => {
  const { name, registerNumber, branch, year, rank, password } = req.body;

  // simple validation
  if (!name || !registerNumber || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  // fake success (replace with DB later)
  res.status(200).json({
    message: 'User registered successfully ✅',
    user: { name, registerNumber }
  });
});

// ✅ PORT (VERY IMPORTANT FOR RENDER)
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});