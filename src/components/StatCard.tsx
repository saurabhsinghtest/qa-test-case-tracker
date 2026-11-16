interface StatCardProps {
  label: string
  value: string | number
  detail?: string
  /** Colour accent: "total", "rate", or a status slug such as "passed". */
  tone?: string
  onClick?: () => void
  /** Accessible description of the click action, e.g. "Show failed test cases". */
  actionLabel?: string
}

export function StatCard({ label, value, detail, tone = 'total', onClick, actionLabel }: StatCardProps) {
  const content = (
    <>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {detail && <span className="stat-card__detail">{detail}</span>}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        className={`stat-card stat-card--${tone} stat-card--clickable`}
        onClick={onClick}
        title={actionLabel}
      >
        {content}
        {actionLabel && <span className="visually-hidden">. {actionLabel}</span>}
      </button>
    )
  }
  return <div className={`stat-card stat-card--${tone}`}>{content}</div>
}
