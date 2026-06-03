import type { Activity } from '../types/activity'

export const ACTIVITIES_STORAGE_KEY = 'leadflow-demo-activities'

function isValidActivity(value: unknown): value is Activity {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.leadId === 'string' &&
    typeof item.leadName === 'string' &&
    typeof item.type === 'string' &&
    typeof item.message === 'string' &&
    typeof item.timestamp === 'string'
  )
}

export function loadActivitiesFromStorage(): Activity[] | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(ACTIVITIES_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isValidActivity)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveActivitiesToStorage(activities: Activity[]): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities))
  } catch {
    // Ignore storage errors in the demo.
  }
}

export function clearActivitiesStorage(): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(ACTIVITIES_STORAGE_KEY)
  } catch {
    // Ignore storage errors in the demo.
  }
}
