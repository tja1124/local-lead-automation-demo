import type { FollowUpTask, TaskStatus, TaskType } from '../types/task'
import type { Lead } from '../types/lead'
import type { TaskCompletionMap } from './taskStorage'
import { getTodayIsoDate } from './activities'

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function getTaskStatus(task: FollowUpTask, today = getTodayIsoDate()): TaskStatus {
  if (task.completed) return 'completed'
  if (task.dueDate < today) return 'overdue'
  return 'pending'
}

export function getTaskStatusClasses(status: TaskStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20'
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
    case 'overdue':
      return 'bg-red-50 text-red-700 ring-red-600/20'
  }
}

export function getTaskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'completed':
      return 'Completed'
    case 'overdue':
      return 'Overdue'
  }
}

function buildTaskId(leadId: string, type: TaskType): string {
  return `task-${leadId}-${type}`
}

function deriveTaskForLead(lead: Lead, today = getTodayIsoDate()): FollowUpTask | null {
  if (lead.status === 'Lost') return null

  if (lead.status === 'New' && lead.lastContacted === null) {
    return {
      id: buildTaskId(lead.id, 'call'),
      leadId: lead.id,
      leadName: lead.name,
      title: `Call ${lead.name}`,
      dueDate: today,
      type: 'call',
      completed: false,
      completedAt: null,
    }
  }

  if (lead.status === 'Contacted') {
    return {
      id: buildTaskId(lead.id, 'quote'),
      leadId: lead.id,
      leadName: lead.name,
      title: `Send quote to ${lead.name}`,
      dueDate: addDays(today, 1),
      type: 'quote',
      completed: false,
      completedAt: null,
    }
  }

  if (lead.status === 'Quote Sent') {
    return {
      id: buildTaskId(lead.id, 'follow_up'),
      leadId: lead.id,
      leadName: lead.name,
      title: `Follow up on quote with ${lead.name}`,
      dueDate: addDays(today, 1),
      type: 'follow_up',
      completed: false,
      completedAt: null,
    }
  }

  if (lead.status === 'Scheduled') {
    return {
      id: buildTaskId(lead.id, 'confirm'),
      leadId: lead.id,
      leadName: lead.name,
      title: `Confirm appointment with ${lead.name}`,
      dueDate: today,
      type: 'confirm',
      completed: false,
      completedAt: null,
    }
  }

  if (lead.status === 'Completed') {
    return {
      id: buildTaskId(lead.id, 'review'),
      leadId: lead.id,
      leadName: lead.name,
      title: `Request review from ${lead.name}`,
      dueDate: today,
      type: 'review',
      completed: false,
      completedAt: null,
    }
  }

  return null
}

export function deriveTasksFromLeads(
  leads: Lead[],
  completions: TaskCompletionMap,
  today = getTodayIsoDate(),
): FollowUpTask[] {
  return leads
    .map((lead) => deriveTaskForLead(lead, today))
    .filter((task): task is FollowUpTask => task !== null)
    .map((task) => {
      const completion = completions[task.id]
      if (!completion) return task
      return {
        ...task,
        completed: completion.completed,
        completedAt: completion.completedAt,
      }
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.title.localeCompare(b.title))
}

export function getTasksForLead(tasks: FollowUpTask[], leadId: string): FollowUpTask[] {
  return tasks.filter((task) => task.leadId === leadId)
}

export function getPendingTasks(tasks: FollowUpTask[], today = getTodayIsoDate()): FollowUpTask[] {
  return tasks.filter((task) => getTaskStatus(task, today) !== 'completed')
}

export function getOverdueTasks(tasks: FollowUpTask[], today = getTodayIsoDate()): FollowUpTask[] {
  return tasks.filter((task) => getTaskStatus(task, today) === 'overdue')
}

export function getUpcomingTasks(
  tasks: FollowUpTask[],
  today = getTodayIsoDate(),
  withinDays = 3,
): FollowUpTask[] {
  const endDate = addDays(today, withinDays)
  return getPendingTasks(tasks, today).filter(
    (task) => task.dueDate >= today && task.dueDate <= endDate,
  )
}
