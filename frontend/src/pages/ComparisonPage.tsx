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
    return <StatePanel badge="Loading" title="Loading comparison" description="Preparing the scorecards." />
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
        title="No comparison available"
        description="Create a project brief from the dashboard first."
        actionLabel="Open Dashboard"
        actionTo="/dashboard"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <RadarComparisonChart comparison={workspace.comparison} />
        <div className="panel">
          <span className="pill">Scoring rationale</span>
          <ul className="mt-3 space-y-1.5 text-sm">
            {workspace.comparison.reasoning.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      </div>

      <ComparisonTable comparison={workspace.comparison} />
    </div>
  )
}
