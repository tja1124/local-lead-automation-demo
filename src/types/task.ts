export type TaskStatus = 'pending' | 'completed' | 'overdue'

export type TaskType = 'call' | 'quote' | 'confirm' | 'review' | 'follow_up'

export interface FollowUpTask {
  id: string
  leadId: string
  leadName: string
  title: string
  dueDate: string
  type: TaskType
  completed: boolean
  completedAt: string | null
}
