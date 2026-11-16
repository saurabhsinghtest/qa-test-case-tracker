// Core data model for the QA Test Case Tracker.

export const TEST_STATUSES = ['Passed', 'Failed', 'Blocked', 'Not Run'] as const
export type TestStatus = (typeof TEST_STATUSES)[number]

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const
export type Priority = (typeof PRIORITIES)[number]

export interface TestCase {
  /** Internal unique identifier (UUID). */
  id: string
  /** Human-readable key, e.g. "TC-001". */
  key: string
  title: string
  description: string
  /** Feature or area under test, e.g. "Login". */
  module: string
  priority: Priority
  preconditions: string
  /** Multi-line text, one step per line. */
  steps: string
  expectedResult: string
  actualResult: string
  status: TestStatus
  /** ISO 8601 timestamps. */
  createdAt: string
  updatedAt: string
  /** Set when the status changes to an executed state (anything except "Not Run"). */
  lastExecutedAt?: string
}

/** The fields a user can edit through the form. */
export type TestCaseInput = Pick<
  TestCase,
  | 'title'
  | 'description'
  | 'module'
  | 'priority'
  | 'preconditions'
  | 'steps'
  | 'expectedResult'
  | 'actualResult'
  | 'status'
>

export const EMPTY_INPUT: TestCaseInput = {
  title: '',
  description: '',
  module: '',
  priority: 'Medium',
  preconditions: '',
  steps: '',
  expectedResult: '',
  actualResult: '',
  status: 'Not Run',
}

export function isTestStatus(value: unknown): value is TestStatus {
  return typeof value === 'string' && (TEST_STATUSES as readonly string[]).includes(value)
}

export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value)
}
