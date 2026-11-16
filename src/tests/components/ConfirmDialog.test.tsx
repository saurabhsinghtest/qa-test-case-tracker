import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '../../components/ConfirmDialog'

function renderDialog(open = true) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(
    <ConfirmDialog open={open} title="Delete it?" message="This cannot be undone." onConfirm={onConfirm} onCancel={onCancel} />,
  )
  return { onConfirm, onCancel, user: userEvent.setup() }
}

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    renderDialog(false)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('is labelled and focuses Cancel when opened', () => {
    renderDialog()
    const dialog = screen.getByRole('alertdialog', { name: 'Delete it?' })
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.')
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
  })

  it('confirms and cancels', async () => {
    const { onConfirm, onCancel, user } = renderDialog()
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('cancels on Escape', async () => {
    const { onCancel, user } = renderDialog()
    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('keeps Tab focus inside the dialog', async () => {
    const { user } = renderDialog()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
  })
})
