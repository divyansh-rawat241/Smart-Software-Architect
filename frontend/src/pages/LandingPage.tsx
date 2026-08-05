import { ArrowRight, Cpu, Database, Rocket, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Requirement intelligence',
    description: 'Extracts actors, constraints, functional requirements, and follow-ups from a single brief.',
    icon: Cpu,
  },
  {
    title: 'Architecture alternatives',
    description: 'Builds architecture options and compares them with transparent weighted scoring.',
    icon: Workflow,
  },
  {
    title: 'Polished deliverables',
    description: 'Generates diagrams, APIs, schema design, and exports that stay aligned as the workspace evolves.',
    icon: Rocket,
  },
]

export function LandingPage() {
  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <span className="pill">Architecture direction, refined</span>
            <h2 className="text-3xl font-bold leading-tight">
              Move from a rough idea to a system blueprint.
            </h2>
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>
              ArchAI turns one project brief into requirements, architecture, diagrams, and exports.
            </p>
            <div className="flex gap-3">
              <Link to="/dashboard" className="button-brand">
                <span className="inline-flex items-center gap-2">
                  Get started <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link to="/dashboard" className="button-secondary">
                View workspaces
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--card-border)', background: 'var(--brand-soft)' }}>
              <div className="text-sm font-medium" style={{ color: 'var(--brand-strong)' }}>Decision canvas</div>
              <p className="mt-1 font-semibold">Three architecture directions</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                Compare monolith, distributed, and managed-service trade-offs.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3" style={{ borderColor: 'var(--card-border)' }}>
                <Database className="h-5 w-5" style={{ color: 'var(--brand)' }} />
                <p className="mt-2 text-sm font-medium">Schema clarity</p>
              </div>
              <div className="rounded-lg border p-3" style={{ borderColor: 'var(--card-border)' }}>
                <Workflow className="h-5 w-5" style={{ color: 'var(--brand)' }} />
                <p className="mt-2 text-sm font-medium">Incremental evolution</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="panel">
              <Icon className="h-5 w-5" style={{ color: 'var(--brand)' }} />
              <h3 className="mt-2 font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{feature.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
