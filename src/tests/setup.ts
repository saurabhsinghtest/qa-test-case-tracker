// Global test setup: runs before every test file.
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  // Unmount rendered components and reset browser storage between tests
  cleanup()
  localStorage.clear()
})
