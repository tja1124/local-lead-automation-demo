import { mockLeads } from '../data/leads'
import type { Lead } from '../types/lead'

export const LEADS_STORAGE_KEY = 'leadflow-demo-leads'

function isValidLead(value: unknown): value is Lead {
  if (typeof value !== 'object' || value === null) return false

  const lead = value as Record<string, unknown>

  return (
    typeof lead.id === 'string' &&
    typeof lead.name === 'string' &&
    typeof lead.phone === 'string' &&
    typeof lead.email === 'string' &&
    typeof lead.vehicle === 'string' &&
    typeof lead.serviceInterest === 'string' &&
    typeof lead.status === 'string' &&
    typeof lead.source === 'string' &&
    typeof lead.estimatedValue === 'number' &&
    typeof lead.requestedDate === 'string' &&
    (lead.lastContacted === null || typeof lead.lastContacted === 'string') &&
    typeof lead.priority === 'string' &&
    typeof lead.notes === 'string'
  )
}

function parseStoredLeads(raw: string): Lead[] | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    if (!parsed.every(isValidLead)) return null
    return parsed
  } catch {
    return null
  }
}

export function loadLeadsFromStorage(): Lead[] {
  if (typeof window === 'undefined') return [...mockLeads]

  try {
    const raw = window.localStorage.getItem(LEADS_STORAGE_KEY)
    if (!raw) return [...mockLeads]

    const stored = parseStoredLeads(raw)
    return stored ?? [...mockLeads]
  } catch {
    return [...mockLeads]
  }
}

export function saveLeadsToStorage(leads: Lead[]): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads))
  } catch {
    // Ignore quota or privacy mode errors in the demo.
  }
}

export function clearLeadsStorage(): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(LEADS_STORAGE_KEY)
  } catch {
    // Ignore storage errors in the demo.
  }
}

export function getDefaultLeads(): Lead[] {
  return [...mockLeads]
}
