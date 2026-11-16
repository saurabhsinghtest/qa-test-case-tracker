import { getSampleTestCases } from '../utils/sampleData'
import { loadInitialTestCases, loadTestCases, saveTestCases, STORAGE_KEY } from '../utils/storage'
import { TEST_STATUSES, PRIORITIES } from '../types/testCase'
import { FIXTURE_CASES } from './fixtures'

describe('storage', () => {
  it('saves and loads test cases (round trip)', () => {
    expect(saveTestCases(FIXTURE_CASES)).toBe(true)
    expect(loadTestCases()).toEqual(FIXTURE_CASES)
  })

  it('returns null when nothing is saved', () => {
    expect(loadTestCases()).toBeNull()
  })

  it('returns null for corrupt or non-array data', () => {
    localStorage.setItem(STORAGE_KEY, '{broken')
    expect(loadTestCases()).toBeNull()
    localStorage.setItem(STORAGE_KEY, '{"a":1}')
    expect(loadTestCases()).toBeNull()
  })

  it('keeps a saved empty list empty (no sample data)', () => {
    saveTestCases([])
    expect(loadTestCases()).toEqual([])
    expect(loadInitialTestCases()).toEqual([])
  })

  it('drops invalid stored items but keeps valid ones', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([FIXTURE_CASES[0], { title: 'no status' }]))
    expect(loadTestCases()).toEqual([FIXTURE_CASES[0]])
  })

  it('falls back to sample data on the first visit', () => {
    const initial = loadInitialTestCases()
    expect(initial.length).toBe(getSampleTestCases().length)
    expect(initial[0].key).toBe('TC-001')
  })

  it('returns false when saving fails (e.g. quota exceeded)', () => {
    const failing = {
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    } as unknown as Storage
    expect(saveTestCases(FIXTURE_CASES, failing)).toBe(false)
  })

  it('handles unavailable storage', () => {
    expect(loadTestCases(null)).toBeNull()
    expect(saveTestCases(FIXTURE_CASES, null)).toBe(false)
  })
})

describe('sample data', () => {
  it('covers every status and priority with unique ids and keys', () => {
    const samples = getSampleTestCases()
    for (const status of TEST_STATUSES) expect(samples.some((tc) => tc.status === status)).toBe(true)
    for (const priority of PRIORITIES) expect(samples.some((tc) => tc.priority === priority)).toBe(true)
    expect(new Set(samples.map((tc) => tc.id)).size).toBe(samples.length)
    expect(new Set(samples.map((tc) => tc.key)).size).toBe(samples.length)
  })

  it('only sets lastExecutedAt for executed cases', () => {
    for (const tc of getSampleTestCases()) {
      expect(Boolean(tc.lastExecutedAt)).toBe(tc.status !== 'Not Run')
    }
  })
})
