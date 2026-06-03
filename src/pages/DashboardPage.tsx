import { businessName } from '../data/navigation'
import type { Activity } from '../types/activity'
import type { FollowUpTask } from '../types/task'
import type { Lead, LeadStatus } from '../types/lead'
import type { LeadCrmAction } from '../types/leadOperations'
import { ActivityTimeline } from '../components/LeadOperations'
import { OperationsInsights } from '../components/OperationsInsights'
import {
  buildDashboardQuickActions,
  QuickActionsBar,
  type QuickAction,
} from '../components/QuickActionsBar'
import {
  DemoNotice,
  EmptyState,
  KpiCard,
  PageHeader,
  PageShell,
  SectionCard,
} from '../components/ui'
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
        label="Welcome back"
        title="Business overview"
        subtitle={`Operational snapshot for ${businessName} — pipeline, follow-ups, and CRM activity.`}
        showDemoBadge
      />

      <DemoNotice />

      <SectionCard title="Quick actions" description="Common CRM workflows for daily operations.">
        <div className="list-row">
          <QuickActionsBar actions={quickActions} onAction={handleQuickAction} />
        </div>
      </SectionCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <KpiCard label="Total leads" value={String(totalLeads)} compact />
        <KpiCard label="New leads" value={String(newLeads)} valueClassName="text-blue-600" compact />
        <KpiCard
          label="Scheduled jobs"
          value={String(scheduledJobs)}
          valueClassName="text-emerald-600"
          compact
        />
        <KpiCard label="Pipeline value" value={formatCurrency(pipelineValue)} compact />
        <KpiCard
          label="Completed revenue"
          value={formatCurrency(completedRevenue)}
          valueClassName="text-slate-700"
          compact
        />
        <KpiCard label="Win rate" value={`${winRate}%`} valueClassName="text-brand-600" compact />
        <KpiCard
          label="Avg. lead score"
          value={String(scoreSummary.avgScore)}
          valueClassName="text-amber-600"
          compact
        />
        <KpiCard
          label="Pipeline health"
          value={`${pipelineHealth}%`}
          valueClassName={pipelineHealth >= 70 ? 'text-emerald-600' : 'text-amber-600'}
          compact
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Operations insights
        </h3>
        <OperationsInsights insights={insights} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900 sm:text-base">Pipeline snapshot</h3>
          <p className="mt-0.5 text-sm text-slate-500">Lead distribution by stage.</p>
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
                      className={`h-full rounded-full ${statusBarClasses(status)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200/80 bg-brand-50/30 p-4 shadow-sm sm:p-5">
          <h3 className="text-sm font-semibold text-slate-900 sm:text-base">Health summary</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{healthSummary}</p>
          <dl className="mt-4 space-y-2.5 border-t border-slate-200/60 pt-4 text-sm">
            <SummaryRow label="Open pipeline" value={formatCurrency(pipelineValue)} />
            <SummaryRow label="Follow-ups due" value={String(followUpCount)} />
            <SummaryRow label="Win rate" value={`${winRate}%`} />
            <SummaryRow label="Hot leads" value={String(scoreSummary.hotCount)} />
            <SummaryRow label="Warm leads" value={String(scoreSummary.warmCount)} />
          </dl>
          <button
            type="button"
            onClick={() => onNavigateToLeads({ view: 'pipeline' })}
            className="btn-secondary mt-4 w-full text-xs sm:text-sm"
          >
            Open pipeline board
          </button>
        </section>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Operations
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Today's priorities" description="Tasks and leads needing action today.">
            {todaysPriorities.length === 0 ? (
              <EmptyState title="All clear for today" description="No priority items scheduled." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {todaysPriorities.map((item) => (
                  <li key={item.id} className="list-row">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.subtitle}</p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Upcoming follow-ups" description="Reminders due within 7 days.">
            {upcomingFollowUps.length === 0 ? (
              <EmptyState title="No upcoming tasks" description="Your follow-up queue is clear." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcomingFollowUps.map((task) => (
                  <li key={task.id} className="list-row">
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

          <SectionCard title="Needs attention" description="Overdue tasks and high-priority gaps.">
            {needsAttention.length === 0 ? (
              <EmptyState title="Pipeline looks healthy" description="Nothing urgent right now." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {needsAttention.map((item) => (
                  <li key={item.id} className="list-row">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Follow-up focus" description="Leads needing pipeline attention.">
          {followUpLeads.length === 0 ? (
            <EmptyState title="No follow-ups due" description="Lead pipeline is up to date." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {followUpLeads.map(({ lead, reason }) => (
                <li key={lead.id} className="list-row">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{lead.serviceInterest}</p>
                      <p className="mt-1.5 text-xs text-amber-700">{reason}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusBadge status={lead.status} />
                      <p className="mt-1 text-xs font-medium text-amber-700">
                        Score {calculateLeadScore(lead, activities, tasks)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatCurrency(lead.estimatedValue)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent leads" description="Latest inquiries by request date.">
          {recentLeads.length === 0 ? (
            <EmptyState title="No leads yet" description="Add leads from the Leads page to get started." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="list-row">
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
