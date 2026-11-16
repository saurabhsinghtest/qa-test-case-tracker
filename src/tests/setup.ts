// Global test setup: runs before every test file.
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom does not implement scrolling
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

afterEach(() => {
  // Unmount rendered components and reset browser storage between tests
  cleanup()
  localStorage.clear()
  vi.clearAllMocks()
})
