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
    return <StatePanel badge="Loading" title="Loading requirements" description="Preparing the overview." />
  }

  if (workspaceQuery.isError) {
    return (
      <StatePanel
        badge="Backend issue"
        title="Could not reach the backend"
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
        title="No requirements available"
        description="Create a project brief from the dashboard first."
        actionLabel="Open Dashboard"
        actionTo="/dashboard"
      />
    )
  }

  const { requirements } = workspace

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="panel">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="pill">{requirements.domain}</span>
            <h2 className="mt-1 text-lg font-semibold">{workspace.title}</h2>
          </div>
          <div className="flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{requirements.actors.length} actors</span>
            <span>&middot;</span>
            <span>{requirements.functional_requirements.length} functional</span>
            <span>&middot;</span>
            <span>{workspace.clarification_plan.completeness_score}% complete</span>
          </div>
        </div>
      </div>

      {/* Actors + Functional Requirements side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-sm font-semibold mb-2">Actors</h3>
          <ul className="space-y-2">
            {requirements.actors.map((actor) => (
              <li key={actor.name} className="flex gap-2 text-sm">
                <span className="font-medium shrink-0">{actor.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>- {actor.description}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3 className="text-sm font-semibold mb-2">Functional Requirements</h3>
          <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {requirements.functional_requirements.map((req, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0" style={{ color: 'var(--brand)' }}>{i + 1}.</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Non-functional + Constraints side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-sm font-semibold mb-2">Non-Functional Requirements</h3>
          <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {requirements.non_functional_requirements.map((req, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0" style={{ color: 'var(--brand)' }}>{i + 1}.</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3 className="text-sm font-semibold mb-2">Constraints</h3>
          <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {requirements.constraints.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0" style={{ color: 'var(--brand)' }}>&bull;</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>

          {requirements.assumptions.length > 0 && (
            <>
              <h3 className="text-sm font-semibold mt-4 mb-2">Assumptions</h3>
              <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                {requirements.assumptions.map((a, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0" style={{ color: 'var(--brand)' }}>&bull;</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
