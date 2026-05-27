export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'drink']

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  drink: 'Drink',
}

export const MEAL_EMOJIS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍪',
  drink: '🥤',
}

export interface Food {
  id: string
  name: string
  mealTypes: MealType[]
  cuisine: string
  rating: number
  comment?: string
  createdAt: number
}

export interface HistoryEntry {
  id: string
  foodId: string
  foodName: string
  mealType: MealType
  date: string
  timestamp: number
}

export const CUISINE_OPTIONS = [
  'Italian',
  'Mexican',
  'Japanese',
  'Chinese',
  'Indian',
  'Thai',
  'American',
  'Mediterranean',
  'Korean',
  'Vietnamese',
  'French',
  'Middle Eastern',
]
