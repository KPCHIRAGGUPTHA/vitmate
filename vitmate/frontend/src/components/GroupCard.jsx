import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { joinGroup } from '../api'

const TYPE_COLORS = {
  AC: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa' },
  NAC: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' },
}

export default function GroupCard({ group, onJoined }) {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const isAC = group.roomType.includes('AC') && !group.roomType.includes('NAC')
  const typeColor = isAC ? TYPE_COLORS.AC : TYPE_COLORS.NAC
  const isMember = group.members.find(m => m.regNo === user?.regNo)
  const isFull = group.members.length >= group.maxMembers
  const fillPct = (group.members.length / group.maxMembers) * 100

  const handleJoin = async () => {
    try {
      await joinGroup(group._id)
      updateUser({ currentGroup: group._id })
      onJoined?.()
      navigate(`/chat/${group._id}`)
    } catch (err) {
      alert(err.response?.data?.message || 'Could not join group')
    }
  }

  return (
    <div style={s.card}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.title}>{group.title}</div>
          <div style={s.block}>{group.block}</div>
        </div>
        <div style={{ ...s.badge, background: typeColor.bg, border: `1px solid ${typeColor.border}`, color: typeColor.text }}>
          {group.roomType}
        </div>
      </div>

      {/* Description */}
      {group.description && <p style={s.desc}>{group.description}</p>}

      {/* Progress bar */}
      <div style={s.progressLabel}>
        <span style={s.memberCount}>{group.members.length} / {group.maxMembers} members</span>
        <span style={{ color: isFull ? '#f87171' : '#4ade80', fontSize: '0.78rem' }}>
          {isFull ? 'FULL' : `${group.maxMembers - group.members.length} spot${group.maxMembers - group.members.length > 1 ? 's' : ''} left`}
        </span>
      </div>
      <div style={s.progressBg}>
        <div style={{ ...s.progressFill, width: `${fillPct}%`, background: isFull ? '#ef4444' : 'linear-gradient(90deg, #c9a84c, #e8c56a)' }} />
      </div>

      {/* Members list */}
      <div style={s.members}>
        {group.members.map((m, i) => (
          <div key={i} style={s.member}>
            <div style={s.memberAvatar}>{m.name?.[0]}</div>
            <div>
              <div style={s.memberName}>{m.name}</div>
              <div style={s.memberMeta}>{m.regNo} · Rank #{m.rank}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Action button */}
      {isMember ? (
        <button style={s.viewBtn} onClick={() => navigate(`/chat/${group._id}`)}>
          💬 Open Chat
        </button>
      ) : user?.currentGroup ? (
        <button style={s.disabledBtn} disabled>Leave your group to join</button>
      ) : isFull ? (
        <button style={s.disabledBtn} disabled>Group Full</button>
      ) : (
        <button style={s.joinBtn} onClick={handleJoin}>Join Group →</button>
      )}
    </div>
  )
}

const s = {
  card: { background: '#111827', border: '1px solid #1e2a45', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'border-color 0.2s', cursor: 'default' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { color: '#e8eaf0', fontWeight: 700, fontSize: '1rem', marginBottom: '3px' },
  block: { color: '#6b7280', fontSize: '0.78rem' },
  badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' },
  desc: { color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.5 },
  progressLabel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  memberCount: { color: '#9ca3af', fontSize: '0.8rem' },
  progressBg: { height: '5px', background: '#1e2a45', borderRadius: '3px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  members: { display: 'flex', flexDirection: 'column', gap: '8px' },
  member: { display: 'flex', alignItems: 'center', gap: '10px' },
  memberAvatar: { width: '30px', height: '30px', borderRadius: '50%', background: '#1e2a45', color: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 },
  memberName: { color: '#d1d5db', fontSize: '0.85rem', fontWeight: 600 },
  memberMeta: { color: '#6b7280', fontSize: '0.75rem' },
  joinBtn: { padding: '10px', background: 'linear-gradient(135deg, #c9a84c, #e8c56a)', border: 'none', borderRadius: '8px', color: '#0a0e1a', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', marginTop: '4px' },
  viewBtn: { padding: '10px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', color: '#c9a84c', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', marginTop: '4px' },
  disabledBtn: { padding: '10px', background: '#1a2235', border: '1px solid #1e2a45', borderRadius: '8px', color: '#4b5563', fontSize: '0.875rem', cursor: 'not-allowed', marginTop: '4px' },
}
