import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  message?: string
  icon?: string
  children?: ReactNode
}

export function EmptyState({ title, message, icon = '📋', children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        {icon}
      </div>
      <h2 className="empty-state__title">{title}</h2>
      {message && <p className="empty-state__message">{message}</p>}
      {children && <div className="empty-state__actions">{children}</div>}
    </div>
  )
}
