import { useEffect, useRef, useState } from 'react'
import type { Food, MealType } from '../types'
import { MEAL_LABELS, MEAL_EMOJIS } from '../types'

interface ConfirmModalProps {
  open: boolean
  food: Food | null
  mealType: MealType
  roomId: string | null
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ open, food, mealType, roomId, onConfirm, onCancel }: ConfirmModalProps) {
  const [saving, setSaving] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      setSaving(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      document.body.classList.add('modal-open')
      const t = setTimeout(() => confirmBtnRef.current?.focus(), 350)
      return () => {
        clearTimeout(t)
        document.body.classList.remove('modal-open')
      }
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open || !food) return null

  async function handleConfirm() {
    setSaving(true)
    onConfirm()
  }

  const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="modal-overlay" onClick={onCancel} role="presentation">
      <div
        className="modal-sheet"
        ref={sheetRef}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Confirm meal selection"
      >
        <div className="modal-handle" />
        <div className="modal-deco">
          <span className="modal-deco-item">🍅</span>
          <span className="modal-deco-item">🍃</span>
          <span className="modal-deco-item">🧄</span>
        </div>

        <div className="modal-food-preview">
          <span className="modal-food-emoji">{MEAL_EMOJIS[mealType]}</span>
          <div className="modal-food-info">
            <span className="modal-food-name">{food.name}</span>
            <div className="modal-food-meta">
              <span className="modal-meal-badge">{MEAL_LABELS[mealType]}</span>
              {food.cuisine && <span className="modal-cuisine">{food.cuisine}</span>}
            </div>
          </div>
        </div>

        <div className="modal-stars">
          {[1, 2, 3, 4, 5].map(i => (
            <svg key={i} width="22" height="22" viewBox="0 0 24 24" fill={i <= food.rating ? 'var(--accent)' : 'none'} stroke={i <= food.rating ? 'var(--accent)' : 'var(--cream-300)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>

        {food.comment && (
          <p className="modal-note">{food.comment}</p>
        )}

        <div className="modal-details">
          <div className="modal-detail-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{dateStr} · {timeStr}</span>
          </div>
          {roomId && (
            <div className="modal-detail-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Room {roomId}</span>
            </div>
          )}
</div>

        <p className="modal-reassure">
          This meal will be added to your history.
        </p>

        <div className="modal-actions">
          <button
            className="modal-btn-cancel"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="modal-btn-confirm"
            onClick={handleConfirm}
            disabled={saving}
            ref={confirmBtnRef}
          >
            {saving ? (
              <span className="modal-spinner-wrap">
                <span className="modal-spinner" />
                Saving…
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Confirm & Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}