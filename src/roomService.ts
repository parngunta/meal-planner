import { db, isConfigured } from './firebase'
import { ref, set, get, onValue, off, push, remove } from 'firebase/database'
import type { Food } from './types'

const ROOMS_KEY = 'food-selector-rooms'
const ROOM_PREFS_KEY = 'food-selector-room-prefs'

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

export async function addFoodToRoom(roomCode: string, food: Food): Promise<void> {
  if (!db || !isConfigured) throw new Error('Firebase not configured')
  await set(ref(db, `${ROOMS_KEY}/${roomCode}/foods/${food.id}`), food)
}

export async function removeFoodFromRoom(roomCode: string, foodId: string): Promise<void> {
  if (!db || !isConfigured) throw new Error('Firebase not configured')
  await remove(ref(db, `${ROOMS_KEY}/${roomCode}/foods/${foodId}`))
}

let currentListenerRoom: string | null = null

export function listenToRoom(roomCode: string, onUpdate: (foods: Food[]) => void): () => void {
  if (!db || !isConfigured) return () => {}
  stopListening()
  const roomRef = ref(db, `${ROOMS_KEY}/${roomCode}/foods`)
  currentListenerRoom = roomCode
  onValue(roomRef, (snapshot) => {
    const data = snapshot.val()
    if (!data) {
      onUpdate([])
      return
    }
    const foods: Food[] = Object.values(data)
    onUpdate(foods)
  })
  return () => stopListening()
}

export function stopListening(): void {
  if (!db || !currentListenerRoom) return
  const roomRef = ref(db, `${ROOMS_KEY}/${currentListenerRoom}/foods`)
  off(roomRef)
  currentListenerRoom = null
}