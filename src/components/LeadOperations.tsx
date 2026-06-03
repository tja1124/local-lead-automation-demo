import type { Activity } from '../types/activity'
import type { LeadCrmAction } from '../types/leadOperations'
import type { LeadStatus } from '../types/lead'
import { EmptyState } from './ui'
import {
  getActivityCategory,
  getActivityCategoryClasses,
  getActivityLabel,
  formatActivityTimestamp,
} from '../utils/activities'
import { getAvailableLeadActions, getLeadActionLabel } from '../utils/leadOperations'

interface LeadActionButtonsProps {
  status: LeadStatus
  onAction: (action: LeadCrmAction) => void
}

export function LeadActionButtons({ status, onAction }: LeadActionButtonsProps) {
  const actions = getAvailableLeadActions(status)

  if (actions.length === 0) {
    return (
      <EmptyState
        title="No actions available"
        description="This lead status does not require further CRM steps."
      />
    )
  }

  const primaryActions = actions.filter((action) => action !== 'mark_lost')
  const destructiveActions = actions.filter((action) => action === 'mark_lost')

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {primaryActions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => onAction(action)}
            className="btn-secondary text-xs sm:text-sm"
          >
            {getLeadActionLabel(action)}
          </button>
        ))}
      </div>
      {destructiveActions.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-2">
          {destructiveActions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => onAction(action)}
              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 sm:text-sm"
            >
              {getLeadActionLabel(action)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface ActivityTimelineProps {
  activities: Activity[]
  emptyMessage?: string
  emptyTitle?: string
  emptyDescription?: string
  limit?: number
}

export function ActivityTimeline({
  activities,
  emptyMessage,
  emptyTitle = 'No activity yet',
  emptyDescription = 'CRM actions and lead events will appear here.',
  limit,
}: ActivityTimelineProps) {
  const items = limit ? activities.slice(0, limit) : activities

  if (items.length === 0) {
    if (emptyMessage) {
      return <p className="text-sm text-slate-500">{emptyMessage}</p>
    }
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <ol className="space-y-2.5">
      {items.map((activity) => {
        const category = getActivityCategory(activity.type)
        return (
          <li
            key={activity.id}
            className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${getActivityCategoryClasses(category)}`}
              >
                {getActivityLabel(activity.type)}
              </span>
              <time className="shrink-0 text-[11px] text-slate-400">
                {formatActivityTimestamp(activity.timestamp)}
              </time>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{activity.message}</p>
          </li>
        )
      })}
    </ol>
  )
}
