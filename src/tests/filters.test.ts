import {
  applyFilters,
  DEFAULT_FILTERS,
  filterTestCases,
  getModules,
  isFiltered,
  matchesSearch,
  sortTestCases,
} from '../utils/filters'
import { FIXTURE_CASES, makeTestCase } from './fixtures'

const keys = (list: { key: string }[]) => list.map((tc) => tc.key)

describe('matchesSearch', () => {
  const tc = makeTestCase({ key: 'TC-007', title: 'Checkout total', module: 'Payments', description: 'VAT rounding' })

  it('matches an empty or whitespace query', () => {
    expect(matchesSearch(tc, '')).toBe(true)
    expect(matchesSearch(tc, '   ')).toBe(true)
  })

  it('searches key, title, module and description case-insensitively', () => {
    expect(matchesSearch(tc, 'tc-007')).toBe(true)
    expect(matchesSearch(tc, 'CHECKOUT')).toBe(true)
    expect(matchesSearch(tc, 'payments')).toBe(true)
    expect(matchesSearch(tc, 'vat')).toBe(true)
    expect(matchesSearch(tc, 'login')).toBe(false)
  })
})

describe('filterTestCases', () => {
  it('returns everything with default filters', () => {
    expect(filterTestCases(FIXTURE_CASES, DEFAULT_FILTERS)).toHaveLength(FIXTURE_CASES.length)
  })

  it('filters by status, priority and module', () => {
    expect(keys(filterTestCases(FIXTURE_CASES, { ...DEFAULT_FILTERS, status: 'Passed' }))).toEqual([
      'TC-001',
      'TC-003',
    ])
    expect(keys(filterTestCases(FIXTURE_CASES, { ...DEFAULT_FILTERS, priority: 'High' }))).toEqual([
      'TC-002',
      'TC-003',
    ])
    expect(keys(filterTestCases(FIXTURE_CASES, { ...DEFAULT_FILTERS, module: 'Checkout' }))).toEqual([
      'TC-003',
      'TC-004',
    ])
  })

  it('combines search and filters (AND)', () => {
    const result = filterTestCases(FIXTURE_CASES, {
      ...DEFAULT_FILTERS,
      search: 'login',
      status: 'Failed',
    })
    expect(keys(result)).toEqual(['TC-002'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterTestCases(FIXTURE_CASES, { ...DEFAULT_FILTERS, search: 'nothing-here' })).toEqual([])
  })
})

describe('sortTestCases', () => {
  it('sorts by most recently updated', () => {
    expect(keys(sortTestCases(FIXTURE_CASES, 'updated'))).toEqual(['TC-002', 'TC-004', 'TC-001', 'TC-003', 'TC-010'])
  })

  it('sorts by key numerically', () => {
    const shuffled = [FIXTURE_CASES[4], FIXTURE_CASES[1], FIXTURE_CASES[0]]
    expect(keys(sortTestCases(shuffled, 'key'))).toEqual(['TC-001', 'TC-002', 'TC-010'])
  })

  it('sorts by title alphabetically', () => {
    expect(sortTestCases(FIXTURE_CASES, 'title')[0].title).toBe('Add product to cart')
  })

  it('sorts by priority, highest first', () => {
    expect(sortTestCases(FIXTURE_CASES, 'priority').map((tc) => tc.priority)).toEqual([
      'Critical',
      'High',
      'High',
      'Medium',
      'Low',
    ])
  })

  it('does not mutate the input array', () => {
    const copy = [...FIXTURE_CASES]
    sortTestCases(FIXTURE_CASES, 'title')
    expect(FIXTURE_CASES).toEqual(copy)
  })
})

describe('helpers', () => {
  it('applyFilters filters then sorts', () => {
    const result = applyFilters(FIXTURE_CASES, { ...DEFAULT_FILTERS, module: 'Login', sortBy: 'key' })
    expect(keys(result)).toEqual(['TC-001', 'TC-002'])
  })

  it('getModules returns unique, sorted, non-empty modules', () => {
    const list = [...FIXTURE_CASES, makeTestCase({ id: 'z', module: '' })]
    expect(getModules(list)).toEqual(['Checkout', 'Login', 'Search'])
  })

  it('isFiltered ignores sort order', () => {
    expect(isFiltered(DEFAULT_FILTERS)).toBe(false)
    expect(isFiltered({ ...DEFAULT_FILTERS, sortBy: 'title' })).toBe(false)
    expect(isFiltered({ ...DEFAULT_FILTERS, search: ' x ' })).toBe(true)
    expect(isFiltered({ ...DEFAULT_FILTERS, module: 'Login' })).toBe(true)
  })
})
