import type { Activity } from '../types/activity'
import type { FollowUpTask } from '../types/task'
import type { Lead, LeadSource, ServiceInterest } from '../types/lead'
import { formatCurrency } from './format'
import { calculateLeadScore, getLeadScoreTier } from './leadScoring'
import { countByStatus, getPipelineValue } from './leadMetrics'

export type InsightTone = 'positive' | 'neutral' | 'warning' | 'action'

export interface BusinessInsight {
  id: string
  title: string
  detail: string
  tone: InsightTone
}

function getSourceValueTotals(leads: Lead[]): Array<{ source: LeadSource; value: number; count: number }> {
  const map = new Map<LeadSource, { value: number; count: number }>()

  for (const lead of leads) {
    if (lead.status === 'Lost') continue
    const existing = map.get(lead.source) ?? { value: 0, count: 0 }
    map.set(lead.source, {
      value: existing.value + lead.estimatedValue,
      count: existing.count + 1,
    })
  }

  return [...map.entries()]
    .map(([source, stats]) => ({ source, ...stats }))
    .sort((a, b) => b.value - a.value)
}

function getServiceCloseRates(leads: Lead[]): Array<{ service: ServiceInterest; rate: number; total: number }> {
  const totals = new Map<ServiceInterest, { closed: number; total: number }>()

  for (const lead of leads) {
    const existing = totals.get(lead.serviceInterest) ?? { closed: 0, total: 0 }
    totals.set(lead.serviceInterest, {
      closed: existing.closed + (lead.status === 'Completed' ? 1 : 0),
      total: existing.total + 1,
    })
  }

  return [...totals.entries()]
    .map(([service, stats]) => ({
      service,
      rate: stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0,
      total: stats.total,
    }))
    .filter((entry) => entry.total >= 2)
    .sort((a, b) => b.rate - a.rate)
}

function countFollowUpsDueToday(tasks: FollowUpTask[]): number {
  const today = new Date().toISOString().slice(0, 10)
  return tasks.filter((task) => !task.completed && task.dueDate <= today).length
}

function countHotLeads(leads: Lead[], activities: Activity[], tasks: FollowUpTask[]): number {
  return leads.filter((lead) => {
    if (lead.status === 'Lost' || lead.status === 'Completed') return false
    const score = calculateLeadScore(lead, activities, tasks)
    return getLeadScoreTier(score) === 'Hot'
  }).length
}

export function generateBusinessInsights(
  leads: Lead[],
  activities: Activity[],
  tasks: FollowUpTask[],
): BusinessInsight[] {
  if (leads.length === 0) {
    return [
      {
        id: 'empty-pipeline',
        title: 'Pipeline is empty',
        detail: 'Add leads to unlock operational insights and conversion trends.',
        tone: 'neutral',
      },
    ]
  }

  const insights: BusinessInsight[] = []
  const statusCounts = countByStatus(leads)
  const pipelineValue = getPipelineValue(leads)
  const winRate =
    leads.length > 0
      ? Math.round(((leads.length - statusCounts.Lost) / leads.length) * 100)
      : 0

  const topSource = getSourceValueTotals(leads)[0]
  if (topSource) {
    insights.push({
      id: 'top-source',
      title: `${topSource.source} drives highest pipeline value`,
      detail: `${topSource.count} active ${topSource.count === 1 ? 'lead' : 'leads'} worth ${formatCurrency(topSource.value)} in open pipeline.`,
      tone: 'positive',
    })
  }

  const followUpsToday = countFollowUpsDueToday(tasks)
  if (followUpsToday > 0) {
    insights.push({
      id: 'follow-ups-today',
      title: `${followUpsToday} ${followUpsToday === 1 ? 'lead requires' : 'leads require'} follow-up today`,
      detail: 'Prioritize quote follow-ups and uncontacted new inquiries to protect conversion.',
      tone: 'action',
    })
  }

  const serviceRates = getServiceCloseRates(leads)
  const topService = serviceRates[0]
  if (topService && topService.rate >= 40) {
    insights.push({
      id: 'service-close-rate',
      title: `${topService.service} closes at a ${topService.rate}% rate`,
      detail: `Based on ${topService.total} inquiries — a strong performer in your service mix.`,
      tone: 'positive',
    })
  }

  if (winRate >= 85) {
    insights.push({
      id: 'win-rate',
      title: `Win rate holding at ${winRate}%`,
      detail: 'Pipeline quality is strong — focus on booking quoted leads to convert revenue.',
      tone: 'positive',
    })
  } else if (statusCounts.Lost > 0) {
    insights.push({
      id: 'win-rate-warning',
      title: `${statusCounts.Lost} lost ${statusCounts.Lost === 1 ? 'lead' : 'leads'} impacting win rate`,
      detail: `Current win rate is ${winRate}%. Review follow-up timing on quoted leads.`,
      tone: 'warning',
    })
  }

  const hotLeads = countHotLeads(leads, activities, tasks)
  if (hotLeads > 0) {
    insights.push({
      id: 'hot-leads',
      title: `${hotLeads} hot ${hotLeads === 1 ? 'lead' : 'leads'} ready to convert`,
      detail: 'High-scoring opportunities based on value, source, and engagement signals.',
      tone: 'action',
    })
  }

  if (statusCounts.New > 0) {
    insights.push({
      id: 'new-leads',
      title: `${statusCounts.New} new ${statusCounts.New === 1 ? 'inquiry' : 'inquiries'} awaiting contact`,
      detail: 'Speed-to-lead response within 24 hours improves close rates for detailing shops.',
      tone: statusCounts.New >= 3 ? 'warning' : 'neutral',
    })
  }

  insights.push({
    id: 'pipeline-value',
    title: `${formatCurrency(pipelineValue)} in open pipeline`,
    detail: `${statusCounts['Quote Sent']} quoted · ${statusCounts.Scheduled} booked · ${statusCounts.Contacted} contacted.`,
    tone: 'neutral',
  })

  return insights.slice(0, 6)
}

export function getInsightToneClasses(tone: InsightTone): string {
  switch (tone) {
    case 'positive':
      return 'border-emerald-200/80 bg-emerald-50/40'
    case 'warning':
      return 'border-amber-200/80 bg-amber-50/40'
    case 'action':
      return 'border-brand-200/80 bg-brand-50/40'
    case 'neutral':
      return 'border-slate-200/80 bg-white'
  }
}
