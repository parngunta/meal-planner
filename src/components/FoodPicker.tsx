import { useState } from 'react'
import type { Food, HistoryEntry, MealType } from '../types'
import { MEAL_TYPES, MEAL_LABELS, MEAL_EMOJIS } from '../types'

interface FoodPickerProps {
  foods: Food[]
  history: HistoryEntry[]
  onPick: (entry: HistoryEntry) => void
  exclusionDays: number
}

export default function FoodPicker({ foods, history, onPick, exclusionDays }: FoodPickerProps) {
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch')
  const [result, setResult] = useState<Food | null>(null)
  const [picked, setPicked] = useState(false)

  function getEligibleFoods(): Food[] {
    const cutoff = Date.now() - exclusionDays * 86400000
    const recentFoodIds = new Set(
      history
        .filter(h => h.timestamp > cutoff && h.mealType === selectedMeal)
        .map(h => h.foodId)
    )
    return foods.filter(f => f.mealTypes.includes(selectedMeal) && !recentFoodIds.has(f.id))
  }

  function pickRandom() {
    const eligible = getEligibleFoods()
    if (eligible.length === 0) return
    const totalWeight = eligible.reduce((sum, f) => sum + f.rating, 0)
    let roll = Math.random() * totalWeight
    for (const f of eligible) {
      roll -= f.rating
      if (roll <= 0) {
        setResult(f)
        setPicked(true)
        onPick({
          id: String(Date.now()),
          foodId: f.id,
          foodName: f.name,
          mealType: selectedMeal,
          date: new Date().toISOString().slice(0, 10),
          timestamp: Date.now(),
        })
        return
      }
    }
  }

  const eligible = getEligibleFoods()

  return (
    <div className="food-picker">
      {picked && result && (
        <div className="pick-result">
          <span className="pick-result-emoji">{MEAL_EMOJIS[selectedMeal]}</span>
          <span className="pick-result-name">{result.name}</span>
          <div className="pick-result-details">
            {result.cuisine && <span>{result.cuisine}</span>}
            <span className="stars-row">
              {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i <= result.rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </span>
          </div>
        </div>
      )}

      <div className="picker-controls">
        <div className="chip-group">
          {MEAL_TYPES.map(m => (
            <button type="button" key={m} className={`chip ${selectedMeal === m ? 'active' : ''}`} onClick={() => { setSelectedMeal(m); setPicked(false) }}>
              {MEAL_EMOJIS[m]} {MEAL_LABELS[m]}
            </button>
          ))}
        </div>

        <button className="btn-primary" onClick={pickRandom} disabled={eligible.length === 0}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" />
          </svg>
          {eligible.length === 0 ? 'No eligible foods' : 'Pick for me!'}
        </button>

        <p className="eligible-count">{eligible.length} meals eligible · skip {exclusionDays}d</p>

        {picked && result && (
          <button className="btn-secondary" onClick={() => pickRandom()}>Re-roll</button>
        )}
      </div>
    </div>
  )
}
