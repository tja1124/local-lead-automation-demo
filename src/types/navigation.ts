export type PageId =
  | 'dashboard'
  | 'leads'
  | 'automations'
  | 'reviews'
  | 'reports'

export interface NavItem {
  id: PageId
  label: string
  description: string
}
