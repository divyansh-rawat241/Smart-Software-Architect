import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

interface StatePanelProps {
  badge: string
  title: string
  description: string
  tone?: 'default' | 'danger'
  actionLabel?: string
  actionTo?: string
  onAction?: () => void
}

export function StatePanel({
  badge,
  title,
  description,
  tone = 'default',
  actionLabel,
  actionTo,
  onAction,
}: StatePanelProps) {
  const isDanger = tone === 'danger'

  return (
    <div className="panel">
      <div className="flex items-start justify-between">
        <div className="max-w-lg">
          <span className="pill">{badge}</span>
          <h2 className="mt-2 text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
        </div>
        {isDanger ? (
          <AlertTriangle className="h-5 w-5 shrink-0" style={{ color: 'var(--danger)' }} />
        ) : null}
      </div>

      {actionLabel ? (
        <div className="mt-3">
          {actionTo ? (
            <Link
              to={actionTo}
              className="button-secondary inline-flex items-center gap-1.5 text-sm"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="button-secondary inline-flex items-center gap-1.5 text-sm"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              {actionLabel}
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}
