import { useState } from 'react'
import { isConfigured } from '../firebase'
import { createRoom, joinRoom, leaveRoom } from '../roomService'

interface RoomManagerProps {
  currentRoom: string | null
  onJoin: (code: string) => void
  onLeave: () => void
}

export default function RoomManager({ currentRoom, onJoin, onLeave }: RoomManagerProps) {
  const [joinCode, setJoinCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  if (!isConfigured) {
    return null
  }

  async function handleCreate() {
    setCreating(true)
    setError('')
    try {
      const code = await createRoom()
      onJoin(code)
    } catch {
      setError('Failed to create room')
    } finally {
      setCreating(false)
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return
    setJoining(true)
    setError('')
    try {
      const success = await joinRoom(joinCode)
      if (success) {
        onJoin(joinCode.toUpperCase().trim())
        setJoinCode('')
      } else {
        setError('Room not found')
      }
    } catch {
      setError('Failed to join room')
    } finally {
      setJoining(false)
    }
  }

  function handleCopy() {
    if (!currentRoom) return
    navigator.clipboard.writeText(currentRoom).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleLeave() {
    await leaveRoom()
    onLeave()
  }

  return (
    <div className={`room-manager${currentRoom ? ' room-active' : ' room-idle'}${!open ? ' room-collapsed' : ''}`}>
      <button className="room-toggle" onClick={() => setOpen(!open)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span>{currentRoom ? `Room: ${currentRoom}` : 'Room Sync'}</span>
        <svg className={`room-chevron${open ? ' room-chevron-open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="room-body">
          {currentRoom ? (
            <>
              <div className="room-status">
                <div className="room-info">
                  <span className="room-label">Room</span>
                  <span className="room-code">{currentRoom}</span>
                </div>
                <button className="btn-copy" onClick={handleCopy}>
                  {copied ? '✓ Copied' : 'Copy Code'}
                </button>
              </div>
              <p className="room-hint">Share this code with friends to sync</p>
              <button className="btn-leave" onClick={handleLeave}>Leave Room</button>
            </>
          ) : (
            <>
              <p className="room-intro">Sync your food list with friends in real-time</p>
              <div className="room-actions">
                <button className="btn-room" onClick={handleCreate} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Room'}
                </button>
                <div className="room-join">
                  <input
                    className="room-input"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    maxLength={6}
                  />
                  <button className="btn-room" onClick={handleJoin} disabled={joining || !joinCode.trim()}>
                    {joining ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </div>
              {error && <p className="room-error">{error}</p>}
            </>
          )}
        </div>
      )}
    </div>
  )
}