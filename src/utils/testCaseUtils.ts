// Domain helpers: IDs, keys, validation, and creating/updating test cases.
import {
  isPriority,
  isTestStatus,
  type TestCase,
  type TestCaseInput,
  type TestStatus,
} from '../types/testCase'

export const TITLE_MIN = 3
export const TITLE_MAX = 120
export const MODULE_MAX = 50
export const TEXT_MAX = 2000

const LONG_TEXT_FIELDS = [
  'description',
  'preconditions',
  'steps',
  'expectedResult',
  'actualResult',
] as const

export type ValidationErrors = Partial<Record<keyof TestCaseInput, string>>

/** Unique ID. Falls back when crypto.randomUUID is unavailable (e.g. non-HTTPS contexts). */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `tc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const KEY_PATTERN = /^TC-(\d+)$/

export function formatKey(n: number): string {
  return `TC-${String(n).padStart(3, '0')}`
}

/** Returns the numeric part of a "TC-###" key, or 0 if the key has another format. */
export function keyNumber(key: string): number {
  const match = KEY_PATTERN.exec(key)
  return match ? Number(match[1]) : 0
}

/** Next human-readable key: one higher than the largest existing "TC-###" number. */
export function nextKey(testCases: readonly TestCase[]): string {
  const max = testCases.reduce((highest, tc) => Math.max(highest, keyNumber(tc.key)), 0)
  return formatKey(max + 1)
}

/** Trims whitespace from all text fields. */
export function normalizeInput(input: TestCaseInput): TestCaseInput {
  return {
    ...input,
    title: input.title.trim(),
    module: input.module.trim(),
    description: input.description.trim(),
    preconditions: input.preconditions.trim(),
    steps: input.steps.trim(),
    expectedResult: input.expectedResult.trim(),
    actualResult: input.actualResult.trim(),
  }
}

export function validateTestCaseInput(input: TestCaseInput): ValidationErrors {
  const errors: ValidationErrors = {}
  const title = input.title.trim()

  if (!title) errors.title = 'Title is required.'
  else if (title.length < TITLE_MIN) errors.title = `Title must be at least ${TITLE_MIN} characters.`
  else if (title.length > TITLE_MAX) errors.title = `Title must be ${TITLE_MAX} characters or fewer.`

  if (input.module.trim().length > MODULE_MAX) {
    errors.module = `Module must be ${MODULE_MAX} characters or fewer.`
  }

  if (!input.expectedResult.trim()) errors.expectedResult = 'Expected result is required.'

  for (const field of LONG_TEXT_FIELDS) {
    if (!errors[field] && input[field].length > TEXT_MAX) {
      errors[field] = `Must be ${TEXT_MAX} characters or fewer.`
    }
  }

  if (!isPriority(input.priority)) errors.priority = 'Select a valid priority.'
  if (!isTestStatus(input.status)) errors.status = 'Select a valid status.'

  return errors
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

/** Sets or clears lastExecutedAt depending on whether the status means "executed". */
function withExecutionTime(tc: TestCase, status: TestStatus, timestamp: string): TestCase {
  const result: TestCase = { ...tc }
  if (status === 'Not Run') delete result.lastExecutedAt
  else result.lastExecutedAt = timestamp
  return result
}

export function createTestCase(
  input: TestCaseInput,
  options: { id: string; key: string; now: Date },
): TestCase {
  const clean = normalizeInput(input)
  const timestamp = options.now.toISOString()
  const base: TestCase = {
    id: options.id,
    key: options.key,
    ...clean,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  return clean.status === 'Not Run' ? base : withExecutionTime(base, clean.status, timestamp)
}

export function updateTestCase(tc: TestCase, input: TestCaseInput, now: Date): TestCase {
  const clean = normalizeInput(input)
  const timestamp = now.toISOString()
  const updated: TestCase = { ...tc, ...clean, updatedAt: timestamp }
  return clean.status === tc.status ? updated : withExecutionTime(updated, clean.status, timestamp)
}

/** Changes only the execution status. Returns the same object if nothing changed. */
export function applyStatus(tc: TestCase, status: TestStatus, now: Date): TestCase {
  if (tc.status === status) return tc
  const timestamp = now.toISOString()
  return withExecutionTime({ ...tc, status, updatedAt: timestamp }, status, timestamp)
}

export function toInput(tc: TestCase): TestCaseInput {
  return {
    title: tc.title,
    description: tc.description,
    module: tc.module,
    priority: tc.priority,
    preconditions: tc.preconditions,
    steps: tc.steps,
    expectedResult: tc.expectedResult,
    actualResult: tc.actualResult,
    status: tc.status,
  }
}
