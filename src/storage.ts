import type { Food, HistoryEntry } from './types'

const FOODS_KEY = 'food-selector-foods'
const HISTORY_KEY = 'food-selector-history'

export function loadFoods(): Food[] {
  try {
    const raw = localStorage.getItem(FOODS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

export function saveFoods(foods: Food[]): void {
  localStorage.setItem(FOODS_KEY, JSON.stringify(foods))
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

export function saveHistory(history: HistoryEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}
