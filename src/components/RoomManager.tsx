import { useState } from 'react'
import { isConfigured } from '../firebase'
import { createRoom, joinRoom, leaveRoom, getPinnedRooms, addPinnedRoom, removePinnedRoom } from '../roomService'

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
  const [shared, setShared] = useState(false)
  const [open, setOpen] = useState(false)
  const [pinnedRooms, setPinnedRooms] = useState<string[]>(() => getPinnedRooms())

  if (!isConfigured) {
    return null
  }

  const isPinned = currentRoom ? pinnedRooms.includes(currentRoom) : false

  function handleTogglePin() {
    if (!currentRoom) return
    if (isPinned) {
      setPinnedRooms(removePinnedRoom(currentRoom))
    } else {
      setPinnedRooms(addPinnedRoom(currentRoom))
    }
  }

  function handleUnpin(code: string) {
    setPinnedRooms(removePinnedRoom(code))
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

  function getShareUrl() {
    const url = new URL(window.location.href)
    url.searchParams.set('room', currentRoom!)
    return url.toString()
  }

  function handleShareLink() {
    if (!currentRoom) return
    const shareUrl = getShareUrl()
    if (navigator.share) {
      navigator.share({
        title: 'Join my meal plan room',
        text: `Join my meal plan room! Code: ${currentRoom}`,
        url: shareUrl,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      })
    }
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
                <div className="room-status-actions">
                  <button
                    className={`btn-pin${isPinned ? ' btn-pin-active' : ''}`}
                    onClick={handleTogglePin}
                    title={isPinned ? 'Unpin room' : 'Pin room'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L12 15" />
                      <path d="M20 10L4 22l2.5-7.5L20 10z" />
                    </svg>
                    {isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button className="btn-copy" onClick={handleCopy}>
                    {copied ? '✓ Copied' : 'Copy Code'}
                  </button>
                  <button className="btn-share" onClick={handleShareLink} title="Share link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    {shared && '✓'}
                  </button>
                </div>
              </div>
              {pinnedRooms.length > 0 && (
                <div className="pinned-rooms">
                  <span className="pinned-label">Pinned Rooms</span>
                  <div className="pinned-list">
                    {pinnedRooms.map(code => (
                      <div key={code} className={`pinned-item${code === currentRoom ? ' pinned-item-active' : ''}`}>
                        <span className="pinned-code" onClick={() => code !== currentRoom && onJoin(code)}>{code}</span>
                        <button className="btn-unpin" onClick={() => handleUnpin(code)} title="Unpin room">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button className="btn-leave" onClick={handleLeave}>Leave Room</button>
            </>
          ) : (
            <>
              {pinnedRooms.length > 0 && (
                <div className="pinned-rooms">
                  <span className="pinned-label">Pinned Rooms</span>
                  <div className="pinned-list">
                    {pinnedRooms.map(code => (
                      <div key={code} className="pinned-item">
                        <span className="pinned-code" onClick={() => onJoin(code)}>{code}</span>
                        <button className="btn-unpin" onClick={() => handleUnpin(code)} title="Unpin room">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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