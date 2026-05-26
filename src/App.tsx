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
  if (name === 'shuffle') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  )
  if (name === 'plus') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
  if (name === 'list') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
  if (name === 'calendar') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
  if (name === 'clock') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
  return null
}

export default function App() {
  const [foods, setFoods] = useState<Food[]>(loadFoods)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [tab, setTab] = useState<Tab>('pick')
  const [exclusionDays, setExclusionDays] = useState(3)

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
          <img className="hero-img" src="./food.avif" alt="Meal" />
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
                  {[1, 2, 3, 5, 7, 14].map(d => (
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
