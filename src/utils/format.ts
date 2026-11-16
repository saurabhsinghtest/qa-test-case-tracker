// Display helpers.
import type { Priority, TestStatus } from '../types/testCase'

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

/** Formats an ISO date for display; "—" for missing or invalid values. */
export function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date)
}

/** CSS-friendly slug: "Not Run" -> "not-run". */
export function statusSlug(status: TestStatus): string {
  return status.toLowerCase().replace(/\s+/g, '-')
}

export function prioritySlug(priority: Priority): string {
  return priority.toLowerCase()
}

/** Splits steps text into lines, removing blank lines and existing "1." / "-" prefixes. */
export function parseSteps(steps: string): string[] {
  return steps
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .replace(/^(\d+[.)]|[-*•])\s+/, '')
        .trim(),
    )
    .filter(Boolean)
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}
