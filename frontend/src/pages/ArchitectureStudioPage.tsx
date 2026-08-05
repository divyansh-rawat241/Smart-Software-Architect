import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArchitectureFlow } from '../components/diagrams/ArchitectureFlow'
import { StatePanel } from '../components/workspace/StatePanel'
import { useWorkspacesQuery } from '../hooks/useWorkspaces'
import { getActiveWorkspace, getErrorMessage } from '../lib/utils'

export function ArchitectureStudioPage() {
  const [searchParams] = useSearchParams()
  const workspaceQuery = useWorkspacesQuery()
  const workspace = getActiveWorkspace(
    workspaceQuery.data,
    searchParams.get('workspace'),
  )
  const recommendedArchitectureId =
    workspace?.recommendation.recommended_architecture_id ?? ''
  const [selectedArchitectureId, setSelectedArchitectureId] = useState(
    recommendedArchitectureId,
  )

  useEffect(() => {
    if (recommendedArchitectureId) {
      setSelectedArchitectureId(recommendedArchitectureId)
    }
  }, [recommendedArchitectureId, workspace?.id])

  if (workspaceQuery.isLoading) {
    return (
      <StatePanel
        badge="Loading"
        title="Loading architecture"
        description="Preparing the architecture view."
      />
    )
  }

  if (workspaceQuery.isError) {
    return (
      <StatePanel
        badge="Backend issue"
        title="The architecture page could not reach the backend"
        description={getErrorMessage(workspaceQuery.error)}
        tone="danger"
        actionLabel="Retry"
        onAction={() => void workspaceQuery.refetch()}
      />
    )
  }

  if (!workspace) {
    return (
      <StatePanel
        badge="No workspace"
        title="No architecture is available yet"
        description="Create the project brief from the dashboard first."
        actionLabel="Open Dashboard"
        actionTo="/dashboard"
      />
    )
  }

  const selectedArchitecture =
    workspace.architectures.find(
      (architecture) => architecture.id === selectedArchitectureId,
    ) ?? workspace.architectures[0]

  return (
    <div className="space-y-4">
      <section className="panel-strong">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="pill">{selectedArchitecture.style}</p>
              <span className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs uppercase tracking-[0.24em] text-muted">
                Recommended path
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold">
              {selectedArchitecture.name}
            </h2>
            <p className="mt-3 text-sm text-muted">
              {workspace.recommendation.decision_summary}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.3rem] border border-[var(--card-border)] bg-black/5 px-4 py-3 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Complexity
              </p>
              <p className="mt-2 text-lg font-semibold">
                {selectedArchitecture.estimated_complexity}
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-[var(--card-border)] bg-black/5 px-4 py-3 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Cost
              </p>
              <p className="mt-2 text-lg font-semibold">
                {selectedArchitecture.estimated_cost}
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-[var(--card-border)] bg-black/5 px-4 py-3 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                API
              </p>
              <p className="mt-2 text-lg font-semibold">
                {selectedArchitecture.api_style}
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-[var(--card-border)] bg-black/5 px-4 py-3 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Deploy
              </p>
              <p className="mt-2 text-lg font-semibold">
                {selectedArchitecture.deployment}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="pill">Architecture options</p>
            <p className="mt-3 text-sm text-muted">
              Switch views to compare the recommended structure against the other
              generated directions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {workspace.architectures.map((architecture) => (
              <button
                key={architecture.id}
                type="button"
                onClick={() => setSelectedArchitectureId(architecture.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  architecture.id === selectedArchitecture.id
                    ? 'bg-brand text-white'
                    : 'border border-[var(--card-border)] bg-[var(--surface-strong)]'
                }`}
              >
                {architecture.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
        <ArchitectureFlow architecture={selectedArchitecture} />

        <div className="grid gap-4">
          <article className="panel">
            <p className="pill">Why it fits</p>
            <ul className="mt-4 space-y-3 text-sm">
              {workspace.recommendation.why.map((reason) => (
                <li key={reason}>- {reason}</li>
              ))}
            </ul>
          </article>

          <article className="panel">
            <p className="pill">Rollout</p>
            <ul className="mt-4 space-y-3 text-sm">
              {workspace.recommendation.rollout_plan.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr,1fr]">
        <article className="panel">
          <p className="pill">Technology stack</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedArchitecture.technology_stack.map((technology) => (
              <span
                key={technology}
                className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs font-semibold text-muted"
              >
                {technology}
              </span>
            ))}
          </div>

          <div className="mt-5">
            <div className="text-xs uppercase tracking-[0.24em] text-muted">
              Suitable when
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {selectedArchitecture.suitable_scenarios.map((scenario) => (
                <li key={scenario}>- {scenario}</li>
              ))}
            </ul>
          </div>
        </article>

        <article className="panel">
          <p className="pill">Trade-offs</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-muted">
                Advantages
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {selectedArchitecture.advantages.map((advantage) => (
                  <li key={advantage}>- {advantage}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-muted">
                Risks
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {selectedArchitecture.disadvantages.map((risk) => (
                  <li key={risk}>- {risk}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
