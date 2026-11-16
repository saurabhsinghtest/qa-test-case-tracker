import { useMemo } from 'react'
import { TEST_STATUSES, type TestCase, type TestStatus } from '../types/testCase'
import { applyFilters, DEFAULT_FILTERS, getModules, type TestCaseFilters } from '../utils/filters'
import { formatDateTime, statusSlug } from '../utils/format'
import { EmptyState } from './EmptyState'
import { FilterBar } from './FilterBar'
import { PriorityBadge } from './PriorityBadge'
import './TestCaseList.css'

interface TestCaseListProps {
  testCases: TestCase[]
  filters: TestCaseFilters
  onFiltersChange: (filters: TestCaseFilters) => void
  onCreate: () => void
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (testCase: TestCase) => void
  onStatusChange: (testCase: TestCase, status: TestStatus) => void
}

export function TestCaseList({
  testCases,
  filters,
  onFiltersChange,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: TestCaseListProps) {
  const modules = useMemo(() => getModules(testCases), [testCases])
  const visible = useMemo(() => applyFilters(testCases, filters), [testCases, filters])

  return (
    <section aria-labelledby="list-title">
      <div className="page-header">
        <div>
          <h1 id="list-title" className="page-title">
            Test Cases
          </h1>
          <p className="page-subtitle">Search, filter and update the execution status of your test cases.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={onCreate}>
          + Create test case
        </button>
      </div>

      {testCases.length === 0 ? (
        <EmptyState title="No test cases yet" message="Create your first test case to start tracking results.">
          <button type="button" className="btn btn--primary" onClick={onCreate}>
            Create test case
          </button>
        </EmptyState>
      ) : (
        <>
          <FilterBar
            filters={filters}
            modules={modules}
            resultCount={visible.length}
            totalCount={testCases.length}
            onChange={onFiltersChange}
          />

          {visible.length === 0 ? (
            <EmptyState icon="🔍" title="No matching test cases" message="Try a different search term or clear the filters.">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => onFiltersChange({ ...DEFAULT_FILTERS, sortBy: filters.sortBy })}
              >
                Clear filters
              </button>
            </EmptyState>
          ) : (
            <div className="table-wrapper">
              <table className="tc-table">
                <caption className="visually-hidden">Test cases</caption>
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Title</th>
                    <th scope="col">Module</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Status</th>
                    <th scope="col">Updated</th>
                    <th scope="col">
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((tc) => (
                    <tr key={tc.id}>
                      <td data-label="ID">
                        <span className="tc-key">{tc.key}</span>
                      </td>
                      <td data-label="Title" className="tc-table__title">
                        <button type="button" className="link-button" onClick={() => onView(tc.id)}>
                          {tc.title}
                        </button>
                      </td>
                      <td data-label="Module">{tc.module || <span className="muted">—</span>}</td>
                      <td data-label="Priority">
                        <PriorityBadge priority={tc.priority} />
                      </td>
                      <td data-label="Status">
                        <select
                          className={`select status-select status-select--${statusSlug(tc.status)}`}
                          value={tc.status}
                          aria-label={`Change status of ${tc.key}`}
                          onChange={(e) => onStatusChange(tc, e.target.value as TestStatus)}
                        >
                          {TEST_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td data-label="Updated" className="muted small">
                        {formatDateTime(tc.updatedAt)}
                      </td>
                      <td data-label="Actions">
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn btn--ghost btn--small"
                            onClick={() => onView(tc.id)}
                            aria-label={`View ${tc.key}`}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--small"
                            onClick={() => onEdit(tc.id)}
                            aria-label={`Edit ${tc.key}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost-danger btn--small"
                            onClick={() => onDelete(tc)}
                            aria-label={`Delete ${tc.key}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  )
}
