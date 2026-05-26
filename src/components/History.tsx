import type { HistoryEntry } from '../types'
import { MEAL_LABELS } from '../types'

interface HistoryProps {
  history: HistoryEntry[]
  onClear: () => void
}

export default function History({ history, onClear }: HistoryProps) {
  const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="history">
      <div className="history-header">
        <h2>History</h2>
        {history.length > 0 && (
          <button className="btn-danger" onClick={onClear}>Clear All</button>
        )}
      </div>
      {sorted.length === 0 ? (
        <p className="empty-state">No meals picked yet.</p>
      ) : (
        <div className="history-list">
          {sorted.map(h => (
            <div key={h.id} className="history-item">
              <span className="history-meal">{MEAL_LABELS[h.mealType]}</span>
              <span className="history-food">{h.foodName}</span>
              <span className="history-date">{h.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
