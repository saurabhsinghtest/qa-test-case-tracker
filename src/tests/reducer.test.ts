import { testCaseReducer, type TestCaseAction } from '../context/testCaseReducer'
import { FIXED_NOW, FIXTURE_CASES, makeInput, makeTestCase } from './fixtures'

describe('testCaseReducer', () => {
  it('ADD appends a test case with the next key', () => {
    const next = testCaseReducer(FIXTURE_CASES, {
      type: 'ADD',
      id: 'new',
      input: makeInput({ title: 'Added' }),
      now: FIXED_NOW,
    })
    expect(next).toHaveLength(FIXTURE_CASES.length + 1)
    expect(next[next.length - 1]).toMatchObject({ id: 'new', key: 'TC-011', title: 'Added', status: 'Not Run' })
  })

  it('ADD to an empty list starts at TC-001', () => {
    const next = testCaseReducer([], { type: 'ADD', id: 'x', input: makeInput(), now: FIXED_NOW })
    expect(next[0].key).toBe('TC-001')
  })

  it('UPDATE changes only the matching test case', () => {
    const next = testCaseReducer(FIXTURE_CASES, {
      type: 'UPDATE',
      id: 'b',
      input: makeInput({ title: 'Edited', status: 'Failed' }),
      now: FIXED_NOW,
    })
    expect(next[1]).toMatchObject({ id: 'b', key: 'TC-002', title: 'Edited', updatedAt: FIXED_NOW.toISOString() })
    expect(next[0]).toBe(FIXTURE_CASES[0])
  })

  it('DELETE removes the matching test case', () => {
    const next = testCaseReducer(FIXTURE_CASES, { type: 'DELETE', id: 'a' })
    expect(next.map((tc) => tc.id)).toEqual(['b', 'c', 'd', 'e'])
  })

  it('SET_STATUS updates status and execution time', () => {
    const next = testCaseReducer(FIXTURE_CASES, { type: 'SET_STATUS', id: 'e', status: 'Passed', now: FIXED_NOW })
    expect(next[4]).toMatchObject({ status: 'Passed', lastExecutedAt: FIXED_NOW.toISOString() })
  })

  it.each<TestCaseAction>([
    { type: 'UPDATE', id: 'missing', input: makeInput(), now: FIXED_NOW },
    { type: 'DELETE', id: 'missing' },
    { type: 'SET_STATUS', id: 'missing', status: 'Passed', now: FIXED_NOW },
    { type: 'SET_STATUS', id: 'a', status: 'Passed', now: FIXED_NOW }, // already Passed
  ])('returns the same state when nothing changes ($type)', (action) => {
    expect(testCaseReducer(FIXTURE_CASES, action)).toBe(FIXTURE_CASES)
  })

  it('IMPORT_REPLACE replaces everything', () => {
    const imported = [makeTestCase({ id: 'z', key: 'TC-001', title: 'Only one' })]
    expect(testCaseReducer(FIXTURE_CASES, { type: 'IMPORT_REPLACE', testCases: imported })).toEqual(imported)
  })

  it('IMPORT_MERGE keeps existing items and adds/updates imported ones', () => {
    const next = testCaseReducer(FIXTURE_CASES, {
      type: 'IMPORT_MERGE',
      testCases: [makeTestCase({ id: 'a', key: 'TC-001', title: 'Replaced' }), makeTestCase({ id: 'new', key: 'TC-050' })],
    })
    expect(next).toHaveLength(6)
    expect(next[0].title).toBe('Replaced')
    expect(next[5]).toMatchObject({ id: 'new', key: 'TC-050' })
  })

  it('ignores unknown actions', () => {
    expect(testCaseReducer(FIXTURE_CASES, { type: 'UNKNOWN' } as unknown as TestCaseAction)).toBe(FIXTURE_CASES)
  })
})
