import type { Lead, LeadStatus } from '../types/lead'

export interface PipelineColumn {
  status: LeadStatus
  label: string
}

export const PIPELINE_COLUMNS: PipelineColumn[] = [
  { status: 'New', label: 'New' },
  { status: 'Contacted', label: 'Contacted' },
  { status: 'Quote Sent', label: 'Quoted' },
  { status: 'Scheduled', label: 'Booked' },
  { status: 'Completed', label: 'Completed' },
  { status: 'Lost', label: 'Lost' },
]

export function groupLeadsByPipelineColumn(leads: Lead[]): Record<LeadStatus, Lead[]> {
  const groups = Object.fromEntries(
    PIPELINE_COLUMNS.map((column) => [column.status, [] as Lead[]]),
  ) as Record<LeadStatus, Lead[]>

  for (const lead of leads) {
    groups[lead.status].push(lead)
  }

  for (const status of PIPELINE_COLUMNS.map((column) => column.status)) {
    groups[status].sort((a, b) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 }
      const priorityCompare = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityCompare !== 0) return priorityCompare
      return b.estimatedValue - a.estimatedValue
    })
  }

  return groups
}

export function getAdjacentPipelineStatus(status: LeadStatus): {
  prev: LeadStatus | null
  next: LeadStatus | null
} {
  const index = PIPELINE_COLUMNS.findIndex((column) => column.status === status)
  return {
    prev: index > 0 ? PIPELINE_COLUMNS[index - 1].status : null,
    next: index >= 0 && index < PIPELINE_COLUMNS.length - 1 ? PIPELINE_COLUMNS[index + 1].status : null,
  }
}

export function getPipelineColumnLabel(status: LeadStatus): string {
  return PIPELINE_COLUMNS.find((column) => column.status === status)?.label ?? status
}

export function getPipelineHealthScore(leads: Lead[]): number {
  if (leads.length === 0) return 0

  const active = leads.filter((lead) => lead.status !== 'Lost')
  if (active.length === 0) return 0

  const weights: Record<LeadStatus, number> = {
    New: 0.4,
    Contacted: 0.55,
    'Quote Sent': 0.7,
    Scheduled: 0.85,
    Completed: 1,
    Lost: 0,
  }

  const total = active.reduce((sum, lead) => sum + weights[lead.status], 0)
  return Math.round((total / active.length) * 100)
}
