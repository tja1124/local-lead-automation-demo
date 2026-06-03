import type { FollowUpTask } from '../types/task'
import type { Lead } from '../types/lead'
import { getTaskStatus } from './tasks'

export type LeadUrgencyKind = 'overdue' | 'hot' | 'awaiting_response' | 'aging'

export interface LeadUrgency {
  kind: LeadUrgencyKind
  label: string
  detail: string
}

function daysSince(dateStr: string): number {
  const today = new Date().toISOString().slice(0, 10)
  const startMs = new Date(`${dateStr}T12:00:00`).getTime()
  const endMs = new Date(`${today}T12:00:00`).getTime()
  return Math.max(0, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)))
}

export function getLeadAgeDays(lead: Lead): number {
  return daysSince(lead.requestedDate)
}

function hasOverdueTask(lead: Lead, tasks: FollowUpTask[]): boolean {
  return tasks.some(
    (task) => task.leadId === lead.id && !task.completed && getTaskStatus(task) === 'overdue',
  )
}

export function getLeadUrgency(
  lead: Lead,
  tasks: FollowUpTask[],
  score: number,
): LeadUrgency | null {
  if (lead.status === 'Completed' || lead.status === 'Lost') return null

  const ageDays = getLeadAgeDays(lead)

  if (hasOverdueTask(lead, tasks)) {
    return {
      kind: 'overdue',
      label: 'Overdue',
      detail: 'Follow-up task is past due',
    }
  }

  if (score >= 75) {
    return {
      kind: 'hot',
      label: 'Hot lead',
      detail: 'High conversion potential',
    }
  }

  if (lead.status === 'Quote Sent') {
    return {
      kind: 'awaiting_response',
      label: 'Awaiting response',
      detail: 'Quote sent — waiting on customer',
    }
  }

  if (lead.status === 'New' && lead.lastContacted === null && ageDays >= 2) {
    return {
      kind: 'aging',
      label: `${ageDays}d old`,
      detail: 'New inquiry needs first contact',
    }
  }

  if (lead.status === 'Contacted' && ageDays >= 5) {
    return {
      kind: 'aging',
      label: `${ageDays}d in pipeline`,
      detail: 'Contacted lead needs next step',
    }
  }

  return null
}

export function getUrgencyBadgeClasses(kind: LeadUrgencyKind): string {
  switch (kind) {
    case 'overdue':
      return 'bg-red-50 text-red-700 ring-red-600/20'
    case 'hot':
      return 'bg-orange-50 text-orange-700 ring-orange-600/20'
    case 'awaiting_response':
      return 'bg-violet-50 text-violet-700 ring-violet-600/20'
    case 'aging':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20'
  }
}

export function formatLeadAge(lead: Lead): string {
  const days = getLeadAgeDays(lead)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day'
  return `${days} days`
}
