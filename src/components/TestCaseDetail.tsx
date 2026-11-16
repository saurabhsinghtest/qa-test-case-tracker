import { TEST_STATUSES, type TestCase, type TestStatus } from '../types/testCase'
import { formatDateTime, parseSteps, statusSlug } from '../utils/format'
import { PriorityBadge } from './PriorityBadge'
import { StatusBadge } from './StatusBadge'
import './TestCaseDetail.css'

interface TestCaseDetailProps {
  testCase: TestCase
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: TestStatus) => void
}

function TextSection({ title, text }: { title: string; text: string }) {
  return (
    <section className="detail-section">
      <h2 className="detail-section__title">{title}</h2>
      {text ? <p className="detail-section__text">{text}</p> : <p className="muted">Not provided</p>}
    </section>
  )
}

export function TestCaseDetail({ testCase, onBack, onEdit, onDelete, onStatusChange }: TestCaseDetailProps) {
  const steps = parseSteps(testCase.steps)

  return (
    <article aria-labelledby="detail-title">
      <button type="button" className="btn btn--ghost btn--small back-link" onClick={onBack}>
        ← Back to test cases
      </button>

      <div className="page-header detail-header">
        <div>
          <p className="tc-key tc-key--large">{testCase.key}</p>
          <h1 id="detail-title" className="page-title">
            {testCase.title}
          </h1>
          <div className="detail-header__badges">
            <StatusBadge status={testCase.status} />
            <PriorityBadge priority={testCase.priority} />
            {testCase.module && <span className="badge badge--module">{testCase.module}</span>}
          </div>
        </div>
        <div className="detail-header__actions">
          <button type="button" className="btn btn--secondary" onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="btn btn--danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="detail-layout">
        <div className="card detail-main">
          <TextSection title="Description" text={testCase.description} />
          <TextSection title="Preconditions" text={testCase.preconditions} />
          <section className="detail-section">
            <h2 className="detail-section__title">Test steps</h2>
            {steps.length > 0 ? (
              <ol className="steps-list">
                {steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="muted">Not provided</p>
            )}
          </section>
          <TextSection title="Expected result" text={testCase.expectedResult} />
          <TextSection title="Actual result" text={testCase.actualResult} />
        </div>

        <aside className="detail-side">
          <div className="card">
            <h2 className="card__title" id="status-group-label">
              Execution status
            </h2>
            <div className="status-buttons" role="group" aria-labelledby="status-group-label">
              {TEST_STATUSES.map((status) => {
                const active = testCase.status === status
                return (
                  <button
                    key={status}
                    type="button"
                    className={`status-button status-button--${statusSlug(status)}${active ? ' status-button--active' : ''}`}
                    aria-pressed={active}
                    onClick={() => onStatusChange(status)}
                  >
                    {status}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card">
            <h2 className="card__title">Details</h2>
            <dl className="meta-list">
              <div>
                <dt>Module</dt>
                <dd>{testCase.module || '—'}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>{testCase.priority}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDateTime(testCase.createdAt)}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{formatDateTime(testCase.updatedAt)}</dd>
              </div>
              <div>
                <dt>Last executed</dt>
                <dd>{formatDateTime(testCase.lastExecutedAt)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </article>
  )
}
