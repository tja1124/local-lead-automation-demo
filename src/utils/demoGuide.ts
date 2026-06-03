const DEMO_GUIDE_KEY = 'leadflow-demo-guide-dismissed'

export function isDemoGuideDismissed(): boolean {
  try {
    return localStorage.getItem(DEMO_GUIDE_KEY) === 'true'
  } catch {
    return false
  }
}

export function dismissDemoGuide(): void {
  try {
    localStorage.setItem(DEMO_GUIDE_KEY, 'true')
  } catch {
    // ignore storage errors in demo mode
  }
}

export const DEMO_WALKTHROUGH_STEPS = [
  {
    step: 1,
    title: 'Start on the Dashboard',
    detail: 'Review business health, priorities, and revenue opportunities at a glance.',
  },
  {
    step: 2,
    title: 'Work leads in the CRM',
    detail: 'Use Inbox for detail work or Pipeline to drag leads between stages.',
  },
  {
    step: 3,
    title: 'Take quick actions',
    detail: 'Mark contacted, send quotes, and complete jobs — all logged locally.',
  },
  {
    step: 4,
    title: 'Track performance',
    detail: 'Reports and Reviews update automatically from your lead pipeline.',
  },
] as const
