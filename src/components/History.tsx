import type { HistoryEntry } from '../types'
import { MEAL_LABELS } from '../types'

interface HistoryProps {
  history: HistoryEntry[]
  onClear: () => void
  onDelete: (id: string) => void
}

export default function History({ history, onClear, onDelete }: HistoryProps) {
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
              <span className="history-date">{h.date} {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <button className="btn-icon history-delete" onClick={() => onDelete(h.id)} title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
