// Dashboard statistics.
import {
  PRIORITIES,
  TEST_STATUSES,
  type Priority,
  type TestCase,
  type TestStatus,
} from '../types/testCase'

export type StatusCounts = Record<TestStatus, number>

export interface TestStats {
  total: number
  byStatus: StatusCounts
  /** Status counts for each priority level. */
  byPriority: Record<Priority, StatusCounts & { total: number }>
  /** Test cases with a status other than "Not Run". */
  executed: number
  /** Failed + Blocked. */
  needsAttention: number
  /** Passed as a percentage of executed tests. */
  passRate: number
  /** Executed as a percentage of all tests. */
  executionRate: number
}

export function emptyStatusCounts(): StatusCounts {
  return Object.fromEntries(TEST_STATUSES.map((s) => [s, 0])) as StatusCounts
}

/** Whole-number percentage; 0 when total is 0 (no divide-by-zero). */
export function percent(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100)
}

export function computeStats(testCases: readonly TestCase[]): TestStats {
  const byStatus = emptyStatusCounts()
  const byPriority = Object.fromEntries(
    PRIORITIES.map((p) => [p, { ...emptyStatusCounts(), total: 0 }]),
  ) as TestStats['byPriority']

  for (const tc of testCases) {
    byStatus[tc.status] += 1
    byPriority[tc.priority][tc.status] += 1
    byPriority[tc.priority].total += 1
  }

  const total = testCases.length
  const executed = total - byStatus['Not Run']

  return {
    total,
    byStatus,
    byPriority,
    executed,
    needsAttention: byStatus.Failed + byStatus.Blocked,
    passRate: percent(byStatus.Passed, executed),
    executionRate: percent(executed, total),
  }
}

/** Most recently updated test cases, newest first. */
export function getRecentTestCases(testCases: readonly TestCase[], limit = 5): TestCase[] {
  return [...testCases].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit)
}
