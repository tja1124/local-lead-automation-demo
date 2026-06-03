import type { Activity } from '../types/activity'
import type { Lead, LeadStatus } from '../types/lead'
import type { LeadCrmAction } from '../types/leadOperations'
import { createActivity } from './activities'

export interface LeadActionResult {
  updatedLead: Lead
  activities: Activity[]
}

export function getAvailableLeadActions(status: LeadStatus): LeadCrmAction[] {
  switch (status) {
    case 'New':
      return ['mark_contacted', 'schedule_follow_up', 'send_quote', 'mark_lost']
    case 'Contacted':
      return ['schedule_follow_up', 'send_quote', 'mark_booked', 'mark_lost']
    case 'Quote Sent':
      return ['schedule_follow_up', 'mark_booked', 'mark_lost']
    case 'Scheduled':
      return ['complete_job', 'mark_lost']
    case 'Completed':
      return []
    case 'Lost':
      return []
  }
}

export function getLeadActionLabel(action: LeadCrmAction): string {
  switch (action) {
    case 'mark_contacted':
      return 'Mark contacted'
    case 'schedule_follow_up':
      return 'Schedule follow-up'
    case 'send_quote':
      return 'Send quote'
    case 'mark_booked':
      return 'Mark booked'
    case 'complete_job':
      return 'Complete job'
    case 'mark_lost':
      return 'Mark lost'
  }
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function applyLeadAction(lead: Lead, action: LeadCrmAction): LeadActionResult {
  const today = todayDate()
  const fromStatus = lead.status
  const activities: Activity[] = []

  let updatedLead: Lead = { ...lead }

  switch (action) {
    case 'mark_contacted':
      updatedLead = {
        ...lead,
        status: 'Contacted',
        lastContacted: today,
      }
      activities.push(
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'status_changed',
          message: `Initial contact made with ${lead.name} about their ${lead.serviceInterest.toLowerCase()} request.`,
          fromStatus,
          toStatus: 'Contacted',
        }),
      )
      break

    case 'schedule_follow_up':
      updatedLead = {
        ...lead,
        lastContacted: today,
      }
      activities.push(
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'follow_up_scheduled',
          message: `Follow-up scheduled for ${lead.name} — call or text tomorrow.`,
        }),
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'automation_triggered',
          message: `Speed-to-lead reminder queued for ${lead.name}.`,
        }),
      )
      break

    case 'send_quote':
      updatedLead = {
        ...lead,
        status: 'Quote Sent',
        lastContacted: today,
      }
      activities.push(
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'quote_sent',
          message: `Detail quote emailed to ${lead.name} for ${lead.vehicle}.`,
          fromStatus,
          toStatus: 'Quote Sent',
        }),
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'automation_triggered',
          message: `Quote follow-up automation armed for ${lead.name}.`,
        }),
      )
      break

    case 'mark_booked':
      updatedLead = {
        ...lead,
        status: 'Scheduled',
        lastContacted: today,
      }
      activities.push(
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'status_changed',
          message: `${lead.name} booked a ${lead.serviceInterest.toLowerCase()} appointment.`,
          fromStatus,
          toStatus: 'Scheduled',
        }),
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'automation_triggered',
          message: `Appointment confirmation prepared for ${lead.name}.`,
        }),
      )
      break

    case 'complete_job':
      updatedLead = {
        ...lead,
        status: 'Completed',
        lastContacted: today,
      }
      activities.push(
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'job_completed',
          message: `${lead.serviceInterest} completed for ${lead.name}'s ${lead.vehicle}.`,
          fromStatus,
          toStatus: 'Completed',
        }),
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'review_requested',
          message: `Google review request queued for ${lead.name}.`,
        }),
      )
      break

    case 'mark_lost':
      updatedLead = {
        ...lead,
        status: 'Lost',
        lastContacted: today,
      }
      activities.push(
        createActivity({
          leadId: lead.id,
          leadName: lead.name,
          type: 'status_changed',
          message: `${lead.name} marked as lost — moved out of active pipeline.`,
          fromStatus,
          toStatus: 'Lost',
        }),
      )
      break
  }

  return { updatedLead, activities }
}
