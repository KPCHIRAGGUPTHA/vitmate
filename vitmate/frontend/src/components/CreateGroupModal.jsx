import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGroup } from '../api'
import { useAuth } from '../context/AuthContext'

const ROOM_TYPES = ['6NAC','6AC','4NAC','4AC','3NAC','3AC','2NAC','2AC','1NAC','1AC']
const BLOCKS = ['A Block','B Block','C Block','D Block','E Block','G Block','H Block','No Preference']

export default function CreateGroupModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', roomType: '', block: 'No Preference', description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { updateUser } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.roomType) return setError('Please select a room type')
    setLoading(true)
    try {
      const { data } = await createGroup(form)
      updateUser({ currentGroup: data._id })
      onCreated?.()
      navigate(`/chat/${data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <span style={s.modalTitle}>Create New Group</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleCreate}>
          <label style={s.label}>Group Title</label>
          <input style={s.input} placeholder="e.g. Looking for 4AC roommates"
            value={form.title} onChange={e => set('title', e.target.value)} required maxLength={60} />

          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Room Type</label>
              <select style={s.input} value={form.roomType} onChange={e => set('roomType', e.target.value)} required>
                <option value="">Select type</option>
                {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Preferred Block</label>
              <select style={s.input} value={form.block} onChange={e => set('block', e.target.value)}>
                {BLOCKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <label style={s.label}>Description <span style={{ color: '#4b5563' }}>(optional)</span></label>
          <textarea style={{ ...s.input, height: '80px', resize: 'vertical' }}
            placeholder="Any preferences, contact info, etc."
            value={form.description} onChange={e => set('description', e.target.value)} maxLength={300} />

          {form.roomType && (
            <div style={s.preview}>
              🏠 This will create a <b style={{ color: '#c9a84c' }}>{form.roomType}</b> group for{' '}
              <b style={{ color: '#c9a84c' }}>
                {{'6NAC':6,'6AC':6,'4NAC':4,'4AC':4,'3NAC':3,'3AC':3,'2NAC':2,'2AC':2,'1NAC':1,'1AC':1}[form.roomType]} people
              </b>
            </div>
          )}

          <div style={s.btns}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={{ ...s.createBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Creating...' : 'Create & Enter Chat →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: '20px' },
  modal: { background: '#111827', border: '1px solid #1e2a45', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle: { color: '#e8eaf0', fontWeight: 700, fontSize: '1.1rem' },
  closeBtn: { background: 'none', border: 'none', color: '#6b7280', fontSize: '1.1rem', cursor: 'pointer' },
  label: { display: 'block', color: '#9ca3af', fontSize: '0.82rem', marginBottom: '6px', marginTop: '14px' },
  input: { width: '100%', background: '#1a2235', border: '1px solid #1e2a45', borderRadius: '8px', padding: '11px 13px', color: '#e8eaf0', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' },
  row: { display: 'flex', gap: '12px' },
  preview: { marginTop: '14px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '10px 14px', color: '#9ca3af', fontSize: '0.875rem' },
  btns: { display: 'flex', gap: '10px', marginTop: '20px' },
  cancelBtn: { flex: 1, padding: '11px', background: '#1a2235', border: '1px solid #1e2a45', borderRadius: '8px', color: '#9ca3af', cursor: 'pointer', fontWeight: 600 },
  createBtn: { flex: 2, padding: '11px', background: 'linear-gradient(135deg, #c9a84c, #e8c56a)', border: 'none', borderRadius: '8px', color: '#0a0e1a', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' },
  error: { background: '#2d1515', border: '1px solid #7f1d1d', color: '#fca5a5', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '0.875rem' },
}
