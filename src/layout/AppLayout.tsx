import type { ReactNode } from 'react'
import type { PageId } from '../types/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AppLayoutProps {
  activePage: PageId
  onNavigate: (pageId: PageId) => void
  sidebarOpen: boolean
  onSidebarOpen: () => void
  onSidebarClose: () => void
  children: ReactNode
}

export function AppLayout({
  activePage,
  onNavigate,
  sidebarOpen,
  onSidebarOpen,
  onSidebarClose,
  children,
}: AppLayoutProps) {
  const handleNavigate = (pageId: PageId) => {
    onNavigate(pageId)
    onSidebarClose()
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={onSidebarClose}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header activePage={activePage} onMenuToggle={onSidebarOpen} />
        <main className="flex-1 p-4 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
