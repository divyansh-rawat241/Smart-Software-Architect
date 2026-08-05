import { ArrowRight, Cpu, Database, Rocket, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Requirement intelligence',
    description:
      'Extracts actors, constraints, functional requirements, assumptions, and follow-ups from a single brief.',
    icon: Cpu,
  },
  {
    title: 'Architecture alternatives',
    description:
      'Builds architecture options and compares them with transparent weighted scoring.',
    icon: Workflow,
  },
  {
    title: 'Polished deliverables',
    description:
      'Generates diagrams, APIs, schema design, rollout guidance, markdown exports, and PDF reports.',
    icon: Rocket,
  },
]

export function LandingPage() {
  return (
    <div className="space-y-6">
      <section className="panel-strong relative overflow-hidden">
        <div className="absolute -right-14 -top-10 h-52 w-52 rounded-full bg-[var(--brand-soft)] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-3xl dark:bg-white/5" />
        <div className="grid gap-8 lg:grid-cols-[1.45fr,0.95fr]">
          <div className="space-y-5">
            <p className="pill">Architecture direction, refined</p>
            <h2 className="max-w-3xl text-5xl font-semibold leading-[0.92] md:text-6xl">
              Move from a rough idea to a boardroom-ready system blueprint.
            </h2>
            <p className="max-w-2xl text-lg text-muted">
              ArchAI turns one project brief into requirements, architecture, diagrams, and exports that stay aligned as the workspace evolves.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="button-brand"
              >
                <span className="inline-flex items-center gap-2">
                  Start on dashboard <ArrowRight className="size-4" />
                </span>
              </Link>
              <Link
                to="/dashboard"
                className="button-secondary"
              >
                Review workspaces
              </Link>
            </div>
          </div>

          <div className="panel grid gap-4">
            <div className="rounded-3xl bg-[var(--brand-soft)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
                Decision canvas
              </p>
              <p className="mt-3 text-3xl font-semibold">Three architecture directions</p>
              <p className="mt-2 text-sm text-muted">
                Compare monolith, distributed, and managed-service trade-offs side by side.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-[var(--card-border)] p-5">
                <Database className="size-6 text-brand" />
                <p className="mt-3 font-semibold">Schema clarity</p>
                <p className="mt-2 text-sm text-muted">
                  Entities, relationships, indexes, and normalization notes in one place.
                </p>
              </div>
              <div className="rounded-3xl border border-[var(--card-border)] p-5">
                <Workflow className="size-6 text-brand" />
                <p className="mt-3 font-semibold">Incremental evolution</p>
                <p className="mt-2 text-sm text-muted">
                  Refresh only the artifacts touched by a scope change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <article
              key={feature.title}
              className="panel animate-rise"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <Icon className="size-6 text-brand" />
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm text-muted">{feature.description}</p>
            </article>
          )
        })}
      </section>
    </div>
  )
}
