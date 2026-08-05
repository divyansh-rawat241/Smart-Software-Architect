import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MermaidDiagram } from '../components/diagrams/MermaidDiagram'
import { StatePanel } from '../components/workspace/StatePanel'
import { useWorkspacesQuery } from '../hooks/useWorkspaces'
import { getActiveWorkspace, getErrorMessage } from '../lib/utils'

const diagramOrder = [
  'use_case',
  'activity',
  'sequence',
  'class',
  'er',
  'component',
  'deployment',
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
    if (!diagramKeys.length) {
      return
    }

    if (!diagramKeys.includes(selectedKey)) {
      setSelectedKey(diagramKeys[0])
    }
  }, [diagramKeys, selectedKey])

  if (workspaceQuery.isLoading) {
    return (
      <StatePanel
        badge="Loading"
        title="Loading diagrams"
        description="Preparing the diagram suite."
      />
    )
  }

  if (workspaceQuery.isError) {
    return (
      <StatePanel
        badge="Backend issue"
        title="The diagrams page could not reach the backend"
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
        title="No diagram pack is available yet"
        description="Create the project brief from the dashboard first."
        actionLabel="Open Dashboard"
        actionTo="/dashboard"
      />
    )
  }

  const activeDiagram =
    workspace.diagrams[selectedKey] ?? workspace.diagrams[diagramKeys[0]]

  return (
    <div className="space-y-6">
      <section className="panel-strong flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="pill">Diagrams</p>
          <h2 className="mt-3 text-3xl font-semibold">Diagram suite</h2>
        </div>
        <div className="rounded-full border border-[var(--card-border)] px-4 py-2 text-sm text-muted">
          {workspace.title} • {diagramKeys.length} views
        </div>
      </section>

      <div className="panel flex flex-wrap gap-2">
        {diagramKeys.map((diagramKey) => (
          <button
            key={diagramKey}
            type="button"
            onClick={() => setSelectedKey(diagramKey)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              diagramKey === selectedKey
                ? 'bg-brand text-white'
                : 'border border-[var(--card-border)] bg-[var(--surface-strong)] hover:-translate-y-0.5'
            }`}
          >
            {diagramLabels[diagramKey] ?? diagramKey.replaceAll('_', ' ')}
          </button>
        ))}
      </div>

      {activeDiagram ? <MermaidDiagram artifact={activeDiagram} /> : null}
    </div>
  )
}
