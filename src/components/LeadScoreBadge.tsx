import { getLeadScoreTier, getScoreTierClasses } from '../utils/leadScoring'

interface LeadScoreBadgeProps {
  score: number
  compact?: boolean
}

export function LeadScoreBadge({ score, compact = false }: LeadScoreBadgeProps) {
  const tier = getLeadScoreTier(score)

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getScoreTierClasses(tier)}`}
      title={`Lead score ${score}/100`}
    >
      {!compact && <span className="font-semibold">{score}</span>}
      <span>{tier}</span>
    </span>
  )
}
