import { createContext } from 'react'
import type { TestCase, TestCaseInput, TestStatus } from '../types/testCase'

export type ImportMode = 'replace' | 'merge'

export interface TestCaseContextValue {
  testCases: TestCase[]
  /** True if the latest change could not be saved to localStorage. */
  storageError: boolean
  /** Creates a test case and returns its ID. */
  addTestCase: (input: TestCaseInput) => string
  updateTestCase: (id: string, input: TestCaseInput) => void
  deleteTestCase: (id: string) => void
  setStatus: (id: string, status: TestStatus) => void
  importTestCases: (testCases: TestCase[], mode: ImportMode) => void
}

export const TestCaseContext = createContext<TestCaseContextValue | null>(null)
