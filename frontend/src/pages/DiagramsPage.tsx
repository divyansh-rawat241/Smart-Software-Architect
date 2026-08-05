import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MermaidDiagram } from '../components/diagrams/MermaidDiagram'
import { StatePanel } from '../components/workspace/StatePanel'
import { useWorkspacesQuery } from '../hooks/useWorkspaces'
import { getActiveWorkspace, getErrorMessage } from '../lib/utils'

const diagramOrder = [
  'use_case', 'activity', 'sequence', 'class', 'er', 'component', 'deployment',
]

const diagramLabels: Record<string, string> = {
  use_case: 'Use Case',
  activity: 'Activity',
  sequence: 'Sequence',
  class: 'Class',
  er: 'ER',
  component: 'Component',
  deployment: 'Deployment',
}

export function DiagramsPage() {
  const [searchParams] = useSearchParams()
  const workspaceQuery = useWorkspacesQuery()
  const workspace = getActiveWorkspace(
    workspaceQuery.data,
    searchParams.get('workspace'),
  )
  const diagramKeys = useMemo(
    () =>
      workspace
        ? diagramOrder.filter((diagramKey) => workspace.diagrams[diagramKey])
        : [],
    [workspace],
  )
  const [selectedKey, setSelectedKey] = useState('use_case')

  useEffect(() => {
    if (!diagramKeys.length) return
    if (!diagramKeys.includes(selectedKey)) {
      setSelectedKey(diagramKeys[0])
    }
  }, [diagramKeys, selectedKey])

  if (workspaceQuery.isLoading) {
    return <StatePanel badge="Loading" title="Loading diagrams" description="Preparing the diagram suite." />
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
        title="No diagrams available"
        description="Create a project brief from the dashboard first."
        actionLabel="Open Dashboard"
        actionTo="/dashboard"
      />
    )
  }

  const activeDiagram =
    workspace.diagrams[selectedKey] ?? workspace.diagrams[diagramKeys[0]]

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="pill">Diagram suite</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {workspace.title} &middot; {diagramKeys.length} views
          </span>
        </div>
      </div>

      <div className="panel flex flex-wrap gap-1.5">
        {diagramKeys.map((diagramKey) => (
          <button
            key={diagramKey}
            type="button"
            onClick={() => setSelectedKey(diagramKey)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              diagramKey === selectedKey
                ? 'bg-amber-600 text-white'
                : 'border hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{ borderColor: 'var(--card-border)' }}
          >
            {diagramLabels[diagramKey] ?? diagramKey.replaceAll('_', ' ')}
          </button>
        ))}
      </div>

      {activeDiagram ? <MermaidDiagram artifact={activeDiagram} /> : null}
    </div>
  )
}
