import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ regNo: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.regNo, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <span style={s.logoV}>VIT</span>
          <span style={s.logoM}>mate</span>
        </div>
        <p style={s.sub}>Hostel Roommate Finder</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Register Number</label>
          <input style={s.input} placeholder="e.g. 24MIS0369"
            value={form.regNo}
            onChange={e => setForm({ ...form, regNo: e.target.value.toUpperCase() })}
            required />

          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="Enter password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required />

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <p style={s.foot}>
          New to VITmate? <Link to="/register" style={s.link}>Create account</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1a2e 100%)', padding: '20px' },
  card: { background: '#111827', border: '1px solid #1e2a45', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px' },
  logo: { textAlign: 'center', marginBottom: '4px' },
  logoV: { fontFamily: "'Syne', sans-serif", fontSize: '2.2rem', fontWeight: 800, color: '#c9a84c' },
  logoM: { fontFamily: "'Syne', sans-serif", fontSize: '2.2rem', fontWeight: 800, color: '#fff' },
  sub: { textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginBottom: '28px' },
  label: { display: 'block', color: '#9ca3af', fontSize: '0.82rem', marginBottom: '6px', marginTop: '16px' },
  input: { width: '100%', background: '#1a2235', border: '1px solid #1e2a45', borderRadius: '8px', padding: '12px 14px', color: '#e8eaf0', fontSize: '0.95rem', outline: 'none' },
  btn: { width: '100%', marginTop: '24px', padding: '13px', background: 'linear-gradient(135deg, #c9a84c, #e8c56a)', border: 'none', borderRadius: '8px', color: '#0a0e1a', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' },
  error: { background: '#2d1515', border: '1px solid #7f1d1d', color: '#fca5a5', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '0.875rem' },
  foot: { textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '0.875rem' },
  link: { color: '#c9a84c', textDecoration: 'none', fontWeight: 600 },
}
