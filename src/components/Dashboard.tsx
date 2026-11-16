import { useMemo } from 'react'
import type { View } from '../types/navigation'
import { PRIORITIES, TEST_STATUSES, type TestCase, type TestStatus } from '../types/testCase'
import { formatDateTime, statusSlug } from '../utils/format'
import { computeStats, getRecentTestCases, percent } from '../utils/stats'
import { EmptyState } from './EmptyState'
import { PriorityBadge } from './PriorityBadge'
import { StatCard } from './StatCard'
import { StatusBadge } from './StatusBadge'
import { StatusBar } from './StatusBar'
import './Dashboard.css'

interface DashboardProps {
  testCases: TestCase[]
  onNavigate: (view: View) => void
  /** Opens the list filtered to one status. */
  onShowStatus: (status: TestStatus) => void
}

export function Dashboard({ testCases, onNavigate, onShowStatus }: DashboardProps) {
  const stats = useMemo(() => computeStats(testCases), [testCases])
  const recent = useMemo(() => getRecentTestCases(testCases, 5), [testCases])

  return (
    <section aria-labelledby="dashboard-title">
      <div className="page-header">
        <div>
          <h1 id="dashboard-title" className="page-title">
            Dashboard
          </h1>
          <p className="page-subtitle">Overview of your test execution results.</p>
        </div>
      </div>

      {stats.total === 0 ? (
        <EmptyState
          title="No test cases yet"
          message="Create your first test case or import an existing set to see statistics here."
        >
          <button type="button" className="btn btn--primary" onClick={() => onNavigate({ name: 'new' })}>
            Create test case
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => onNavigate({ name: 'data' })}>
            Import JSON
          </button>
        </EmptyState>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard
              label="Total"
              value={stats.total}
              detail={`${stats.executed} executed`}
              tone="total"
              onClick={() => onNavigate({ name: 'list' })}
              actionLabel="Show all test cases"
            />
            {TEST_STATUSES.map((status) => (
              <StatCard
                key={status}
                label={status}
                value={stats.byStatus[status]}
                detail={`${percent(stats.byStatus[status], stats.total)}% of total`}
                tone={statusSlug(status)}
                onClick={() => onShowStatus(status)}
                actionLabel={`Show ${status.toLowerCase()} test cases`}
              />
            ))}
            <StatCard
              label="Pass rate"
              value={`${stats.passRate}%`}
              detail="of executed tests"
              tone="rate"
            />
          </div>

          <div className="dashboard-grid">
            <article className="card" aria-labelledby="execution-title">
              <h2 id="execution-title" className="card__title">
                Execution status
              </h2>
              <StatusBar counts={stats.byStatus} total={stats.total} label="Execution status" />
              <ul className="legend">
                {TEST_STATUSES.map((status) => (
                  <li key={status} className="legend__item">
                    <span className={`legend__swatch legend__swatch--${statusSlug(status)}`} aria-hidden="true" />
                    <span className="legend__label">{status}</span>
                    <span className="legend__value">
                      {stats.byStatus[status]} ({percent(stats.byStatus[status], stats.total)}%)
                    </span>
                  </li>
                ))}
              </ul>

              <div className="progress-block">
                <div className="progress-block__header">
                  <span>Execution progress</span>
                  <span>
                    {stats.executed} of {stats.total} executed ({stats.executionRate}%)
                  </span>
                </div>
                <div
                  className="progress"
                  role="progressbar"
                  aria-label="Execution progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={stats.executionRate}
                >
                  <span className="progress__fill" style={{ width: `${stats.executionRate}%` }} />
                </div>
                {stats.needsAttention > 0 && (
                  <p className="attention-note">
                    ⚠ {stats.needsAttention} test {stats.needsAttention === 1 ? 'case needs' : 'cases need'}{' '}
                    attention (failed or blocked).
                  </p>
                )}
              </div>
            </article>

            <article className="card" aria-labelledby="priority-title">
              <h2 id="priority-title" className="card__title">
                By priority
              </h2>
              <ul className="priority-list">
                {[...PRIORITIES].reverse().map((priority) => {
                  const counts = stats.byPriority[priority]
                  return (
                    <li key={priority} className="priority-list__item">
                      <div className="priority-list__header">
                        <PriorityBadge priority={priority} />
                        <span className="priority-list__count">
                          {counts.total} {counts.total === 1 ? 'case' : 'cases'}
                          {counts.total > 0 && ` · ${counts.Passed} passed`}
                        </span>
                      </div>
                      <StatusBar counts={counts} total={counts.total} label={`${priority} priority`} size="small" />
                    </li>
                  )
                })}
              </ul>
            </article>
          </div>

          <article className="card" aria-labelledby="recent-title">
            <div className="card__header">
              <h2 id="recent-title" className="card__title">
                Recently updated
              </h2>
              <button type="button" className="btn btn--ghost btn--small" onClick={() => onNavigate({ name: 'list' })}>
                View all →
              </button>
            </div>
            <ul className="recent-list">
              {recent.map((tc) => (
                <li key={tc.id} className="recent-list__item">
                  <div className="recent-list__main">
                    <span className="tc-key">{tc.key}</span>
                    <button
                      type="button"
                      className="link-button recent-list__title"
                      onClick={() => onNavigate({ name: 'view', id: tc.id })}
                    >
                      {tc.title}
                    </button>
                  </div>
                  <div className="recent-list__meta">
                    <StatusBadge status={tc.status} />
                    <span className="muted small">{formatDateTime(tc.updatedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </>
      )}
    </section>
  )
}
