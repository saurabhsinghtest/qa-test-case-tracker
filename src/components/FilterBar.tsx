import { PRIORITIES, TEST_STATUSES } from '../types/testCase'
import {
  ALL,
  DEFAULT_FILTERS,
  isFiltered,
  SORT_OPTIONS,
  type SortOption,
  type TestCaseFilters,
} from '../utils/filters'

interface FilterBarProps {
  filters: TestCaseFilters
  modules: string[]
  resultCount: number
  totalCount: number
  onChange: (filters: TestCaseFilters) => void
}

export function FilterBar({ filters, modules, resultCount, totalCount, onChange }: FilterBarProps) {
  function update<K extends keyof TestCaseFilters>(key: K, value: TestCaseFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="filter-bar" role="search" aria-label="Filter test cases">
      <div className="filter-bar__search field">
        <label htmlFor="filter-search" className="field__label">
          Search
        </label>
        <input
          id="filter-search"
          type="search"
          className="input"
          placeholder="Search by ID, title, module or description…"
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
        />
      </div>

      <div className="filter-bar__selects">
        <div className="field">
          <label htmlFor="filter-status" className="field__label">
            Status
          </label>
          <select
            id="filter-status"
            className="select"
            value={filters.status}
            onChange={(e) => update('status', e.target.value as TestCaseFilters['status'])}
          >
            <option value={ALL}>All statuses</option>
            {TEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-priority" className="field__label">
            Priority
          </label>
          <select
            id="filter-priority"
            className="select"
            value={filters.priority}
            onChange={(e) => update('priority', e.target.value as TestCaseFilters['priority'])}
          >
            <option value={ALL}>All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-module" className="field__label">
            Module
          </label>
          <select
            id="filter-module"
            className="select"
            value={filters.module}
            onChange={(e) => update('module', e.target.value)}
          >
            <option value={ALL}>All modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-sort" className="field__label">
            Sort by
          </label>
          <select
            id="filter-sort"
            className="select"
            value={filters.sortBy}
            onChange={(e) => update('sortBy', e.target.value as SortOption)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-bar__footer">
        <p className="muted small" aria-live="polite">
          Showing {resultCount} of {totalCount} test {totalCount === 1 ? 'case' : 'cases'}
        </p>
        <button
          type="button"
          className="btn btn--ghost btn--small"
          onClick={() => onChange({ ...DEFAULT_FILTERS, sortBy: filters.sortBy })}
          disabled={!isFiltered(filters)}
        >
          Clear filters
        </button>
      </div>
    </div>
  )
}
