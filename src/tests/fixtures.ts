// Test data builders shared by unit and component tests.
import { EMPTY_INPUT, type TestCase, type TestCaseInput } from '../types/testCase'

export const FIXED_NOW = new Date('2026-01-15T12:00:00.000Z')

export function makeTestCase(overrides: Partial<TestCase> = {}): TestCase {
  return {
    id: 'id-1',
    key: 'TC-001',
    title: 'Sample test case',
    description: '',
    module: 'General',
    priority: 'Medium',
    preconditions: '',
    steps: '',
    expectedResult: 'It works',
    actualResult: '',
    status: 'Not Run',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    ...overrides,
  }
}

export function makeInput(overrides: Partial<TestCaseInput> = {}): TestCaseInput {
  return { ...EMPTY_INPUT, title: 'Valid title', expectedResult: 'Expected', ...overrides }
}

/** A small, varied set: 2 Passed, 1 Failed, 1 Blocked, 1 Not Run across 3 modules. */
export const FIXTURE_CASES: TestCase[] = [
  makeTestCase({
    id: 'a',
    key: 'TC-001',
    title: 'Login with valid credentials',
    module: 'Login',
    priority: 'Critical',
    status: 'Passed',
    description: 'Happy path sign in',
    updatedAt: '2026-01-05T10:00:00.000Z',
  }),
  makeTestCase({
    id: 'b',
    key: 'TC-002',
    title: 'Login with wrong password',
    module: 'Login',
    priority: 'High',
    status: 'Failed',
    updatedAt: '2026-01-07T10:00:00.000Z',
  }),
  makeTestCase({
    id: 'c',
    key: 'TC-003',
    title: 'Add product to cart',
    module: 'Checkout',
    priority: 'High',
    status: 'Passed',
    updatedAt: '2026-01-03T10:00:00.000Z',
  }),
  makeTestCase({
    id: 'd',
    key: 'TC-004',
    title: 'Apply discount code',
    module: 'Checkout',
    priority: 'Medium',
    status: 'Blocked',
    description: 'Coupon service',
    updatedAt: '2026-01-06T10:00:00.000Z',
  }),
  makeTestCase({
    id: 'e',
    key: 'TC-010',
    title: 'Search products',
    module: 'Search',
    priority: 'Low',
    status: 'Not Run',
    updatedAt: '2026-01-02T10:00:00.000Z',
  }),
]
