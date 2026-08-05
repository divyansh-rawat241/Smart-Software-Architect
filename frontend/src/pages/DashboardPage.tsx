import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Image, Layers3, Network } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ClarificationPanel } from '../components/workspace/ClarificationPanel'
import { StatePanel } from '../components/workspace/StatePanel'
import { WorkspaceForm } from '../components/workspace/WorkspaceForm'
import {
  answerClarifications,
  createWorkspace,
  getApiBaseUrl,
} from '../lib/api'
import { formatUpdatedAt, getActiveWorkspace, getErrorMessage } from '../lib/utils'
import { useWorkspacesQuery } from '../hooks/useWorkspaces'
import type { Workspace, WorkspaceCreatePayload } from '../types/api'

type FocusTarget = 'clarifications' | null

const resultLinks = [
  {
    to: '/wizard',
    label: 'Requirements',
    description: 'Review actors, constraints, and the captured project scope.',
    icon: Layers3,
  },
  {
    to: '/architecture',
    label: 'Architecture',
    description: 'Inspect the recommended direction, rollout plan, and trade-offs.',
    icon: Network,
  },
  {
    to: '/diagrams',
    label: 'Diagrams',
    description: 'Open the use case, ER, class, sequence, and deployment views.',
    icon: Image,
  },
  {
    to: '/docs',
    label: 'Report',
    description: 'Export the final markdown or PDF architecture pack.',
    icon: FileText,
  },
]

