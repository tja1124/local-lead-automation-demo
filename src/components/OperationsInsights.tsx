import type { BusinessInsight } from '../utils/businessInsights'
import { getInsightToneClasses } from '../utils/businessInsights'
import { EmptyState } from './ui'

interface OperationsInsightsProps {
  insights: BusinessInsight[]
}

export function OperationsInsights({ insights }: OperationsInsightsProps) {
  if (insights.length === 0) {
    return <EmptyState title="No insights yet" description="Insights appear as your pipeline grows." />
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight) => (
        <article
          key={insight.id}
          className={`rounded-xl border p-4 shadow-sm ${getInsightToneClasses(insight.tone)}`}
        >
          <p className="text-sm font-semibold text-slate-900">{insight.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{insight.detail}</p>
        </article>
      ))}
    </div>
  )
}
