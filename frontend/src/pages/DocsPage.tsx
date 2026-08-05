import { Download } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { MarkdownPanel } from '../components/docs/MarkdownPanel'
import { StatePanel } from '../components/workspace/StatePanel'
import { downloadMarkdown, downloadPdf } from '../lib/api'
import { useWorkspacesQuery } from '../hooks/useWorkspaces'
import { downloadBlob, getActiveWorkspace, getErrorMessage } from '../lib/utils'

export function DocsPage() {
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
        title="Loading report"
        description="Preparing the current export."
      />
    )
  }

  if (workspaceQuery.isError) {
    return (
      <StatePanel
        badge="Backend issue"
        title="The report page could not reach the backend"
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
        title="No report is available yet"
        description="Create the project brief from the dashboard first."
        actionLabel="Open Dashboard"
        actionTo="/dashboard"
      />
    )
  }

  const activeWorkspace = workspace

  async function handleMarkdownDownload() {
    const markdown = await downloadMarkdown(activeWorkspace.id)
    downloadBlob(
      new Blob([markdown], { type: 'text/markdown;charset=utf-8' }),
      `${activeWorkspace.title}.md`,
    )
  }

  async function handlePdfDownload() {
    const pdf = await downloadPdf(activeWorkspace.id)
    downloadBlob(pdf, `${activeWorkspace.title}.pdf`)
  }

  return (
    <div className="space-y-6">
      <section className="panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="pill">Report</p>
          <h2 className="mt-3 text-2xl font-semibold">
            {activeWorkspace.title} architecture report
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleMarkdownDownload()}
            className="rounded-full border border-[var(--card-border)] px-4 py-2 text-sm font-medium"
          >
            <span className="inline-flex items-center gap-2">
              <Download className="size-4" /> Markdown
            </span>
          </button>
          <button
            type="button"
            onClick={() => void handlePdfDownload()}
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
          >
            <span className="inline-flex items-center gap-2">
              <Download className="size-4" /> PDF
            </span>
          </button>
        </div>
      </section>

      <MarkdownPanel markdown={activeWorkspace.documentation_markdown} />
    </div>
  )
}
