import { useSearchParams } from 'react-router-dom'
import { RadarComparisonChart } from '../components/charts/RadarComparisonChart'
import { ComparisonTable } from '../components/workspace/ComparisonTable'
import { StatePanel } from '../components/workspace/StatePanel'
import { useWorkspacesQuery } from '../hooks/useWorkspaces'
import { getActiveWorkspace, getErrorMessage } from '../lib/utils'

export function ComparisonPage() {
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
        title="Loading comparison"
        description="Preparing the architecture scorecards."
      />
    )
  }

  if (workspaceQuery.isError) {
    return (
      <StatePanel
        badge="Backend issue"
        title="The comparison dashboard could not reach the backend"
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
        title="No comparison scorecard is available yet"
        description="Create the project brief from the dashboard first."
        actionLabel="Open Dashboard"
        actionTo="/dashboard"
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1fr,1fr]">
        <RadarComparisonChart comparison={workspace.comparison} />
        <div className="panel">
          <p className="pill">Scoring rationale</p>
          <h3 className="mt-3 text-xl font-semibold">
            Why the scorecards look this way
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {workspace.comparison.reasoning.map((reason) => (
              <li key={reason}>- {reason}</li>
            ))}
          </ul>
        </div>
      </section>

      <ComparisonTable comparison={workspace.comparison} />
    </div>
  )
}
