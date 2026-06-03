export const TASK_COMPLETIONS_STORAGE_KEY = 'leadflow-demo-task-completions'

export type TaskCompletionMap = Record<string, { completed: boolean; completedAt: string | null }>

function isValidTaskCompletionMap(value: unknown): value is TaskCompletionMap {
  if (typeof value !== 'object' || value === null) return false

  return Object.values(value).every((entry) => {
    if (typeof entry !== 'object' || entry === null) return false
    const item = entry as Record<string, unknown>
    return (
      typeof item.completed === 'boolean' &&
      (item.completedAt === null || typeof item.completedAt === 'string')
    )
  })
}

export function loadTaskCompletionsFromStorage(): TaskCompletionMap {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(TASK_COMPLETIONS_STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return isValidTaskCompletionMap(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function saveTaskCompletionsToStorage(completions: TaskCompletionMap): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(TASK_COMPLETIONS_STORAGE_KEY, JSON.stringify(completions))
  } catch {
    // Ignore storage errors in the demo.
  }
}

export function clearTaskCompletionsStorage(): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(TASK_COMPLETIONS_STORAGE_KEY)
  } catch {
    // Ignore storage errors in the demo.
  }
}
