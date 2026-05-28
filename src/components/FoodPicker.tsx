import { useState, useCallback } from 'react'
import type { Food, HistoryEntry, MealType } from '../types'
import { MEAL_TYPES, MEAL_LABELS, MEAL_EMOJIS } from '../types'
import ConfirmModal from './ConfirmModal'
import SuccessState from './SuccessState'

interface FoodPickerProps {
  foods: Food[]
  history: HistoryEntry[]
  onPick: (entry: HistoryEntry) => void
  exclusionDays: number
  roomId: string | null
  onViewHistory: () => void
}

type PickerPhase = 'idle' | 'picked' | 'confirming' | 'success'

export default function FoodPicker({ foods, history, onPick, exclusionDays, roomId, onViewHistory }: FoodPickerProps) {
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch')
  const [result, setResult] = useState<Food | null>(null)
  const [phase, setPhase] = useState<PickerPhase>('idle')

  function getEligibleFoods(): Food[] {
    const cutoff = Date.now() - exclusionDays * 86400000
    const recentFoodIds = new Set(
      history
        .filter(h => h.timestamp > cutoff && h.mealType === selectedMeal)
        .map(h => h.foodId)
    )
    return foods.filter(f => f.mealTypes.includes(selectedMeal) && !recentFoodIds.has(f.id))
  }

  const pickRandom = useCallback(() => {
    const eligible = getEligibleFoods()
    if (eligible.length === 0) return
    const totalWeight = eligible.reduce((sum, f) => sum + f.rating, 0)
    let roll = Math.random() * totalWeight
    for (const f of eligible) {
      roll -= f.rating
      if (roll <= 0) {
        setResult(f)
        setPhase('picked')
        return
      }
    }
  }, [foods, history, selectedMeal, exclusionDays])

  function handleMealChange(m: MealType) {
    setSelectedMeal(m)
    setResult(null)
    setPhase('idle')
  }

  function handleConfirmClick() {
    setPhase('confirming')
  }

  function handleModalConfirm() {
    if (!result) return
    onPick({
      id: String(Date.now()),
      foodId: result.id,
      foodName: result.name,
      mealType: selectedMeal,
      date: new Date().toISOString().slice(0, 10),
      timestamp: Date.now(),
    })
    setPhase('success')
  }

  function handleModalCancel() {
    setPhase('picked')
  }

  function handleDone() {
    setResult(null)
    setPhase('idle')
  }

  const eligible = getEligibleFoods()

  return (
    <div className="food-picker">
      <div className={`meal-hero-card ${phase !== 'idle' ? 'has-result' : ''}`}>
        {phase === 'idle' && (
          <div className="meal-hero-empty">
            <div className="meal-hero-illustration">
              <span className="meal-hero-emoji">{MEAL_EMOJIS[selectedMeal]}</span>
            </div>
            <h3 className="meal-hero-title">What's for {MEAL_LABELS[selectedMeal]}?</h3>
            <p className="meal-hero-sub">Tap the button to pick a meal</p>
          </div>
        )}

        {phase !== 'idle' && result && (
          <div className="pick-result">
            <span className="pick-result-emoji">{MEAL_EMOJIS[selectedMeal]}</span>
            <span className="pick-result-name">{result.name}</span>
            <span className="stars-row pick-result-stars">
              {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i <= result.rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </span>
            {result.cuisine && <span className="pick-result-cuisine">{result.cuisine}</span>}
          </div>
        )}
      </div>

      <div className="picker-controls">
        <div className="chip-group">
          {MEAL_TYPES.map(m => (
            <button
              type="button"
              key={m}
              className={`chip ${selectedMeal === m ? 'active' : ''}`}
              onClick={() => handleMealChange(m)}
            >
              {MEAL_EMOJIS[m]} {MEAL_LABELS[m]}
            </button>
          ))}
        </div>

        {phase === 'idle' && (
          <button className="btn-primary btn-pick-cta" onClick={pickRandom} disabled={eligible.length === 0}>
            {eligible.length === 0 ? (
              'No eligible meals'
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 3h5v5M4 20l17-17M16 21h5v-5M15 15l6 6M4 4l5 5" />
                </svg>
                Pick for me!
              </>
            )}
          </button>
        )}

        {phase === 'picked' && result && (
          <div className="pick-actions">
            <button className="btn-secondary" onClick={pickRandom}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5M4 20l17-17M16 21h5v-5M15 15l6 6M4 4l5 5" />
              </svg>
              Re-roll
            </button>
            <button className="btn-confirm btn-confirm-cta" onClick={handleConfirmClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Confirm
            </button>
          </div>
        )}

        <div className="eligible-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{eligible.length} meal{eligible.length !== 1 ? 's' : ''} eligible</span>
          {exclusionDays > 0 && (
            <>
              <span className="eligible-sep">·</span>
              <span>Skip {exclusionDays}d</span>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={phase === 'confirming'}
        food={result}
        mealType={selectedMeal}
        roomId={roomId}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />

      {phase === 'success' && result && (
        <SuccessState
          food={result}
          mealType={selectedMeal}
          onViewHistory={onViewHistory}
          onDone={handleDone}
        />
      )}
    </div>
  )
}