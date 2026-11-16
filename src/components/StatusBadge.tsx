import type { TestStatus } from '../types/testCase'
import { statusSlug } from '../utils/format'

export function StatusBadge({ status }: { status: TestStatus }) {
  return (
    <span className={`badge badge--status badge--${statusSlug(status)}`}>
      <span className="badge__dot" aria-hidden="true" />
      {status}
    </span>
  )
}
