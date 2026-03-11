import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getGroups } from '../api'
import GroupCard from '../components/GroupCard'
import CreateGroupModal from '../components/CreateGroupModal'

const ROOM_TYPES = ['ALL','6NAC','6AC','4NAC','4AC','3NAC','3AC','2NAC','2AC','1NAC','1AC']
const BLOCKS = ['ALL','A Block','B Block','C Block','D Block','E Block','G Block','H Block','No Preference']

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({ roomType: 'ALL', ac: 'ALL', block: 'ALL', search: '' })

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.roomType !== 'ALL') params.roomType = filters.roomType
      if (filters.ac !== 'ALL') params.ac = filters.ac
      if (filters.block !== 'ALL') params.block = filters.block
      if (filters.search) params.search = filters.search
      const { data } = await getGroups(params)
      setGroups(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchGroups() }, [fetchGroups])

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  return (
    <div style={s.page}>
      {/* My Group Banner */}
      {user?.currentGroup && (
        <div style={s.myGroupBanner}>
          <span>🏠 You are in a group!</span>
          <button style={s.goBtn}
            onClick={() => navigate(`/chat/${user.currentGroup._id || user.currentGroup}`)}>
            Open Group Chat →
          </button>
        </div>
      )}

      {/* Hero */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>
          Find your <span style={s.heroGold}>perfect roommate</span> at VIT
        </h1>
        <p style={s.heroSub}>Browse groups, check ranks, and coordinate your hostel room allocation</p>

        {!user?.currentGroup && (
          <button style={s.createBtn} onClick={() => setShowModal(true)}>
            + Create New Group
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div style={s.statsBar}>
        <div style={s.stat}>
          <span style={s.statNum}>{groups.length}</span>
          <span style={s.statLabel}>Active Groups</span>
        </div>
        <div style={s.statDiv} />
        <div style={s.stat}>
          <span style={s.statNum}>{groups.reduce((a, g) => a + g.members.length, 0)}</span>
          <span style={s.statLabel}>Students</span>
        </div>
        <div style={s.statDiv} />
        <div style={s.stat}>
          <span style={s.statNum}>{groups.filter(g => g.members.length < g.maxMembers).length}</span>
          <span style={s.statLabel}>Open Spots</span>
        </div>
        <div style={s.statDiv} />
        <div style={s.stat}>
          <span style={s.statNum}>{new Set(groups.map(g => g.roomType)).size}</span>
          <span style={s.statLabel}>Room Types</span>
        </div>
      </div>

      {/* Filters */}
      <div style={s.filtersWrap}>
        <input style={s.searchInput} placeholder="🔍 Search groups..."
          value={filters.search}
          onChange={e => setF('search', e.target.value)} />

        <div style={s.filterRow}>
          <div style={s.filterGroup}>
            <span style={s.filterLabel}>AC/NAC</span>
            {['ALL','AC','NAC'].map(v => (
              <button key={v} style={{ ...s.chip, ...(filters.ac === v ? s.chipActive : {}) }}
                onClick={() => setF('ac', v)}>{v}</button>
            ))}
          </div>

          <div style={s.filterGroup}>
            <span style={s.filterLabel}>Room Type</span>
            {ROOM_TYPES.map(v => (
              <button key={v} style={{ ...s.chip, ...(filters.roomType === v ? s.chipActive : {}) }}
                onClick={() => setF('roomType', v)}>{v}</button>
            ))}
          </div>

          <div style={s.filterGroup}>
            <span style={s.filterLabel}>Block</span>
            <select style={s.select} value={filters.block} onChange={e => setF('block', e.target.value)}>
              {BLOCKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div style={s.loader}>Loading groups...</div>
      ) : groups.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🏠</div>
          <div style={s.emptyText}>No groups found</div>
          <div style={s.emptySub}>Be the first to create one!</div>
          {!user?.currentGroup && (
            <button style={s.createBtn2} onClick={() => setShowModal(true)}>+ Create Group</button>
          )}
        </div>
      ) : (
        <div style={s.grid}>
          {groups.map(g => (
            <GroupCard key={g._id} group={g} onJoined={fetchGroups} />
          ))}
        </div>
      )}

      {showModal && (
        <CreateGroupModal
          onClose={() => setShowModal(false)}
          onCreated={fetchGroups}
        />
      )}
    </div>
  )
}

const s = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '24px 20px', minHeight: '100vh' },
  myGroupBanner: { background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#c9a84c', fontWeight: 600 },
  goBtn: { background: '#c9a84c', border: 'none', borderRadius: '6px', color: '#0a0e1a', padding: '7px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' },
  hero: { textAlign: 'center', padding: '40px 0 32px' },
  heroTitle: { fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#e8eaf0', marginBottom: '10px' },
  heroGold: { color: '#c9a84c' },
  heroSub: { color: '#6b7280', fontSize: '1rem', marginBottom: '24px' },
  createBtn: { padding: '13px 28px', background: 'linear-gradient(135deg, #c9a84c, #e8c56a)', border: 'none', borderRadius: '10px', color: '#0a0e1a', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' },
  statsBar: { display: 'flex', justifyContent: 'center', gap: '0', background: '#111827', border: '1px solid #1e2a45', borderRadius: '12px', padding: '16px 24px', marginBottom: '24px', flexWrap: 'wrap' },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px' },
  statNum: { fontFamily: "'Syne', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#c9a84c' },
  statLabel: { color: '#6b7280', fontSize: '0.78rem', marginTop: '2px' },
  statDiv: { width: '1px', background: '#1e2a45', margin: '0 4px' },
  filtersWrap: { background: '#111827', border: '1px solid #1e2a45', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' },
  searchInput: { width: '100%', background: '#1a2235', border: '1px solid #1e2a45', borderRadius: '8px', padding: '11px 14px', color: '#e8eaf0', fontSize: '0.95rem', outline: 'none', marginBottom: '14px' },
  filterRow: { display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  filterLabel: { color: '#6b7280', fontSize: '0.8rem', marginRight: '4px', whiteSpace: 'nowrap' },
  chip: { padding: '5px 12px', background: '#1a2235', border: '1px solid #1e2a45', borderRadius: '20px', color: '#9ca3af', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 },
  chipActive: { background: 'rgba(201,168,76,0.15)', border: '1px solid #c9a84c', color: '#c9a84c', fontWeight: 700 },
  select: { background: '#1a2235', border: '1px solid #1e2a45', borderRadius: '8px', padding: '5px 10px', color: '#9ca3af', fontSize: '0.8rem', outline: 'none' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' },
  loader: { textAlign: 'center', padding: '60px', color: '#6b7280' },
  empty: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { fontSize: '3rem', marginBottom: '12px' },
  emptyText: { color: '#e8eaf0', fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' },
  emptySub: { color: '#6b7280', marginBottom: '20px' },
  createBtn2: { padding: '11px 24px', background: 'linear-gradient(135deg, #c9a84c, #e8c56a)', border: 'none', borderRadius: '8px', color: '#0a0e1a', fontWeight: 700, cursor: 'pointer' },
}
