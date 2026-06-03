import type { Activity, ActivityCategory, ActivityType } from '../types/activity'
import type { Lead } from '../types/lead'

export function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getActivityCategory(type: ActivityType): ActivityCategory {
  switch (type) {
    case 'lead_created':
      return 'lead'
    case 'status_changed':
    case 'quote_sent':
    case 'follow_up_scheduled':
    case 'job_completed':
      return 'pipeline'
    case 'review_requested':
      return 'review'
    case 'automation_triggered':
      return 'automation'
  }
}

export function getActivityLabel(type: ActivityType): string {
  switch (type) {
    case 'lead_created':
      return 'Lead created'
    case 'status_changed':
      return 'Status updated'
    case 'quote_sent':
      return 'Quote sent'
    case 'follow_up_scheduled':
      return 'Follow-up scheduled'
    case 'job_completed':
      return 'Job completed'
    case 'review_requested':
      return 'Review requested'
    case 'automation_triggered':
      return 'Automation triggered'
  }
}

export function getActivityCategoryClasses(category: ActivityCategory): string {
  switch (category) {
    case 'lead':
      return 'bg-blue-50 text-blue-700 ring-blue-600/20'
    case 'pipeline':
      return 'bg-violet-50 text-violet-700 ring-violet-600/20'
    case 'automation':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20'
    case 'review':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
  }
}

export function generateActivityId(): string {
  return `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function createActivity(
  input: Omit<Activity, 'id' | 'timestamp'> & { timestamp?: string },
): Activity {
  return {
    id: generateActivityId(),
    timestamp: input.timestamp ?? new Date().toISOString(),
    ...input,
  }
}

export function sortActivitiesNewestFirst(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export function getActivitiesForLead(activities: Activity[], leadId: string): Activity[] {
  return sortActivitiesNewestFirst(activities.filter((activity) => activity.leadId === leadId))
}

export function seedActivitiesFromLeads(leads: Lead[]): Activity[] {
  const seeded: Activity[] = []

  for (const lead of leads) {
    seeded.push(
      createActivity({
        leadId: lead.id,
        leadName: lead.name,
        type: 'lead_created',
        message: `${lead.name} submitted a ${lead.serviceInterest.toLowerCase()} inquiry.`,
        timestamp: `${lead.requestedDate}T09:00:00.000Z`,
      }),
    )

    if (lead.lastContacted) {
      seeded.push(
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'status_changed',
          message: `Follow-up logged for ${lead.name}.`,
          timestamp: `${lead.lastContacted}T14:00:00.000Z`,
          fromStatus: 'New',
          toStatus: lead.status,
        }),
      )
    }

    if (lead.status === 'Quote Sent') {
      seeded.push(
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'quote_sent',
          message: `Detail quote sent to ${lead.name} for ${lead.vehicle}.`,
          timestamp: `${lead.lastContacted ?? lead.requestedDate}T15:30:00.000Z`,
        }),
      )
    }

    if (lead.status === 'Scheduled') {
      seeded.push(
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'automation_triggered',
          message: `Appointment confirmation prepared for ${lead.name}.`,
          timestamp: `${lead.lastContacted ?? lead.requestedDate}T16:00:00.000Z`,
        }),
      )
    }

    if (lead.status === 'Completed') {
      seeded.push(
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'job_completed',
          message: `${lead.serviceInterest} completed for ${lead.name}.`,
          timestamp: `${lead.lastContacted ?? lead.requestedDate}T17:00:00.000Z`,
        }),
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'review_requested',
          message: `Google review request queued for ${lead.name}.`,
          timestamp: `${lead.lastContacted ?? lead.requestedDate}T17:15:00.000Z`,
        }),
      )
    }
  }

  return sortActivitiesNewestFirst(seeded)
}

export function formatActivityTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return timestamp

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
