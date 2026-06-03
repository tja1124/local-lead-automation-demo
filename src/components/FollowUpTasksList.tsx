import type { FollowUpTask } from '../types/task'
import { EmptyState } from './ui'
import {
  getTaskStatus,
  getTaskStatusClasses,
  getTaskStatusLabel,
} from '../utils/tasks'
import { getTodayIsoDate } from '../utils/activities'

interface FollowUpTasksListProps {
  tasks: FollowUpTask[]
  onToggleComplete: (taskId: string) => void
  emptyMessage?: string
}

export function FollowUpTasksList({
  tasks,
  onToggleComplete,
  emptyMessage,
}: FollowUpTasksListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks"
        description={
          emptyMessage ?? 'Follow-up tasks are generated automatically from lead status.'
        }
      />
    )
  }

  const today = getTodayIsoDate()

  return (
    <ul className="space-y-2">
      {tasks.map((task) => {
        const status = getTaskStatus(task, today)
        return (
          <li
            key={task.id}
            className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2.5"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(task.id)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              aria-label={`Mark ${task.title} complete`}
            />
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}
              >
                {task.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Due {task.dueDate}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${getTaskStatusClasses(status)}`}
            >
              {getTaskStatusLabel(status)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
