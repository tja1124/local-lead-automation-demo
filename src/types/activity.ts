export type ActivityType =
  | 'lead_created'
  | 'status_changed'
  | 'quote_sent'
  | 'follow_up_scheduled'
  | 'job_completed'
  | 'review_requested'
  | 'automation_triggered'

export type ActivityCategory = 'lead' | 'pipeline' | 'automation' | 'review'

export interface Activity {
  id: string
  leadId: string
  leadName: string
  type: ActivityType
  message: string
  timestamp: string
  fromStatus?: string
  toStatus?: string
}
