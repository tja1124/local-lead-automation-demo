import type { NavItem } from '../types/navigation'

export const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Overview of your lead pipeline and activity',
  },
  {
    id: 'leads',
    label: 'Leads',
    description: 'Manage incoming and active customer leads',
  },
  {
    id: 'automations',
    label: 'Automations',
    description: 'Configure follow-up workflows and triggers',
  },
  {
    id: 'reviews',
    label: 'Reviews',
    description: 'Track and respond to customer reviews',
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Analyze performance and conversion metrics',
  },
]

export const businessName = 'Apex Auto Detailing'
export const appName = 'LeadFlow Demo'
