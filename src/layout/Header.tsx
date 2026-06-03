import type { PageId } from '../types/navigation'
import { DemoBadge } from '../components/ui'
import { navItems } from '../data/navigation'

interface HeaderProps {
  activePage: PageId
  onMenuToggle: () => void
}

export function Header({ activePage, onMenuToggle }: HeaderProps) {
  const currentPage = navItems.find((item) => item.id === activePage)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all duration-150 hover:bg-slate-50 active:scale-[0.98] lg:hidden"
          onClick={onMenuToggle}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-slate-900">
            {currentPage?.label ?? 'Dashboard'}
          </h1>
          <p className="hidden truncate text-sm text-slate-500 sm:block">
            {currentPage?.description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <DemoBadge text="Portfolio demo" />
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 ring-1 ring-brand-200"
          aria-hidden="true"
        >
          AA
        </div>
      </div>
    </header>
  )
}
