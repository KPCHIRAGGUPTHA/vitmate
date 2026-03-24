import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGroup } from '../api'
import { useAuth } from '../context/AuthContext'

const ROOM_TYPES = ['6NAC','6AC','4NAC','4AC','3NAC','3AC','2NAC','2AC','1NAC','1AC']
const BLOCKS = ['A Block','B Block','C Block','D Block','E Block','G Block','H Block','No Preference']

export default function CreateGroupModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    roomType: '',
    block: 'No Preference',
    description: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { updateUser } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.roomType) {
      return setError('Please select a room type')
    }

    setLoading(true)

    try {
      const res = await createGroup(form) // ✅ uses fixed API
      const data = res.data

      updateUser({ currentGroup: data._id })

      onCreated?.()

      navigate(`/chat/${data._id}`)

    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        
        <div style={styles.header}>
          <h2>Create New Group</h2>
          <button onClick={onClose} style={styles.close}>✕</button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleCreate}>
          
          <label>Group Title</label>
          <input
            style={styles.input}
            placeholder="Looking for 4AC roommates"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            required
          />

          <div style={styles.row}>
            <div>
              <label>Room Type</label>
              <select
                style={styles.input}
                value={form.roomType}
                onChange={e => set('roomType', e.target.value)}
                required
              >
                <option value="">Select</option>
                {ROOM_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Preferred Block</label>
              <select
                style={styles.input}
                value={form.block}
                onChange={e => set('block', e.target.value)}
              >
                {BLOCKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <label>Description (optional)</label>
          <textarea
            style={{ ...styles.input, height: '80px' }}
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />

          {form.roomType && (
            <div style={styles.preview}>
              🏠 {form.roomType} group for{' '}
              {
                {
                  '6NAC':6,'6AC':6,'4NAC':4,'4AC':4,
                  '3NAC':3,'3AC':3,'2NAC':2,'2AC':2,
                  '1NAC':1,'1AC':1
                }[form.roomType]
              } people
            </div>
          )}

          <div style={styles.buttons}>
            <button type="button" onClick={onClose} style={styles.cancel}>
              Cancel
            </button>

            <button disabled={loading} style={styles.create}>
              {loading ? 'Creating...' : 'Create Group →'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    background: '#111827',
    padding: 20,
    borderRadius: 12,
    width: 400
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  close: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer'
  },
  input: {
    width: '100%',
    marginBottom: 10,
    padding: 8,
    borderRadius: 6,
    border: '1px solid #333',
    background: '#1a2235',
    color: 'white'
  },
  row: {
    display: 'flex',
    gap: 10
  },
  preview: {
    marginTop: 10,
    color: '#c9a84c'
  },
  buttons: {
    display: 'flex',
    gap: 10,
    marginTop: 15
  },
  cancel: {
    flex: 1,
    padding: 10
  },
  create: {
    flex: 2,
    padding: 10,
    background: '#c9a84c',
    border: 'none',
    cursor: 'pointer'
  },
  error: {
    color: 'red',
    marginBottom: 10
  }
}