import type { LeadCrmAction } from '../types/leadOperations'

export interface QuickAction {
  id: string
  label: string
  description: string
  action?: LeadCrmAction
  variant?: 'primary' | 'secondary'
}

interface QuickActionsBarProps {
  actions: QuickAction[]
  onAction: (action: QuickAction) => void
}

export function QuickActionsBar({ actions, onAction }: QuickActionsBarProps) {
  if (actions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onAction(item)}
          title={item.description}
          className={item.variant === 'primary' ? 'btn-primary text-xs sm:text-sm' : 'btn-secondary text-xs sm:text-sm'}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function buildDashboardQuickActions(): QuickAction[] {
  return [
    {
      id: 'add-lead',
      label: 'Add lead',
      description: 'Capture a new customer inquiry',
      variant: 'primary',
    },
    {
      id: 'schedule-follow-up',
      label: 'Schedule follow-up',
      description: 'Open leads to schedule a follow-up',
      action: 'schedule_follow_up',
    },
    {
      id: 'send-quote',
      label: 'Mark quote sent',
      description: 'Open leads to send a quote',
      action: 'send_quote',
    },
    {
      id: 'complete-job',
      label: 'Complete job',
      description: 'Open leads to mark a job complete',
      action: 'complete_job',
    },
    {
      id: 'request-review',
      label: 'Request review',
      description: 'Open leads to request a Google review',
      action: 'request_review',
    },
  ]
}