export function DashboardPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const workspaceQuery = useWorkspacesQuery()
  const workspace = getActiveWorkspace(
    workspaceQuery.data,
    searchParams.get('workspace'),
  )
  const [focusTarget, setFocusTarget] = useState<FocusTarget>(null)

  useEffect(() => {
    if (!workspace || !focusTarget) {
      return
    }

    const target = document.getElementById(focusTarget)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setFocusTarget(null)
  }, [focusTarget, workspace])

  const createMutation = useMutation({
    mutationFn: (payload: WorkspaceCreatePayload) => createWorkspace(payload),
    onSuccess: (nextWorkspace) => {
      queryClient.setQueryData<Workspace[]>(
        ['workspaces', getApiBaseUrl()],
        (currentWorkspaces) => {
          const remainingWorkspaces = (currentWorkspaces ?? []).filter(
            (item) => item.id !== nextWorkspace.id,
          )
          return [nextWorkspace, ...remainingWorkspaces]
        },
      )
      void queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      if (nextWorkspace.clarification_plan.questions.length > 0) {
        navigate(`/dashboard?workspace=${nextWorkspace.id}`)
        setFocusTarget('clarifications')
        return
      }

      navigate(`/wizard?workspace=${nextWorkspace.id}`)
    },
  })

  const clarificationMutation = useMutation({
    mutationFn: (answers: Record<string, string>) => {
      if (!workspace) {
        throw new Error('No workspace is selected.')
      }
      return answerClarifications(workspace.id, answers)
    },
    onSuccess: (nextWorkspace) => {
      queryClient.setQueryData<Workspace[]>(
        ['workspaces', getApiBaseUrl()],
        (currentWorkspaces) => {
          const remainingWorkspaces = (currentWorkspaces ?? []).filter(
            (item) => item.id !== nextWorkspace.id,
          )
          return [nextWorkspace, ...remainingWorkspaces]
        },
      )
      void queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      navigate(`/wizard?workspace=${nextWorkspace.id}`)
    },
  })

  const previewRequirements =
    workspace?.requirements.functional_requirements.slice(0, 4) ?? []
  const previewActors = workspace?.requirements.actors.slice(0, 4) ?? []

  return (
    <div className="space-y-5">
      {workspaceQuery.isError ? (
        <StatePanel
          badge="Backend issue"
          title="The dashboard could not reach the backend"
          description={getErrorMessage(workspaceQuery.error)}
          tone="danger"
          actionLabel="Retry"
          onAction={() => void workspaceQuery.refetch()}
        />
      ) : null}

      {createMutation.isError ? (
        <StatePanel
          badge="Create failed"
          title="The workspace could not be generated"
          description={getErrorMessage(createMutation.error)}
          tone="danger"
          actionLabel="Dismiss"
          onAction={() => createMutation.reset()}
        />
      ) : null}

      {clarificationMutation.isError ? (
        <StatePanel
          badge="Update failed"
          title="The clarification answers could not be applied"
          description={getErrorMessage(clarificationMutation.error)}
          tone="danger"
          actionLabel="Dismiss"
          onAction={() => clarificationMutation.reset()}
        />
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <WorkspaceForm
          isPending={createMutation.isPending}
          onSubmit={(payload) => createMutation.mutate(payload)}
        />

        <section className="panel-strong">
          {workspace ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="pill">{workspace.requirements.domain}</p>
                  <h2 className="mt-3 text-3xl font-semibold">{workspace.title}</h2>
                  <p className="mt-2 text-sm text-muted">
                    {workspace.requirements.summary}
                  </p>
                </div>
                <div className="rounded-[1.3rem] border border-[var(--card-border)] bg-black/5 px-4 py-3 text-right dark:bg-white/5">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-muted">
                    Updated
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {formatUpdatedAt(workspace.updated_at)}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.45rem] border border-[var(--card-border)] bg-black/5 p-4 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">
                    Recommended
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {workspace.recommendation.recommended_architecture_name}
                  </p>
                </div>
                <div className="rounded-[1.45rem] border border-[var(--card-border)] bg-black/5 p-4 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">
                    Completeness
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {workspace.clarification_plan.completeness_score}%
                  </p>
                </div>
              </div>

              <div className="rounded-[1.45rem] border border-[var(--card-border)] bg-black/5 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  Open results
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {resultLinks.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.to}
                        to={`${item.to}?workspace=${workspace.id}`}
                        className="button-secondary px-4 py-2 text-xs"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon className="size-4" />
                          {item.label}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="pill">Results</p>
              <h2 className="text-3xl font-semibold">Your workspace will appear here.</h2>
              <p className="text-sm text-muted">
                Enter the brief on the left. Phase 1 creates the workspace. Phase 2
                applies clarifications. Once the workspace is ready, ArchAI opens the
                requirements overview automatically.
              </p>
            </div>
          )}
        </section>
      </section>

      {workspace ? (
        <div id="clarifications">
          <ClarificationPanel
            workspace={workspace}
            isPending={clarificationMutation.isPending}
            onSubmit={(answers) => clarificationMutation.mutate(answers)}
          />
        </div>
      ) : null}

      {workspace ? (
        <section id="workspace-results" className="space-y-4">
          <section className="panel-strong flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="pill">Results</p>
              <h2 className="mt-3 text-3xl font-semibold">Workspace overview</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.3rem] border border-[var(--card-border)] bg-black/5 px-4 py-3 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  Architectures
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {workspace.architectures.length}
                </p>
              </div>
              <div className="rounded-[1.3rem] border border-[var(--card-border)] bg-black/5 px-4 py-3 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  Diagrams
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {Object.keys(workspace.diagrams).length}
                </p>
              </div>
              <div className="rounded-[1.3rem] border border-[var(--card-border)] bg-black/5 px-4 py-3 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  Exports
                </p>
                <p className="mt-2 text-lg font-semibold">Markdown + PDF</p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
            <article className="panel">
              <p className="pill">Decision</p>
              <h3 className="mt-3 text-2xl font-semibold">
                {workspace.recommendation.recommended_architecture_name}
              </h3>
              <p className="mt-3 text-sm text-muted">
                {workspace.recommendation.decision_summary}
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {workspace.recommendation.why.slice(0, 3).map((reason) => (
                  <li key={reason}>- {reason}</li>
                ))}
              </ul>
            </article>

            <div className="grid gap-4">
              <article className="panel">
                <p className="pill">Project coverage</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {previewRequirements.map((requirement) => (
                    <li key={requirement}>- {requirement}</li>
                  ))}
                </ul>
              </article>

              <article className="panel">
                <p className="pill">Primary actors</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {previewActors.map((actor) => (
                    <li key={actor.name}>- {actor.name}</li>
                  ))}
                </ul>
              </article>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            {resultLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={`${item.to}?workspace=${workspace.id}`}
                  className="panel transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="pill">{item.label}</p>
                      <h3 className="mt-3 text-2xl font-semibold">
                        Open {item.label.toLowerCase()}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-muted">
                        {item.description}
                      </p>
                    </div>
                    <div className="rounded-full border border-[var(--card-border)] p-3">
                      <Icon className="size-5" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </section>
        </section>
      ) : null}
    </div>
  )
}
