import { db, isConfigured } from './firebase'
import { ref, set, get, onValue, off, push, remove } from 'firebase/database'
import type { Food, HistoryEntry } from './types'

const ROOMS_KEY = 'food-selector-rooms'
const ROOM_PREFS_KEY = 'food-selector-room-prefs'
const PINNED_ROOMS_KEY = 'food-selector-pinned-rooms'
const ROOM_NAMES_KEY = 'food-selector-room-names'
const MAX_PINNED_ROOMS = 5

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function createRoom(): Promise<string> {
  if (!db || !isConfigured) throw new Error('Firebase not configured')
  let code = generateRoomCode()
  let exists = true
  while (exists) {
    const snapshot = await get(ref(db, `${ROOMS_KEY}/${code}`))
    if (snapshot.exists()) {
      code = generateRoomCode()
    } else {
      exists = false
    }
  }
  await set(ref(db, `${ROOMS_KEY}/${code}`), {
    createdAt: Date.now(),
    foods: {},
  })
  return code
}

export async function joinRoom(code: string): Promise<boolean> {
  if (!db || !isConfigured) throw new Error('Firebase not configured')
  const upper = code.toUpperCase().trim()
  const snapshot = await get(ref(db, `${ROOMS_KEY}/${upper}`))
  if (!snapshot.exists()) return false
  localStorage.setItem(ROOM_PREFS_KEY, upper)
  return true
}

export async function leaveRoom(): Promise<void> {
  stopListening()
  localStorage.removeItem(ROOM_PREFS_KEY)
}

export function getCurrentRoom(): string | null {
  return localStorage.getItem(ROOM_PREFS_KEY)
}

export function getPinnedRooms(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PINNED_ROOMS_KEY) || '[]')
  } catch {
    return []
  }
}

export function addPinnedRoom(code: string): string[] {
  const pinned = getPinnedRooms()
  const upper = code.toUpperCase().trim()
  if (pinned.includes(upper)) return pinned
  const updated = [upper, ...pinned].slice(0, MAX_PINNED_ROOMS)
  localStorage.setItem(PINNED_ROOMS_KEY, JSON.stringify(updated))
  return updated
}

export function removePinnedRoom(code: string): string[] {
  const upper = code.toUpperCase().trim()
  const updated = getPinnedRooms().filter(r => r !== upper)
  localStorage.setItem(PINNED_ROOMS_KEY, JSON.stringify(updated))
  return updated
}

export function isRoomPinned(code: string): boolean {
  return getPinnedRooms().includes(code.toUpperCase().trim())
}

export function getRoomNames(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(ROOM_NAMES_KEY) || '{}')
  } catch {
    return {}
  }
}

export function setRoomName(code: string, name: string): void {
  const names = getRoomNames()
  const upper = code.toUpperCase().trim()
  if (name.trim()) {
    names[upper] = name.trim()
  } else {
    delete names[upper]
  }
  localStorage.setItem(ROOM_NAMES_KEY, JSON.stringify(names))
}

export function getRoomName(code: string): string | null {
  const names = getRoomNames()
  const upper = code.toUpperCase().trim()
  return names[upper] || null
}

export async function addFoodToRoom(roomCode: string, food: Food): Promise<void> {
  if (!db || !isConfigured) throw new Error('Firebase not configured')
  await set(ref(db, `${ROOMS_KEY}/${roomCode}/foods/${food.id}`), food)
}

export async function removeFoodFromRoom(roomCode: string, foodId: string): Promise<void> {
  if (!db || !isConfigured) throw new Error('Firebase not configured')
  await remove(ref(db, `${ROOMS_KEY}/${roomCode}/foods/${foodId}`))
}

export async function addHistoryToRoom(roomCode: string, entry: HistoryEntry): Promise<void> {
  if (!db || !isConfigured) throw new Error('Firebase not configured')
  await set(ref(db, `${ROOMS_KEY}/${roomCode}/history/${entry.id}`), entry)
}

export async function removeHistoryFromRoom(roomCode: string, entryId: string): Promise<void> {
  if (!db || !isConfigured) throw new Error('Firebase not configured')
  await remove(ref(db, `${ROOMS_KEY}/${roomCode}/history/${entryId}`))
}

export async function clearRoomHistory(roomCode: string): Promise<void> {
  if (!db || !isConfigured) throw new Error('Firebase not configured')
  await remove(ref(db, `${ROOMS_KEY}/${roomCode}/history`))
}

export async function updateFoodToRoom(roomCode: string, food: Food): Promise<void> {
  if (!db || !isConfigured) throw new Error('Firebase not configured')
  await set(ref(db, `${ROOMS_KEY}/${roomCode}/foods/${food.id}`), food)
}

let currentListenerRoom: string | null = null

export function listenToRoom(roomCode: string, onUpdate: (foods: Food[], history: HistoryEntry[]) => void): () => void {
  if (!db || !isConfigured) return () => {}
  stopListening()
  currentListenerRoom = roomCode
  const foodsRef = ref(db, `${ROOMS_KEY}/${roomCode}/foods`)
  const historyRef = ref(db, `${ROOMS_KEY}/${roomCode}/history`)

  let currentFoods: Food[] = []
  let currentHistory: HistoryEntry[] = []

  function emitUpdate() {
    onUpdate(currentFoods, currentHistory)
  }

  onValue(foodsRef, (snapshot) => {
    const data = snapshot.val()
    currentFoods = data ? Object.values(data) : []
    emitUpdate()
  })

  onValue(historyRef, (snapshot) => {
    const data = snapshot.val()
    currentHistory = data ? Object.values(data) : []
    emitUpdate()
  })

  return () => stopListening()
}

export function stopListening(): void {
  if (!db || !currentListenerRoom) return
  const foodsRef = ref(db, `${ROOMS_KEY}/${currentListenerRoom}/foods`)
  const historyRef = ref(db, `${ROOMS_KEY}/${currentListenerRoom}/history`)
  off(foodsRef)
  off(historyRef)
  currentListenerRoom = null
}