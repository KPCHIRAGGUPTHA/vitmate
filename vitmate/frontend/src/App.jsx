import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Navbar from './components/Navbar'
import axios from 'axios'

// ✅ ADD THIS (VERY IMPORTANT)
const token = localStorage.getItem('vitmate_token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div style={styles.loader}>Loading VITmate...</div>
  return user ? children : <Navigate to="/login" />
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div style={styles.loader}>Loading VITmate...</div>
  return !user ? children : <Navigate to="/" />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={
            <PrivateRoute>
              <>
                <Navbar />
                <Dashboard />
              </>
            </PrivateRoute>
          } />
          <Route path="/chat/:id" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

const styles = {
  loader: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0e1a',
    color: '#c9a84c',
    fontFamily: 'sans-serif',
    fontSize: '1.2rem'
  }
}