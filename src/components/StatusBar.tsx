import { TEST_STATUSES } from '../types/testCase'
import { statusSlug } from '../utils/format'
import { percent, type StatusCounts } from '../utils/stats'

interface StatusBarProps {
  counts: StatusCounts
  total: number
  /** Prefix for the accessible description, e.g. "Execution status". */
  label: string
  size?: 'large' | 'small'
}

/** Stacked horizontal bar showing the share of each status (pure CSS, no chart library). */
export function StatusBar({ counts, total, label, size = 'large' }: StatusBarProps) {
  const description =
    total === 0
      ? `${label}: no test cases`
      : `${label}: ` +
        TEST_STATUSES.map((s) => `${s} ${counts[s]} (${percent(counts[s], total)}%)`).join(', ')

  return (
    <div className={`status-bar status-bar--${size}`} role="img" aria-label={description}>
      {total > 0 &&
        TEST_STATUSES.filter((s) => counts[s] > 0).map((s) => (
          <span
            key={s}
            className={`status-bar__segment status-bar__segment--${statusSlug(s)}`}
            style={{ width: `${(counts[s] / total) * 100}%` }}
            title={`${s}: ${counts[s]}`}
          />
        ))}
    </div>
  )
}
