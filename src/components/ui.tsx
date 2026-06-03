import type { ReactNode } from 'react'
import { DEMO_WALKTHROUGH_STEPS } from '../utils/demoGuide'

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">{children}</div>
}

export function PageHeader({
  label,
  title,
  subtitle,
  showDemoBadge = false,
  actions,
}: {
  label: string
  title: string
  subtitle: string
  showDemoBadge?: boolean
  actions?: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-brand-600">{label}</p>
          {showDemoBadge && <DemoBadge />}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500">{subtitle}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-col gap-2 sm:flex-row">{actions}</div>}
    </section>
  )
}

export function DemoBadge({
  text = 'Local demo',
}: {
  text?: string
}) {
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
      {text}
    </span>
  )
}

export function DemoNotice() {
  return (
    <p className="rounded-lg border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs leading-relaxed text-slate-500 shadow-sm">
      Simulated CRM — all metrics and activity are computed locally in your browser. No external
      APIs or messaging services are used.
    </p>
  )
}

export function SectionLabel({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h3>
      {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
    </div>
  )
}

export function WorkflowHint({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={`min-w-0 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-xs leading-relaxed text-slate-600 ${className}`}
    >
      {children}
    </p>
  )
}

export function DemoGuideBanner({
  onDismiss,
}: {
  onDismiss: () => void
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-brand-200/60 border-l-4 border-l-brand-500 bg-gradient-to-br from-brand-50/80 to-white shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Demo walkthrough
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900 sm:text-lg">
            LeadFlow helps local businesses capture, follow up, and close more jobs
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            This portfolio demo simulates a complete CRM for Apex Auto Detailing — from first
            inquiry to booked detail and review request. All data stays in your browser.
          </p>
          <ol className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {DEMO_WALKTHROUGH_STEPS.map((step) => (
              <li key={step.step} className="flex items-start gap-2.5 text-xs sm:text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                  {step.step}
                </span>
                <span className="min-w-0 text-slate-600">
                  <span className="font-medium text-slate-800">{step.title}</span>
                  {' — '}
                  {step.detail}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="btn-secondary shrink-0 self-start text-xs"
          aria-label="Dismiss demo guide"
        >
          Got it
        </button>
      </div>
    </section>
  )
}

export function KpiCard({
  label,
  value,
  valueClassName = 'text-slate-900',
  compact = false,
}: {
  label: string
  value: string
  valueClassName?: string
  compact?: boolean
}) {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 sm:text-sm sm:normal-case sm:tracking-normal">
        {label}
      </p>
      <p
        className={`mt-1.5 truncate font-semibold ${compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'} ${valueClassName}`}
      >
        {value}
      </p>
    </article>
  )
}

export function SectionCard({
  title,
  description,
  children,
  bodyClassName = '',
  className = '',
}: {
  title: string
  description?: string
  children: ReactNode
  bodyClassName?: string
  className?: string
}) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm ${className}`}
    >
      <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5 sm:py-4">
        <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

export function EmptyState({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="px-4 py-10 text-center sm:px-5">
      <div
        className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400"
        aria-hidden="true"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5a1.125 1.125 0 00-1.125-1.125H3.375a1.125 1.125 0 00-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-700">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      )}
    </div>
  )
}

export function DetailSection({
  title,
  children,
  variant = 'default',
}: {
  title: string
  children: ReactNode
  variant?: 'default' | 'highlight' | 'muted'
}) {
  const variantClasses =
    variant === 'highlight'
      ? 'border-brand-200/80 bg-brand-50/40'
      : variant === 'muted'
        ? 'border-slate-200/80 bg-slate-50/50'
        : 'border-slate-200/80 bg-white'

  return (
    <section className={`rounded-xl border p-4 ${variantClasses}`}>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h4>
      <div className="mt-3">{children}</div>
    </section>
  )
}
