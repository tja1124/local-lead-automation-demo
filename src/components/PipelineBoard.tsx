import { useMemo, useState } from 'react'
import type { Activity } from '../types/activity'
import type { FollowUpTask } from '../types/task'
import type { Lead, LeadPriority, LeadStatus } from '../types/lead'
import { LeadScoreBadge } from './LeadScoreBadge'
import { LeadUrgencyBadge } from './LeadUrgencyBadge'
import { EmptyState, WorkflowHint } from './ui'
import { formatCurrency } from '../utils/format'
import { calculateLeadScore } from '../utils/leadScoring'
import { formatLeadAge, getLeadUrgency } from '../utils/leadUrgency'
import {
  getAdjacentPipelineStatus,
  groupLeadsByPipelineColumn,
  PIPELINE_COLUMNS,
} from '../utils/pipeline'

interface PipelineBoardProps {
  leads: Lead[]
  activities: Activity[]
  tasks: FollowUpTask[]
  selectedLeadId: string
  onSelectLead: (leadId: string) => void
  onMoveLead: (leadId: string, status: LeadStatus) => void
}

function PriorityDot({ priority }: { priority: LeadPriority }) {
  const color =
    priority === 'High' ? 'bg-red-500' : priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-300'
  return (
    <span
      className={`h-2 w-2 shrink-0 rounded-full ${color}`}
      title={`${priority} priority`}
      aria-hidden="true"
    />
  )
}

export function PipelineBoard({
  leads,
  activities,
  tasks,
  selectedLeadId,
  onSelectLead,
  onMoveLead,
}: PipelineBoardProps) {
  const grouped = useMemo(() => groupLeadsByPipelineColumn(leads), [leads])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<LeadStatus | null>(null)

  if (leads.length === 0) {
    return (
      <EmptyState
        title="Pipeline is empty"
        description="Add leads to see them organized across your sales stages."
      />
    )
  }

  const handleDrop = (status: LeadStatus) => {
    if (!draggingId) return
    onMoveLead(draggingId, status)
    setDraggingId(null)
    setDropTarget(null)
  }

  return (
    <div className="space-y-3">
      <WorkflowHint>
        Drag cards between columns or use the stage selector to move leads. Hot and overdue leads
        are highlighted for quick prioritization.
      </WorkflowHint>

      <div className="-mx-1 overflow-x-auto px-1 pb-2">
        <div className="flex min-w-max gap-3 sm:gap-4">
          {PIPELINE_COLUMNS.map((column) => {
            const columnLeads = grouped[column.status]
            const columnValue = columnLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0)
            const isDropTarget = dropTarget === column.status

            return (
              <div
                key={column.status}
                className={`pipeline-column w-[15.5rem] sm:w-[16.5rem] ${
                  isDropTarget ? 'pipeline-column-drop-target' : 'border-slate-200/80'
                }`}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDropTarget(column.status)
                }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(event) => {
                  event.preventDefault()
                  handleDrop(column.status)
                }}
              >
                <div className="border-b border-slate-200/80 px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                      {column.label}
                    </h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
                      {columnLeads.length}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    {formatCurrency(columnValue)}
                  </p>
                </div>

                <ul className="flex max-h-[32rem] flex-1 flex-col gap-2.5 overflow-y-auto p-2.5 sm:max-h-[28rem]">
                  {columnLeads.length === 0 ? (
                    <li className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200/80 bg-white/50 px-3 py-8 text-center">
                      <p className="text-[11px] leading-relaxed text-slate-400">
                        No leads in this stage
                        <span className="mt-1 block text-[10px]">Drop a card here</span>
                      </p>
                    </li>
                  ) : (
                    columnLeads.map((lead) => {
                      const score = calculateLeadScore(lead, activities, tasks)
                      const urgency = getLeadUrgency(lead, tasks, score)
                      return (
                        <PipelineCard
                          key={lead.id}
                          lead={lead}
                          score={score}
                          urgency={urgency}
                          isSelected={selectedLeadId === lead.id}
                          isDragging={draggingId === lead.id}
                          onSelect={() => onSelectLead(lead.id)}
                          onMove={(status) => onMoveLead(lead.id, status)}
                          onDragStart={() => setDraggingId(lead.id)}
                          onDragEnd={() => {
                            setDraggingId(null)
                            setDropTarget(null)
                          }}
                        />
                      )
                    })
                  )}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PipelineCard({
  lead,
  score,
  urgency,
  isSelected,
  isDragging,
  onSelect,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead
  score: number
  urgency: ReturnType<typeof getLeadUrgency>
  isSelected: boolean
  isDragging: boolean
  onSelect: () => void
  onMove: (status: LeadStatus) => void
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const { prev, next } = getAdjacentPipelineStatus(lead.status)
  const isHot = score >= 75

  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`pipeline-card cursor-grab active:cursor-grabbing ${
        isDragging ? 'pipeline-card-dragging' : ''
      } ${
        isSelected
          ? 'pipeline-card-selected'
          : isHot
            ? 'border-orange-200/80 hover:border-orange-300'
            : 'border-slate-200/80 card-interactive'
      }`}
    >
      <button type="button" onClick={onSelect} className="w-full p-3 text-left">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
          <PriorityDot priority={lead.priority} />
        </div>
        <p className="mt-1 truncate text-xs text-slate-500">{lead.serviceInterest}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {urgency && <LeadUrgencyBadge urgency={urgency} compact />}
          <LeadScoreBadge score={score} compact />
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-900">{formatCurrency(lead.estimatedValue)}</p>
          <span className="text-[10px] text-slate-400">{formatLeadAge(lead)}</span>
        </div>
        <p className="mt-1 truncate text-[10px] text-slate-400">{lead.source}</p>
      </button>

      <div className="flex items-center gap-1 border-t border-slate-100 px-2 pb-2 pt-1.5">
        {prev && (
          <button
            type="button"
            onClick={() => onMove(prev)}
            className="rounded-md px-1.5 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:bg-slate-100 active:bg-slate-200"
            title={`Move to ${prev}`}
          >
            ←
          </button>
        )}
        <select
          value={lead.status}
          onChange={(event) => onMove(event.target.value as LeadStatus)}
          className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1 text-[10px] text-slate-600 transition-colors hover:border-slate-300 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
          aria-label={`Move ${lead.name} to stage`}
        >
          {PIPELINE_COLUMNS.map((column) => (
            <option key={column.status} value={column.status}>
              {column.label}
            </option>
          ))}
        </select>
        {next && (
          <button
            type="button"
            onClick={() => onMove(next)}
            className="rounded-md px-1.5 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:bg-slate-100 active:bg-slate-200"
            title={`Move to ${next}`}
          >
            →
          </button>
        )}
      </div>
    </li>
  )
}
