import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import { getGroup, getMessages, sendMessage, leaveGroup } from '../api'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export default function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [group, setGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [typingUser, setTypingUser] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)
  const typingTimeout = useRef(null)

  const isMember = group?.members?.find(m => m.regNo === user?.regNo)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  // Load group + messages
  const loadData = useCallback(async () => {
    try {
      const [gRes, mRes] = await Promise.all([getGroup(id), getMessages(id)])
      setGroup(gRes.data)
      setMessages(mRes.data)
    } catch {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { scrollToBottom() }, [messages])

  // Socket.io setup
  useEffect(() => {
    if (!user) return
    const socket = io(SOCKET_URL)
    socketRef.current = socket

    socket.emit('joinGroup', { groupId: id, userId: user._id, name: user.name })

    socket.on('newMessage', (msg) => {
      setMessages(prev => {
        if (prev.find(m => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    })

    socket.on('userTyping', ({ name }) => {
      if (name !== user.name) setTypingUser(name)
    })

    socket.on('userStopTyping', () => setTypingUser(''))

    socket.on('userOnline', ({ name }) => {
      setOnlineUsers(prev => [...new Set([...prev, name])])
    })

    socket.on('userOffline', ({ name }) => {
      setOnlineUsers(prev => prev.filter(n => n !== name))
    })

    socket.on('refreshGroup', () => { loadData() })

    return () => {
      socket.emit('leaveGroup', { groupId: id })
      socket.disconnect()
    }
  }, [id, user, loadData])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || !isMember || sending) return
    setSending(true)
    try {
      const { data: msg } = await sendMessage(id, text.trim())
      socketRef.current?.emit('sendMessage', { groupId: id, message: msg })
      setText('')
      socketRef.current?.emit('stopTyping', { groupId: id })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const handleTyping = (e) => {
    setText(e.target.value)
    socketRef.current?.emit('typing', { groupId: id, name: user.name })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit('stopTyping', { groupId: id })
    }, 1500)
  }

  const handleLeave = async () => {
    if (!window.confirm('Leave this group?')) return
    try {
      await leaveGroup(id)
      updateUser({ currentGroup: null })
      socketRef.current?.emit('groupUpdated', { groupId: id })
      navigate('/')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave')
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'Today'
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.createdAt)
    if (!acc[date]) acc[date] = []
    acc[date].push(msg)
    return acc
  }, {})

  if (loading) return <div style={s.loader}>Loading chat...</div>

  const isAC = group?.roomType?.includes('AC') && !group?.roomType?.includes('NAC')
  const fillPct = ((group?.members?.length || 0) / (group?.maxMembers || 1)) * 100

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        {/* Group Info */}
        <div style={s.sideHeader}>
          <button style={s.backBtn} onClick={() => navigate('/')}>← Back</button>
          <div style={s.groupBadge}>{group?.roomType}</div>
        </div>
        <div style={s.groupTitle}>{group?.title}</div>
        <div style={s.groupBlock}>{group?.block}</div>

        {/* Progress */}
        <div style={s.progressRow}>
          <span style={s.progressLabel}>{group?.members?.length}/{group?.maxMembers} members</span>
          <span style={{ color: fillPct === 100 ? '#f87171' : '#4ade80', fontSize: '0.75rem' }}>
            {fillPct === 100 ? 'FULL' : `${group.maxMembers - group.members.length} left`}
          </span>
        </div>
        <div style={s.progressBg}>
          <div style={{ ...s.progressFill, width: `${fillPct}%`, background: fillPct === 100 ? '#ef4444' : 'linear-gradient(90deg,#c9a84c,#e8c56a)' }} />
        </div>

        {/* Members */}
        <div style={s.membersSection}>
          <div style={s.sectionTitle}>Members</div>
          {group?.members?.map((m, i) => {
            const isOnline = onlineUsers.includes(m.name) || m.regNo === user?.regNo
            const isMe = m.regNo === user?.regNo
            const isCreator = group.creator?._id === m.user || group.creator === m.user
            return (
              <div key={i} style={{ ...s.memberRow, background: isMe ? 'rgba(201,168,76,0.06)' : 'transparent' }}>
                <div style={s.memberAvatarWrap}>
                  <div style={s.memberAvatar}>{m.name?.[0]}</div>
                  <div style={{ ...s.onlineDot, background: isOnline ? '#4ade80' : '#374151' }} />
                </div>
                <div style={s.memberInfo}>
                  <div style={s.memberName}>
                    {m.name} {isMe && <span style={s.youBadge}>you</span>}
                    {isCreator && <span style={s.creatorBadge}>👑</span>}
                  </div>
                  <div style={s.memberMeta}>{m.regNo} · {m.year}</div>
                  <div style={s.memberRank}>Rank #{m.rank}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Leave */}
        {isMember && (
          <button style={s.leaveBtn} onClick={handleLeave}>Leave Group</button>
        )}
      </div>

      {/* Chat Area */}
      <div style={s.chatArea}>
        {/* Chat Header */}
        <div style={s.chatHeader}>
          <div>
            <div style={s.chatTitle}>Group Chat</div>
            <div style={s.chatSub}>{isMember ? 'You are a member' : 'Read-only — join to chat'}</div>
          </div>
          {typingUser && (
            <div style={s.typingIndicator}>
              <span style={s.typingDot} />
              <span style={s.typingDot} />
              <span style={s.typingDot} />
              <span style={{ color: '#9ca3af', fontSize: '0.8rem', marginLeft: '6px' }}>{typingUser} is typing</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={s.messages}>
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div style={s.dateDivider}><span style={s.dateLabel}>{date}</span></div>
              {msgs.map((msg, i) => {
                const isMe = msg.senderName === user?.name || msg.sender?._id === user?._id || msg.sender === user?._id
                const isSystem = msg.senderName === 'System'
                if (isSystem) return (
                  <div key={i} style={s.systemMsg}>{msg.text}</div>
                )
                return (
                  <div key={i} style={{ ...s.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    {!isMe && <div style={s.msgAvatar}>{msg.senderName?.[0]}</div>}
                    <div style={{ maxWidth: '65%' }}>
                      {!isMe && <div style={s.msgSender}>{msg.senderName}</div>}
                      <div style={{ ...s.msgBubble, ...(isMe ? s.myBubble : s.theirBubble) }}>
                        {msg.text}
                      </div>
                      <div style={{ ...s.msgTime, textAlign: isMe ? 'right' : 'left' }}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form style={s.inputArea} onSubmit={handleSend}>
          {isMember ? (
            <>
              <input style={s.chatInput} placeholder="Type a message..."
                value={text} onChange={handleTyping}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)} />
              <button style={{ ...s.sendBtn, opacity: (!text.trim() || sending) ? 0.5 : 1 }}
                disabled={!text.trim() || sending}>
                {sending ? '...' : '➤'}
              </button>
            </>
          ) : (
            <div style={s.readOnly}>🔒 Join this group to participate in chat</div>
          )}
        </form>
      </div>
    </div>
  )
}

const s = {
  page: { display: 'flex', height: '100vh', background: '#0a0e1a', overflow: 'hidden' },
  loader: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a', color: '#c9a84c', fontFamily: 'sans-serif' },

  // Sidebar
  sidebar: { width: '280px', minWidth: '280px', background: '#0d1321', borderRight: '1px solid #1e2a45', display: 'flex', flexDirection: 'column', padding: '20px 16px', overflowY: 'auto' },
  sideHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  backBtn: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.875rem', padding: '4px 0' },
  groupBadge: { background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 },
  groupTitle: { color: '#e8eaf0', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' },
  groupBlock: { color: '#6b7280', fontSize: '0.78rem', marginBottom: '14px' },
  progressRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
  progressLabel: { color: '#9ca3af', fontSize: '0.78rem' },
  progressBg: { height: '5px', background: '#1e2a45', borderRadius: '3px', overflow: 'hidden', marginBottom: '18px' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  membersSection: { flex: 1 },
  sectionTitle: { color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' },
  memberRow: { display: 'flex', gap: '10px', padding: '8px', borderRadius: '8px', marginBottom: '4px' },
  memberAvatarWrap: { position: 'relative', flexShrink: 0 },
  memberAvatar: { width: '34px', height: '34px', borderRadius: '50%', background: '#1e2a45', color: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: '9px', height: '9px', borderRadius: '50%', border: '2px solid #0d1321' },
  memberInfo: { flex: 1, minWidth: 0 },
  memberName: { color: '#d1d5db', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' },
  youBadge: { background: 'rgba(201,168,76,0.15)', color: '#c9a84c', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px' },
  creatorBadge: { fontSize: '0.75rem' },
  memberMeta: { color: '#6b7280', fontSize: '0.72rem' },
  memberRank: { color: '#c9a84c', fontSize: '0.72rem', fontWeight: 600 },
  leaveBtn: { marginTop: '16px', padding: '9px', background: '#2d1515', border: '1px solid #7f1d1d', color: '#fca5a5', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 },

  // Chat
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { background: '#0d1321', borderBottom: '1px solid #1e2a45', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatTitle: { color: '#e8eaf0', fontWeight: 700 },
  chatSub: { color: '#6b7280', fontSize: '0.78rem' },
  typingIndicator: { display: 'flex', alignItems: 'center' },
  typingDot: { width: '5px', height: '5px', borderRadius: '50%', background: '#c9a84c', margin: '0 2px', animation: 'bounce 1s infinite' },
  messages: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' },
  dateDivider: { textAlign: 'center', margin: '12px 0' },
  dateLabel: { background: '#1e2a45', color: '#6b7280', fontSize: '0.72rem', padding: '3px 12px', borderRadius: '10px' },
  systemMsg: { textAlign: 'center', color: '#4b5563', fontSize: '0.78rem', padding: '6px', margin: '4px 0' },
  msgRow: { display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '6px' },
  msgAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: '#1e2a45', color: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 },
  msgSender: { color: '#c9a84c', fontSize: '0.75rem', marginBottom: '3px', fontWeight: 600 },
  msgBubble: { padding: '10px 14px', borderRadius: '12px', fontSize: '0.9rem', lineHeight: 1.5, wordBreak: 'break-word' },
  myBubble: { background: 'linear-gradient(135deg, #c9a84c, #e8c56a)', color: '#0a0e1a', borderBottomRightRadius: '4px' },
  theirBubble: { background: '#1a2235', color: '#e8eaf0', borderBottomLeftRadius: '4px', border: '1px solid #1e2a45' },
  msgTime: { color: '#4b5563', fontSize: '0.68rem', marginTop: '3px' },
  inputArea: { background: '#0d1321', borderTop: '1px solid #1e2a45', padding: '14px 20px', display: 'flex', gap: '10px' },
  chatInput: { flex: 1, background: '#1a2235', border: '1px solid #1e2a45', borderRadius: '10px', padding: '12px 16px', color: '#e8eaf0', fontSize: '0.95rem', outline: 'none' },
  sendBtn: { width: '46px', height: '46px', borderRadius: '10px', background: 'linear-gradient(135deg, #c9a84c, #e8c56a)', border: 'none', color: '#0a0e1a', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 700 },
  readOnly: { width: '100%', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', padding: '12px' },
}
