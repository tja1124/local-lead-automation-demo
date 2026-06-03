import type { Lead } from '../types/lead'
import { formatDate } from './format'

export type ReviewState = 'ready' | 'queued' | 'received'

export interface SimulatedReview {
  id: string
  leadId: string
  customerName: string
  service: string
  rating: number
  reviewText: string
  reviewDate: string
  source: 'Google Business Profile'
}

export interface ReviewRequestItem {
  id: string
  leadId: string
  customerName: string
  service: string
  vehicle: string
  completedDate: string
  state: ReviewState
  queueMessage: string
}

export interface ReputationRecommendation {
  id: string
  title: string
  description: string
}

const KNOWN_REVIEW_STATES: Record<string, ReviewState> = {
  'lead-007': 'received',
  'lead-011': 'ready',
}

const SIMULATED_REVIEWS: Record<string, Omit<SimulatedReview, 'id' | 'leadId'>> = {
  'lead-007': {
    customerName: 'Tyler Hammond',
    service: 'Full Detail Package',
    rating: 5,
    reviewText:
      'Incredible work on my Tacoma. Bed liner looks brand new and the interior smells amazing. Will definitely be back.',
    reviewDate: '2026-05-26',
    source: 'Google Business Profile',
  },
}

function getLeadNumericId(id: string): number {
  const match = id.match(/(\d+)$/)
  return match ? Number.parseInt(match[1], 10) : 0
}

export function getReviewState(lead: Lead): ReviewState {
  if (KNOWN_REVIEW_STATES[lead.id]) return KNOWN_REVIEW_STATES[lead.id]

  const numericId = getLeadNumericId(lead.id)
  if (numericId % 3 === 0) return 'received'
  if (numericId % 3 === 1) return 'queued'
  return 'ready'
}

function sortCompletedLeads(leads: Lead[]): Lead[] {
  return [...leads]
    .filter((lead) => lead.status === 'Completed')
    .sort((a, b) => {
      const dateCompare = b.requestedDate.localeCompare(a.requestedDate)
      if (dateCompare !== 0) return dateCompare
      return a.id.localeCompare(b.id)
    })
}

export function getCompletedJobs(leads: Lead[]): Lead[] {
  return sortCompletedLeads(leads)
}

export function getReviewRequestReadyLeads(leads: Lead[]): Lead[] {
  return getCompletedJobs(leads).filter((lead) => getReviewState(lead) === 'ready')
}

export function getReviewRequestQueue(leads: Lead[]): ReviewRequestItem[] {
  return getCompletedJobs(leads)
    .filter((lead) => getReviewState(lead) === 'ready' || getReviewState(lead) === 'queued')
    .map((lead) => {
      const state = getReviewState(lead)
      return {
        id: `review-queue-${lead.id}`,
        leadId: lead.id,
        customerName: lead.name,
        service: lead.serviceInterest,
        vehicle: lead.vehicle,
        completedDate: lead.lastContacted ?? lead.requestedDate,
        state,
        queueMessage:
          state === 'ready'
            ? `Google review request ready for ${lead.name}`
            : `Review request sent to ${lead.name} — awaiting response`,
      }
    })
}

export function getRecentReviews(leads: Lead[]): SimulatedReview[] {
  return getCompletedJobs(leads)
    .filter((lead) => getReviewState(lead) === 'received')
    .map((lead) => {
      const preset = SIMULATED_REVIEWS[lead.id]
      if (preset) {
        return { id: `review-${lead.id}`, leadId: lead.id, ...preset }
      }

      return {
        id: `review-${lead.id}`,
        leadId: lead.id,
        customerName: lead.name,
        service: lead.serviceInterest,
        rating: 5,
        reviewText: `Great experience with ${lead.serviceInterest.toLowerCase()}. Professional team and excellent results on my ${lead.vehicle}.`,
        reviewDate: lead.lastContacted ?? lead.requestedDate,
        source: 'Google Business Profile' as const,
      }
    })
    .sort((a, b) => b.reviewDate.localeCompare(a.reviewDate))
}

export function getReviewsSummary(leads: Lead[]) {
  const completedJobs = getCompletedJobs(leads)
  const reviewRequestsReady = getReviewRequestReadyLeads(leads).length
  const recentReviews = getRecentReviews(leads)
  const reviewsReceived = recentReviews.length
  const avgRating =
    reviewsReceived > 0
      ? recentReviews.reduce((sum, review) => sum + review.rating, 0) / reviewsReceived
      : 0
  const estimatedRatingImpact = reviewRequestsReady * 0.04 + reviewsReceived * 0.02

  return {
    completedJobs: completedJobs.length,
    reviewRequestsReady,
    reviewsReceived,
    avgRating,
    estimatedRatingImpact,
  }
}

export function getReputationRecommendations(leads: Lead[]): ReputationRecommendation[] {
  const ready = getReviewRequestReadyLeads(leads)
  const queued = getCompletedJobs(leads).filter((lead) => getReviewState(lead) === 'queued')
  const recommendations: ReputationRecommendation[] = []

  if (ready.length > 0) {
    recommendations.push({
      id: 'send-review-requests',
      title: 'Send pending review requests',
      description: `${ready.length} completed ${ready.length === 1 ? 'job is' : 'jobs are'} ready for a Google review request. Automating this step typically lifts local ratings within 30 days.`,
    })
  }

  if (queued.length > 0) {
    recommendations.push({
      id: 'follow-up-review-requests',
      title: 'Follow up on sent requests',
      description: `${queued.length} review ${queued.length === 1 ? 'request was' : 'requests were'} sent and ${queued.length === 1 ? 'is' : 'are'} awaiting a customer response.`,
    })
  }

  if (getRecentReviews(leads).length > 0) {
    recommendations.push({
      id: 'respond-to-reviews',
      title: 'Respond to recent reviews',
      description:
        'Replying to new Google reviews builds trust and improves visibility in local search results.',
    })
  }

  if (recommendations.length === 0 && getCompletedJobs(leads).length === 0) {
    recommendations.push({
      id: 'complete-jobs-first',
      title: 'Complete jobs to unlock review requests',
      description:
        'Review automation activates after jobs are marked Completed in your lead pipeline.',
    })
  }

  return recommendations
}

export function formatRating(value: number): string {
  return value > 0 ? value.toFixed(1) : '—'
}

export function formatRatingImpact(value: number): string {
  if (value <= 0) return '—'
  return `+${value.toFixed(2)} projected`
}

export function formatReviewDate(dateStr: string): string {
  return formatDate(dateStr)
}
