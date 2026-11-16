import { computeStats, getRecentTestCases, percent } from '../utils/stats'
import { FIXTURE_CASES } from './fixtures'

describe('percent', () => {
  it('rounds to a whole number', () => {
    expect(percent(1, 3)).toBe(33)
    expect(percent(2, 3)).toBe(67)
    expect(percent(5, 5)).toBe(100)
  })

  it('returns 0 when the total is 0', () => {
    expect(percent(0, 0)).toBe(0)
  })
})

describe('computeStats', () => {
  it('counts statuses and priorities', () => {
    const stats = computeStats(FIXTURE_CASES)
    expect(stats.total).toBe(5)
    expect(stats.byStatus).toEqual({ Passed: 2, Failed: 1, Blocked: 1, 'Not Run': 1 })
    expect(stats.byPriority.High).toMatchObject({ total: 2, Passed: 1, Failed: 1 })
    expect(stats.byPriority.Low).toMatchObject({ total: 1, 'Not Run': 1 })
  })

  it('calculates executed, pass rate, execution rate and needs-attention', () => {
    const stats = computeStats(FIXTURE_CASES)
    expect(stats.executed).toBe(4)
    expect(stats.passRate).toBe(50) // 2 passed of 4 executed
    expect(stats.executionRate).toBe(80) // 4 of 5
    expect(stats.needsAttention).toBe(2) // 1 failed + 1 blocked
  })

  it('handles an empty list without dividing by zero', () => {
    const stats = computeStats([])
    expect(stats).toMatchObject({ total: 0, executed: 0, passRate: 0, executionRate: 0, needsAttention: 0 })
    expect(stats.byStatus.Passed).toBe(0)
    expect(stats.byPriority.Critical.total).toBe(0)
  })
})

describe('getRecentTestCases', () => {
  it('returns the most recently updated first, limited', () => {
    expect(getRecentTestCases(FIXTURE_CASES, 3).map((tc) => tc.key)).toEqual(['TC-002', 'TC-004', 'TC-001'])
  })

  it('defaults to 5 items', () => {
    expect(getRecentTestCases([...FIXTURE_CASES, ...FIXTURE_CASES])).toHaveLength(5)
  })
})
