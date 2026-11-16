// Search, filter and sort logic for the test case list.
import { PRIORITIES, type Priority, type TestCase, type TestStatus } from '../types/testCase'
import { keyNumber } from './testCaseUtils'

export const ALL = 'All'

export type SortOption = 'updated' | 'key' | 'title' | 'priority'

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'key', label: 'ID' },
  { value: 'title', label: 'Title (A–Z)' },
  { value: 'priority', label: 'Priority (highest first)' },
]

export interface TestCaseFilters {
  search: string
  status: TestStatus | typeof ALL
  priority: Priority | typeof ALL
  /** A module name, or "All". */
  module: string
  sortBy: SortOption
}

export const DEFAULT_FILTERS: TestCaseFilters = {
  search: '',
  status: ALL,
  priority: ALL,
  module: ALL,
  sortBy: 'updated',
}

export function matchesSearch(tc: TestCase, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [tc.key, tc.title, tc.module, tc.description].some((field) =>
    field.toLowerCase().includes(q),
  )
}

export function filterTestCases(
  testCases: readonly TestCase[],
  filters: TestCaseFilters,
): TestCase[] {
  return testCases.filter(
    (tc) =>
      matchesSearch(tc, filters.search) &&
      (filters.status === ALL || tc.status === filters.status) &&
      (filters.priority === ALL || tc.priority === filters.priority) &&
      (filters.module === ALL || tc.module === filters.module),
  )
}

// Index 0 = highest priority
const PRIORITY_RANK = [...PRIORITIES].reverse()

export function sortTestCases(testCases: readonly TestCase[], sortBy: SortOption): TestCase[] {
  const sorted = [...testCases]
  switch (sortBy) {
    case 'updated':
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    case 'key':
      return sorted.sort(
        (a, b) =>
          keyNumber(a.key) - keyNumber(b.key) ||
          a.key.localeCompare(b.key, undefined, { numeric: true }),
      )
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
    case 'priority':
      return sorted.sort(
        (a, b) =>
          PRIORITY_RANK.indexOf(a.priority) - PRIORITY_RANK.indexOf(b.priority) ||
          keyNumber(a.key) - keyNumber(b.key),
      )
  }
}

export function applyFilters(testCases: readonly TestCase[], filters: TestCaseFilters): TestCase[] {
  return sortTestCases(filterTestCases(testCases, filters), filters.sortBy)
}

/** Unique, non-empty module names, sorted alphabetically. */
export function getModules(testCases: readonly TestCase[]): string[] {
  const modules = new Set(testCases.map((tc) => tc.module).filter(Boolean))
  return [...modules].sort((a, b) => a.localeCompare(b))
}

/** True when any filter (not the sort order) narrows the list. */
export function isFiltered(filters: TestCaseFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.status !== ALL ||
    filters.priority !== ALL ||
    filters.module !== ALL
  )
}
