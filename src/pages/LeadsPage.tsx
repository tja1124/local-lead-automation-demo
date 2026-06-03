import { useEffect, useMemo, useState } from 'react'
import { LeadCaptureModal } from '../components/LeadCaptureModal'
import { LeadDetailPanel } from '../components/LeadDetailPanel'
import { LeadScoreBadge } from '../components/LeadScoreBadge'
import { PipelineBoard } from '../components/PipelineBoard'
import { EmptyState, KpiCard, PageHeader, PageShell } from '../components/ui'
import type { Activity } from '../types/activity'
import type { FollowUpTask } from '../types/task'
import type { Lead, LeadPriority, LeadStatus, StatusFilter } from '../types/lead'
import type { LeadCrmAction } from '../types/leadOperations'
import { getActivitiesForLead } from '../utils/activities'
import { formatCurrency } from '../utils/format'
import type { LeadFormData } from '../utils/leadForm'
import { isPipelineLead } from '../utils/leadMetrics'
import { statusBadgeClasses } from '../utils/leadDisplay'
import { searchLeads } from '../utils/leadSearch'
import { calculateLeadScore } from '../utils/leadScoring'
import { getTasksForLead } from '../utils/tasks'

type LeadsViewMode = 'inbox' | 'pipeline'

interface LeadsPageProps {
  leads: Lead[]
  activities: Activity[]
  tasks: FollowUpTask[]
  onAddLead: (formData: LeadFormData) => Lead
  onLeadAction: (leadId: string, action: LeadCrmAction) => Lead | null
  onMoveLeadStatus: (leadId: string, status: LeadStatus) => Lead | null
  onToggleTask: (taskId: string) => void
  onResetDemoData: () => Lead[]
  openFormOnMount?: boolean
  initialView?: LeadsViewMode
  onMountHandled?: () => void
}

const STATUS_FILTERS: StatusFilter[] = [
  'All',
  'New',
  'Contacted',
  'Quote Sent',
  'Scheduled',
  'Completed',
  'Lost',
]

function filterLeadsByStatus(leads: Lead[], filter: StatusFilter): Lead[] {
  if (filter === 'All') return leads
  return leads.filter((lead) => lead.status === filter)
}

function getVisibleLeads(leads: Lead[], statusFilter: StatusFilter, searchQuery: string): Lead[] {
  return searchLeads(filterLeadsByStatus(leads, statusFilter), searchQuery)
}

function priorityClasses(priority: LeadPriority): string {
  switch (priority) {
    case 'High':
      return 'text-red-600'
    case 'Medium':
      return 'text-amber-600'
    case 'Low':
      return 'text-slate-400'
  }
}

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClasses(status)}`}
    >
      {status}
    </span>
  )
}

function PriorityIndicator({ priority }: { priority: LeadPriority }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${priorityClasses(priority)}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${priority === 'High' ? 'bg-red-500' : priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-300'}`}
      />
      {priority}
    </span>
  )
}

