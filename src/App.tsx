import { useState, useCallback } from 'react'
import type { Food, HistoryEntry } from './types'
import { loadFoods, saveFoods, loadHistory, saveHistory } from './storage'
import FoodForm from './components/FoodForm'
import FoodList from './components/FoodList'
import FoodPicker from './components/FoodPicker'
import History from './components/History'
import WeekPlanner from './components/WeekPlanner'
import './App.css'

type Tab = 'add' | 'foods' | 'pick' | 'history' | 'week'

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

export default function App() {
  const [foods, setFoods] = useState<Food[]>(loadFoods)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [tab, setTab] = useState<Tab>('pick')
  const [exclusionDays, setExclusionDays] = useState(0)

  const addFood = useCallback((f: Food) => {
    setFoods(prev => {
      const next = [...prev, f]
      saveFoods(next)
      return next
    })
    setTab('foods')
  }, [])

  const deleteFood = useCallback((id: string) => {
    setFoods(prev => {
      const next = prev.filter(f => f.id !== id)
      saveFoods(next)
      return next
    })
  }, [])

  const addHistoryEntry = useCallback((entry: HistoryEntry) => {
    setHistory(prev => {
      const next = [...prev, entry]
      saveHistory(next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    saveHistory([])
  }, [])

  return (
    <div className="app">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <img className="hero-img" src="/food.avif" alt="Meal" />
          <div className="hero-badge">Meal Planner</div>
          <h1 className="hero-title">What's for Dinner?</h1>
          <p className="hero-sub">{foods.length} food{foods.length !== 1 ? 's' : ''} in your list</p>
          <div className="hero-actions">
            <div className="exclusion-control">
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                Skip{' '}
                <select value={exclusionDays} onChange={e => setExclusionDays(Number(e.target.value))}>
                  {[0, 1, 2, 3, 5, 7, 14].map(d => (
                    <option key={d} value={d}>{d}d</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      </section>

      <main className="app-main">
        <nav className="tab-nav">
          {TABS.map(t => (
            <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              <TabIcon name={t.icon} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {tab === 'add' && <FoodForm onAdd={addFood} />}
        {tab === 'foods' && <FoodList foods={foods} onDelete={deleteFood} />}
        {tab === 'pick' && (
          <FoodPicker foods={foods} history={history} onPick={addHistoryEntry} exclusionDays={exclusionDays} />
        )}
        {tab === 'history' && <History history={history} onClear={clearHistory} />}
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
