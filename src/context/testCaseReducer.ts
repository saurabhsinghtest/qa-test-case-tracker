// Pure reducer for the test case list. Time and IDs are passed in actions so it stays deterministic.
import type { TestCase, TestCaseInput, TestStatus } from '../types/testCase'
import { ensureUniqueKeys, mergeTestCases } from '../utils/importExport'
import { applyStatus, createTestCase, nextKey, updateTestCase } from '../utils/testCaseUtils'

export type TestCaseAction =
  | { type: 'ADD'; id: string; input: TestCaseInput; now: Date }
  | { type: 'UPDATE'; id: string; input: TestCaseInput; now: Date }
  | { type: 'DELETE'; id: string }
  | { type: 'SET_STATUS'; id: string; status: TestStatus; now: Date }
  | { type: 'IMPORT_REPLACE'; testCases: TestCase[] }
  | { type: 'IMPORT_MERGE'; testCases: TestCase[] }
  /** Replace state with data saved by another browser tab. */
  | { type: 'LOAD'; testCases: TestCase[] }

function updateById(
  state: TestCase[],
  id: string,
  update: (tc: TestCase) => TestCase,
): TestCase[] {
  let changed = false
  const next = state.map((tc) => {
    if (tc.id !== id) return tc
    const updated = update(tc)
    if (updated !== tc) changed = true
    return updated
  })
  return changed ? next : state
}

export function testCaseReducer(state: TestCase[], action: TestCaseAction): TestCase[] {
  switch (action.type) {
    case 'ADD':
      return [
        ...state,
        createTestCase(action.input, { id: action.id, key: nextKey(state), now: action.now }),
      ]
    case 'UPDATE':
      return updateById(state, action.id, (tc) => updateTestCase(tc, action.input, action.now))
    case 'DELETE': {
      const next = state.filter((tc) => tc.id !== action.id)
      return next.length === state.length ? state : next
    }
    case 'SET_STATUS':
      return updateById(state, action.id, (tc) => applyStatus(tc, action.status, action.now))
    case 'IMPORT_REPLACE':
      return ensureUniqueKeys(action.testCases)
    case 'IMPORT_MERGE':
      return mergeTestCases(state, action.testCases)
    case 'LOAD':
      return action.testCases
    default:
      return state
  }
}
