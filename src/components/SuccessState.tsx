import { useEffect, useState } from 'react'
import type { Food, MealType } from '../types'
import { MEAL_LABELS, MEAL_EMOJIS } from '../types'

interface SuccessStateProps {
  food: Food
  mealType: MealType
  onViewHistory: () => void
  onDone: () => void
}

export default function SuccessState({ food, mealType, onViewHistory, onDone }: SuccessStateProps) {
  const [visible, setVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [checkScale, setCheckScale] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => {
      setVisible(true)
      setTimeout(() => setCheckScale(true), 150)
      setTimeout(() => setShowConfetti(true), 300)
    })
  }, [])

  return (
    <div className={`success-overlay ${visible ? 'visible' : ''}`}>
      {showConfetti && <Confetti />}
      <div className={`success-card ${visible ? 'visible' : ''}`}>
        <div className={`success-check-wrap ${checkScale ? 'scaled' : ''}`}>
          <div className="success-check-circle">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <h3 className="success-title">Added to history!</h3>

        <div className="success-meal-card">
          <span className="success-meal-emoji">{MEAL_EMOJIS[mealType]}</span>
          <div className="success-meal-info">
            <span className="success-meal-name">{food.name}</span>
            <span className="success-meal-type">{MEAL_LABELS[mealType]}</span>
          </div>
        </div>

        <div className="success-actions">
          <button className="success-btn-secondary" onClick={onViewHistory}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            View History
          </button>
          <button className="success-btn-primary" onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function Confetti() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.2 + Math.random() * 1,
    size: 4 + Math.random() * 6,
    color: ['#D94432', '#E8683A', '#FFD4B8', '#5EA838', '#BFAB8E'][Math.floor(Math.random() * 5)],
    rotation: Math.random() * 360,
    drift: (Math.random() - 0.5) * 40,
  }))

  return (
    <div className="confetti-container">
      {particles.map(p => (
        <span
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
            '--rotation': `${p.rotation}deg`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}