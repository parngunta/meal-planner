import type { Food, HistoryEntry, MealType } from '../types'
import { MEAL_TYPES, MEAL_LABELS } from '../types'

interface WeekPlannerProps {
  foods: Food[]
  history: HistoryEntry[]
  onPick: (entry: HistoryEntry) => void
  exclusionDays: number
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function WeekPlanner({ foods, history, onPick, exclusionDays }: WeekPlannerProps) {
  function generateWeek() {
    const cutoff = Date.now() - exclusionDays * 86400000
    const recentFoodIds = new Set(
      history.filter(h => h.timestamp > cutoff).map(h => h.foodId)
    )
    const usedInWeek = new Set<string>()
    const plan: { day: string; mealType: MealType; food: Food | null }[] = []

    for (const day of DAYS) {
      for (const mealType of MEAL_TYPES) {
        const eligible = foods.filter(
          f =>
            f.mealTypes.includes(mealType) &&
            !recentFoodIds.has(f.id) &&
            !usedInWeek.has(f.id)
        )
        if (eligible.length === 0) {
          plan.push({ day, mealType, food: null })
          continue
        }
        const totalWeight = eligible.reduce((s, f) => s + f.rating, 0)
        let roll = Math.random() * totalWeight
        let picked: Food = eligible[0]
        for (const f of eligible) {
          roll -= f.rating
          if (roll <= 0) {
            picked = f
            break
          }
        }
        usedInWeek.add(picked.id)
        plan.push({ day, mealType, food: picked })
      }
    }
    return plan
  }

  const weekPlan = generateWeek()
  const grouped: Record<string, { day: string; mealType: MealType; food: Food | null }[]> = {}
  for (const entry of weekPlan) {
    if (!grouped[entry.day]) grouped[entry.day] = []
    grouped[entry.day].push(entry)
  }

  function handleAcceptAll() {
    for (const entry of weekPlan) {
      if (entry.food) {
        onPick({
          id: String(Date.now()),
          foodId: entry.food.id,
          foodName: entry.food.name,
          mealType: entry.mealType,
          date: new Date().toISOString().slice(0, 10),
          timestamp: Date.now(),
        })
      }
    }
  }

  return (
    <div className="week-planner">
      <h2>Week Planner</h2>
      <p className="week-note">Generated plan — accept to add all to history.</p>
      <button className="btn-primary" onClick={handleAcceptAll}>Accept All to History</button>
      <div className="week-grid">
        {DAYS.map(day => (
          <div key={day} className="day-column">
            <h3>{day}</h3>
            {grouped[day].map(entry => (
              <div key={`${entry.day}-${entry.mealType}`} className={`day-meal ${!entry.food ? 'empty' : ''}`}>
                <span className="meal-label">{MEAL_LABELS[entry.mealType]}</span>
                <span className="meal-food">{entry.food ? entry.food.name : '—'}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
