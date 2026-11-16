// Integration tests: full user flows through the real App, provider and localStorage.
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import type { TestCase } from '../types/testCase'
import { getSampleTestCases } from '../utils/sampleData'
import { STORAGE_KEY } from '../utils/storage'
import { FIXTURE_CASES } from './fixtures'

function renderApp(seed: TestCase[] | null = FIXTURE_CASES) {
  if (seed) localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  render(<App />)
  return userEvent.setup()
}

function stored(): TestCase[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
}

const nav = () => within(screen.getByRole('navigation', { name: 'Main' }))

describe('App', () => {
  it('loads and saves sample data on the first visit', () => {
    renderApp(null)
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument()
    expect(stored()).toHaveLength(getSampleTestCases().length)
  })

  it('loads saved data from localStorage', async () => {
    const user = renderApp()
    await user.click(nav().getByRole('button', { name: 'Test Cases' }))
    expect(screen.getAllByRole('row')).toHaveLength(FIXTURE_CASES.length + 1)
  })

  it('creates a test case', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: /new test case/i }))
    await user.type(screen.getByLabelText(/^title/i), 'Logout clears the session')
    await user.type(screen.getByLabelText(/^module/i), 'Login')
    await user.type(screen.getByLabelText(/test steps/i), 'Log in{enter}Click logout')
    await user.type(screen.getByLabelText(/expected result/i), 'User is signed out')
    await user.click(screen.getByRole('button', { name: 'Create test case' }))

    // Detail view of the new test case
    expect(screen.getByRole('heading', { level: 1, name: 'Logout clears the session' })).toBeInTheDocument()
    expect(screen.getByText('TC-011')).toBeInTheDocument()
    expect(screen.getByText('Click logout').tagName).toBe('LI') // steps rendered as a numbered list
    expect(screen.getByRole('status')).toHaveTextContent('Test case "Logout clears the session" created.')

    // Saved to localStorage
    expect(stored()).toHaveLength(FIXTURE_CASES.length + 1)
    expect(stored().at(-1)).toMatchObject({ key: 'TC-011', module: 'Login', steps: 'Log in\nClick logout' })
  })

  it('blocks creation when validation fails', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: /new test case/i }))
    await user.click(screen.getByRole('button', { name: 'Create test case' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Please fix 2 errors')
    expect(stored()).toHaveLength(FIXTURE_CASES.length)
  })

  it('edits a test case', async () => {
    const user = renderApp()
    await user.click(nav().getByRole('button', { name: 'Test Cases' }))
    await user.click(screen.getByRole('button', { name: 'Edit TC-002' }))

    const title = screen.getByLabelText(/^title/i)
    expect(title).toHaveValue('Login with wrong password')
    await user.clear(title)
    await user.type(title, 'Login with an incorrect password')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Login with an incorrect password' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Changes saved.')
    expect(stored().find((tc) => tc.id === 'b')?.title).toBe('Login with an incorrect password')
  })

  it('deletes a test case after confirmation', async () => {
    const user = renderApp()
    await user.click(nav().getByRole('button', { name: 'Test Cases' }))
    await user.click(screen.getByRole('button', { name: 'Delete TC-001' }))

    const dialog = screen.getByRole('alertdialog', { name: 'Delete test case?' })
    expect(dialog).toHaveTextContent('TC-001: Login with valid credentials')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(screen.queryByText('Login with valid credentials')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('TC-001 deleted.')
    expect(stored().map((tc) => tc.id)).not.toContain('a')
  })

  it('deleting from the detail view returns to the list', async () => {
    const user = renderApp()
    await user.click(nav().getByRole('button', { name: 'Test Cases' }))
    await user.click(screen.getByRole('button', { name: 'View TC-003' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Test Cases' })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(FIXTURE_CASES.length) // one fewer + header
  })

  it('updates dashboard counts after a status change in the list', async () => {
    const user = renderApp()
    const passedCard = () => screen.getByRole('button', { name: /show passed test cases/i })
    expect(within(passedCard()).getByText('2')).toBeInTheDocument()

    await user.click(nav().getByRole('button', { name: 'Test Cases' }))
    await user.selectOptions(screen.getByLabelText('Change status of TC-010'), 'Passed')
    expect(screen.getByRole('status')).toHaveTextContent('TC-010 marked as Passed.')

    await user.click(nav().getByRole('button', { name: 'Dashboard' }))
    expect(within(passedCard()).getByText('3')).toBeInTheDocument()
    expect(stored().find((tc) => tc.id === 'e')?.lastExecutedAt).toBeTruthy()
  })

  it('changes status from the detail view', async () => {
    const user = renderApp()
    await user.click(nav().getByRole('button', { name: 'Test Cases' }))
    await user.click(screen.getByRole('button', { name: 'View TC-004' }))

    const group = screen.getByRole('group', { name: 'Execution status' })
    expect(within(group).getByRole('button', { name: 'Blocked' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(within(group).getByRole('button', { name: 'Passed' }))

    expect(within(group).getByRole('button', { name: 'Passed' })).toHaveAttribute('aria-pressed', 'true')
    expect(stored().find((tc) => tc.id === 'd')?.status).toBe('Passed')
  })

  it('opens the list filtered by status from a dashboard card and keeps search working', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: /show failed test cases/i }))

    expect(screen.getByLabelText('Status')).toHaveValue('Failed')
    expect(screen.getAllByRole('row')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    await user.type(screen.getByLabelText('Search'), 'checkout')
    expect(screen.getAllByRole('row')).toHaveLength(3)
  })
})
