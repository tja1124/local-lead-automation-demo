import type { NavItem } from '../types/navigation'

export const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Business health, priorities, and revenue opportunities',
  },
  {
    id: 'leads',
    label: 'Leads',
    description: 'Inbox, pipeline board, and CRM actions',
  },
  {
    id: 'automations',
    label: 'Automations',
    description: 'Simulated follow-up workflows and triggers',
  },
  {
    id: 'reviews',
    label: 'Reviews',
    description: 'Google review requests and reputation tracking',
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Pipeline, source, and service performance',
  },
]

export const businessName = 'Apex Auto Detailing'
export const appName = 'LeadFlow Demo'
