import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RadarComparisonChart } from '../components/charts/RadarComparisonChart'
import { ComparisonTable } from '../components/workspace/ComparisonTable'
import { StatePanel } from '../components/workspace/StatePanel'
import { WhatIfPlayground } from '../components/workspace/WhatIfPlayground'
import { ADRTimeline } from '../components/workspace/ADRTimeline'
import { useWorkspacesQuery } from '../hooks/useWorkspaces'
import { getActiveWorkspace, getErrorMessage } from '../lib/utils'
import type { Workspace, ArchitectureDecisionRecord, ArchitectureScorecard } from '../types/api'

interface TimelineEntry {
  adr: ArchitectureDecisionRecord
  snapshot: Workspace
}

export function ComparisonPage() {
  const [searchParams] = useSearchParams()
  const workspaceQuery = useWorkspacesQuery()
  const workspace = getActiveWorkspace(
    workspaceQuery.data,
    searchParams.get('workspace'),
  )

  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([])
  const [activeTimelineIndex, setActiveTimelineIndex] = useState(0)
  const lastAdrIdRef = useRef<string | null>(null)

  // Accumulate ADR entries as the workspace updates
  useEffect(() => {
    if (!workspace?.adr) return
    if (workspace.adr.id === lastAdrIdRef.current) return
    lastAdrIdRef.current = workspace.adr.id
    setTimelineEntries((prev) => [...prev, { adr: workspace.adr!, snapshot: workspace }])
    setActiveTimelineIndex((prev) => prev + 1)
  }, [workspace])

  const activeSnapshot = useMemo(() => {
    if (timelineEntries.length === 0) return workspace
    return timelineEntries[activeTimelineIndex]?.snapshot ?? workspace
  }, [timelineEntries, activeTimelineIndex, workspace])

  const handleRevert = (index: number) => {
    setActiveTimelineIndex(index)
  }

  const handleRankingChange = (_scorecards: ArchitectureScorecard[]) => {
    // Rankings are displayed live via the WhatIfPlayground — no action needed here
  }

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
        <RadarComparisonChart comparison={activeSnapshot.comparison} />
        <div className="panel">
          <span className="pill">Scoring rationale</span>
          <ul className="mt-3 space-y-1.5 text-sm">
            {activeSnapshot.comparison.reasoning.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      </div>

      <ComparisonTable comparison={activeSnapshot.comparison} />

      <WhatIfPlayground
        comparison={activeSnapshot.comparison}
        onRankingChange={handleRankingChange}
      />

      {timelineEntries.length > 0 && (
        <ADRTimeline
          entries={timelineEntries}
          activeIndex={activeTimelineIndex}
          onSelect={handleRevert}
        />
      )}
    </div>
  )
}
