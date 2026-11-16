import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { TestCaseList } from '../../components/TestCaseList'
import type { TestCase } from '../../types/testCase'
import { DEFAULT_FILTERS } from '../../utils/filters'
import { FIXTURE_CASES } from '../fixtures'

const handlers = {
  onCreate: vi.fn(),
  onView: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onStatusChange: vi.fn(),
}

/** Holds filter state like App does. */
function Harness({ testCases = FIXTURE_CASES }: { testCases?: TestCase[] }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  return <TestCaseList testCases={testCases} filters={filters} onFiltersChange={setFilters} {...handlers} />
}

/** Data rows (excludes the header row). */
function dataRows() {
  return screen.getAllByRole('row').slice(1)
}

describe('TestCaseList', () => {
  it('renders all test cases', () => {
    render(<Harness />)
    expect(dataRows()).toHaveLength(FIXTURE_CASES.length)
    expect(screen.getByText('Showing 5 of 5 test cases')).toBeInTheDocument()
  })

  it('narrows the list when searching', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(screen.getByLabelText('Search'), 'login')

    expect(dataRows()).toHaveLength(2)
    expect(screen.getByText('Showing 2 of 5 test cases')).toBeInTheDocument()
  })

  it('filters by status and module, and clears filters', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.selectOptions(screen.getByLabelText('Status'), 'Passed')
    expect(dataRows()).toHaveLength(2)

    await user.selectOptions(screen.getByLabelText('Module'), 'Checkout')
    expect(dataRows()).toHaveLength(1)
    expect(screen.getByText('Add product to cart')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(dataRows()).toHaveLength(5)
  })

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(screen.getByLabelText('Search'), 'does-not-exist')

    expect(screen.getByRole('heading', { name: 'No matching test cases' })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows an empty state with no test cases', () => {
    render(<Harness testCases={[]} />)
    expect(screen.getByRole('heading', { name: 'No test cases yet' })).toBeInTheDocument()
  })

  it('changes status from the row select', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.selectOptions(screen.getByLabelText('Change status of TC-010'), 'Failed')

    expect(handlers.onStatusChange).toHaveBeenCalledWith(expect.objectContaining({ key: 'TC-010' }), 'Failed')
  })

  it('calls view, edit and delete handlers', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const row = screen.getByText('Apply discount code').closest('tr')!

    await user.click(within(row).getByRole('button', { name: 'View TC-004' }))
    await user.click(within(row).getByRole('button', { name: 'Edit TC-004' }))
    await user.click(within(row).getByRole('button', { name: 'Delete TC-004' }))

    expect(handlers.onView).toHaveBeenCalledWith('d')
    expect(handlers.onEdit).toHaveBeenCalledWith('d')
    expect(handlers.onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'd' }))
  })
})
