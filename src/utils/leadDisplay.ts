import type { LeadStatus } from '../types/lead'

export function statusBadgeClasses(status: LeadStatus): string {
  switch (status) {
    case 'New':
      return 'bg-blue-50 text-blue-700 ring-blue-600/20'
    case 'Contacted':
      return 'bg-violet-50 text-violet-700 ring-violet-600/20'
    case 'Quote Sent':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20'
    case 'Scheduled':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
    case 'Completed':
      return 'bg-slate-100 text-slate-600 ring-slate-500/20'
    case 'Lost':
      return 'bg-red-50 text-red-700 ring-red-600/20'
  }
}

export function statusBarClasses(status: LeadStatus): string {
  switch (status) {
    case 'New':
      return 'bg-blue-500'
    case 'Contacted':
      return 'bg-violet-500'
    case 'Quote Sent':
      return 'bg-amber-500'
    case 'Scheduled':
      return 'bg-emerald-500'
    case 'Completed':
      return 'bg-slate-400'
    case 'Lost':
      return 'bg-red-400'
  }
}
