import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>
        <span style={s.brandV}>VIT</span><span style={s.brandM}>mate</span>
      </Link>

      <div style={s.right}>
        {user?.currentGroup && (
          <Link to={`/chat/${user.currentGroup._id || user.currentGroup}`} style={s.chatBtn}>
            💬 My Group
          </Link>
        )}

        <div style={s.avatarWrap} onClick={() => setOpen(!open)}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={s.userInfo}>
            <span style={s.userName}>{user?.name?.split(' ')[0]}</span>
            <span style={s.userReg}>{user?.regNo}</span>
          </div>
          <span style={s.chevron}>{open ? '▲' : '▼'}</span>
        </div>

        {open && (
          <div style={s.dropdown}>
            <div style={s.dropItem}>
              <span style={s.dropLabel}>Branch</span>
              <span style={s.dropVal}>{user?.branch}</span>
            </div>
            <div style={s.dropItem}>
              <span style={s.dropLabel}>Year</span>
              <span style={s.dropVal}>{user?.year}</span>
            </div>
            <div style={s.dropItem}>
              <span style={s.dropLabel}>Rank</span>
              <span style={s.dropVal}>#{user?.rank}</span>
            </div>
            <div style={s.divider} />
            <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  )
}

const s = {
  nav: { background: '#0d1321', borderBottom: '1px solid #1e2a45', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  brand: { textDecoration: 'none', display: 'flex', alignItems: 'center' },
  brandV: { fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#c9a84c' },
  brandM: { fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#fff' },
  right: { display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' },
  chatBtn: { background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', padding: '7px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 },
  avatarWrap: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9a84c, #e8c56a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0e1a', fontWeight: 800, fontSize: '0.9rem' },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { color: '#e8eaf0', fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2 },
  userReg: { color: '#6b7280', fontSize: '0.72rem', lineHeight: 1.2 },
  chevron: { color: '#6b7280', fontSize: '0.6rem' },
  dropdown: { position: 'absolute', top: '50px', right: 0, background: '#111827', border: '1px solid #1e2a45', borderRadius: '12px', padding: '12px', minWidth: '180px', zIndex: 200 },
  dropItem: { display: 'flex', justifyContent: 'space-between', padding: '6px 4px' },
  dropLabel: { color: '#6b7280', fontSize: '0.8rem' },
  dropVal: { color: '#c9a84c', fontSize: '0.8rem', fontWeight: 600 },
  divider: { height: '1px', background: '#1e2a45', margin: '8px 0' },
  logoutBtn: { width: '100%', padding: '8px', background: '#2d1515', border: '1px solid #7f1d1d', color: '#fca5a5', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 },
}
