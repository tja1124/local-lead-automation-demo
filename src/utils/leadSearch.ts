import type { Lead } from '../types/lead'

const SEARCH_FIELDS: (keyof Lead)[] = [
  'name',
  'phone',
  'email',
  'vehicle',
  'serviceInterest',
  'source',
  'status',
]

export function searchLeads(leads: Lead[], query: string): Lead[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return leads

  return leads.filter((lead) =>
    SEARCH_FIELDS.some((field) => {
      const value = lead[field]
      return typeof value === 'string' && value.toLowerCase().includes(normalizedQuery)
    }),
  )
}
