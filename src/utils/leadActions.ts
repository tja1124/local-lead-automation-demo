import type { LeadStatus } from '../types/lead'

export function getRecommendedNextAction(status: LeadStatus): string {
  switch (status) {
    case 'New':
      return 'Call or text this lead within 5 minutes.'
    case 'Contacted':
      return 'Send quote or schedule service.'
    case 'Quote Sent':
      return 'Follow up on quote and ask if they want to book.'
    case 'Scheduled':
      return 'Confirm appointment details.'
    case 'Completed':
      return 'Send review request.'
    case 'Lost':
      return 'No active action needed.'
  }
}
