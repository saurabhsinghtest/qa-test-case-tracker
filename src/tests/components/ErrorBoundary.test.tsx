// Review fix M3: unexpected render errors show a recovery screen instead of a blank page.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { downloadFile } from '../../utils/fileIO'
import { saveTestCases } from '../../utils/storage'
import { FIXTURE_CASES } from '../fixtures'

vi.mock('../../utils/fileIO', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../utils/fileIO')>()),
  downloadFile: vi.fn(),
}))

function Broken(): never {
  throw new Error('Boom')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React and the boundary log the caught error; keep test output clean
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('shows a recovery screen when a child throws', () => {
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument()
  })

  it('downloads a backup of the saved data from localStorage', async () => {
    saveTestCases(FIXTURE_CASES)
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    )
    await userEvent.setup().click(screen.getByRole('button', { name: 'Download backup (JSON)' }))

    const [fileName, content] = vi.mocked(downloadFile).mock.calls[0]
    expect(fileName).toMatch(/^qa-test-cases-.*\.json$/)
    expect(JSON.parse(content).testCases).toHaveLength(FIXTURE_CASES.length)
  })
})
