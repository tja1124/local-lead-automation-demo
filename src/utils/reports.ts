import { businessName } from '../data/navigation'
import type { Lead, LeadSource, LeadStatus, ServiceInterest } from '../types/lead'
import { formatCurrency } from './format'
import {
  countByStatus,
  getCompletedRevenue,
  getPipelineValue,
  getRecentLeads,
} from './leadMetrics'

const ALL_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Quote Sent',
  'Scheduled',
  'Completed',
  'Lost',
]

export interface ReportSummary {
  totalLeads: number
  openPipelineValue: number
  completedRevenue: number
  lostPipelineValue: number
  winRate: number
  averageLeadValue: number
}

export interface CountValueRow {
  label: string
  count: number
  value: number
}

export interface ReportRecommendation {
  id: string
  title: string
  description: string
}

export function getReportSummary(leads: Lead[]): ReportSummary {
  const totalLeads = leads.length
  const lostLeads = leads.filter((lead) => lead.status === 'Lost')
  const totalValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0)

  return {
    totalLeads,
    openPipelineValue: getPipelineValue(leads),
    completedRevenue: getCompletedRevenue(leads),
    lostPipelineValue: lostLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0),
    winRate: totalLeads > 0 ? ((totalLeads - lostLeads.length) / totalLeads) * 100 : 0,
    averageLeadValue: totalLeads > 0 ? totalValue / totalLeads : 0,
  }
}

export function getStatusBreakdown(leads: Lead[]): CountValueRow[] {
  const counts = countByStatus(leads)

  return ALL_STATUSES.map((status) => ({
    label: status,
    count: counts[status],
    value: leads
      .filter((lead) => lead.status === status)
      .reduce((sum, lead) => sum + lead.estimatedValue, 0),
  }))
}

export function getSourceBreakdown(leads: Lead[]): CountValueRow[] {
  const sourceMap = new Map<LeadSource, { count: number; value: number }>()

  for (const lead of leads) {
    const current = sourceMap.get(lead.source) ?? { count: 0, value: 0 }
    sourceMap.set(lead.source, {
      count: current.count + 1,
      value: current.value + lead.estimatedValue,
    })
  }

  return [...sourceMap.entries()]
    .map(([label, data]) => ({ label, ...data }))
    .sort((a, b) => b.count - a.count || b.value - a.value)
}

export function getServiceValueBreakdown(leads: Lead[]): CountValueRow[] {
  const serviceMap = new Map<ServiceInterest, { count: number; value: number }>()

  for (const lead of leads) {
    const current = serviceMap.get(lead.serviceInterest) ?? { count: 0, value: 0 }
    serviceMap.set(lead.serviceInterest, {
      count: current.count + 1,
      value: current.value + lead.estimatedValue,
    })
  }

  return [...serviceMap.entries()]
    .map(([label, data]) => ({ label, ...data }))
    .sort((a, b) => b.value - a.value || b.count - a.count)
}

export function getRecentActivity(leads: Lead[], limit = 8): Lead[] {
  return getRecentLeads(leads, limit)
}

export function buildBusinessReportSummary(leads: Lead[]): string {
  if (leads.length === 0) {
    return `${businessName} has no lead data yet. Reports will populate as inquiries are captured.`
  }

  const summary = getReportSummary(leads)
  const topSource = getSourceBreakdown(leads)[0]
  const topService = getServiceValueBreakdown(leads)[0]
  const newCount = countByStatus(leads).New

  const sentences = [
    `${businessName} is tracking ${summary.totalLeads} leads with ${formatCurrency(summary.openPipelineValue)} in open pipeline and ${formatCurrency(summary.completedRevenue)} in completed revenue.`,
  ]

  if (topSource) {
    sentences.push(
      `${topSource.label} is the top lead source with ${topSource.count} ${topSource.count === 1 ? 'inquiry' : 'inquiries'}.`,
    )
  }

  if (topService) {
    sentences.push(
      `${topService.label} leads the service mix at ${formatCurrency(topService.value)} in estimated value.`,
    )
  }

  if (newCount > 0) {
    sentences.push(
      `${newCount} new ${newCount === 1 ? 'lead requires' : 'leads require'} outreach to protect conversion.`,
    )
  }

  return sentences.join(' ')
}

export function getReportRecommendations(leads: Lead[]): ReportRecommendation[] {
  if (leads.length === 0) {
    return [
      {
        id: 'add-leads',
        title: 'Capture leads to unlock reporting',
        description:
          'Add inquiries through the Leads page to see pipeline, source, and service performance metrics.',
      },
    ]
  }

  const recommendations: ReportRecommendation[] = []
  const summary = getReportSummary(leads)
  const sources = getSourceBreakdown(leads)
  const services = getServiceValueBreakdown(leads)
  const newCount = countByStatus(leads).New

  if (newCount > 0) {
    recommendations.push({
      id: 'convert-new-leads',
      title: 'Prioritize new lead response',
      description: `${newCount} new ${newCount === 1 ? 'lead is' : 'leads are'} waiting. Faster follow-up typically improves win rate for local service businesses.`,
    })
  }

  if (summary.lostPipelineValue > 0) {
    recommendations.push({
      id: 'reduce-lost-value',
      title: 'Recover lost pipeline value',
      description: `${formatCurrency(summary.lostPipelineValue)} in estimated value was lost. Review follow-up timing on quote and contacted leads.`,
    })
  }

  if (sources[0]) {
    recommendations.push({
      id: 'invest-top-source',
      title: `Double down on ${sources[0].label}`,
      description: `Your strongest source by volume is ${sources[0].label}. Consider increasing spend or referral incentives in this channel.`,
    })
  }

  if (services[0]) {
    recommendations.push({
      id: 'promote-top-service',
      title: `Promote ${services[0].label}`,
      description: `${services[0].label} drives the highest estimated value in your pipeline. Feature it in ads and website offers.`,
    })
  }

  return recommendations.slice(0, 4)
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}
