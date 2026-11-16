import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestCaseForm } from '../../components/TestCaseForm'
import { makeInput } from '../fixtures'

function renderForm(props: Partial<Parameters<typeof TestCaseForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  render(<TestCaseForm mode="create" modules={['Login']} onSubmit={onSubmit} onCancel={onCancel} {...props} />)
  return { onSubmit, onCancel, user: userEvent.setup() }
}

describe('TestCaseForm', () => {
  it('shows validation errors and does not submit when required fields are empty', async () => {
    const { onSubmit, user } = renderForm()
    await user.click(screen.getByRole('button', { name: 'Create test case' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Please fix 2 errors')
    expect(screen.getByLabelText(/^title/i)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/expected result/i)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getAllByText('Title is required.').length).toBeGreaterThan(0)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('moves focus to the error summary on every failed submit', async () => {
    const { user } = renderForm()
    await user.click(screen.getByRole('button', { name: 'Create test case' }))
    expect(screen.getByRole('alert')).toHaveFocus()

    // Focus elsewhere, submit again: focus returns to the summary
    await user.click(screen.getByLabelText(/^module/i))
    await user.click(screen.getByRole('button', { name: 'Create test case' }))
    expect(screen.getByRole('alert')).toHaveFocus()
  })

  it('clears errors as the user fixes them after a failed submit', async () => {
    const { user } = renderForm()
    await user.click(screen.getByRole('button', { name: 'Create test case' }))
    await user.type(screen.getByLabelText(/^title/i), 'Valid title')

    expect(screen.getByLabelText(/^title/i)).not.toHaveAttribute('aria-invalid')
    expect(screen.getByRole('alert')).toHaveTextContent('Please fix 1 error')
  })

  it('submits trimmed values when valid', async () => {
    const { onSubmit, user } = renderForm()
    await user.type(screen.getByLabelText(/^title/i), '  Checkout works  ')
    await user.type(screen.getByLabelText(/expected result/i), 'Order placed')
    await user.selectOptions(screen.getByLabelText(/^priority/i), 'High')
    await user.selectOptions(screen.getByLabelText(/execution status/i), 'Failed')
    await user.click(screen.getByRole('button', { name: 'Create test case' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Checkout works',
        expectedResult: 'Order placed',
        priority: 'High',
        status: 'Failed',
      }),
    )
  })

  it('pre-fills values in edit mode', async () => {
    const { onSubmit, user } = renderForm({
      mode: 'edit',
      testCaseKey: 'TC-007',
      initialValues: makeInput({ title: 'Existing title', module: 'Login' }),
    })
    expect(screen.getByRole('heading', { name: 'Edit TC-007' })).toBeInTheDocument()
    expect(screen.getByLabelText(/^title/i)).toHaveValue('Existing title')

    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: 'Existing title', module: 'Login' }))
  })

  it('calls onCancel', async () => {
    const { onCancel, user } = renderForm()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })
})
