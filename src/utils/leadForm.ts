import type { Lead, LeadSource, LeadPriority, ServiceInterest } from '../types/lead'

export const SERVICE_OPTIONS: ServiceInterest[] = [
  'Full Interior Detail',
  'Ceramic Coating',
  'Paint Correction',
  'Maintenance Wash',
  'Full Detail Package',
  'Fleet Detail',
]

export const SOURCE_OPTIONS: LeadSource[] = [
  'Website Form',
  'Google Business Profile',
  'Facebook Ad',
  'Referral',
  'Missed Call',
]

export interface LeadFormData {
  name: string
  phone: string
  email: string
  vehicle: string
  serviceInterest: ServiceInterest
  source: LeadSource
  requestedDate: string
  estimatedValue: string
  notes: string
}

export type LeadFormErrors = Partial<Record<keyof LeadFormData, string>>

export function getDefaultFormData(): LeadFormData {
  return {
    name: '',
    phone: '',
    email: '',
    vehicle: '',
    serviceInterest: 'Full Detail Package',
    source: 'Website Form',
    requestedDate: new Date().toISOString().slice(0, 10),
    estimatedValue: '',
    notes: '',
  }
}

export function validateLeadForm(data: LeadFormData): LeadFormErrors {
  const errors: LeadFormErrors = {}

  if (!data.name.trim()) {
    errors.name = 'Customer name is required.'
  }

  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required.'
  }

  if (data.email.trim() && !data.email.includes('@')) {
    errors.email = 'Enter a valid email address or leave blank.'
  }

  if (!data.vehicle.trim()) {
    errors.vehicle = 'Vehicle is required.'
  }

  if (!data.serviceInterest) {
    errors.serviceInterest = 'Service interest is required.'
  }

  if (!data.source) {
    errors.source = 'Lead source is required.'
  }

  if (!data.requestedDate) {
    errors.requestedDate = 'Requested date is required.'
  }

  const value = data.estimatedValue.trim()
  if (!value) {
    errors.estimatedValue = 'Estimated value is required.'
  } else {
    const parsed = Number(value)
    if (Number.isNaN(parsed) || parsed < 0) {
      errors.estimatedValue = 'Enter a valid non-negative number.'
    }
  }

  return errors
}

export function generateLeadId(existingLeads: Lead[]): string {
  const maxNum = existingLeads.reduce((max, lead) => {
    const match = lead.id.match(/^lead-(\d+)$/)
    return match ? Math.max(max, Number.parseInt(match[1], 10)) : max
  }, 0)

  return `lead-${String(maxNum + 1).padStart(3, '0')}`
}

function derivePriority(estimatedValue: number): LeadPriority {
  return estimatedValue > 1000 ? 'High' : 'Medium'
}

export function createLeadFromForm(data: LeadFormData, existingLeads: Lead[]): Lead {
  const estimatedValue = Number.parseFloat(data.estimatedValue.trim())

  return {
    id: generateLeadId(existingLeads),
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    vehicle: data.vehicle.trim(),
    serviceInterest: data.serviceInterest,
    status: 'New',
    source: data.source,
    estimatedValue,
    requestedDate: data.requestedDate,
    lastContacted: null,
    priority: derivePriority(estimatedValue),
    notes: data.notes.trim() || 'No notes provided.',
  }
}
