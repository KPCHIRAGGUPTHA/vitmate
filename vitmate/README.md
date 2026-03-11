# VITmate — Hostel Roommate Finder

A full-stack web platform for VIT Vellore students to form hostel room groups before official allocation.

---

## 🚀 Run Locally (Step by Step)

### Step 1 — MongoDB Atlas Setup
1. Go to https://cloud.mongodb.com
2. Create free account → Create free cluster (M0)
3. Click "Connect" → "Connect your application"
4. Copy the connection string — it looks like:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
5. Replace `<password>` with your actual password
6. Add `/vitmate` at the end → `mongodb+srv://...mongodb.net/vitmate`

### Step 2 — Backend Setup
```bash
cd backend
copy .env.example .env
# Open .env and paste your MongoDB URI

npm install
npm run dev
# Should see: ✅ MongoDB Connected + 🚀 Server running on port 5000
```

### Step 3 — Frontend Setup
```bash
cd frontend
copy .env.example .env
# .env is already set for localhost

npm install
npm run dev
# Should see: Local: http://localhost:5173
```

Open http://localhost:5173 — VITmate is running! 🎉

---

## 🌐 Deploy to Production

### Backend → Render
1. Push code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add Environment Variables:
   - `MONGO_URI` = your MongoDB URI
   - `JWT_SECRET` = vitmate_super_secret_key_2025
   - `CLIENT_URL` = https://your-vercel-url.vercel.app
6. Deploy → Copy your Render URL

### Frontend → Vercel
1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Settings:
   - Root Directory: `frontend`
   - Framework: Vite
4. Add Environment Variables:
   - `VITE_API_URL` = https://your-render-url.onrender.com/api
   - `VITE_SOCKET_URL` = https://your-render-url.onrender.com
5. Deploy → Get your live URL! 🎉

---

## 📁 Project Structure
```
vitmate/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Group.js          # Group + Messages schema
│   ├── routes/
│   │   ├── auth.js           # Register, Login, Profile
│   │   ├── groups.js         # CRUD + Join/Leave
│   │   └── messages.js       # Group chat messages
│   ├── middleware/auth.js     # JWT protection
│   ├── server.js             # Express + Socket.io
│   └── .env                  # Environment variables
└── frontend/
    ├── src/
    │   ├── context/AuthContext.jsx  # Global auth state
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── Chat.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── GroupCard.jsx
    │   │   └── CreateGroupModal.jsx
    │   ├── api.js            # Axios API calls
    │   └── App.jsx           # Routes
    └── .env                  # Frontend env vars
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/me | Get profile | Yes |
| PUT | /api/auth/profile | Update profile | Yes |
| GET | /api/groups | Get all groups | No |
| POST | /api/groups | Create group | Yes |
| GET | /api/groups/:id | Get group details | Yes |
| POST | /api/groups/:id/join | Join group | Yes |
| POST | /api/groups/:id/leave | Leave group | Yes |
| DELETE | /api/groups/:id | Delete group | Yes |
| GET | /api/messages/:groupId | Get messages | Yes |
| POST | /api/messages/:groupId | Send message | Yes |

---

## ⚡ Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Real-time**: Socket.io
- **Auth**: JWT
- **Deploy**: Vercel (frontend) + Render (backend)
