import type { Lead, LeadStatus } from '../types/lead'
import { formatCurrency } from './format'

const ALL_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Quote Sent',
  'Scheduled',
  'Completed',
  'Lost',
]

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 } as const

export function isPipelineLead(lead: Lead): boolean {
  return lead.status !== 'Completed' && lead.status !== 'Lost'
}

export function countByStatus(leads: Lead[]): Record<LeadStatus, number> {
  const counts = Object.fromEntries(ALL_STATUSES.map((status) => [status, 0])) as Record<
    LeadStatus,
    number
  >

  for (const lead of leads) {
    counts[lead.status] += 1
  }

  return counts
}

export function getPipelineValue(leads: Lead[]): number {
  return leads.filter(isPipelineLead).reduce((sum, lead) => sum + lead.estimatedValue, 0)
}

export function getCompletedRevenue(leads: Lead[]): number {
  return leads
    .filter((lead) => lead.status === 'Completed')
    .reduce((sum, lead) => sum + lead.estimatedValue, 0)
}

export function getRecentLeads(leads: Lead[], limit: number): Lead[] {
  return [...leads]
    .sort((a, b) => {
      const dateCompare = b.requestedDate.localeCompare(a.requestedDate)
      if (dateCompare !== 0) return dateCompare
      return a.id.localeCompare(b.id)
    })
    .slice(0, limit)
}

export interface FollowUpItem {
  lead: Lead
  reason: string
}

function getFollowUpReason(lead: Lead): string | null {
  if (lead.status === 'New' && lead.lastContacted === null) {
    return 'New inquiry, no contact yet'
  }
  if (lead.status === 'Contacted') {
    return 'Contacted, needs next step'
  }
  if (lead.status === 'Quote Sent') {
    return 'Quote sent, follow-up recommended'
  }
  return null
}

function getFollowUpTier(lead: Lead): number | null {
  if (lead.status === 'New' && lead.lastContacted === null) return 1
  if (lead.status === 'Contacted') return 2
  if (lead.status === 'Quote Sent') return 3
  return null
}

export function getFollowUpLeads(leads: Lead[], limit: number): FollowUpItem[] {
  return leads
    .flatMap((lead) => {
      const reason = getFollowUpReason(lead)
      const tier = getFollowUpTier(lead)
      if (!reason || tier === null) return []
      return [{ lead, reason, tier }]
    })
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier
      const priorityDiff =
        PRIORITY_ORDER[a.lead.priority] - PRIORITY_ORDER[b.lead.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.lead.requestedDate.localeCompare(a.lead.requestedDate)
    })
    .slice(0, limit)
    .map(({ lead, reason }) => ({ lead, reason }))
}

export function countFollowUpLeads(leads: Lead[]): number {
  return leads.filter((lead) => getFollowUpReason(lead) !== null).length
}

export function buildBusinessHealthSummary(leads: Lead[], businessName: string): string {
  const pipelineLeads = leads.filter(isPipelineLead)
  const pipelineValue = getPipelineValue(leads)
  const newCount = leads.filter((lead) => lead.status === 'New').length
  const followUpCount = countFollowUpLeads(leads)

  const sentences: string[] = [
    `${businessName} has ${pipelineLeads.length} active leads with ${formatCurrency(pipelineValue)} in open pipeline.`,
  ]

  if (newCount > 0) {
    sentences.push(
      `${newCount} new ${newCount === 1 ? 'inquiry is' : 'inquiries are'} waiting for first contact.`,
    )
  }

  if (followUpCount > 0) {
    sentences.push(
      `${followUpCount} ${followUpCount === 1 ? 'lead needs' : 'leads need'} follow-up to prevent missed bookings.`,
    )
  } else {
    sentences.push('The follow-up queue is clear for today.')
  }

  return sentences.join(' ')
}
