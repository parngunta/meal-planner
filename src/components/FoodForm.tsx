import { useState } from 'react'
import type { Food, MealType } from '../types'
import { MEAL_TYPES, MEAL_LABELS, MEAL_EMOJIS, CUISINE_OPTIONS } from '../types'

interface FoodFormProps {
  onAdd: (food: Food) => void
}

let nextId = Date.now()
function genId() {
  return String(++nextId)
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" className={`star ${i <= value ? 'filled' : ''}`} onClick={() => onChange(i)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={i <= value ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function FoodForm({ onAdd }: FoodFormProps) {
  const [name, setName] = useState('')
  const [mealTypes, setMealTypes] = useState<MealType[]>([])
  const [cuisine, setCuisine] = useState('')
  const [rating, setRating] = useState(3)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || mealTypes.length === 0) return
    onAdd({
      id: genId(),
      name: name.trim(),
      mealTypes,
      cuisine,
      rating,
      createdAt: Date.now(),
    })
    setName('')
    setMealTypes([])
    setCuisine('')
    setRating(3)
  }

  function toggleMeal(m: MealType) {
    setMealTypes(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    )
  }

  return (
    <form className="food-form" onSubmit={handleSubmit}>
      <div className="ff-field">
        <input
          className="ff-name-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Food name"
          autoFocus
        />
      </div>

      <div className="ff-field">
        <label className="ff-label">Meal</label>
        <div className="chip-group">
          {MEAL_TYPES.map(m => (
            <button type="button" key={m} className={`chip ${mealTypes.includes(m) ? 'active' : ''}`} onClick={() => toggleMeal(m)}>
              {MEAL_EMOJIS[m]} {MEAL_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      <div className="ff-field">
        <label className="ff-label">Cuisine <span className="ff-optional">(optional)</span></label>
        <select value={cuisine} onChange={e => setCuisine(e.target.value)}>
          <option value="">Any</option>
          {CUISINE_OPTIONS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="ff-field">
        <label className="ff-label">Rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <button type="submit" disabled={!name.trim() || mealTypes.length === 0}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Food
      </button>
    </form>
  )
}
