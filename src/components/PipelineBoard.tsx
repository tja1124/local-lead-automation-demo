import { useMemo, useState } from 'react'
import type { Activity } from '../types/activity'
import type { FollowUpTask } from '../types/task'
import type { Lead, LeadPriority, LeadStatus } from '../types/lead'
import { LeadScoreBadge } from './LeadScoreBadge'
import { EmptyState } from './ui'
import { formatCurrency } from '../utils/format'
import { calculateLeadScore } from '../utils/leadScoring'
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
  return <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color}`} title={`${priority} priority`} />
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
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-3">
        {PIPELINE_COLUMNS.map((column) => {
          const columnLeads = grouped[column.status]
          const columnValue = columnLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0)
          const isDropTarget = dropTarget === column.status

          return (
            <div
              key={column.status}
              className={`flex w-56 shrink-0 flex-col rounded-xl border bg-slate-50/80 sm:w-60 ${
                isDropTarget ? 'border-brand-400 ring-2 ring-brand-200' : 'border-slate-200/80'
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
              <div className="border-b border-slate-200/80 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    {column.label}
                  </h3>
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
                    {columnLeads.length}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">{formatCurrency(columnValue)}</p>
              </div>

              <ul className="flex max-h-[28rem] flex-1 flex-col gap-2 overflow-y-auto p-2">
                {columnLeads.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-slate-200 px-2 py-6 text-center text-[11px] text-slate-400">
                    Drop leads here
                  </li>
                ) : (
                  columnLeads.map((lead) => (
                    <PipelineCard
                      key={lead.id}
                      lead={lead}
                      score={calculateLeadScore(lead, activities, tasks)}
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
                  ))
                )}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PipelineCard({
  lead,
  score,
  isSelected,
  isDragging,
  onSelect,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead
  score: number
  isSelected: boolean
  isDragging: boolean
  onSelect: () => void
  onMove: (status: LeadStatus) => void
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const { prev, next } = getAdjacentPipelineStatus(lead.status)

  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`rounded-lg border bg-white p-2.5 shadow-sm transition-opacity ${
        isDragging ? 'opacity-50' : ''
      } ${isSelected ? 'border-brand-400 ring-1 ring-brand-200' : 'border-slate-200/80'}`}
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-slate-900">{lead.name}</p>
          <PriorityDot priority={lead.priority} />
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">{lead.serviceInterest}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-900">{formatCurrency(lead.estimatedValue)}</p>
          <LeadScoreBadge score={score} compact />
        </div>
        <p className="mt-1 truncate text-[10px] text-slate-400">{lead.source}</p>
      </button>

      <div className="mt-2 flex items-center gap-1 border-t border-slate-100 pt-2">
        {prev && (
          <button
            type="button"
            onClick={() => onMove(prev)}
            className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-100"
            title={`Move to ${prev}`}
          >
            ←
          </button>
        )}
        <select
          value={lead.status}
          onChange={(event) => onMove(event.target.value as LeadStatus)}
          className="min-w-0 flex-1 rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px] text-slate-600"
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
            className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-100"
            title={`Move to ${next}`}
          >
            →
          </button>
        )}
      </div>
    </li>
  )
}
