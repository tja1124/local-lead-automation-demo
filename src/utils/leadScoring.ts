import type { Activity } from '../types/activity'
import type { FollowUpTask } from '../types/task'
import type { Lead, LeadSource, LeadStatus } from '../types/lead'
import { getTaskStatus } from './tasks'

export type LeadScoreTier = 'Hot' | 'Warm' | 'Cold'

const SOURCE_WEIGHTS: Record<LeadSource, number> = {
  Referral: 14,
  'Google Business Profile': 12,
  'Website Form': 10,
  'Facebook Ad': 8,
  'Missed Call': 4,
}

const STATUS_WEIGHTS: Record<LeadStatus, number> = {
  New: 6,
  Contacted: 14,
  'Quote Sent': 22,
  Scheduled: 30,
  Completed: 35,
  Lost: 0,
}

const PRIORITY_WEIGHTS = { High: 12, Medium: 7, Low: 3 } as const

function daysBetween(start: string, end: string): number {
  const startMs = new Date(`${start}T12:00:00`).getTime()
  const endMs = new Date(`${end}T12:00:00`).getTime()
  return Math.max(0, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)))
}

function daysSince(dateStr: string): number {
  const today = new Date().toISOString().slice(0, 10)
  return daysBetween(dateStr, today)
}

function valueScore(value: number): number {
  return Math.min(28, Math.round((value / 1800) * 28))
}

function responsivenessScore(lead: Lead): number {
  if (lead.status === 'Lost' || lead.status === 'Completed') return 0

  if (lead.lastContacted) {
    const responseDays = daysBetween(lead.requestedDate, lead.lastContacted)
    if (responseDays <= 1) return 14
    if (responseDays <= 3) return 10
    return 6
  }

  const age = daysSince(lead.requestedDate)
  if (age <= 1) return 10
  if (age <= 3) return 6
  if (age <= 7) return 3
  return 0
}

function followUpScore(lead: Lead, tasks: FollowUpTask[]): number {
  if (lead.status === 'Lost' || lead.status === 'Completed') return 0

  const leadTasks = tasks.filter((task) => task.leadId === lead.id)
  const pending = leadTasks.filter((task) => !task.completed)
  const hasOverdue = pending.some((task) => getTaskStatus(task) === 'overdue')

  if (hasOverdue) return 3
  if (pending.length === 0 && ['Contacted', 'Quote Sent'].includes(lead.status)) return 8
  if (pending.length > 0) return 6
  if (lead.status === 'New' && lead.lastContacted === null) return 5
  return 8
}

function engagementScore(activities: Activity[]): number {
  return Math.min(8, activities.length * 2)
}

export function calculateLeadScore(
  lead: Lead,
  activities: Activity[] = [],
  tasks: FollowUpTask[] = [],
): number {
  if (lead.status === 'Lost') return Math.max(5, Math.round(valueScore(lead.estimatedValue) * 0.3))

  const leadActivities = activities.filter((entry) => entry.leadId === lead.id)

  const raw =
    valueScore(lead.estimatedValue) +
    SOURCE_WEIGHTS[lead.source] +
    STATUS_WEIGHTS[lead.status] +
    PRIORITY_WEIGHTS[lead.priority] +
    responsivenessScore(lead) +
    followUpScore(lead, tasks) +
    engagementScore(leadActivities)

  return Math.min(100, Math.max(0, Math.round(raw)))
}

export function getLeadScoreTier(score: number): LeadScoreTier {
  if (score >= 75) return 'Hot'
  if (score >= 50) return 'Warm'
  return 'Cold'
}

export function getScoreTierClasses(tier: LeadScoreTier): string {
  switch (tier) {
    case 'Hot':
      return 'bg-red-50 text-red-700 ring-red-600/20'
    case 'Warm':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20'
    case 'Cold':
      return 'bg-slate-100 text-slate-600 ring-slate-500/20'
  }
}

export function summarizeLeadScores(
  leads: Lead[],
  activities: Activity[],
  tasks: FollowUpTask[],
): { avgScore: number; hotCount: number; warmCount: number; coldCount: number } {
  if (leads.length === 0) {
    return { avgScore: 0, hotCount: 0, warmCount: 0, coldCount: 0 }
  }

  let total = 0
  let hotCount = 0
  let warmCount = 0
  let coldCount = 0

  for (const lead of leads) {
    if (lead.status === 'Lost') continue
    const score = calculateLeadScore(lead, activities, tasks)
    total += score
    const tier = getLeadScoreTier(score)
    if (tier === 'Hot') hotCount += 1
    else if (tier === 'Warm') warmCount += 1
    else coldCount += 1
  }

  const activeLeads = leads.filter((lead) => lead.status !== 'Lost').length
  return {
    avgScore: activeLeads > 0 ? Math.round(total / activeLeads) : 0,
    hotCount,
    warmCount,
    coldCount,
  }
}
