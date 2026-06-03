import { useState } from 'react'
import type { PageId } from './types/navigation'
import { useLeads } from './hooks/useLeads'
import { AppLayout } from './layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LeadsPage } from './pages/LeadsPage'
import { AutomationsPage } from './pages/AutomationsPage'
import { ReviewsPage } from './pages/ReviewsPage'
import { ReportsPage } from './pages/ReportsPage'

interface LeadsNavigationOptions {
  openForm?: boolean
  view?: 'inbox' | 'pipeline'
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [leadsOpenForm, setLeadsOpenForm] = useState(false)
  const [leadsInitialView, setLeadsInitialView] = useState<'inbox' | 'pipeline'>('inbox')
  const {
    leads,
    activities,
    tasks,
    addLeadFromForm,
    performLeadAction,
    moveLeadStatus,
    toggleTaskComplete,
    resetDemoData,
  } = useLeads()

  const navigateToLeads = (options?: LeadsNavigationOptions) => {
    setLeadsOpenForm(Boolean(options?.openForm))
    setLeadsInitialView(options?.view ?? 'inbox')
    setActivePage('leads')
  }

  const renderPage = (pageId: PageId) => {
    switch (pageId) {
      case 'dashboard':
        return (
          <DashboardPage
            leads={leads}
            activities={activities}
            tasks={tasks}
            onNavigateToLeads={navigateToLeads}
            onLeadAction={performLeadAction}
          />
        )
      case 'leads':
        return (
          <LeadsPage
            leads={leads}
            activities={activities}
            tasks={tasks}
            onAddLead={addLeadFromForm}
            onLeadAction={performLeadAction}
            onMoveLeadStatus={moveLeadStatus}
            onToggleTask={toggleTaskComplete}
            onResetDemoData={resetDemoData}
            openFormOnMount={leadsOpenForm}
            initialView={leadsInitialView}
            onMountHandled={() => {
              setLeadsOpenForm(false)
              setLeadsInitialView('inbox')
            }}
          />
        )
      case 'automations':
        return <AutomationsPage leads={leads} />
      case 'reviews':
        return <ReviewsPage leads={leads} />
      case 'reports':
        return <ReportsPage leads={leads} />
    }
  }

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={setActivePage}
      sidebarOpen={sidebarOpen}
      onSidebarOpen={() => setSidebarOpen(true)}
      onSidebarClose={() => setSidebarOpen(false)}
    >
      {renderPage(activePage)}
    </AppLayout>
  )
}
