import type { Activity } from '../types/activity'
import type { Lead } from '../types/lead'
import type { FollowUpTask } from '../types/task'
import { getTodayIsoDate } from './activities'
import { countFollowUpLeads } from './leadMetrics'
import { getOverdueTasks, getPendingTasks, getTaskStatus, getUpcomingTasks } from './tasks'

export interface DashboardPriority {
  id: string
  title: string
  subtitle: string
  kind: 'task' | 'lead'
}

export function getTodaysPriorities(
  leads: Lead[],
  tasks: FollowUpTask[],
  limit = 5,
  today = getTodayIsoDate(),
): DashboardPriority[] {
  const priorities: DashboardPriority[] = []

  for (const task of getPendingTasks(tasks, today)) {
    if (task.dueDate <= today) {
      priorities.push({
        id: task.id,
        title: task.title,
        subtitle: `Due ${task.dueDate === today ? 'today' : task.dueDate}`,
        kind: 'task',
      })
    }
  }

  const newUncontacted = leads.filter(
    (lead) => lead.status === 'New' && lead.lastContacted === null,
  )
  for (const lead of newUncontacted) {
    priorities.push({
      id: `priority-${lead.id}`,
      title: `Respond to ${lead.name}`,
      subtitle: 'New inquiry — speed-to-lead window open',
      kind: 'lead',
    })
  }

  return priorities.slice(0, limit)
}

export function getUpcomingFollowUps(
  tasks: FollowUpTask[],
  limit = 5,
  today = getTodayIsoDate(),
): FollowUpTask[] {
  return getUpcomingTasks(tasks, today, 7).slice(0, limit)
}

export function getRecentCrmActivity(activities: Activity[], limit = 6): Activity[] {
  return activities.slice(0, limit)
}

export function getNeedsAttentionItems(
  leads: Lead[],
  tasks: FollowUpTask[],
  limit = 5,
  today = getTodayIsoDate(),
): Array<{ id: string; title: string; detail: string; tone: 'danger' | 'warning' }> {
  const items: Array<{ id: string; title: string; detail: string; tone: 'danger' | 'warning' }> =
    []

  for (const task of getOverdueTasks(tasks, today)) {
    items.push({
      id: task.id,
      title: task.title,
      detail: `Overdue since ${task.dueDate}`,
      tone: 'danger',
    })
  }

  const followUpCount = countFollowUpLeads(leads)
  if (followUpCount > 0) {
    items.push({
      id: 'pipeline-follow-ups',
      title: `${followUpCount} leads need pipeline follow-up`,
      detail: 'New, contacted, and quote-sent leads awaiting next step',
      tone: 'warning',
    })
  }

  const highPriorityNew = leads.filter(
    (lead) => lead.priority === 'High' && (lead.status === 'New' || lead.status === 'Quote Sent'),
  )
  for (const lead of highPriorityNew) {
    items.push({
      id: `high-${lead.id}`,
      title: `High priority: ${lead.name}`,
      detail: `${lead.serviceInterest} · ${lead.status}`,
      tone: 'warning',
    })
  }

  return items.slice(0, limit)
}

export function summarizeTask(task: FollowUpTask, today = getTodayIsoDate()): string {
  const status = getTaskStatus(task, today)
  if (status === 'overdue') return `Overdue · due ${task.dueDate}`
  if (status === 'completed') return `Completed`
  if (task.dueDate === today) return 'Due today'
  return `Due ${task.dueDate}`
}
