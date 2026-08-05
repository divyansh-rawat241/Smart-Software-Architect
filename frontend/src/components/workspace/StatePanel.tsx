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
    <section className="panel-strong">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <span className="pill">{badge}</span>
          <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
          <p className="mt-3 text-sm text-muted">{description}</p>
        </div>
        {isDanger ? (
          <div className="rounded-full bg-[rgba(182,66,66,0.12)] p-3 text-danger">
            <AlertTriangle className="size-5" />
          </div>
        ) : null}
      </div>

      {actionLabel ? (
        <div className="mt-5">
          {actionTo ? (
            <Link
              to={actionTo}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold"
            >
              <RefreshCcw className="size-4" />
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold"
            >
              <RefreshCcw className="size-4" />
              {actionLabel}
            </button>
          )}
        </div>
      ) : null}
    </section>
  )
}

