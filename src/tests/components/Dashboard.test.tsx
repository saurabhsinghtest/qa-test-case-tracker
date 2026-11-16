import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dashboard } from '../../components/Dashboard'
import { FIXTURE_CASES } from '../fixtures'

describe('Dashboard', () => {
  it('shows totals, status counts and percentages', () => {
    render(<Dashboard testCases={FIXTURE_CASES} onNavigate={vi.fn()} onShowStatus={vi.fn()} />)

    const total = screen.getByRole('button', { name: /show all test cases/i })
    expect(within(total).getByText('5')).toBeInTheDocument()

    const passed = screen.getByRole('button', { name: /show passed test cases/i })
    expect(within(passed).getByText('2')).toBeInTheDocument()
    expect(within(passed).getByText('40% of total')).toBeInTheDocument()

    // 2 passed of 4 executed
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('4 of 5 executed (80%)')).toBeInTheDocument()
    expect(screen.getByText(/2 test cases need attention/)).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Execution progress' })).toHaveAttribute('aria-valuenow', '80')
  })

  it('describes the status bar for screen readers', () => {
    render(<Dashboard testCases={FIXTURE_CASES} onNavigate={vi.fn()} onShowStatus={vi.fn()} />)
    expect(
      screen.getByRole('img', { name: /Execution status: Passed 2 \(40%\), Failed 1 \(20%\)/ }),
    ).toBeInTheDocument()
  })

  it('opens the filtered list when a status card is clicked', async () => {
    const onShowStatus = vi.fn()
    const user = userEvent.setup()
    render(<Dashboard testCases={FIXTURE_CASES} onNavigate={vi.fn()} onShowStatus={onShowStatus} />)

    await user.click(screen.getByRole('button', { name: /show failed test cases/i }))
    expect(onShowStatus).toHaveBeenCalledWith('Failed')
  })

  it('lists recently updated test cases and opens them', async () => {
    const onNavigate = vi.fn()
    const user = userEvent.setup()
    render(<Dashboard testCases={FIXTURE_CASES} onNavigate={onNavigate} onShowStatus={vi.fn()} />)

    const recent = screen.getByRole('heading', { name: 'Recently updated' }).closest('article')!
    const buttons = within(recent).getAllByRole('button', { name: /login|discount|cart|search/i })
    expect(buttons[0]).toHaveTextContent('Login with wrong password') // newest first

    await user.click(buttons[0])
    expect(onNavigate).toHaveBeenCalledWith({ name: 'view', id: 'b' })
  })

  it('shows an empty state when there are no test cases', () => {
    render(<Dashboard testCases={[]} onNavigate={vi.fn()} onShowStatus={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'No test cases yet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Import JSON' })).toBeInTheDocument()
  })
})
