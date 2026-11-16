import { useContext } from 'react'
import { TestCaseContext, type TestCaseContextValue } from './TestCaseContext'

export function useTestCases(): TestCaseContextValue {
  const context = useContext(TestCaseContext)
  if (!context) throw new Error('useTestCases must be used inside <TestCaseProvider>.')
  return context
}
