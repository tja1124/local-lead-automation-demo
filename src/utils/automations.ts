import type { Lead } from '../types/lead'

export interface AutomationWorkflow {
  id: string
  name: string
  trigger: string
  action: string
  status: 'Active'
  affectedCount: number
  businessValue: string
}

export interface AutomationActivityItem {
  id: string
  leadId: string
  leadName: string
  message: string
  workflowName: string
  sortDate: string
}

export interface AutomationRecommendation {
  id: string
  title: string
  description: string
  leadCount: number
  leadNames: string[]
}

const WORKFLOW_DEFINITIONS = [
  {
    id: 'speed-to-lead',
    name: 'New Lead Speed-to-Lead',
    trigger: 'New lead submitted',
    action: 'Send instant text + owner notification',
    match: (lead: Lead) => lead.status === 'New',
    businessValue:
      'Respond within 5 minutes to increase booking rates by up to 40% for local service businesses.',
    activityMessage: (name: string) => `Instant text queued for ${name}`,
  },
  {
    id: 'quote-follow-up',
    name: 'Quote Follow-Up',
    trigger: 'Quote Sent for 24 hours',
    action: 'Send quote reminder',
    match: (lead: Lead) => lead.status === 'Quote Sent',
    businessValue:
      'Automated quote reminders recover stalled deals before customers choose a competitor.',
    activityMessage: (name: string) => `Quote reminder ready for ${name}`,
  },
  {
    id: 'appointment-confirmation',
    name: 'Appointment Confirmation',
    trigger: 'Scheduled job',
    action: 'Send confirmation text',
    match: (lead: Lead) => lead.status === 'Scheduled',
    businessValue:
      'Confirmation texts reduce no-shows and keep your detail bay schedule full.',
    activityMessage: (name: string) => `Appointment confirmation prepared for ${name}`,
  },
  {
    id: 'review-request',
    name: 'Review Request',
    trigger: 'Completed job',
    action: 'Send Google review request',
    match: (lead: Lead) => lead.status === 'Completed',
    businessValue:
      'Review requests after completed jobs build local trust and improve Google rankings.',
    activityMessage: (name: string) => `Review request ready for ${name}`,
  },
  {
    id: 'lost-re-engagement',
    name: 'Lost Lead Re-Engagement',
    trigger: 'Lost lead after 14 days',
    action: 'Send win-back message',
    match: (lead: Lead) => lead.status === 'Lost',
    businessValue:
      'Win-back sequences recover 10–15% of lost leads with a timely, friendly check-in.',
    activityMessage: (name: string) => `Win-back sequence available for ${name}`,
  },
] as const

function sortLeadsByDate(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    const dateCompare = b.requestedDate.localeCompare(a.requestedDate)
    if (dateCompare !== 0) return dateCompare
    return a.id.localeCompare(b.id)
  })
}

export function getAutomationWorkflows(leads: Lead[]): AutomationWorkflow[] {
  return WORKFLOW_DEFINITIONS.map((workflow) => ({
    id: workflow.id,
    name: workflow.name,
    trigger: workflow.trigger,
    action: workflow.action,
    status: 'Active',
    affectedCount: leads.filter(workflow.match).length,
    businessValue: workflow.businessValue,
  }))
}

export function getAutomationActivityFeed(leads: Lead[]): AutomationActivityItem[] {
  const items: AutomationActivityItem[] = []

  for (const workflow of WORKFLOW_DEFINITIONS) {
    const matchingLeads = sortLeadsByDate(leads.filter(workflow.match))
    for (const lead of matchingLeads) {
      items.push({
        id: `${workflow.id}-${lead.id}`,
        leadId: lead.id,
        leadName: lead.name,
        message: workflow.activityMessage(lead.name),
        workflowName: workflow.name,
        sortDate: lead.requestedDate,
      })
    }
  }

  return items.sort((a, b) => {
    const dateCompare = b.sortDate.localeCompare(a.sortDate)
    if (dateCompare !== 0) return dateCompare
    return a.id.localeCompare(b.id)
  })
}

export function getAutomationRecommendations(leads: Lead[]): AutomationRecommendation[] {
  const newUncontacted = sortLeadsByDate(
    leads.filter((lead) => lead.status === 'New' && lead.lastContacted === null),
  )
  const quoteSent = sortLeadsByDate(leads.filter((lead) => lead.status === 'Quote Sent'))
  const completed = sortLeadsByDate(leads.filter((lead) => lead.status === 'Completed'))

  return [
    {
      id: 'new-uncontacted',
      title: 'Speed-to-lead opportunities',
      description: 'New leads with no contact yet — instant text automation can run now.',
      leadCount: newUncontacted.length,
      leadNames: newUncontacted.slice(0, 3).map((lead) => lead.name),
    },
    {
      id: 'quote-follow-up',
      title: 'Quote follow-ups due',
      description: 'Quote sent leads that would receive a 24-hour reminder automatically.',
      leadCount: quoteSent.length,
      leadNames: quoteSent.slice(0, 3).map((lead) => lead.name),
    },
    {
      id: 'review-requests',
      title: 'Review requests ready',
      description: 'Completed jobs ready for a Google review request message.',
      leadCount: completed.length,
      leadNames: completed.slice(0, 3).map((lead) => lead.name),
    },
  ].filter((item) => item.leadCount > 0)
}

export function getAutomationSummary(leads: Lead[]) {
  const workflows = getAutomationWorkflows(leads)
  const activityFeed = getAutomationActivityFeed(leads)
  const activeWorkflowCount = workflows.filter((w) => w.status === 'Active').length
  const leadsAffected = new Set(
    WORKFLOW_DEFINITIONS.flatMap((workflow) =>
      leads.filter(workflow.match).map((lead) => lead.id),
    ),
  ).size

  return {
    activeWorkflowCount,
    leadsAffected,
    queuedActions: activityFeed.length,
  }
}
