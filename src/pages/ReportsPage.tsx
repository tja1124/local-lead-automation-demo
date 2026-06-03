import type { Lead, LeadStatus } from '../types/lead'
import { DemoNotice, EmptyState, KpiCard, PageHeader, PageShell } from '../components/ui'
import { formatCurrency, formatDate } from '../utils/format'
import { statusBadgeClasses, statusBarClasses } from '../utils/leadDisplay'
import {
  buildBusinessReportSummary,
  formatPercent,
  getRecentActivity,
  getReportRecommendations,
  getReportSummary,
  getServiceValueBreakdown,
  getSourceBreakdown,
  getStatusBreakdown,
  type CountValueRow,
} from '../utils/reports'

interface ReportsPageProps {
  leads: Lead[]
}

const SOURCE_BAR_CLASSES = [
  'bg-brand-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-slate-500',
]

const SERVICE_BAR_CLASSES = [
  'bg-brand-600',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-slate-500',
  'bg-emerald-500',
]

export function ReportsPage({ leads }: ReportsPageProps) {
  const summary = getReportSummary(leads)
  const statusBreakdown = getStatusBreakdown(leads)
  const sourceBreakdown = getSourceBreakdown(leads)
  const serviceBreakdown = getServiceValueBreakdown(leads)
  const recentActivity = getRecentActivity(leads)
  const businessSummary = buildBusinessReportSummary(leads)
  const recommendations = getReportRecommendations(leads)

  const maxSourceCount = Math.max(...sourceBreakdown.map((row) => row.count), 1)
  const maxServiceValue = Math.max(...serviceBreakdown.map((row) => row.value), 1)

  if (leads.length === 0) {
    return (
      <PageShell>
        <PageHeader
          label="Reporting center"
          title="Business performance reports"
          subtitle="Simulated local reports computed from your current lead pipeline."
          showDemoBadge
        />
        <EmptyState
          title="No report data yet"
          description="Add leads from the Leads page to generate pipeline, source, and service reports."
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        label="Reporting center"
        title="Business performance reports"
        subtitle="Simulated local reports computed from your current lead pipeline."
        showDemoBadge
      />

      <DemoNotice />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Total leads" value={String(summary.totalLeads)} compact />
        <KpiCard label="Open pipeline value" value={formatCurrency(summary.openPipelineValue)} compact />
        <KpiCard
          label="Completed revenue"
          value={formatCurrency(summary.completedRevenue)}
          valueClassName="text-emerald-600"
          compact
        />
        <KpiCard
          label="Win rate"
          value={formatPercent(summary.winRate)}
          valueClassName="text-brand-600"
          compact
        />
        <KpiCard label="Average lead value" value={formatCurrency(summary.averageLeadValue)} compact />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownSection
          title="Pipeline breakdown by status"
          description="Lead volume and estimated value across each pipeline stage."
          rows={statusBreakdown.map((row) => ({
            ...row,
            barClass: statusBarClasses(row.label as LeadStatus),
            meta: `${formatCurrency(row.value)} est. value`,
          }))}
          maxValue={summary.totalLeads}
          valueKey="count"
        />

        <BreakdownSection
          title="Lead source performance"
          description="Which channels are bringing in the most inquiries."
          rows={sourceBreakdown.map((row, index) => ({
            ...row,
            barClass: SOURCE_BAR_CLASSES[index % SOURCE_BAR_CLASSES.length],
            meta: formatCurrency(row.value),
          }))}
          maxValue={maxSourceCount}
          valueKey="count"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900 sm:text-base">Service interest value breakdown</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Estimated pipeline value grouped by requested service type.
          </p>
          <ul className="mt-4 space-y-3">
            {serviceBreakdown.map((row, index) => (
              <BarRow
                key={row.label}
                label={row.label}
                primary={`${formatCurrency(row.value)} · ${row.count} ${row.count === 1 ? 'lead' : 'leads'}`}
                percentage={(row.value / maxServiceValue) * 100}
                barClass={SERVICE_BAR_CLASSES[index % SERVICE_BAR_CLASSES.length]}
              />
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200/80 bg-brand-50/30 p-4 shadow-sm sm:p-5">
          <h3 className="text-sm font-semibold text-slate-900 sm:text-base">Business summary</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{businessSummary}</p>
          <dl className="mt-4 space-y-2.5 border-t border-slate-200/60 pt-4">
            <SummaryRow label="Lost pipeline value" value={formatCurrency(summary.lostPipelineValue)} />
            <SummaryRow label="Open pipeline" value={formatCurrency(summary.openPipelineValue)} />
            <SummaryRow label="Win rate" value={formatPercent(summary.winRate)} />
          </dl>
          {recommendations.length > 0 && (
            <div className="mt-6 border-t border-slate-200/80 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recommendations
              </p>
              <ul className="mt-3 space-y-4">
                {recommendations.map((item) => (
                  <li key={item.id}>
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5 sm:py-4">
          <h3 className="text-sm font-semibold text-slate-900 sm:text-base">Recent lead activity</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Latest inquiries sorted by request date.
          </p>
        </div>
        {recentActivity.length === 0 ? (
          <EmptyState
            title="No recent activity"
            description="Lead activity will appear here as inquiries come in."
          />
        ) : (
        <ul className="divide-y divide-slate-100">
          {recentActivity.map((lead) => (
            <li
              key={lead.id}
              className="flex flex-col gap-3 list-row sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{lead.name}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {lead.serviceInterest} · {lead.source}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Requested {formatDate(lead.requestedDate)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                <StatusBadge status={lead.status} />
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(lead.estimatedValue)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        )}
      </section>
    </PageShell>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900">{value}</dd>
    </div>
  )
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

function BreakdownSection({
  title,
  description,
  rows,
  maxValue,
  valueKey,
}: {
  title: string
  description: string
  rows: Array<CountValueRow & { barClass: string; meta: string }>
  maxValue: number
  valueKey: 'count' | 'value'
}) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h3>
      <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <BarRow
            key={row.label}
            label={row.label}
            primary={`${row.count} · ${row.meta}`}
            percentage={(row[valueKey] / maxValue) * 100}
            barClass={row.barClass}
          />
        ))}
      </ul>
    </section>
  )
}

function BarRow({
  label,
  primary,
  percentage,
  barClass,
}: {
  label: string
  primary: string
  percentage: number
  barClass: string
}) {
  return (
    <li>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="shrink-0 text-slate-500">{primary}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </li>
  )
}
