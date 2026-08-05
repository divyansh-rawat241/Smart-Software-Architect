import { useState, type FormEvent } from 'react'
import { ThemeToggle } from '../components/layout/ThemeToggle'
import { StatePanel } from '../components/workspace/StatePanel'
import { useHealthQuery } from '../hooks/useWorkspaces'
import { getApiBaseUrl, setApiBaseUrl } from '../lib/api'
import { getErrorMessage } from '../lib/utils'

export function SettingsPage() {
  const [apiBaseUrl, setApiBaseUrlState] = useState(getApiBaseUrl)
  const [saved, setSaved] = useState(false)
  const healthQuery = useHealthQuery()

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setApiBaseUrl(apiBaseUrl)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr,0.8fr]">
      <form className="panel-strong" onSubmit={saveSettings}>
        <p className="pill">Client configuration</p>
        <h2 className="mt-3 text-2xl font-semibold">Frontend runtime settings</h2>
        <label className="mt-6 block space-y-2">
          <span className="text-sm font-semibold">Backend API base URL</span>
          <input
            value={apiBaseUrl}
            onChange={(event) => setApiBaseUrlState(event.target.value)}
            className="w-full rounded-2xl border border-[var(--card-border)] bg-white/50 px-4 py-3 outline-none transition focus:border-brand dark:bg-white/5"
          />
        </label>
        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)]"
          >
            Save
          </button>
          {saved ? (
            <span className="text-sm text-success">
              Saved for this browser session.
            </span>
          ) : null}
        </div>
        <p className="mt-4 text-sm text-muted">
          Use <code>npm run dev</code> for local editing or <code>npm run build</code> plus <code>npm run serve:frontend</code> for the stable frontend on port 5173.
        </p>
      </form>

      <div className="grid gap-4">
        <section className="panel">
          <p className="pill">Appearance</p>
          <h2 className="mt-3 text-2xl font-semibold">Theme</h2>
          <p className="mt-3 text-sm text-muted">
            Switch the visual mode without changing the generated outputs.
          </p>
          <div className="mt-6">
            <ThemeToggle />
          </div>
        </section>

        {healthQuery.isError ? (
          <StatePanel
            badge="Backend issue"
            title="The frontend cannot reach the configured API"
            description={getErrorMessage(healthQuery.error)}
            tone="danger"
            actionLabel="Retry"
            onAction={() => void healthQuery.refetch()}
          />
        ) : (
          <section className="panel">
            <p className="pill">Connection</p>
            <h2 className="mt-3 text-2xl font-semibold">Backend health</h2>
            {healthQuery.isLoading ? (
              <p className="mt-3 text-sm text-muted">
                Checking the current ArchAI API connection.
              </p>
            ) : (
              <>
                <p className="mt-3 text-sm text-muted">
                  Connected to <strong>{healthQuery.data?.service}</strong> in{' '}
                  <strong>{healthQuery.data?.environment}</strong> mode.
                </p>
                <p className="mt-2 text-sm text-muted">
                  Ollama refinement:{' '}
                  {healthQuery.data?.ollama_enabled ? 'enabled' : 'disabled'}
                </p>
                <p className="mt-2 text-sm text-muted">
                  Active API URL: <code>{getApiBaseUrl()}</code>
                </p>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
