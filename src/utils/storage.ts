// localStorage persistence.
import type { TestCase } from '../types/testCase'
import { sanitizeStoredList } from './importExport'
import { getSampleTestCases } from './sampleData'

/** Versioned key so the stored format can be migrated in the future. */
export const STORAGE_KEY = 'qa-tracker:testCases:v1'

/** Returns localStorage, or null if the browser blocks access (e.g. some privacy modes). */
function getStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * Loads saved test cases.
 * Returns null when nothing is saved yet or the saved data is unreadable,
 * so the caller can decide to load sample data. A saved empty list stays empty.
 */
export function loadTestCases(storage: Storage | null = getStorage()): TestCase[] | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const data: unknown = JSON.parse(raw)
    return Array.isArray(data) ? sanitizeStoredList(data) : null
  } catch {
    return null
  }
}

/** Saves test cases. Returns false if saving failed (e.g. storage full or blocked). */
export function saveTestCases(
  testCases: readonly TestCase[],
  storage: Storage | null = getStorage(),
): boolean {
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(testCases))
    return true
  } catch {
    return false
  }
}

/** Saved data if present, otherwise sample data (first visit). */
export function loadInitialTestCases(storage: Storage | null = getStorage()): TestCase[] {
  return loadTestCases(storage) ?? getSampleTestCases()
}