export function LeadsPage({
  leads,
  activities,
  tasks,
  onAddLead,
  onLeadAction,
  onMoveLeadStatus,
  onToggleTask,
  onResetDemoData,
  openFormOnMount = false,
  initialView = 'inbox',
  onMountHandled,
}: LeadsPageProps) {
  const [viewMode, setViewMode] = useState<LeadsViewMode>(initialView)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLeadId, setSelectedLeadId] = useState(() => leads[0]?.id ?? '')
  const [isFormOpen, setIsFormOpen] = useState(openFormOnMount)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (openFormOnMount) setIsFormOpen(true)
    if (initialView !== 'inbox') setViewMode(initialView)
    onMountHandled?.()
  }, [])

  const visibleLeads = useMemo(
    () => getVisibleLeads(leads, statusFilter, searchQuery),
    [leads, statusFilter, searchQuery],
  )

  const selectedLead =
    leads.find((lead) => lead.id === selectedLeadId) ??
    visibleLeads.find((lead) => lead.id === selectedLeadId) ??
    visibleLeads[0] ??
    null

  const totalLeads = leads.length
  const newLeads = leads.filter((lead) => lead.status === 'New').length
  const scheduledLeads = leads.filter((lead) => lead.status === 'Scheduled').length
  const pipelineValue = leads
    .filter(isPipelineLead)
    .reduce((sum, lead) => sum + lead.estimatedValue, 0)

  const hasActiveSearch = searchQuery.trim().length > 0
  const hasActiveFilter = statusFilter !== 'All'

  const selectFirstVisibleLead = (nextLeads: Lead[], filter: StatusFilter, query: string) => {
    const visible = getVisibleLeads(nextLeads, filter, query)
    if (visible.length > 0) {
      setSelectedLeadId(visible[0].id)
    }
  }

  const handleFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter)
    selectFirstVisibleLead(leads, filter, searchQuery)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    selectFirstVisibleLead(leads, statusFilter, query)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    selectFirstVisibleLead(leads, statusFilter, '')
  }

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId)
  }

  const handleAddLead = (formData: LeadFormData) => {
    const newLead = onAddLead(formData)

    setStatusFilter('All')
    setSearchQuery('')
    setSelectedLeadId(newLead.id)
    setSuccessMessage(`${newLead.name} was added to your lead inbox.`)

    window.setTimeout(() => setSuccessMessage(null), 5000)
  }

  const selectedLeadActivities = useMemo(
    () => (selectedLead ? getActivitiesForLead(activities, selectedLead.id) : []),
    [activities, selectedLead],
  )

  const selectedLeadTasks = useMemo(
    () => (selectedLead ? getTasksForLead(tasks, selectedLead.id) : []),
    [tasks, selectedLead],
  )

  const handleResetDemoData = () => {
    const confirmed = window.confirm(
      'Reset to the original 13 demo leads? Any leads you added will be removed.',
    )
    if (!confirmed) return

    const restored = onResetDemoData()
    setStatusFilter('All')
    setSearchQuery('')
    setSelectedLeadId(restored[0]?.id ?? '')
    setSuccessMessage('Demo data restored to the original 13 leads.')

    window.setTimeout(() => setSuccessMessage(null), 5000)
  }

  return (
    <PageShell>
      <PageHeader
        label="Lead inbox"
        title="Manage customer inquiries"
        subtitle="Track quote requests, follow-ups, and bookings for Apex Auto Detailing."
        actions={
          <>
            <button type="button" onClick={handleResetDemoData} className="btn-secondary">
              Reset demo data
            </button>
            <button type="button" onClick={() => setIsFormOpen(true)} className="btn-primary inline-flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Lead
            </button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        <ViewModeButton
          label="Inbox"
          active={viewMode === 'inbox'}
          onClick={() => setViewMode('inbox')}
        />
        <ViewModeButton
          label="Pipeline"
          active={viewMode === 'pipeline'}
          onClick={() => setViewMode('pipeline')}
        />
      </div>

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm"
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
          <p className="text-sm font-medium text-emerald-900">{successMessage}</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total leads" value={String(totalLeads)} compact />
        <KpiCard label="New leads" value={String(newLeads)} valueClassName="text-blue-600" compact />
        <KpiCard label="Scheduled" value={String(scheduledLeads)} valueClassName="text-emerald-600" compact />
        <KpiCard label="Est. pipeline value" value={formatCurrency(pipelineValue)} compact />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        {viewMode === 'pipeline' ? (
          <div className="flex flex-col xl:flex-row xl:items-start">
            <div className="min-w-0 flex-1 border-b border-slate-100 p-3 sm:p-4 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto xl:border-b-0 xl:border-r">
              <PipelineBoard
                leads={leads}
                activities={activities}
                tasks={tasks}
                selectedLeadId={selectedLeadId}
                onSelectLead={handleSelectLead}
                onMoveLead={onMoveLeadStatus}
              />
            </div>
            <aside className="w-full shrink-0 xl:sticky xl:top-20 xl:w-[22rem] xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto 2xl:w-96">
              {selectedLead ? (
                <LeadDetailPanel
                  lead={selectedLead}
                  activities={selectedLeadActivities}
                  tasks={selectedLeadTasks}
                  onLeadAction={(action) => onLeadAction(selectedLead.id, action)}
                  onToggleTask={onToggleTask}
                />
              ) : (
                <EmptyState
                  title="Select a pipeline card"
                  description="Choose a lead from the board to view details and take action."
                />
              )}
            </aside>
          </div>
        ) : (
          <>
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((filter) => {
                  const count =
                    filter === 'All'
                      ? leads.length
                      : leads.filter((lead) => lead.status === filter).length
                  const isActive = statusFilter === filter
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => handleFilterChange(filter)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {filter}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-xs ${
                          isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
              {(hasActiveSearch || hasActiveFilter) && (
                <p className="mt-3 text-sm text-slate-500">
                  Showing {visibleLeads.length} of {leads.length} leads
                </p>
              )}
            </div>

            <div className="relative w-full shrink-0 lg:max-w-xs">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search leads..."
                aria-label="Search leads"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {hasActiveSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1 border-b border-slate-100 xl:max-h-[42rem] xl:overflow-y-auto xl:border-b-0 xl:border-r">
            {visibleLeads.length === 0 ? (
              <EmptyLeadsState
                hasActiveSearch={hasActiveSearch}
                hasActiveFilter={hasActiveFilter}
                statusFilter={statusFilter}
                onClearSearch={handleClearSearch}
                onClearFilter={() => handleFilterChange('All')}
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {visibleLeads.map((lead) => {
                  const isSelected = selectedLead?.id === lead.id
                  const isHighPriority = lead.priority === 'High'
                  return (
                    <li key={lead.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectLead(lead.id)}
                        className={`flex w-full flex-col gap-2 border-l-2 px-4 py-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
                          isSelected
                            ? 'border-l-brand-600 bg-brand-50/60'
                            : isHighPriority
                              ? 'border-l-red-400 hover:bg-red-50/30'
                              : 'border-l-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-slate-900">{lead.name}</p>
                            {isHighPriority && (
                              <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600 ring-1 ring-red-200 ring-inset">
                                High
                              </span>
                            )}
                            <StatusBadge status={lead.status} />
                            <LeadScoreBadge
                              score={calculateLeadScore(lead, activities, tasks)}
                              compact
                            />
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {lead.vehicle} · {lead.serviceInterest}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">{lead.source}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {formatCurrency(lead.estimatedValue)}
                          </p>
                          <PriorityIndicator priority={lead.priority} />
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <aside className="w-full shrink-0 xl:sticky xl:top-20 xl:w-[22rem] xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto 2xl:w-96">
            {selectedLead ? (
              <LeadDetailPanel
                lead={selectedLead}
                activities={selectedLeadActivities}
                tasks={selectedLeadTasks}
                onLeadAction={(action) => onLeadAction(selectedLead.id, action)}
                onToggleTask={onToggleTask}
              />
            ) : (
              <EmptyState
                title="No lead selected"
                description="Adjust your filters or search to find leads."
              />
            )}
          </aside>
        </div>
          </>
        )}
      </section>

      <LeadCaptureModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddLead}
      />
    </PageShell>
  )
}

function ViewModeButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-brand-600 text-white shadow-sm'
          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  )
}

function EmptyLeadsState({
  hasActiveSearch,
  hasActiveFilter,
  statusFilter,
  onClearSearch,
  onClearFilter,
}: {
  hasActiveSearch: boolean
  hasActiveFilter: boolean
  statusFilter: StatusFilter
  onClearSearch: () => void
  onClearFilter: () => void
}) {
  const isSearchEmpty = hasActiveSearch && hasActiveFilter
  const title = isSearchEmpty
    ? 'No matching leads'
    : hasActiveSearch
      ? 'No search results'
      : 'No leads in this view'

  const description = isSearchEmpty
    ? `No leads in "${statusFilter}" match your search. Try broadening your filters or search terms.`
    : hasActiveSearch
      ? 'Try a different name, phone number, vehicle, service, source, or status.'
      : `There are no leads with status "${statusFilter}". Try another filter.`

  return (
    <div className="flex flex-col items-center px-6 py-12 text-center sm:py-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      <p className="mt-4 text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {hasActiveSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Clear search
          </button>
        )}
        {hasActiveFilter && (
          <button
            type="button"
            onClick={onClearFilter}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Show all leads
          </button>
        )}
      </div>
    </div>
  )
}
