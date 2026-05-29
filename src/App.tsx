import { useState, useCallback, useEffect, useRef } from 'react'
import type { Food, HistoryEntry } from './types'
import { loadFoods, saveFoods, loadHistory, saveHistory } from './storage'
import { isConfigured } from './firebase'
import {
  addFoodToRoom,
  removeFoodFromRoom,
  updateFoodToRoom,
  addHistoryToRoom,
  removeHistoryFromRoom,
  clearRoomHistory,
  listenToRoom,
  getCurrentRoom,
  stopListening,
} from './roomService'
import FoodForm from './components/FoodForm'
import FoodList from './components/FoodList'
import FoodPicker from './components/FoodPicker'
import History from './components/History'
import WeekPlanner from './components/WeekPlanner'
import RoomManager from './components/RoomManager'
import './App.css'

type Tab = 'pick' | 'add' | 'foods' | 'history' | 'week'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'pick', label: 'Pick', icon: 'shuffle' },
  { key: 'add', label: 'Add', icon: 'plus' },
  { key: 'foods', label: 'Foods', icon: 'list' },
  { key: 'week', label: 'Week', icon: 'calendar' },
  { key: 'history', label: 'History', icon: 'clock' },
]

function TabIcon({ name }: { name: string }) {
  const m: Record<string, string> = {
    shuffle: 'M16 3h5v5M4 20l17-17M16 21h5v-5M15 15l6 6M4 4l5 5',
    plus: 'M12 5v14M5 12h14',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    calendar: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18',
    clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
  }
  return m[name] ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={m[name]} />
    </svg>
  ) : null
}

function getRoomFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get('room')?.toUpperCase().trim() || null
}

export default function App() {
  const [foods, setFoods] = useState<Food[]>(loadFoods)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [tab, setTab] = useState<Tab>('pick')
  const [exclusionDays, setExclusionDays] = useState(0)
  const [currentRoom, setCurrentRoom] = useState<string | null>(() => {
    if (!isConfigured) return null
    const urlRoom = getRoomFromUrl()
    if (urlRoom) return urlRoom
    return getCurrentRoom()
  })
  const unlistenRef = useRef<(() => void) | null>(null)
  const inRoom = isConfigured && currentRoom !== null

  useEffect(() => {
    if (!isConfigured || !currentRoom) return
    const unlisten = listenToRoom(currentRoom, (roomFoods, roomHistory) => {
      setFoods(roomFoods)
      saveFoods(roomFoods)
      setHistory(roomHistory)
      saveHistory(roomHistory)
    })
    unlistenRef.current = unlisten
    return () => {
      unlisten()
      unlistenRef.current = null
    }
  }, [currentRoom])

  const addFood = useCallback((f: Food) => {
    if (inRoom && currentRoom) {
      addFoodToRoom(currentRoom, f).catch(() => {
        setFoods(prev => {
          const next = [...prev, f]
          saveFoods(next)
          return next
        })
      })
    } else {
      setFoods(prev => {
        const next = [...prev, f]
        saveFoods(next)
        return next
      })
    }
    setTab('foods')
  }, [inRoom, currentRoom])

  const deleteFood = useCallback((id: string) => {
    if (inRoom && currentRoom) {
      removeFoodFromRoom(currentRoom, id).catch(() => {
        setFoods(prev => {
          const next = prev.filter(f => f.id !== id)
          saveFoods(next)
          return next
        })
      })
    } else {
      setFoods(prev => {
        const next = prev.filter(f => f.id !== id)
        saveFoods(next)
        return next
      })
    }
  }, [inRoom, currentRoom])

  const reorderFoods = useCallback((reordered: Food[]) => {
    setFoods(reordered)
    saveFoods(reordered)
  }, [])

  const updateFood = useCallback((updated: Food) => {
    if (inRoom && currentRoom) {
      updateFoodToRoom(currentRoom, updated).catch(() => {
        setFoods(prev => {
          const next = prev.map(f => f.id === updated.id ? updated : f)
          saveFoods(next)
          return next
        })
      })
    } else {
      setFoods(prev => {
        const next = prev.map(f => f.id === updated.id ? updated : f)
        saveFoods(next)
        return next
      })
    }
  }, [inRoom, currentRoom])

  const addHistoryEntry = useCallback((entry: HistoryEntry) => {
    if (inRoom && currentRoom) {
      addHistoryToRoom(currentRoom, entry).catch(() => {
        setHistory(prev => {
          const next = [...prev, entry]
          saveHistory(next)
          return next
        })
      })
    } else {
      setHistory(prev => {
        const next = [...prev, entry]
        saveHistory(next)
        return next
      })
    }
  }, [inRoom, currentRoom])

  const clearHistory = useCallback(() => {
    if (inRoom && currentRoom) {
      clearRoomHistory(currentRoom).catch(() => {
        setHistory([])
        saveHistory([])
      })
    } else {
      setHistory([])
      saveHistory([])
    }
  }, [inRoom, currentRoom])

  const deleteHistoryEntry = useCallback((id: string) => {
    if (inRoom && currentRoom) {
      removeHistoryFromRoom(currentRoom, id).catch(() => {
        setHistory(prev => {
          const next = prev.filter(h => h.id !== id)
          saveHistory(next)
          return next
        })
      })
    } else {
      setHistory(prev => {
        const next = prev.filter(h => h.id !== id)
        saveHistory(next)
        return next
      })
    }
  }, [inRoom, currentRoom])

  function handleJoinRoom(code: string) {
    setCurrentRoom(code)
  }

  function handleLeaveRoom() {
    if (unlistenRef.current) {
      unlistenRef.current()
      unlistenRef.current = null
    }
    stopListening()
    setCurrentRoom(null)
    setFoods(loadFoods())
    setHistory(loadHistory())
  }

  return (
    <div className="app">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">

          <div className="hero-actions">
            <div className="exclusion-control">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <label>
                Skip{' '}
                <select value={exclusionDays} onChange={e => setExclusionDays(Number(e.target.value))}>
                  {[0, 1, 2, 3, 5, 7, 14].map(d => (
                    <option key={d} value={d}>{d}d</option>
                  ))}
                </select>
              </label>
            </div>
            <span className="food-count-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {foods.length} food{foods.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </section>

      <main className="app-main">
        <RoomManager
          currentRoom={currentRoom}
          onJoin={handleJoinRoom}
          onLeave={handleLeaveRoom}
        />

        <nav className="tab-nav">
          {TABS.map(t => (
            <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              <TabIcon name={t.icon} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {tab === 'add' && <FoodForm onAdd={addFood} />}
        {tab === 'foods' && <FoodList foods={foods} onDelete={deleteFood} onReorder={reorderFoods} onEdit={updateFood} />}
        {tab === 'pick' && (
          <FoodPicker foods={foods} history={history} onPick={addHistoryEntry} exclusionDays={exclusionDays} roomId={currentRoom} onViewHistory={() => setTab('history')} />
        )}
        {tab === 'history' && <History history={history} onClear={clearHistory} onDelete={deleteHistoryEntry} />}
        {tab === 'week' && (
          <WeekPlanner foods={foods} history={history} onPick={addHistoryEntry} exclusionDays={exclusionDays} />
        )}
      </main>

      <nav className="bottom-nav">
        {TABS.map(t => (
          <button key={t.key} className={`bn-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            <TabIcon name={t.icon} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}