import { CheckCircle2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { ArchitectureOption } from '../../types/api'

interface ArchitectureCardProps {
  architecture: ArchitectureOption
  recommended?: boolean
}

export function ArchitectureCard({
  architecture,
  recommended = false,
}: ArchitectureCardProps) {
  return (
    <article
      className={cn(
        'panel h-full transition hover:-translate-y-1',
        recommended && 'ring-2 ring-[var(--brand-strong)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="pill">{architecture.style}</div>
          <h3 className="mt-3 text-xl font-semibold">{architecture.name}</h3>
          <p className="mt-2 text-sm text-muted">{architecture.overview}</p>
        </div>
        {recommended ? <CheckCircle2 className="size-6 text-success" /> : null}
      </div>

      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-3">
        <div>
          <dt className="text-muted">Complexity</dt>
          <dd className="mt-1 font-semibold">{architecture.estimated_complexity}</dd>
        </div>
        <div>
          <dt className="text-muted">Cost</dt>
          <dd className="mt-1 font-semibold">{architecture.estimated_cost}</dd>
        </div>
        <div>
          <dt className="text-muted">API style</dt>
          <dd className="mt-1 font-semibold">{architecture.api_style}</dd>
        </div>
      </dl>

      <div className="mt-5">
        <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
          Advantages
        </h4>
        <ul className="mt-3 space-y-2 text-sm">
          {architecture.advantages.map((advantage) => (
            <li key={advantage}>- {advantage}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}

