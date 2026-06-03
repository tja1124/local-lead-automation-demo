import type { PageId } from '../types/navigation'
import { NavIcon } from '../components/NavIcon'
import { navItems, businessName, appName } from '../data/navigation'

interface SidebarProps {
  activePage: PageId
  onNavigate: (pageId: PageId) => void
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ activePage, onNavigate, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white shadow-sm">
            AA
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{businessName}</p>
            <p className="truncate text-xs text-slate-500">{appName}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
            Menu
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className={isActive ? 'text-brand-600' : 'text-slate-400'}>
                      <NavIcon pageId={item.id} />
                    </span>
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-2.5">
            <p className="text-xs font-medium text-slate-700">Local demo mode</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Data persists in your browser. No real messages sent.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
