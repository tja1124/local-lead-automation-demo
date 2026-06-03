import { useState } from 'react'
import { businessName } from '../data/navigation'
import type { Activity } from '../types/activity'
import type { FollowUpTask } from '../types/task'
import type { Lead, LeadStatus } from '../types/lead'
import type { LeadCrmAction } from '../types/leadOperations'
import { ActivityTimeline } from '../components/LeadOperations'
import { LeadScoreBadge } from '../components/LeadScoreBadge'
import { LeadUrgencyBadge } from '../components/LeadUrgencyBadge'
import { OperationsInsights } from '../components/OperationsInsights'
import {
  buildDashboardQuickActions,
  QuickActionsBar,
  type QuickAction,
} from '../components/QuickActionsBar'
import {
  DemoGuideBanner,
  DemoNotice,
  EmptyState,
  KpiCard,
  PageHeader,
  PageShell,
  SectionCard,
  SectionLabel,
} from '../components/ui'
import { dismissDemoGuide, isDemoGuideDismissed } from '../utils/demoGuide'
import { formatCurrency, formatDate } from '../utils/format'
import { generateBusinessInsights } from '../utils/businessInsights'
import {
  getNeedsAttentionItems,
  getRecentCrmActivity,
  getTodaysPriorities,
  getUpcomingFollowUps,
  summarizeTask,
} from '../utils/dashboardOperations'
import { statusBadgeClasses, statusBarClasses } from '../utils/leadDisplay'
import {
  buildBusinessHealthSummary,
  countByStatus,
  countFollowUpLeads,
  getCompletedRevenue,
  getFollowUpLeads,
  getPipelineValue,
  getRecentLeads,
} from '../utils/leadMetrics'
import { getAvailableLeadActions } from '../utils/leadOperations'
import { getPipelineHealthScore } from '../utils/pipeline'
import { calculateLeadScore, summarizeLeadScores } from '../utils/leadScoring'
import { getLeadUrgency } from '../utils/leadUrgency'

interface DashboardPageProps {
  leads: Lead[]
  activities: Activity[]
  tasks: FollowUpTask[]
  onNavigateToLeads: (options?: { openForm?: boolean; view?: 'inbox' | 'pipeline' }) => void
  onLeadAction: (leadId: string, action: LeadCrmAction) => Lead | null
}

