import type { View } from '../types/navigation'

interface HeaderProps {
  view: View
  onNavigate: (view: View) => void
}

type Section = 'dashboard' | 'list' | 'data' | 'new'

/** Detail and edit screens belong to the "Test Cases" section. */
function currentSection(view: View): Section {
  if (view.name === 'view' || view.name === 'edit') return 'list'
  return view.name
}

const NAV_ITEMS: { section: Exclude<Section, 'new'>; label: string }[] = [
  { section: 'dashboard', label: 'Dashboard' },
  { section: 'list', label: 'Test Cases' },
  { section: 'data', label: 'Import / Export' },
]

export function Header({ view, onNavigate }: HeaderProps) {
  const active = currentSection(view)

  return (
    <header className="app-header">
      <div className="container app-header__inner">
        <button
          type="button"
          className="brand"
          onClick={() => onNavigate({ name: 'dashboard' })}
          aria-label="QA Test Case Tracker, go to dashboard"
        >
          <span className="brand__logo" aria-hidden="true">
            ✓
          </span>
          <span className="brand__name">QA Test Case Tracker</span>
        </button>

        <nav className="app-nav" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.section}
              type="button"
              className={`app-nav__link${active === item.section ? ' app-nav__link--active' : ''}`}
              aria-current={active === item.section ? 'page' : undefined}
              onClick={() => onNavigate({ name: item.section })}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="btn btn--primary app-header__cta"
          aria-label="New Test Case"
          aria-current={active === 'new' ? 'page' : undefined}
          onClick={() => onNavigate({ name: 'new' })}
        >
          {/* On small screens only "+ New" is shown; the full name stays available to screen readers */}
          <span aria-hidden="true">+</span> New<span className="app-header__cta-extra"> Test Case</span>
        </button>
      </div>
    </header>
  )
}
