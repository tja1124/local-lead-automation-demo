import type { LeadUrgency } from '../utils/leadUrgency'
import { getUrgencyBadgeClasses } from '../utils/leadUrgency'

interface LeadUrgencyBadgeProps {
  urgency: LeadUrgency
  compact?: boolean
}

export function LeadUrgencyBadge({ urgency, compact = false }: LeadUrgencyBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset sm:text-[11px] sm:normal-case sm:tracking-normal ${getUrgencyBadgeClasses(urgency.kind)}`}
      title={urgency.detail}
    >
      {compact ? urgency.label.split(' ')[0] : urgency.label}
    </span>
  )
}