const PIPELINE_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Quote Sent',
  'Scheduled',
  'Completed',
  'Lost',
]

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClasses(status)}`}
    >
      {status}
    </span>
  )
}

function findLeadForAction(leads: Lead[], action: LeadCrmAction): Lead | null {
  return leads.find((lead) => getAvailableLeadActions(lead.status).includes(action)) ?? null
}

export function DashboardPage({
  leads,
  activities,
  tasks,
  onNavigateToLeads,
  onLeadAction,
}: DashboardPageProps) {
  const [showGuide, setShowGuide] = useState(() => !isDemoGuideDismissed())

  const totalLeads = leads.length
  const statusCounts = countByStatus(leads)
  const newLeads = statusCounts.New
  const scheduledJobs = statusCounts.Scheduled
  const lostLeads = statusCounts.Lost
  const pipelineValue = getPipelineValue(leads)
  const completedRevenue = getCompletedRevenue(leads)
  const recentLeads = getRecentLeads(leads, 5)
  const followUpLeads = getFollowUpLeads(leads, 5)
  const followUpCount = countFollowUpLeads(leads)
  const healthSummary = buildBusinessHealthSummary(leads, businessName)
  const todaysPriorities = getTodaysPriorities(leads, tasks)
  const upcomingFollowUps = getUpcomingFollowUps(tasks)
  const recentCrmActivity = getRecentCrmActivity(activities)
  const needsAttention = getNeedsAttentionItems(leads, tasks)
  const winRate = totalLeads > 0 ? Math.round(((totalLeads - lostLeads) / totalLeads) * 100) : 0
  const scoreSummary = summarizeLeadScores(leads, activities, tasks)
  const pipelineHealth = getPipelineHealthScore(leads)
  const insights = generateBusinessInsights(leads, activities, tasks)
  const quickActions = buildDashboardQuickActions()

  const handleDismissGuide = () => {
    dismissDemoGuide()
    setShowGuide(false)
  }

  const handleQuickAction = (item: QuickAction) => {
    if (item.id === 'add-lead') {
      onNavigateToLeads({ openForm: true })
      return
    }

    if (item.action) {
      const lead = findLeadForAction(leads, item.action)
      if (lead) {
        onLeadAction(lead.id, item.action)
        return
      }
    }

    onNavigateToLeads()
  }

  return (
    <PageShell>
      <PageHeader
        label="Operations command center"
        title="Today's business snapshot"
        subtitle={`See what needs attention, where revenue is sitting, and what to do next for ${businessName}.`}
        showDemoBadge
      />

      {showGuide && <DemoGuideBanner onDismiss={handleDismissGuide} />}

      <DemoNotice />

      {/* 1. Business health */}
      <div>
        <SectionLabel
          title="Business health"
          description="Pipeline strength and revenue at a glance."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Pipeline value"
            value={formatCurrency(pipelineValue)}
            valueClassName="text-brand-600"
            compact
          />
          <KpiCard
            label="Pipeline health"
            value={`${pipelineHealth}%`}
            valueClassName={pipelineHealth >= 70 ? 'text-emerald-600' : 'text-amber-600'}
            compact
          />
          <KpiCard label="Win rate" value={`${winRate}%`} valueClassName="text-brand-600" compact />
          <KpiCard
            label="Completed revenue"
            value={formatCurrency(completedRevenue)}
            valueClassName="text-emerald-600"
            compact
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total leads" value={String(totalLeads)} compact />
          <KpiCard label="New inquiries" value={String(newLeads)} valueClassName="text-blue-600" compact />
          <KpiCard
            label="Scheduled jobs"
            value={String(scheduledJobs)}
            valueClassName="text-emerald-600"
            compact
          />
          <KpiCard
            label="Avg. lead score"
            value={String(scoreSummary.avgScore)}
            valueClassName="text-amber-600"
            compact
          />
        </div>
      </div>

      {/* 2. Operational priorities */}
      <div>
        <SectionLabel
          title="Operational priorities"
          description="What your team should focus on right now."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Today's priorities" description="Tasks and leads needing action today.">
            {todaysPriorities.length === 0 ? (
              <EmptyState title="All clear for today" description="No priority items scheduled." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {todaysPriorities.map((item) => (
                  <li key={item.id} className="list-row-interactive">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.subtitle}</p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Needs attention" description="Overdue tasks and high-priority gaps.">
            {needsAttention.length === 0 ? (
              <EmptyState title="Pipeline looks healthy" description="Nothing urgent right now." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {needsAttention.map((item) => (
                  <li key={item.id} className="list-row-interactive">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p
                      className={`mt-0.5 text-xs ${item.tone === 'danger' ? 'text-red-600' : 'text-amber-700'}`}
                    >
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>

      {/* 3. Revenue opportunities */}
      <div>
        <SectionLabel
          title="Revenue opportunities"
          description="Insights derived from your current lead pipeline."
        />
        <OperationsInsights insights={insights} />

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <section className="rounded-xl border border-slate-200/80 bg-brand-50/30 p-4 shadow-sm sm:p-5 lg:col-span-1">
            <h3 className="text-sm font-semibold text-slate-900 sm:text-base">Executive summary</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{healthSummary}</p>
            <dl className="mt-4 space-y-2.5 border-t border-slate-200/60 pt-4 text-sm">
              <SummaryRow label="Open pipeline" value={formatCurrency(pipelineValue)} />
              <SummaryRow label="Follow-ups due" value={String(followUpCount)} />
              <SummaryRow label="Hot leads" value={String(scoreSummary.hotCount)} />
              <SummaryRow label="Warm leads" value={String(scoreSummary.warmCount)} />
            </dl>
            <button
              type="button"
              onClick={() => onNavigateToLeads({ view: 'pipeline' })}
              className="btn-primary mt-4 w-full text-xs sm:text-sm"
            >
              Open pipeline board
            </button>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900 sm:text-base">Pipeline by stage</h3>
            <p className="mt-0.5 text-sm text-slate-500">Where leads sit in your sales funnel.</p>
            <ul className="mt-4 space-y-3">
              {PIPELINE_STATUSES.map((status) => {
                const count = statusCounts[status]
                const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0
                return (
                  <li key={status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{status}</span>
                      <span className="text-xs text-slate-500 sm:text-sm">
                        {count} · {Math.round(percentage)}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${statusBarClasses(status)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </div>

      {/* 4. Recommended actions */}
      <div>
        <SectionLabel
          title="Recommended actions"
          description="Fast CRM workflows to keep deals moving."
        />
        <SectionCard title="Quick actions" description="One-click operator shortcuts.">
          <div className="list-row">
            <QuickActionsBar actions={quickActions} onAction={handleQuickAction} />
          </div>
        </SectionCard>
      </div>

      {/* Supporting detail */}
      <div>
        <SectionLabel title="Pipeline activity" description="Follow-ups, activity, and recent inquiries." />
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Follow-up focus" description="Leads needing pipeline attention.">
            {followUpLeads.length === 0 ? (
              <EmptyState title="No follow-ups due" description="Lead pipeline is up to date." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {followUpLeads.map(({ lead, reason }) => {
                  const score = calculateLeadScore(lead, activities, tasks)
                  const urgency = getLeadUrgency(lead, tasks, score)
                  return (
                    <li key={lead.id} className="list-row-interactive">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                            {urgency && <LeadUrgencyBadge urgency={urgency} compact />}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">{lead.serviceInterest}</p>
                          <p className="mt-1 text-xs text-amber-700">{reason}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <StatusBadge status={lead.status} />
                          <div className="mt-1">
                            <LeadScoreBadge score={score} compact />
                          </div>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {formatCurrency(lead.estimatedValue)}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Upcoming follow-ups" description="Reminders due within 7 days.">
            {upcomingFollowUps.length === 0 ? (
              <EmptyState title="No upcoming tasks" description="Your follow-up queue is clear." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcomingFollowUps.map((task) => (
                  <li key={task.id} className="list-row-interactive">
                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{summarizeTask(task)}</p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Recent CRM activity" description="Latest simulated pipeline events.">
            <div className="list-row">
              <ActivityTimeline
                activities={recentCrmActivity}
                limit={4}
                emptyTitle="No CRM activity"
                emptyDescription="Actions taken on leads will appear here."
              />
            </div>
          </SectionCard>

          <SectionCard title="Recent leads" description="Latest inquiries by request date.">
            {recentLeads.length === 0 ? (
              <EmptyState title="No leads yet" description="Add leads from the Leads page to get started." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <li key={lead.id} className="list-row-interactive">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {lead.serviceInterest} · {lead.source}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Requested {formatDate(lead.requestedDate)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <StatusBadge status={lead.status} />
                        <p className="mt-1.5 text-sm font-semibold text-slate-900">
                          {formatCurrency(lead.estimatedValue)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </PageShell>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900">{value}</dd>
    </div>
  )
}
