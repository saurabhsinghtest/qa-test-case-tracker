import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import type { TestCase, TestCaseInput, TestStatus } from '../types/testCase'
import { loadInitialTestCases, saveTestCases } from '../utils/storage'
import { generateId } from '../utils/testCaseUtils'
import { TestCaseContext, type ImportMode, type TestCaseContextValue } from './TestCaseContext'
import { testCaseReducer } from './testCaseReducer'

interface TestCaseProviderProps {
  children: ReactNode
  /** Optional starting data (used by tests). Defaults to localStorage, then sample data. */
  initialTestCases?: TestCase[]
}

export function TestCaseProvider({ children, initialTestCases }: TestCaseProviderProps) {
  const [testCases, dispatch] = useReducer(
    testCaseReducer,
    initialTestCases,
    (initial?: TestCase[]) => initial ?? loadInitialTestCases(),
  )
  const [storageError, setStorageError] = useState(false)

  // Persist every change to localStorage (an external system) and record whether the write failed,
  // so the UI can warn the user. The result is only known after writing, hence state set in an effect.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setStorageError(!saveTestCases(testCases))
  }, [testCases])

  const addTestCase = useCallback((input: TestCaseInput) => {
    const id = generateId()
    dispatch({ type: 'ADD', id, input, now: new Date() })
    return id
  }, [])

  const updateTestCase = useCallback((id: string, input: TestCaseInput) => {
    dispatch({ type: 'UPDATE', id, input, now: new Date() })
  }, [])

  const deleteTestCase = useCallback((id: string) => {
    dispatch({ type: 'DELETE', id })
  }, [])

  const setStatus = useCallback((id: string, status: TestStatus) => {
    dispatch({ type: 'SET_STATUS', id, status, now: new Date() })
  }, [])

  const importTestCases = useCallback((imported: TestCase[], mode: ImportMode) => {
    dispatch({ type: mode === 'replace' ? 'IMPORT_REPLACE' : 'IMPORT_MERGE', testCases: imported })
  }, [])

  const value = useMemo<TestCaseContextValue>(
    () => ({
      testCases,
      storageError,
      addTestCase,
      updateTestCase,
      deleteTestCase,
      setStatus,
      importTestCases,
    }),
    [testCases, storageError, addTestCase, updateTestCase, deleteTestCase, setStatus, importTestCases],
  )

  return <TestCaseContext.Provider value={value}>{children}</TestCaseContext.Provider>
}
