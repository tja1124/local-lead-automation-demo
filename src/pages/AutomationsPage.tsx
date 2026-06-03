import type { Lead } from '../types/lead'
import {
  DemoNotice,
  EmptyState,
  KpiCard,
  PageHeader,
  PageShell,
  SectionCard,
} from '../components/ui'
import { formatDate } from '../utils/format'
import {
  getAutomationActivityFeed,
  getAutomationRecommendations,
  getAutomationSummary,
  getAutomationWorkflows,
  type AutomationActivityItem,
  type AutomationWorkflow,
} from '../utils/automations'

interface AutomationsPageProps {
  leads: Lead[]
}

export function AutomationsPage({ leads }: AutomationsPageProps) {
  const workflows = getAutomationWorkflows(leads)
  const activityFeed = getAutomationActivityFeed(leads)
  const recommendations = getAutomationRecommendations(leads)
  const summary = getAutomationSummary(leads)

  return (
    <PageShell>
      <PageHeader
        label="Automation center"
        title="Follow-up workflows"
        subtitle="Pre-built follow-up workflows that respond to lead status — simulated for demo purposes."
        showDemoBadge
      />

      <DemoNotice />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Active workflows" value={String(summary.activeWorkflowCount)} compact />
        <KpiCard
          label="Leads in automation"
          value={String(summary.leadsAffected)}
          valueClassName="text-brand-600"
          compact
        />
        <KpiCard
          label="Actions queued"
          value={String(summary.queuedActions)}
          valueClassName="text-emerald-600"
          compact
        />
      </div>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 sm:text-base">Workflow library</h3>
        <p className="mt-0.5 text-sm text-slate-500">
          Pre-built automations tuned for local auto detailing businesses.
        </p>
        <div className="mt-3 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {workflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <SectionCard
          title="Automation activity"
          description="Simulated queue based on your current lead pipeline."
          className="lg:col-span-3"
        >
          {activityFeed.length === 0 ? (
            <EmptyState
              title="No automation activity"
              description="Add leads or update statuses to see simulated workflow actions."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {activityFeed.map((item) => (
                <ActivityFeedItem key={item.id} item={item} leads={leads} />
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Recommended actions"
          description="Top automation opportunities from your current leads."
          className="lg:col-span-2"
        >
          {recommendations.length === 0 ? (
            <EmptyState
              title="All caught up"
              description="No immediate automation opportunities based on current lead statuses."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recommendations.map((item) => (
                <li key={item.id} className="list-row">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                        {item.description}
                      </p>
                      {item.leadNames.length > 0 && (
                        <p className="mt-1.5 text-xs text-slate-400">
                          Includes {item.leadNames.join(', ')}
                          {item.leadCount > item.leadNames.length
                            ? ` +${item.leadCount - item.leadNames.length} more`
                            : ''}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-600/20 ring-inset">
                      {item.leadCount}
                    </span>
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

function WorkflowCard({ workflow }: { workflow: AutomationWorkflow }) {
  return (
    <article className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <WorkflowIcon workflowId={workflow.id} />
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset">
          {workflow.status}
        </span>
      </div>

      <h4 className="mt-3 text-sm font-semibold text-slate-900">{workflow.name}</h4>

      <dl className="mt-2.5 space-y-2 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">Trigger</dt>
          <dd className="mt-0.5 text-slate-700">{workflow.trigger}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">Action</dt>
          <dd className="mt-0.5 text-slate-700">{workflow.action}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{workflow.affectedCount}</span>{' '}
          {workflow.affectedCount === 1 ? 'lead' : 'leads'} affected
        </p>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-500">{workflow.businessValue}</p>
    </article>
  )
}

function ActivityFeedItem({ item, leads }: { item: AutomationActivityItem; leads: Lead[] }) {
  const lead = leads.find((entry) => entry.id === item.leadId)
  const statusLabel = lead?.status ?? 'Unknown'

  return (
    <li className="flex gap-3 list-row">
      <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{item.message}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {item.workflowName} · {statusLabel}
          {lead ? ` · Requested ${formatDate(lead.requestedDate)}` : ''}
        </p>
      </div>
      <span className="shrink-0 rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
        Simulated
      </span>
    </li>
  )
}

function WorkflowIcon({ workflowId }: { workflowId: string }) {
  switch (workflowId) {
    case 'speed-to-lead':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      )
    case 'quote-follow-up':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 00-1.07-1.916l-7.5-4.615a2.25 2.25 0 00-2.36 0L3.32 8.91a2.25 2.25 0 00-1.07 1.916V6.75" />
        </svg>
      )
    case 'appointment-confirmation':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      )
    case 'review-request':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      )
    case 'lost-re-engagement':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      )
    default:
      return null
  }
}
