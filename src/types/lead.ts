export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Quote Sent'
  | 'Scheduled'
  | 'Completed'
  | 'Lost'

export type LeadSource =
  | 'Website Form'
  | 'Google Business Profile'
  | 'Facebook Ad'
  | 'Referral'
  | 'Missed Call'

export type ServiceInterest =
  | 'Full Interior Detail'
  | 'Ceramic Coating'
  | 'Paint Correction'
  | 'Maintenance Wash'
  | 'Full Detail Package'
  | 'Fleet Detail'

export type LeadPriority = 'High' | 'Medium' | 'Low'

export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  vehicle: string
  serviceInterest: ServiceInterest
  status: LeadStatus
  source: LeadSource
  estimatedValue: number
  requestedDate: string
  lastContacted: string | null
  priority: LeadPriority
  notes: string
}

export type StatusFilter = 'All' | LeadStatus
