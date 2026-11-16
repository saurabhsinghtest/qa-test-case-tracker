import { useEffect } from 'react'

export type NotificationType = 'success' | 'error' | 'info'

export interface NotificationData {
  id: number
  message: string
  type: NotificationType
}

interface NotificationProps {
  notification: NotificationData | null
  onDismiss: () => void
}

const ICONS: Record<NotificationType, string> = { success: '✓', error: '!', info: 'i' }

/** Toast message. The live region is always rendered so screen readers announce new messages. */
export function Notification({ notification, onDismiss }: NotificationProps) {
  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(onDismiss, notification.type === 'error' ? 7000 : 4000)
    return () => clearTimeout(timer)
  }, [notification, onDismiss])

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {notification && (
        <div key={notification.id} className={`toast toast--${notification.type}`}>
          <span className="toast__icon" aria-hidden="true">
            {ICONS[notification.type]}
          </span>
          <span className="toast__message">{notification.message}</span>
          <button
            type="button"
            className="toast__close"
            onClick={onDismiss}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
