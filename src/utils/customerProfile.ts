import type { Activity } from '../types/activity'
import type { FollowUpTask } from '../types/task'
import type { Lead, LeadStatus } from '../types/lead'
import { calculateLeadScore, getLeadScoreTier } from './leadScoring'

export interface CustomerProfile {
  estimatedLifetimeValue: number
  totalInteractions: number
  customerTags: string[]
  preferredService: string
  lastContactDate: string | null
  leadScore: number
  scoreTier: ReturnType<typeof getLeadScoreTier>
  daysInPipeline: number
}

const REPEAT_SERVICE_MULTIPLIER: Record<Lead['serviceInterest'], number> = {
  'Ceramic Coating': 2.4,
  'Paint Correction': 2.1,
  'Full Detail Package': 1.9,
  'Full Interior Detail': 1.6,
  'Maintenance Wash': 3.2,
  'Fleet Detail': 2.8,
}

function daysSince(dateStr: string): number {
  const today = new Date().toISOString().slice(0, 10)
  const startMs = new Date(`${dateStr}T12:00:00`).getTime()
  const endMs = new Date(`${today}T12:00:00`).getTime()
  return Math.max(0, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)))
}

function deriveTags(lead: Lead, score: number, pendingTasks: number): string[] {
  const tags: string[] = []

  if (score >= 75) tags.push('High intent')
  if (lead.estimatedValue >= 800) tags.push('High value')
  if (lead.source === 'Referral') tags.push('Referral')
  if (lead.source === 'Facebook Ad') tags.push('Paid lead')
  if (lead.priority === 'High') tags.push('Priority')
  if (lead.status === 'Scheduled') tags.push('Booked')
  if (lead.status === 'Completed') tags.push('Repeat candidate')
  if (pendingTasks > 0) tags.push('Follow-up due')
  if (lead.lastContacted === null && lead.status === 'New') tags.push('Uncontacted')

  return tags.slice(0, 4)
}

function statusProgress(status: LeadStatus): number {
  switch (status) {
    case 'New':
      return 0.15
    case 'Contacted':
      return 0.35
    case 'Quote Sent':
      return 0.55
    case 'Scheduled':
      return 0.8
    case 'Completed':
      return 1
    case 'Lost':
      return 0
  }
}

export function buildCustomerProfile(
  lead: Lead,
  activities: Activity[],
  tasks: FollowUpTask[],
): CustomerProfile {
  const leadActivities = activities.filter((entry) => entry.leadId === lead.id)
  const pendingTasks = tasks.filter((task) => task.leadId === lead.id && !task.completed).length
  const leadScore = calculateLeadScore(lead, activities, tasks)
  const repeatMultiplier = REPEAT_SERVICE_MULTIPLIER[lead.serviceInterest]
  const progress = statusProgress(lead.status)

  const estimatedLifetimeValue = Math.round(
    lead.estimatedValue * repeatMultiplier * (0.6 + progress * 0.4),
  )

  return {
    estimatedLifetimeValue,
    totalInteractions: leadActivities.length,
    customerTags: deriveTags(lead, leadScore, pendingTasks),
    preferredService: lead.serviceInterest,
    lastContactDate: lead.lastContacted,
    leadScore,
    scoreTier: getLeadScoreTier(leadScore),
    daysInPipeline: daysSince(lead.requestedDate),
  }
}
