import { useSearchParams } from 'react-router-dom'
import { StatePanel } from '../components/workspace/StatePanel'
import { useWorkspacesQuery } from '../hooks/useWorkspaces'
import { getActiveWorkspace, getErrorMessage } from '../lib/utils'

export function RequirementWizardPage() {
  const [searchParams] = useSearchParams()
  const workspaceQuery = useWorkspacesQuery()
  const workspace = getActiveWorkspace(
    workspaceQuery.data,
    searchParams.get('workspace'),
  )

  if (workspaceQuery.isLoading) {
    return (
      <StatePanel
        badge="Loading"
        title="Loading requirements"
        description="Preparing the project requirement overview."
      />
    )
  }

  if (workspaceQuery.isError) {
    return (
      <StatePanel
        badge="Backend issue"
        title="The requirements view could not reach the backend"
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
        title="No requirement overview is available yet"
        description="Create the project brief from the dashboard first."
        actionLabel="Open Dashboard"
        actionTo="/dashboard"
      />
    )
  }

  return (
    <div className="space-y-4">
      <section className="panel-strong">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="pill">{workspace.requirements.domain}</p>
            <h2 className="mt-3 text-3xl font-semibold">
              {workspace.title} requirements
            </h2>
            <p className="mt-3 text-sm text-muted">
              {workspace.requirements.summary}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.3rem] border border-[var(--card-border)] bg-black/5 px-4 py-3 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Actors
              </p>
              <p className="mt-2 text-lg font-semibold">
                {workspace.requirements.actors.length}
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-[var(--card-border)] bg-black/5 px-4 py-3 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Functional
              </p>
              <p className="mt-2 text-lg font-semibold">
                {workspace.requirements.functional_requirements.length}
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-[var(--card-border)] bg-black/5 px-4 py-3 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Completeness
              </p>
              <p className="mt-2 text-lg font-semibold">
                {workspace.clarification_plan.completeness_score}%
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr,1fr]">
        <article className="panel">
          <p className="pill">Project brief</p>
          <p className="mt-4 text-sm leading-7">{workspace.original_prompt}</p>
        </article>

        <article className="panel">
          <p className="pill">Business context</p>
          <p className="mt-4 text-sm leading-7">
            {workspace.business_context || 'No business context was supplied.'}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
        <article className="panel">
          <p className="pill">Actors</p>
          <ul className="mt-4 space-y-3 text-sm">
            {workspace.requirements.actors.map((actor) => (
              <li key={actor.name}>
                <div className="font-semibold">{actor.name}</div>
                <div className="mt-1 text-muted">{actor.description}</div>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <p className="pill">Functional requirements</p>
          <ul className="mt-4 grid gap-2 text-sm">
            {workspace.requirements.functional_requirements.map((requirement) => (
              <li key={requirement}>- {requirement}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr,1fr]">
        <article className="panel">
          <p className="pill">Non-functional requirements</p>
          <ul className="mt-4 grid gap-2 text-sm">
            {workspace.requirements.non_functional_requirements.map(
              (requirement) => (
                <li key={requirement}>- {requirement}</li>
              ),
            )}
          </ul>
        </article>

        <article className="panel">
          <p className="pill">Captured inputs</p>
          <div className="mt-4 grid gap-3 text-sm">
            {Object.entries(workspace.answers).length ? (
              Object.entries(workspace.answers).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-[1.2rem] border border-[var(--card-border)] bg-black/5 px-4 py-3 dark:bg-white/5"
                >
                  <div className="text-xs uppercase tracking-[0.24em] text-muted">
                    {key.replaceAll('_', ' ')}
                  </div>
                  <div className="mt-2 font-semibold">{value}</div>
                </div>
              ))
            ) : (
              <p className="text-muted">No structured answers were captured.</p>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr,1fr]">
        <article className="panel">
          <p className="pill">Constraints</p>
          <ul className="mt-4 grid gap-2 text-sm">
            {workspace.requirements.constraints.map((constraint) => (
              <li key={constraint}>- {constraint}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <p className="pill">Assumptions</p>
          <ul className="mt-4 grid gap-2 text-sm">
            {workspace.requirements.assumptions.map((assumption) => (
              <li key={assumption}>- {assumption}</li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}
