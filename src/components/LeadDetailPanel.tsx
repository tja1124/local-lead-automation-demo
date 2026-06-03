import type { Activity } from '../types/activity'
import type { FollowUpTask } from '../types/task'
import type { Lead, LeadPriority, LeadStatus } from '../types/lead'
import type { LeadCrmAction } from '../types/leadOperations'
import { ActivityTimeline, LeadActionButtons } from './LeadOperations'
import { FollowUpTasksList } from './FollowUpTasksList'
import { DetailSection } from './ui'
import { getRecommendedNextAction } from '../utils/leadActions'
import { formatCurrency, formatDate } from '../utils/format'
import { statusBadgeClasses } from '../utils/leadDisplay'

interface LeadDetailPanelProps {
  lead: Lead
  activities: Activity[]
  tasks: FollowUpTask[]
  onLeadAction: (action: LeadCrmAction) => void
  onToggleTask: (taskId: string) => void
}

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClasses(status)}`}
    >
      {status}
    </span>
  )
}

function PriorityIndicator({ priority }: { priority: LeadPriority }) {
  const color =
    priority === 'High' ? 'text-red-600' : priority === 'Medium' ? 'text-amber-600' : 'text-slate-400'
  const dot =
    priority === 'High' ? 'bg-red-500' : priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-300'

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {priority}
    </span>
  )
}

export function LeadDetailPanel({
  lead,
  activities,
  tasks,
  onLeadAction,
  onToggleTask,
}: LeadDetailPanelProps) {
  const isHighPriority = lead.priority === 'High'
  const nextAction = getRecommendedNextAction(lead.status)

  return (
    <div
      className={`space-y-4 p-4 sm:p-5 ${isHighPriority ? 'bg-gradient-to-b from-red-50/50 to-transparent' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{lead.name}</h3>
            {isHighPriority && (
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600 ring-1 ring-red-200 ring-inset">
                High priority
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-500">{lead.vehicle}</p>
          <p className="mt-1 text-xs text-slate-400">{lead.serviceInterest}</p>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <DetailSection title="Quick actions">
        <LeadActionButtons status={lead.status} onAction={onLeadAction} />
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Simulated CRM actions — updates status and logs activity locally.
        </p>
      </DetailSection>

      <DetailSection title="Recommended next step" variant="highlight">
        <p className="text-sm leading-relaxed text-slate-800">{nextAction}</p>
      </DetailSection>

      <DetailSection title="Follow-up tasks">
        <FollowUpTasksList tasks={tasks} onToggleComplete={onToggleTask} />
      </DetailSection>

      <DetailSection title="Activity timeline">
        <ActivityTimeline
          activities={activities}
          limit={5}
          emptyTitle="No activity yet"
          emptyDescription="CRM actions and lead events will appear here."
        />
      </DetailSection>

      <DetailSection title="Lead details" variant="muted">
        <dl className="space-y-3 text-sm">
          <DetailRow label="Est. value">
            <span className="font-semibold text-slate-900">
              {formatCurrency(lead.estimatedValue)}
            </span>
          </DetailRow>
          <DetailRow label="Priority">
            <PriorityIndicator priority={lead.priority} />
          </DetailRow>
          <DetailRow label="Source">{lead.source}</DetailRow>
          <DetailRow label="Requested">{formatDate(lead.requestedDate)}</DetailRow>
          <DetailRow label="Last contacted">
            {lead.lastContacted ? formatDate(lead.lastContacted) : 'Not yet contacted'}
          </DetailRow>
          <DetailRow label="Phone">
            <a href={`tel:${lead.phone}`} className="text-brand-600 hover:text-brand-700">
              {lead.phone}
            </a>
          </DetailRow>
          <DetailRow label="Email">
            {lead.email ? (
              <a
                href={`mailto:${lead.email}`}
                className="break-all text-brand-600 hover:text-brand-700"
              >
                {lead.email}
              </a>
            ) : (
              <span className="text-slate-400">Not provided</span>
            )}
          </DetailRow>
        </dl>
      </DetailSection>

      {lead.notes && (
        <DetailSection title="Notes" variant="muted">
          <p className="text-sm leading-relaxed text-slate-600">{lead.notes}</p>
        </DetailSection>
      )}
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-700">{children}</dd>
    </div>
  )
}
