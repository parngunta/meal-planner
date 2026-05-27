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

  if (currentRoom) {
    return (
      <div className="room-manager room-active">
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
      </div>
    )
  }

  return (
    <div className="room-manager">
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
    </div>
  )
}