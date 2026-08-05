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
        'panel transition',
        recommended && 'ring-2 ring-amber-600',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="pill">{architecture.style}</span>
          <h3 className="mt-2 text-lg font-semibold">{architecture.name}</h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{architecture.overview}</p>
        </div>
        {recommended ? <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: 'var(--success)' }} /> : null}
      </div>

      <div className="mt-3 flex gap-4 text-sm">
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Complexity: </span>
          <span className="font-medium">{architecture.estimated_complexity}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Cost: </span>
          <span className="font-medium">{architecture.estimated_cost}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Advantages</div>
        <ul className="mt-1 space-y-1 text-sm">
          {architecture.advantages.map((advantage) => (
            <li key={advantage}>{advantage}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}
