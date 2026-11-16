import {
  applyStatus,
  createTestCase,
  formatKey,
  generateId,
  hasErrors,
  keyNumber,
  nextKey,
  normalizeInput,
  TEXT_MAX,
  TITLE_MAX,
  toInput,
  updateTestCase,
  validateTestCaseInput,
} from '../utils/testCaseUtils'
import type { TestCaseInput } from '../types/testCase'
import { FIXED_NOW, makeInput, makeTestCase } from './fixtures'

describe('keys and ids', () => {
  it('formats keys with 3-digit padding', () => {
    expect(formatKey(1)).toBe('TC-001')
    expect(formatKey(42)).toBe('TC-042')
    expect(formatKey(1234)).toBe('TC-1234')
  })

  it('reads the number from a key, or 0 for other formats', () => {
    expect(keyNumber('TC-007')).toBe(7)
    expect(keyNumber('BUG-7')).toBe(0)
    expect(keyNumber('')).toBe(0)
  })

  it('nextKey returns one higher than the largest existing key', () => {
    expect(nextKey([])).toBe('TC-001')
    expect(
      nextKey([makeTestCase({ key: 'TC-002' }), makeTestCase({ key: 'TC-009' }), makeTestCase({ key: 'X' })]),
    ).toBe('TC-010')
  })

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 50 }, generateId))
    expect(ids.size).toBe(50)
  })

  it('generates ids without crypto.randomUUID', () => {
    const original = crypto.randomUUID
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true })
    try {
      expect(generateId()).toMatch(/^tc-/)
    } finally {
      Object.defineProperty(crypto, 'randomUUID', { value: original, configurable: true })
    }
  })
})

describe('validateTestCaseInput', () => {
  it('accepts a valid input', () => {
    expect(validateTestCaseInput(makeInput())).toEqual({})
    expect(hasErrors({})).toBe(false)
  })

  it('requires a title and expected result', () => {
    const errors = validateTestCaseInput(makeInput({ title: '   ', expectedResult: '' }))
    expect(errors.title).toBe('Title is required.')
    expect(errors.expectedResult).toBe('Expected result is required.')
    expect(hasErrors(errors)).toBe(true)
  })

  it('enforces title length limits', () => {
    expect(validateTestCaseInput(makeInput({ title: 'ab' })).title).toMatch(/at least 3/)
    expect(validateTestCaseInput(makeInput({ title: 'a'.repeat(TITLE_MAX + 1) })).title).toMatch(
      /120 characters or fewer/,
    )
    expect(validateTestCaseInput(makeInput({ title: 'a'.repeat(TITLE_MAX) })).title).toBeUndefined()
  })

  it('limits module and long text fields', () => {
    const errors = validateTestCaseInput(
      makeInput({ module: 'm'.repeat(51), steps: 's'.repeat(TEXT_MAX + 1) }),
    )
    expect(errors.module).toMatch(/50 characters/)
    expect(errors.steps).toMatch(/2000 characters/)
  })

  it('rejects invalid priority and status values', () => {
    const errors = validateTestCaseInput({
      ...makeInput(),
      priority: 'Urgent',
      status: 'Done',
    } as unknown as TestCaseInput)
    expect(errors.priority).toBeDefined()
    expect(errors.status).toBeDefined()
  })
})

describe('creating and updating', () => {
  it('normalizeInput trims text fields', () => {
    const result = normalizeInput(makeInput({ title: '  Hello  ', module: ' Login ', steps: '\nstep\n' }))
    expect(result.title).toBe('Hello')
    expect(result.module).toBe('Login')
    expect(result.steps).toBe('step')
  })

  it('createTestCase sets timestamps and no lastExecutedAt for Not Run', () => {
    const tc = createTestCase(makeInput({ title: ' New ' }), { id: 'x', key: 'TC-005', now: FIXED_NOW })
    expect(tc).toMatchObject({
      id: 'x',
      key: 'TC-005',
      title: 'New',
      createdAt: FIXED_NOW.toISOString(),
      updatedAt: FIXED_NOW.toISOString(),
    })
    expect(tc).not.toHaveProperty('lastExecutedAt')
  })

  it('createTestCase sets lastExecutedAt for executed statuses', () => {
    const tc = createTestCase(makeInput({ status: 'Passed' }), { id: 'x', key: 'TC-001', now: FIXED_NOW })
    expect(tc.lastExecutedAt).toBe(FIXED_NOW.toISOString())
  })

  it('updateTestCase keeps id/key/createdAt and updates fields', () => {
    const original = makeTestCase({ status: 'Passed', lastExecutedAt: '2026-01-01T10:00:00.000Z' })
    const updated = updateTestCase(original, makeInput({ title: 'Changed', status: 'Passed' }), FIXED_NOW)
    expect(updated).toMatchObject({
      id: original.id,
      key: original.key,
      createdAt: original.createdAt,
      title: 'Changed',
      updatedAt: FIXED_NOW.toISOString(),
      // Status unchanged, so the last execution time is kept
      lastExecutedAt: '2026-01-01T10:00:00.000Z',
    })
  })

  it('updateTestCase records execution time when the status changes', () => {
    const updated = updateTestCase(makeTestCase(), makeInput({ status: 'Failed' }), FIXED_NOW)
    expect(updated.lastExecutedAt).toBe(FIXED_NOW.toISOString())
  })

  it('applyStatus sets lastExecutedAt, and clears it for Not Run', () => {
    const passed = applyStatus(makeTestCase(), 'Passed', FIXED_NOW)
    expect(passed.status).toBe('Passed')
    expect(passed.lastExecutedAt).toBe(FIXED_NOW.toISOString())
    expect(passed.updatedAt).toBe(FIXED_NOW.toISOString())

    const reset = applyStatus(passed, 'Not Run', new Date('2026-02-01T00:00:00.000Z'))
    expect(reset).not.toHaveProperty('lastExecutedAt')
  })

  it('applyStatus returns the same object when the status is unchanged', () => {
    const tc = makeTestCase({ status: 'Blocked' })
    expect(applyStatus(tc, 'Blocked', FIXED_NOW)).toBe(tc)
  })

  it('toInput extracts the editable fields', () => {
    const input = toInput(makeTestCase({ title: 'T' }))
    expect(input.title).toBe('T')
    expect(input).not.toHaveProperty('id')
    expect(input).not.toHaveProperty('createdAt')
  })
})
