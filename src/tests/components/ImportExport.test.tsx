import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportExport } from '../../components/ImportExport'
import { TestCaseProvider } from '../../context/TestCaseProvider'
import { useTestCases } from '../../context/useTestCases'
import type { TestCase } from '../../types/testCase'
import { downloadFile } from '../../utils/fileIO'
import { FIXTURE_CASES, makeTestCase } from '../fixtures'

vi.mock('../../utils/fileIO', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../utils/fileIO')>()),
  downloadFile: vi.fn(),
}))

/** Shows the current count so tests can observe state changes. */
function Count() {
  const { testCases } = useTestCases()
  return <p data-testid="count">{testCases.length}</p>
}

function renderImportExport(initial: TestCase[] = FIXTURE_CASES) {
  const onNotify = vi.fn()
  render(
    <TestCaseProvider initialTestCases={initial}>
      <ImportExport onNotify={onNotify} />
      <Count />
    </TestCaseProvider>,
  )
  return { onNotify, user: userEvent.setup() }
}

function jsonFile(content: unknown, name = 'cases.json') {
  return new File([typeof content === 'string' ? content : JSON.stringify(content)], name, {
    type: 'application/json',
  })
}

describe('ImportExport', () => {
  it('exports all test cases as JSON', async () => {
    const { onNotify, user } = renderImportExport()
    await user.click(screen.getByRole('button', { name: /export json/i }))

    expect(downloadFile).toHaveBeenCalledTimes(1)
    const [fileName, content] = vi.mocked(downloadFile).mock.calls[0]
    expect(fileName).toMatch(/^qa-test-cases-\d{4}-\d{2}-\d{2}\.json$/)
    expect(JSON.parse(content).testCases).toHaveLength(FIXTURE_CASES.length)
    expect(onNotify).toHaveBeenCalledWith('Exported 5 test cases to JSON.')
  })

  it('disables export when there is nothing to export', () => {
    renderImportExport([])
    expect(screen.getByRole('button', { name: /export json/i })).toBeDisabled()
  })

  it('previews and merges a valid file', async () => {
    const { onNotify, user } = renderImportExport()
    const file = jsonFile([
      { id: 'a', title: 'Updated login', status: 'Failed', priority: 'Critical' },
      { id: 'new-1', title: 'New case', status: 'Not Run', priority: 'Low' },
    ])
    await user.upload(screen.getByLabelText('JSON file'), file)

    expect(await screen.findByText(/Found/)).toHaveTextContent('Found 2 test cases in cases.json.')
    expect(screen.getByRole('radio', { name: /merge/i })).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Import 2 test cases' }))
    expect(screen.getByTestId('count')).toHaveTextContent('6')
    expect(onNotify).toHaveBeenCalledWith('Imported 2 test cases: 1 added, 1 updated.')
  })

  it('shows an error for an invalid file', async () => {
    const { user } = renderImportExport()
    await user.upload(screen.getByLabelText('JSON file'), jsonFile('{oops', 'bad.json'))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Import failed')
    expect(alert).toHaveTextContent('The file is not valid JSON.')
    expect(screen.queryByRole('button', { name: /^import \d/i })).not.toBeInTheDocument()
  })

  it('asks for confirmation before replacing all data', async () => {
    const { onNotify, user } = renderImportExport()
    await user.upload(screen.getByLabelText('JSON file'), jsonFile({ testCases: [makeTestCase({ id: 'only' })] }))
    await screen.findByText(/Found/)

    await user.click(screen.getByRole('radio', { name: /replace/i }))
    await user.click(screen.getByRole('button', { name: 'Import 1 test case' }))

    const dialog = screen.getByRole('alertdialog', { name: 'Replace all test cases?' })
    await user.click(within(dialog).getByRole('button', { name: 'Replace all' }))

    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(onNotify).toHaveBeenCalledWith('Replaced all data with 1 imported test case.')
  })

  it('does not replace data when the confirmation is cancelled', async () => {
    const { user } = renderImportExport()
    await user.upload(screen.getByLabelText('JSON file'), jsonFile([makeTestCase({ id: 'only' })]))
    await screen.findByText(/Found/)
    await user.click(screen.getByRole('radio', { name: /replace/i }))
    await user.click(screen.getByRole('button', { name: 'Import 1 test case' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('count')).toHaveTextContent('5')
  })
})
