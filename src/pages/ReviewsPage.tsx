import type { Lead } from '../types/lead'
import {
  DemoNotice,
  EmptyState,
  KpiCard,
  PageHeader,
  PageShell,
  SectionCard,
} from '../components/ui'
import { formatDate } from '../utils/format'
import {
  formatRating,
  formatRatingImpact,
  getCompletedJobs,
  getRecentReviews,
  getReputationRecommendations,
  getReviewRequestQueue,
  getReviewRequestReadyLeads,
  getReviewsSummary,
  type ReviewRequestItem,
  type SimulatedReview,
} from '../utils/reviews'

interface ReviewsPageProps {
  leads: Lead[]
}

export function ReviewsPage({ leads }: ReviewsPageProps) {
  const summary = getReviewsSummary(leads)
  const readyLeads = getReviewRequestReadyLeads(leads)
  const requestQueue = getReviewRequestQueue(leads)
  const recentReviews = getRecentReviews(leads)
  const recommendations = getReputationRecommendations(leads)
  const completedJobs = getCompletedJobs(leads)

  return (
    <PageShell>
      <PageHeader
        label="Reputation center"
        title="Review requests"
        subtitle="Simulated Google review tracking for Apex Auto Detailing. No messages are actually sent."
        showDemoBadge
      />

      <DemoNotice />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Completed jobs" value={String(summary.completedJobs)} compact />
        <KpiCard
          label="Review requests ready"
          value={String(summary.reviewRequestsReady)}
          valueClassName="text-amber-600"
          compact
        />
        <KpiCard
          label="Reviews received"
          value={String(summary.reviewsReceived)}
          valueClassName="text-emerald-600"
          compact
        />
        <KpiCard
          label="Avg. rating"
          value={formatRating(summary.avgRating)}
          valueClassName="text-brand-600"
          compact
        />
        <KpiCard
          label="Est. rating impact"
          value={formatRatingImpact(summary.estimatedRatingImpact)}
          valueClassName="text-slate-700"
          compact
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Completed jobs ready for review request"
          description="Finished details eligible for an automated Google review ask."
        >
          {readyLeads.length === 0 ? (
            <EmptyState
              title="No review requests ready"
              description="Completed jobs will appear here when they are ready for a review request."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {readyLeads.map((lead) => (
                <li key={lead.id} className="list-row">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {lead.serviceInterest} · {lead.vehicle}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Completed {formatDate(lead.lastContacted ?? lead.requestedDate)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-600/20 ring-inset">
                      Ready
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Simulated review request queue"
          description="Pending and in-progress review messages based on completed jobs."
        >
          {requestQueue.length === 0 ? (
            <EmptyState
              title="Queue is empty"
              description="No simulated review requests are queued for your completed jobs."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {requestQueue.map((item) => (
                <QueueItem key={item.id} item={item} />
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Recent customer reviews"
          description="Simulated Google reviews from completed customers."
          className="lg:col-span-2"
        >
          {recentReviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              description="Reviews will appear once simulated responses are received from completed jobs."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </ul>
          )}
        </SectionCard>

        <section className="rounded-xl border border-slate-200/80 bg-brand-50/30 p-4 shadow-sm sm:p-5">
          <h3 className="text-sm font-semibold text-slate-900 sm:text-base">Reputation summary</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {buildReputationSummary(completedJobs.length, summary)}
          </p>

          <dl className="mt-4 space-y-2.5 border-t border-slate-200/60 pt-4 text-sm">
            <SummaryRow label="Completed jobs" value={String(summary.completedJobs)} />
            <SummaryRow label="Pending requests" value={String(summary.reviewRequestsReady)} />
            <SummaryRow label="Avg. rating" value={formatRating(summary.avgRating)} />
          </dl>

          {recommendations.length > 0 && (
            <div className="mt-4 border-t border-slate-200/60 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recommendations
              </p>
              <ul className="mt-3 space-y-3">
                {recommendations.map((item) => (
                  <li key={item.id}>
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  )
}

function buildReputationSummary(
  completedCount: number,
  summary: ReturnType<typeof getReviewsSummary>,
): string {
  if (completedCount === 0) {
    return 'No completed jobs yet. As you finish details, review requests and reputation metrics will populate automatically.'
  }

  const parts = [
    `Apex Auto Detailing has ${completedCount} completed ${completedCount === 1 ? 'job' : 'jobs'} in the pipeline.`,
  ]

  if (summary.reviewRequestsReady > 0) {
    parts.push(
      `${summary.reviewRequestsReady} ${summary.reviewRequestsReady === 1 ? 'is' : 'are'} ready for a Google review request.`,
    )
  }

  if (summary.reviewsReceived > 0) {
    parts.push(
      `${summary.reviewsReceived} simulated ${summary.reviewsReceived === 1 ? 'review has' : 'reviews have'} been received with an average rating of ${formatRating(summary.avgRating)} stars.`,
    )
  }

  return parts.join(' ')
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900">{value}</dd>
    </div>
  )
}

function QueueItem({ item }: { item: ReviewRequestItem }) {
  return (
    <li className="flex gap-3 list-row">
      <span
        className={`mt-1.5 flex h-2 w-2 shrink-0 rounded-full ${item.state === 'ready' ? 'bg-amber-500' : 'bg-brand-500'}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{item.queueMessage}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {item.service} · {item.vehicle}
        </p>
      </div>
      <span className="shrink-0 rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
        Simulated
      </span>
    </li>
  )
}

function ReviewCard({ review }: { review: SimulatedReview }) {
  return (
    <li className="list-row">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900">{review.customerName}</p>
          <p className="mt-0.5 text-xs text-slate-500">{review.service}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{review.reviewText}</p>
      <p className="mt-2 text-xs text-slate-400">
        {review.source} · {formatDate(review.reviewDate)}
      </p>
    </li>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          className={`h-3.5 w-3.5 ${index < rating ? 'text-amber-400' : 'text-slate-200'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}
