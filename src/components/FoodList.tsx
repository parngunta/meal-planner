import type { Food } from '../types'
import { MEAL_LABELS, MEAL_EMOJIS } from '../types'
import { FoodOnDishIcon } from './FoodIcon'

interface FoodListProps {
  foods: Food[]
  onDelete: (id: string) => void
}

export default function FoodList({ foods, onDelete }: FoodListProps) {
  if (foods.length === 0) {
    return (
      <div className="food-list">
        <h2>My Foods</h2>
        <p className="empty-state">No foods yet. Add some!</p>
      </div>
    )
  }

  return (
    <div className="food-list">
      <h2>My Foods ({foods.length})</h2>
      <div className="food-grid">
        {foods.map(f => (
          <div key={f.id} className="food-card">
            <div className="food-card-header">
              <span className="food-name">{f.name}</span>
              <button className="btn-icon" onClick={() => onDelete(f.id)} title="Delete">
                <FoodOnDishIcon />
              </button>
            </div>
            <div className="food-card-details">
              <div className="detail-row">
                <span>{f.mealTypes.map(m => `${MEAL_EMOJIS[m]} ${MEAL_LABELS[m]}`).join(' · ')}</span>
              </div>
              {f.cuisine && (
                <div className="detail-row">
                  <span className="detail-label">Cuisine:</span>
                  <span>{f.cuisine}</span>
                </div>
              )}
              <div className="detail-row stars-row">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= f.rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
