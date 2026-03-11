import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const BRANCHES = ['CSE','ECE','EEE','MECH','CIVIL','IT','BIOMED','CHEM','AIDS','AIML','CSD','MIS','ISE','OTHER']
const YEARS = ['1st Year','2nd Year','3rd Year','4th Year','5th Year']

export default function Register() {
  const [form, setForm] = useState({ name: '', regNo: '', password: '', branch: '', year: '', rank: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.branch || !form.year) return setError('Please select branch and year')
    setLoading(true)
    try {
      await register({ ...form, regNo: form.regNo.toUpperCase(), rank: Number(form.rank) })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <span style={s.logoV}>VIT</span><span style={s.logoM}>mate</span>
        </div>
        <p style={s.sub}>Create your account</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Full Name</label>
              <input style={s.input} placeholder="Your name"
                value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Register Number</label>
              <input style={s.input} placeholder="24MIS0369"
                value={form.regNo} onChange={e => set('regNo', e.target.value.toUpperCase())} required />
            </div>
          </div>

          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Branch</label>
              <select style={s.input} value={form.branch} onChange={e => set('branch', e.target.value)} required>
                <option value="">Select branch</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Year</label>
              <select style={s.input} value={form.year} onChange={e => set('year', e.target.value)} required>
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Allotment Rank</label>
              <input style={s.input} type="number" placeholder="e.g. 4521"
                value={form.rank} onChange={e => set('rank', e.target.value)} required min="1" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Password</label>
              <input style={s.input} type="password" placeholder="Min 6 chars"
                value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
            </div>
          </div>

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p style={s.foot}>
          Already have an account? <Link to="/login" style={s.link}>Login</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1a2e 100%)', padding: '20px' },
  card: { background: '#111827', border: '1px solid #1e2a45', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '540px' },
  logo: { textAlign: 'center', marginBottom: '4px' },
  logoV: { fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#c9a84c' },
  logoM: { fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#fff' },
  sub: { textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginBottom: '24px' },
  row: { display: 'flex', gap: '12px', marginTop: '4px' },
  label: { display: 'block', color: '#9ca3af', fontSize: '0.82rem', marginBottom: '6px', marginTop: '14px' },
  input: { width: '100%', background: '#1a2235', border: '1px solid #1e2a45', borderRadius: '8px', padding: '11px 13px', color: '#e8eaf0', fontSize: '0.9rem', outline: 'none' },
  btn: { width: '100%', marginTop: '24px', padding: '13px', background: 'linear-gradient(135deg, #c9a84c, #e8c56a)', border: 'none', borderRadius: '8px', color: '#0a0e1a', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' },
  error: { background: '#2d1515', border: '1px solid #7f1d1d', color: '#fca5a5', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '0.875rem' },
  foot: { textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '0.875rem' },
  link: { color: '#c9a84c', textDecoration: 'none', fontWeight: 600 },
}
